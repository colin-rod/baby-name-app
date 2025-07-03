// ForgotPassword.jsx
import { useState } from 'react'
import { supabase } from './supabaseClient'
import { Link } from 'react-router-dom'
import { theme } from './theme'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/reset-password',
    })
    if (error) {
      setError(error.message)
      setMessage('')
    } else {
      setMessage('Reset link sent! Check your email.')
      setError('')
    }
  }

  return (
    <div
      style={{ backgroundColor: theme.background }}
      className="min-h-screen flex flex-col items-center justify-center p-4"
    >
      <h1 className="text-xl font-bold mb-4">Forgot Password</h1>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2 p-2 border rounded w-64"
      />
      <button
        onClick={handleReset}
        className={`bg-[${theme.accent}] text-white px-4 py-2 rounded w-64 mb-2 hover:bg-[${theme.accentDark}]`}
      >
        Send Reset Link
      </button>
      {message && <p className={`text-[${theme.accent}] text-sm`}>{message}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Link to="/" className="text-sm text-blue-600 mt-4 underline">← Back to login</Link>
    </div>
  )
}
