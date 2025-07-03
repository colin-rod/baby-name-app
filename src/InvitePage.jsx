import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { theme } from './theme'

export default function InvitePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('Checking invite...')

  const token = searchParams.get('token')

  useEffect(() => {
    const processInvite = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
const redirectUrl = `/invite?token=${token}`
navigate(`/login?redirectTo=${encodeURIComponent(redirectUrl)}`)
        return
      }

      const user = session.user
      if (!token) {
        setStatus('Invalid invite link.')
        return
      }

      // Check if this user has a pending invite
      const { data: invite, error } = await supabase
        .from('pending_invites')
        .select('*')
        .eq('id', token)
        .eq('email', user.email)
        .single()

      if (error || !invite) {
        setStatus('Invite not found or already used.')
        return
      }

      // Add to list_user_roles
      const { error: insertError } = await supabase
        .from('list_user_roles')
        .insert([
          {
            user_id: user.id,
            list_id: invite.list_id,
            role: invite.role,
          }
        ])

      if (insertError) {
        setStatus('Failed to accept invite. Please try again.')
        return
      }

      // Delete invite
      await supabase
        .from('pending_invites')
        .delete()
        .eq('id', invite.id)

      // Redirect to list
      navigate(`/list/${invite.list_id}`)
    }

    processInvite()
  }, [token, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
      <div className="p-6 rounded shadow-md text-center max-w-md" style={{ backgroundColor: 'white', borderColor: theme.primary, color: theme.text, borderWidth: '1px' }}>
        <p>{status}</p>
      </div>
    </div>
  )
}