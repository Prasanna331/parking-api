import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getLots, createLot, updateLot, deleteLot, ParkingLot, ParkingLotPayload } from '../api/lots'
import { useAuthStore } from '../store/authStore'

const EMPTY_FORM: ParkingLotPayload = { name: '', address: '', city: '', isActive: true }

function LotModal({
  initial,
  onClose,
  onSave,
  saving,
  error,
}: {
  initial: ParkingLotPayload
  onClose: () => void
  onSave: (data: ParkingLotPayload) => void
  saving: boolean
  error: string
}) {
  const [form, setForm] = useState<ParkingLotPayload>(initial)
  const set = (k: keyof ParkingLotPayload, v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">{initial.name ? 'Edit Lot' : 'Add Lot'}</h3>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.name}
              onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.address}
              onChange={(e) => set('address', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.city}
              onChange={(e) => set('city', e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive ?? true}
              onChange={(e) => set('isActive', e.target.checked)} />
            Active
          </label>
        </div>
        <div className="flex gap-2 mt-5 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">Cancel</button>
          <button
            disabled={saving || !form.name || !form.address}
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

export default function LotsPage() {
  const role = useAuthStore((s) => s.role)
  const isAdmin = role === 'admin'
  const qc = useQueryClient()

  const { data: lots, isLoading, isError } = useQuery({ queryKey: ['lots'], queryFn: getLots })

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing]     = useState<ParkingLot | null>(null)
  const [mutError, setMutError]   = useState('')

  const openCreate = () => { setEditing(null); setMutError(''); setModalMode('create') }
  const openEdit   = (lot: ParkingLot) => { setEditing(lot); setMutError(''); setModalMode('edit') }
  const closeModal = () => setModalMode(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ['lots'] })

  const createMut = useMutation({
    mutationFn: createLot,
    onSuccess: () => { invalidate(); closeModal() },
    onError: (e: any) => setMutError(e.response?.data?.message || 'Failed to create lot'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ParkingLotPayload }) => updateLot(id, data),
    onSuccess: () => { invalidate(); closeModal() },
    onError: (e: any) => setMutError(e.response?.data?.message || 'Failed to update lot'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteLot,
    onSuccess: invalidate,
    onError: (e: any) => alert(e.response?.data?.message || 'Failed to delete lot'),
  })

  const handleSave = (data: ParkingLotPayload) => {
    setMutError('')
    if (modalMode === 'edit' && editing) {
      updateMut.mutate({ id: editing.id, data })
    } else {
      createMut.mutate(data)
    }
  }

  const handleDelete = (lot: ParkingLot) => {
    if (confirm(`Delete "${lot.name}"? This cannot be undone.`)) deleteMut.mutate(lot.id)
  }

  if (isLoading) return <p className="text-gray-500">Loading lots…</p>
  if (isError)   return <p className="text-red-500">Failed to load parking lots.</p>

  const isSaving = createMut.isPending || updateMut.isPending

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Parking Lots</h2>
        {isAdmin && (
          <button onClick={openCreate}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
            + Add Lot
          </button>
        )}
      </div>

      {lots && lots.length === 0 && (
        <p className="text-gray-500">No parking lots yet.{isAdmin ? ' Add one to get started.' : ''}</p>
      )}

      <div className="grid gap-4">
        {lots?.map((lot) => (
          <div key={lot.id} className="bg-white rounded-xl shadow p-5 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{lot.name}</p>
                {!lot.isActive && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                )}
              </div>
              <p className="text-sm text-gray-500">{lot.address}{lot.city ? `, ${lot.city}` : ''}</p>
              <p className="text-sm text-gray-400">{lot.totalSpots} total spots</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                to={`/lots/${lot.id}/spots`}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
              >
                View Spots
              </Link>
              {isAdmin && (
                <>
                  <button
                    onClick={() => openEdit(lot)}
                    className="px-3 py-2 rounded text-sm border hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(lot)}
                    disabled={deleteMut.isPending}
                    className="px-3 py-2 rounded text-sm bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {modalMode && (
        <LotModal
          initial={modalMode === 'edit' && editing
            ? { name: editing.name, address: editing.address, city: editing.city, isActive: editing.isActive }
            : EMPTY_FORM}
          onClose={closeModal}
          onSave={handleSave}
          saving={isSaving}
          error={mutError}
        />
      )}
    </div>
  )
}
