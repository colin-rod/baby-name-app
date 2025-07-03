import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Link } from 'react-router-dom'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { theme } from './theme'
import ThemedInput from './components/ThemedInput'
import Button from './components/Button'
import ThemedTabButton from './components/ThemedTabButton'

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
        (error.message.toLowerCase().includes('user already registered') || error.status === 400)
      ) {
        setError("Looks like this email is already registered. Please log in instead.");
        setMode('login');
      } else {
        setError(error.message)
      }
    } else if (data?.user && type === 'signup') {
      setError("Signup successful! Please check your email and confirm your account to continue.");
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
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: theme.background }}>
      <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-6" style={{ color: theme.text }}>EloBabyHub</h1>
        <div className="flex border-b border-gray-300 mb-4">
          <ThemedTabButton
            active={mode === 'login'}
            onClick={() => setMode('login')}
            color="primaryDark"
            className="border-r border-gray-300 font-semibold"
          >
            I already have an account
          </ThemedTabButton>
          <ThemedTabButton
            active={mode === 'signup'}
            onClick={() => setMode('signup')}
            color="accent"
            className="font-semibold"
          >
            I'm new here
          </ThemedTabButton>
        </div>
        {mode === 'signup' && (
          <p className="text-sm text-gray-600 mb-2 text-center">
            Already have an account? Try logging in above.
          </p>
        )}
        <ThemedInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-2"
        />
        <ThemedInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-2"
        />
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <div className="flex flex-col items-center mt-4 space-y-2">
          {mode === 'login' ? (
            <>
              <Button color="primaryDark" onClick={() => handleAuth('signin')} disabled={loading} className="w-full">
                Log In
              </Button>
              <Link
                to="/forgot-password"
                className="text-sm underline" style={{ color: theme.primary }}
                onMouseOver={(e) => (e.target.style.color = theme.primaryDark)}
                onMouseOut={(e) => (e.target.style.color = theme.primary)}
              >
                Forgot Password?
              </Link>
            </>
          ) : (
            <Button color="accent" onClick={() => handleAuth('signup')} disabled={loading} className="w-full">
              Sign Up
            </Button>
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
            <Button color="primary" onClick={handleResetPassword} className="w-full">
              Send Reset Link
            </Button>
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
