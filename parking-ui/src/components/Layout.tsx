import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Layout() {
  const { email, role, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <header className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between shadow">
        <h1 className="text-xl font-bold">🅿️ Parking Management</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-80">{email} · {role}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-48 bg-white border-r p-4 space-y-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm font-medium ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/lots"
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm font-medium ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            Parking Lots
          </NavLink>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
