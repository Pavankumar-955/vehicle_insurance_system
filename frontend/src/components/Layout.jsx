import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.roles?.includes('ROLE_ADMIN')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to={isAdmin ? '/admin' : '/dashboard'} className="text-2xl font-serif font-bold text-neutral-900 hover:text-gold-600 transition">
                DriveSafe Insurance
              </Link>
              {isAdmin ? (
                <div className="hidden sm:flex gap-6">
                  <Link to="/admin" className="link-underline text-neutral-700">Dashboard</Link>
                  <Link to="/admin/customers" className="link-underline text-neutral-700">Customers</Link>
                  <Link to="/admin/policies" className="link-underline text-neutral-700">Policies</Link>
                  <Link to="/admin/claims" className="link-underline text-neutral-700">Claims</Link>
                  <Link to="/admin/tickets" className="link-underline text-neutral-700">Support</Link>
                </div>
              ) : (
                <div className="hidden sm:flex gap-6">
                  <Link to="/dashboard" className="link-underline text-neutral-700">Dashboard</Link>
                  <Link to="/buy-policy" className="link-underline text-neutral-700">Buy Policy</Link>
                  <Link to="/claims" className="link-underline text-neutral-700">Claims</Link>
                  <Link to="/tickets" className="link-underline text-neutral-700">Support</Link>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-600 font-semibold">{user?.fullName}</span>
              {!isAdmin && (
                <Link to="/profile" className="px-4 py-2 border border-gold-600 text-gold-600 font-semibold rounded-lg hover:bg-gold-50 transition-all duration-200">
                  👤 Profile
                </Link>
              )}
              <button onClick={handleLogout} className="px-4 py-2 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
