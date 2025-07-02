import { useState } from 'react'
import { supabase } from './supabaseClient'
import { Link } from 'react-router-dom'
import { useSearchParams, useNavigate } from 'react-router-dom'


export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [resetEmail, setResetEmail] = useState('')
const [resetRequested, setResetRequested] = useState(false)
const [resetMessage, setResetMessage] = useState('')
const [searchParams] = useSearchParams()
const navigate = useNavigate()
const redirectPath = searchParams.get('redirect') || '/'


 const handleAuth = async (type) => {
  setLoading(true)
  setError(null)

  const { data, error } = type === 'signup'
    ? await supabase.auth.signUp({ email, password })
    : await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (type === 'signup' && error.message.toLowerCase().includes('already registered')) {
      setError('You already have an account. Please log in instead.')
    } else {
      setError(error.message)
    }
  } else if (data?.session) {
    navigate(redirectPath)
  }

  setLoading(false)
}

  const handleResetPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: 'http://localhost:5173/reset-password',
    })
    if (error) {
      setResetMessage('Error: ' + error.message)
    } else {
      setResetMessage('Password reset email sent!')
      setResetRequested(false)
    }
  }
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Login or Sign Up</h1>
      <input
        type="email"
        placeholder="Email"
        className="mb-2 p-2 border rounded w-64"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="mb-2 p-2 border rounded w-64"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <div className="flex gap-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => handleAuth('signin')}
          disabled={loading}
        >
          Log In
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => handleAuth('signup')}
          disabled={loading}
        >
          Sign Up
        </button>
      </div>
      {resetRequested ? (
  <div className="mt-4">
    <input
      type="email"
      value={resetEmail}
      onChange={(e) => setResetEmail(e.target.value)}
      placeholder="Enter your email"
      className="border px-3 py-2 rounded w-full mb-2"
    />
    <button
      onClick={handleResetPassword}
      className="bg-blue-600 text-white px-4 py-2 rounded w-full"
    >
      Send Reset Link
    </button>
    <p className="text-sm text-gray-600 mt-2 cursor-pointer" onClick={() => setResetRequested(false)}>
      ← Back to login
    </p>
    {resetMessage && <p className="text-green-600 mt-2">{resetMessage}</p>}
  </div>
) : (
<Link to="/forgot-password" className="text-sm text-blue-600 underline">
  Forgot Password?
</Link>

)}

    </div>
  )
}
