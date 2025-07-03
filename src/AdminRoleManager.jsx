import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import ThemedTable from './components/ThemedTable'
import ThemedSelect from './components/ThemedSelect'

const ROLE_CAPABILITIES = {
  voter: ['vote'],
  submitter: ['vote', 'add_names'],
  observer: ['vote', 'add_names', 'view_results'],
  admin: ['vote', 'add_names', 'view_results', 'manage_roles'],
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
      <h2 className="text-lg font-semibold text-primary mb-4">Manage List Roles</h2>
      <ThemedTable
        headers={headers}
        rows={users}
        renderRow={(user) => (
          <tr key={user.user_id}>
            <td className="px-2 py-1 break-words text-sm">{user.email || user.user_id}</td>
            <td className="px-3 py-2">
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
            </td>
            {Object.keys(CAPABILITY_LABELS).map((cap) => (
              <td key={cap} className="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={ROLE_CAPABILITIES[user.role]?.includes(cap)}
                  readOnly
                />
              </td>
            ))}
          </tr>
        )}
        tableClassName="w-full table-fixed border border-primary"
        headerCellStyle={(i) => ({
          width: i === 0 ? '40%' : i === 1 ? '20%' : '10%',
        })}
      />
      <hr className="my-6 border-t border-gray-300" />
      <div className="mt-6 space-y-3">
        {/* Invite form elements would go here */}
      </div>
      <hr className="my-6 border-t border-gray-300" />
      <div className="mt-6 space-y-3">
        {/* Pending invites section would go here */}
      </div>
    </div>
  )
}