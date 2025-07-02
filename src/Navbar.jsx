import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function Navbar() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      navigate('/')
    } else {
      console.error('Logout failed:', error.message)
    }
  }

  return (
    <nav className="bg-gradient-to-r from-green-200 to-green-100 px-4 py-4 shadow-md">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold text-green-900 tracking-tight">
          eloBabyHub
        </Link>
        <div className="flex space-x-4 items-center mt-2 sm:mt-0">
          <Link
            to="/"
            className="text-sm text-green-800 hover:text-green-900 font-medium transition"
          >
            Dashboard
          </Link>
          <Link to="/manage-lists" className="text-sm text-green-800 hover:text-green-900 font-medium transition">
  Notifications
</Link>
          <Link
            to="/settings"
            className="text-sm text-green-800 hover:text-green-900 font-medium transition"
          >
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-1.5 px-4 rounded-lg shadow-sm transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
