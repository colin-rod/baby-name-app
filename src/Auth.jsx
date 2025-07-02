import { useState, useEffect } from 'react'
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
  const [mode, setMode] = useState('login')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const redirectPath = searchParams.get('redirect') || '/'
  const [pendingInviteExists, setPendingInviteExists] = useState(false)


  const handleAuth = async (type) => {
    setLoading(true)
    setError(null)

    const { data, error } = type === 'signup'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (
        type === 'signup' &&
        error.message.toLowerCase().includes('user already registered')
      ) {
        setError("Looks like this email is already registered. Want to log in instead?")
        setMode('login')
      } else if (type === 'signup' && error.status === 400) {
        setError("Looks like this email is already registered. Want to log in instead?")
        setMode('login')
      } else {
        setError(error.message)
      }
    } else if (data?.session) {
      const { data: invites, error: inviteError } = await supabase
        .from('pending_invites')
        .select('*')
        .eq('email', email)
        .eq('status', 'pending')

      if (inviteError) {
        console.error('Error checking invites:', inviteError)
      } else if (invites.length > 0) {
        setPendingInviteExists(true)
      } else {
        navigate(redirectPath)
      }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-6">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">EloBabyHub</h1>
        <div className="flex border-b border-gray-300 mb-4">
          <button
            className={`flex-1 text-center px-4 py-2 rounded-t ${mode === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setMode('login')}
          >
            I already have an account
          </button>
          <button
            className={`flex-1 text-center px-4 py-2 rounded-t ${mode === 'signup' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setMode('signup')}
          >
            I'm new here
          </button>
        </div>
        <input
          type="email"
          placeholder="Email"
          className="mb-2 p-2 border rounded w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-2 p-2 border rounded w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <div className="flex flex-col items-center mt-4 space-y-2">
          {mode === 'login' ? (
            <>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                onClick={() => handleAuth('signin')}
                disabled={loading}
              >
                Log In
              </button>
              <Link to="/forgot-password" className="text-sm text-blue-600 underline">
                Forgot Password?
              </Link>
            </>
          ) : (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
              onClick={() => handleAuth('signup')}
              disabled={loading}
            >
              Sign Up
            </button>
          )}
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
        ) : null}
        {pendingInviteExists && (
          <div className="mt-6 bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded">
            <p className="mb-2">You’re invited to join a name list! Click below to accept your invitation.</p>
            <button
              onClick={() => navigate('/notifications')}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Review Invites
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
