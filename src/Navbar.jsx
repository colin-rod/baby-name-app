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
    <nav className="bg-green-100 px-4 py-3 shadow">
      <div className="max-w-2xl mx-auto flex justify-between items-center">
        <h1 className="text-lg font-bold text-green-800">👶 ELO-Baby</h1>
        <div className="flex gap-4 items-center">
          <Link
            to="/"
            className="text-sm text-blue-700 underline hover:text-blue-900"
          >
            Dashboard
          </Link>
          <Link
            to="/settings"
            className="text-sm text-blue-700 underline hover:text-blue-900"
          >
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-1 px-3 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
