import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { theme } from './theme';

export default function InvitesList({ listId, currentUserId, currentUserEmail, mode = 'sent' }) {
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    const fetchInvites = async () => {
      let query = supabase.from('pending_invites').select('*');

      if (mode === 'sent' && currentUserId && listId) {
        query = query.eq('invited_by', currentUserId).eq('list_id', listId).eq('status', 'pending');
      } else if (mode !== 'sent' && currentUserEmail) {
        query = query.eq('email', currentUserEmail).eq('status', 'pending');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching invites:', error);
      } else {
        setInvites(data);
      }
    };

    if ((mode === 'sent' && currentUserId && listId) || (mode !== 'sent' && currentUserEmail)) {
      fetchInvites();
    }
  }, [listId, currentUserId, currentUserEmail, mode]);

  if (!invites.length) {
    return (
      <p className="text-sm" style={{ color: theme.text }}>
        {mode === 'sent' ? 'No pending invites sent yet.' : 'No pending invites received yet.'}
      </p>
    );
  }

  return (
    <div className="mt-4 p-4 rounded" style={{ backgroundColor: theme.background }}>
      <h3 className="text-md font-semibold mb-2">Pending Invites</h3>
      <ul className="space-y-2">
        {invites.map((invite) => (
          <li key={invite.id} className="border p-2 rounded" style={{ backgroundColor: theme.secondary }}>
            <div>
              <span className="font-medium">{invite.email}</span> – <span className="italic">{invite.role}</span>
            </div>
            <div className="text-xs" style={{ color: theme.text }}>
              Sent on {new Date(invite.created_at).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
