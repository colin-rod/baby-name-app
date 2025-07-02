import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { Link } from 'react-router-dom'

export default function Dashboard({ user }) {
  const [listsByRole, setListsByRole] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLists = async () => {
      const { data, error } = await supabase
        .from('list_user_roles')
        .select(`
          role,
          name_lists (
            id,
            title,
            created_at
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        setError(error.message)
      } else {
        const grouped = data.reduce((acc, item) => {
          const role = item.role
          const list = item.name_lists
          if (!acc[role]) acc[role] = []
          acc[role].push(list)
          return acc
        }, {})
        setListsByRole(grouped)
      }

      setLoading(false)
    }

    fetchLists()
  }, [user.id])

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">

        <p className="mb-4 text-gray-700">Welcome, {user.user_metadata?.username || user.email}!</p>

        <div className="mb-6">
          <Link to="/upload">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">
              + Upload New Name List
            </button>
          </Link>
          <Link to="/manage-lists" className="text-blue-600 underline">
  Manage Lists
</Link>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Your Name Lists</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : Object.keys(listsByRole).length === 0 ? (
            <p className="text-gray-500">You haven't uploaded any name lists yet.</p>
          ) : (
            Object.entries(listsByRole).map(([role, lists]) => (
              <div key={role} className="mb-6">
                <h3 className="text-md font-bold capitalize mb-2">{role} Lists</h3>
                {lists.map((list) => (
                  <div key={list.id} className="border p-4 rounded mb-2 flex justify-between items-center">
                    <div>
                      <Link to={`/list/${list.id}/compare`} className="font-semibold text-blue-700 hover:underline">
                        {list.title}
                      </Link>
                      <p className="text-sm text-gray-600">Created: {new Date(list.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-4 items-center">
                      <a href={`/list/${list.id}/results`} className="text-blue-600 text-sm underline flex items-center gap-1">
                        📈 View Rankings
                      </a>
                      <a href={`/edit/${list.id}`} className="text-sm text-blue-600 underline flex items-center gap-1">
                        ✏️ Edit
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
