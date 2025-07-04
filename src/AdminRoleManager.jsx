import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import ThemedTable from './components/ThemedTable'
import ThemedSelect from './components/ThemedSelect'

const ROLE_CAPABILITIES = {
  Voter: ['vote'],
  Submitter: ['vote', 'add_names'],
  Observer: ['vote', 'add_names', 'view_results'],
  Admin: ['vote', 'add_names', 'view_results', 'manage_roles'],
}

const CAPABILITY_LABELS = {
  vote: 'Vote',
  add_names: 'Add Names',
  view_results: 'View Results',
  manage_roles: 'Manage Roles',
}

export default function AdminRoleManager({ listId, currentUserId }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('list_user_roles_view')
        .select('*')
        .eq('list_id', listId)

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setUsers(data)
      setLoading(false)
    }

    fetchRoles()
  }, [listId])

  const updateRole = async (userId, newRole) => {
    const { error } = await supabase
      .from('list_user_roles')
      .update({ role: newRole })
      .eq('list_id', listId)
      .eq('user_id', userId)

    if (error) {
      alert('Failed to update role: ' + error.message)
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, role: newRole } : u
        )
      )
    }
  }

  if (loading) return <p>Loading roles...</p>
  if (error) return <p className="text-red-600">{error}</p>

  const headers = ['User Email', 'Role', ...Object.values(CAPABILITY_LABELS)]

  return (
    <div className="bg-white rounded border border-primary shadow p-4">
      <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
        Manage List Roles
        <span className="relative group cursor-pointer text-gray-500">
          ⓘ
          <div className="absolute left-1/2 transform -translate-x-1/2 top-6 w-64 bg-white border border-gray-300 text-sm text-gray-700 p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <p><strong>Voter:</strong> Can vote on names.</p>
            <p><strong>Submitter:</strong> Can vote and submit names.</p>
            <p><strong>Observer:</strong> Can vote, submit names, and view results.</p>
          </div>
        </span>
      </h2>
      <ThemedTable
        headers={headers}
        rows={users}
        renderRow={(user) => (
          <tr key={user.user_id}>
            <td className="px-2 py-1 break-words text-sm">{user.email || user.user_id}</td>
            <td className="px-3 py-2">
  {user.role === 'admin' ? (
    <span className="text-sm font-medium text-gray-800">Admin</span>
  ) : (
    <ThemedSelect
      value={user.role}
      onChange={(e) => updateRole(user.user_id, e.target.value)}
      disabled={user.user_id === currentUserId}
    >
      {Object.keys(ROLE_CAPABILITIES)
        .filter((role) => role !== 'owner' && role !== 'admin')
        .map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
    </ThemedSelect>
  )}
</td>
            {Object.keys(CAPABILITY_LABELS).map((cap) => (
              <td key={cap} className="px-3 py-2 text-center">
                <span className={`inline-block w-3 h-3 rounded-full ${ROLE_CAPABILITIES[user.role]?.includes(cap) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              </td>
            ))}
          </tr>
        )}
        tableClassName="w-full table-fixed border border-primary"
        headerCellStyle={(i) => ({
          width: i === 0 ? '40%' : i === 1 ? '20%' : '10%',
        })}
      />
      <div className="mt-6 space-y-3">
        {/* Invite form elements would go here */}
      </div>
      <div className="mt-6 space-y-3">
        {/* Pending invites section would go here */}
      </div>
    </div>
  )
}