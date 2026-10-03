import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { getLots } from '../api/lots'
import { getSpots } from '../api/spots'

export default function DashboardPage() {
  const { email, role } = useAuthStore()

  const { data: lots } = useQuery({ queryKey: ['lots'], queryFn: getLots })
  const { data: spots } = useQuery({ queryKey: ['spots'], queryFn: () => getSpots() })

  const totalLots      = lots?.length ?? '—'
  const availableSpots = spots?.filter((s) => s.status === 'available').length ?? '—'
  const occupiedSpots  = spots?.filter((s) => s.status === 'occupied').length ?? '—'

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
      <p className="text-gray-500 mb-6">
        Welcome back, <strong>{email}</strong> · Role: <span className="capitalize">{role}</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Lots',       value: totalLots,       color: 'blue'  },
          { label: 'Available Spots',  value: availableSpots,  color: 'green' },
          { label: 'Occupied Spots',   value: occupiedSpots,   color: 'red'   },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`text-3xl font-bold mt-1 text-${card.color}-600`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-700 mb-2">📅 Build Progress</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>✅ Day 1 — Project setup</li>
          <li>✅ Day 2 — Auth (JWT, register, login)</li>
          <li>✅ Day 3 — Parking lot CRUD</li>
          <li>✅ Day 4 — Parking spot management</li>
          <li>⬜ Day 5 — WebSocket real-time updates</li>
        </ul>
      </div>
    </div>
  )
}
