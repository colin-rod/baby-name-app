import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import AdminRoleManager from './AdminRoleManager';
import InvitesList from './InvitesList';

export default function ManageLists({ user }) {
  const [adminLists, setAdminLists] = useState([]);
  const [receivedInvites, setReceivedInvites] = useState([]);

  useEffect(() => {
    const fetchAdminLists = async () => {
      const { data, error } = await supabase
        .from('list_user_roles_with_email') // or your view
        .select('*, name_lists(*)')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      setAdminLists(data.map(d => d.name_lists));
    };

    const fetchReceivedInvites = async () => {
      const { data } = await supabase
        .from('pending_invites')
        .select('*')
        .eq('email', user.email)
        .eq('status', 'pending');
      setReceivedInvites(data);
    };

    fetchAdminLists();
    fetchReceivedInvites();
  }, [user]);

  const acceptInvite = async (invite) => {
    const { error } = await supabase.rpc('accept_invite', {
      invite_id: invite.id,
      user_id: user.id
    });
    if (!error) {
      setReceivedInvites((prev) => prev.filter(i => i.id !== invite.id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-6">List Management</h2>

      <div className="mb-10">
        <h3 className="font-semibold mb-2">Pending Invites</h3>
        {receivedInvites.length === 0 && <p>No pending invites</p>}
        {receivedInvites.map((invite) => (
          <div key={invite.id} className="border p-2 rounded mb-2 flex justify-between">
            <div>
              {invite.email} – <em>{invite.role}</em>
            </div>
            <button
              onClick={() => acceptInvite(invite)}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Accept
            </button>
          </div>
        ))}
      </div>

      {adminLists.map((list) => (
        <div key={list.id} className="border p-4 rounded shadow mb-6">
          <h3 className="font-bold text-lg mb-2">{list.title}</h3>
          <AdminRoleManager listId={list.id} currentUserId={user.id} />
          <InvitesList listId={list.id} mode="sent" currentUserEmail={user.email} />
          {/* Optionally allow editing list settings here too */}
        </div>
      ))}
    </div>
  );
}