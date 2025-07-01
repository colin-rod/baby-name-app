import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function Settings() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) {
        console.error(error)
      } else {
        setUser(user)
        setUsername(user.user_metadata?.username || '')
        setEmail(user.email)
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  const handleSaveChanges = async () => {
    setMessage('')
    setError('')

    // Update username in metadata
    const { error: metaError } = await supabase.auth.updateUser({
      data: { username }
    })

    // Update email if changed
    let emailError = null
    if (email !== user.email) {
      const { error } = await supabase.auth.updateUser({ email })
      emailError = error
    }

    // Update password if filled in
    let passwordError = null
    if (password.trim() !== '') {
      const { error } = await supabase.auth.updateUser({ password })
      passwordError = error
    }

    if (metaError || emailError || passwordError) {
      setError(metaError?.message || emailError?.message || passwordError?.message)
    } else {
      setMessage('Profile updated. If you changed your email, check your inbox to confirm.')
      setPassword('')
    }
  }

  if (loading) return <p className="p-4">Loading...</p>

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">User Settings</h2>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Current Email */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600">Current Email</label>
        <p className="text-gray-800">{user?.email}</p>
        <input
          type="email"
          placeholder="Enter new email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mt-1 border px-3 py-2 rounded"
        />
      </div>

      {/* Username */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600">Username</label>
        <p className="text-gray-800">{user?.user_metadata?.username || 'Not set'}</p>
        <input
          type="text"
          placeholder="Enter new username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mt-1 border px-3 py-2 rounded"
        />
      </div>

      {/* Password */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600">New Password</label>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mt-1 border px-3 py-2 rounded"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveChanges}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </div>
  )
}
