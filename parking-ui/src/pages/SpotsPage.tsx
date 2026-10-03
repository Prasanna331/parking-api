import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { getSpots, createSpot, updateSpot, updateSpotStatus, deleteSpot, ParkingSpot, ParkingSpotPayload } from '../api/spots'
import { useSpotWebSocket } from '../api/websocket'
import { useAuthStore } from '../store/authStore'

const SPOT_TYPES: ParkingSpot['spotType'][]   = ['standard', 'handicapped', 'ev_charging', 'reserved', 'motorcycle']
const SPOT_STATUSES: ParkingSpot['status'][]  = ['available', 'occupied', 'reserved', 'maintenance']

const statusColors: Record<ParkingSpot['status'], string> = {
  available:   'bg-green-100 text-green-700',
  occupied:    'bg-red-100 text-red-700',
  reserved:    'bg-yellow-100 text-yellow-700',
  maintenance: 'bg-gray-100 text-gray-700',
}

const statusBorderColors: Record<ParkingSpot['status'], string> = {
  available:   'border-green-400',
  occupied:    'border-red-400',
  reserved:    'border-yellow-400',
  maintenance: 'border-gray-400',
}

function SpotModal({
  lotId,
  initial,
  onClose,
  onSave,
  saving,
  error,
}: {
  lotId: string
  initial: ParkingSpotPayload | null
  onClose: () => void
  onSave: (data: ParkingSpotPayload) => void
  saving: boolean
  error: string
}) {
  const [form, setForm] = useState<ParkingSpotPayload>(
    initial ?? { lotId, spotNumber: '', spotType: 'standard', status: 'available', sensorId: '' }
  )
  const set = <K extends keyof ParkingSpotPayload>(k: K, v: ParkingSpotPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4">{initial ? 'Edit Spot' : 'Add Spot'}</h3>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Spot Number *</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.spotNumber}
              onChange={(e) => set('spotNumber', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.spotType}
              onChange={(e) => set('spotType', e.target.value as ParkingSpot['spotType'])}>
              {SPOT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.status}
              onChange={(e) => set('status', e.target.value as ParkingSpot['status'])}>
              {SPOT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sensor ID</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.sensorId ?? ''}
              onChange={(e) => set('sensorId', e.target.value)} placeholder="optional" />
          </div>
        </div>
        <div className="flex gap-2 mt-5 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">Cancel</button>
          <button
            disabled={saving || !form.spotNumber}
            onClick={() => onSave(form)}
            className="px-4 py-2 rounded-lg text-sm bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SpotsPage() {
  const { lotId } = useParams<{ lotId: string }>()
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.role)
  const isAdminOrOperator = role === 'admin' || role === 'operator'
  const isAdmin = role === 'admin'
  const qc = useQueryClient()

  const { data: initialSpots, isLoading, isError } = useQuery({
    queryKey: ['spots', lotId],
    queryFn: () => getSpots(lotId!),
    enabled: !!lotId,
  })

  const [spots, setSpots] = useState<ParkingSpot[]>([])
  useEffect(() => { if (initialSpots) setSpots(initialSpots) }, [initialSpots])

  useSpotWebSocket(lotId, (updatedSpot) =>
    setSpots((prev) => prev.map((s) => s.id === updatedSpot.id ? updatedSpot : s))
  )

  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState<ParkingSpot | null>(null)
  const [mutError, setMutError]     = useState('')
  const [statusSpot, setStatusSpot] = useState<ParkingSpot | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ['spots', lotId] })

  const createMut = useMutation({
    mutationFn: createSpot,
    onSuccess: () => { invalidate(); setModalOpen(false) },
    onError: (e: any) => setMutError(e.response?.data?.message || 'Failed to create spot'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ParkingSpotPayload }) => updateSpot(id, data),
    onSuccess: () => { invalidate(); setModalOpen(false); setEditing(null) },
    onError: (e: any) => setMutError(e.response?.data?.message || 'Failed to update spot'),
  })

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ParkingSpot['status'] }) => updateSpotStatus(id, status),
    onSuccess: () => { invalidate(); setStatusSpot(null) },
    onError: (e: any) => alert(e.response?.data?.message || 'Failed to update status'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteSpot,
    onSuccess: invalidate,
    onError: (e: any) => alert(e.response?.data?.message || 'Failed to delete spot'),
  })

  const openCreate = () => { setEditing(null); setMutError(''); setModalOpen(true) }
  const openEdit   = (s: ParkingSpot) => { setEditing(s); setMutError(''); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleSave = (data: ParkingSpotPayload) => {
    setMutError('')
    if (editing) updateMut.mutate({ id: editing.id, data })
    else         createMut.mutate(data)
  }

  const handleDelete = (spot: ParkingSpot) => {
    if (confirm(`Delete spot "${spot.spotNumber}"? This cannot be undone.`)) deleteMut.mutate(spot.id)
  }

  if (isLoading) return <p className="text-gray-500">Loading spots…</p>
  if (isError)   return <p className="text-red-500">Failed to load spots.</p>

  const isSaving = createMut.isPending || updateMut.isPending

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => navigate('/lots')}
            className="text-sm text-gray-500 hover:text-gray-800 self-start"
          >
            ← Back to Lots
          </button>
          <h2 className="text-2xl font-bold">
            {spots[0]?.lotName ?? 'Parking Spots'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-600 font-medium">🟢 Live updates active</span>
          {isAdmin && (
            <button onClick={openCreate}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
              + Add Spot
            </button>
          )}
        </div>
      </div>

      {spots.length === 0 && (
        <p className="text-gray-500">No spots in this lot yet.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {spots.map((spot) => (
          <div
            key={spot.id}
            className={`rounded-lg p-3 text-center text-sm font-medium transition-colors duration-300 border-2 ${statusColors[spot.status]} ${statusBorderColors[spot.status]}`}
          >
            <p className="text-base font-bold">{spot.spotNumber}</p>
            <p className="capitalize text-xs mt-1">{spot.status}</p>
            <p className="text-xs opacity-70 mt-1">{spot.spotType}</p>

            {isAdminOrOperator && (
              <div className="mt-2 flex flex-col gap-1">
                <button
                  onClick={() => setStatusSpot(spot)}
                  className="text-xs bg-white/60 hover:bg-white/90 rounded px-1 py-0.5 border border-current"
                >
                  Status
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => openEdit(spot)}
                      className="text-xs bg-white/60 hover:bg-white/90 rounded px-1 py-0.5 border border-current"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(spot)}
                      disabled={deleteMut.isPending}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded px-1 py-0.5"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit spot modal */}
      {modalOpen && lotId && (
        <SpotModal
          lotId={lotId}
          initial={editing
            ? { lotId: lotId, spotNumber: editing.spotNumber, spotType: editing.spotType, status: editing.status, sensorId: editing.sensorId ?? '' }
            : null}
          onClose={closeModal}
          onSave={handleSave}
          saving={isSaving}
          error={mutError}
        />
      )}

      {/* Quick status change modal */}
      {statusSpot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs">
            <h3 className="text-lg font-bold mb-3">Change Status — {statusSpot.spotNumber}</h3>
            <div className="grid grid-cols-2 gap-2">
              {SPOT_STATUSES.map((s) => (
                <button
                  key={s}
                  disabled={statusMut.isPending}
                  onClick={() => statusMut.mutate({ id: statusSpot.id, status: s })}
                  className={`py-2 rounded-lg text-sm font-medium capitalize border-2 transition-colors
                    ${statusSpot.status === s ? statusColors[s] + ' ' + statusBorderColors[s] : 'border-gray-200 hover:bg-gray-50'}
                    disabled:opacity-50`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button onClick={() => setStatusSpot(null)}
              className="mt-4 w-full py-2 rounded-lg text-sm border hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
