import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import ThemedTable from './ThemedTable'

const ROLE_CAPABILITIES = {
  voter: ['vote'],
  submitter: ['vote', 'add_names'],
  viewer_plus: ['vote', 'add_names', 'view_results'],
  owner: ['vote', 'add_names', 'view_results', 'manage_roles'],
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
  .from('list_user_roles_view') // use your actual view name
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

  const headers = [
    'User Email',
    'Role',
    ...Object.values(CAPABILITY_LABELS)
  ]

  return (
    <div className="p-6 bg-primaryLight shadow rounded max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Manage List Roles</h2>
      <ThemedTable
        headers={headers}
        rows={users}
        renderRow={(user) => (
          <tr key={user.user_id} className="border-t">
            <td className="border border-primary px-3 py-2">{user.email || user.user_id}</td>
            <td className="border border-primary px-3 py-2">
              <select
                value={user.role}
                onChange={(e) => updateRole(user.user_id, e.target.value)}
                className="border border-primary rounded px-2 py-1"
                disabled={user.user_id === currentUserId}
              >
                {Object.keys(ROLE_CAPABILITIES).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </td>
            {Object.keys(CAPABILITY_LABELS).map((cap) => (
              <td key={cap} className="border border-primary px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={ROLE_CAPABILITIES[user.role]?.includes(cap)}
                  readOnly
                />
              </td>
            ))}
          </tr>
        )}
      />
    </div>
  )
}