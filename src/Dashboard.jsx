import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { Link } from 'react-router-dom'
import { theme } from './theme';

export default function Dashboard({ user }) {
  const [listsByRole, setListsByRole] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('created_desc')

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
            <button className={`bg-[${theme.accent}] hover:bg-[${theme.accentDark}] text-white px-4 py-2 rounded`}>
              + Create New Name List
            </button>
          </Link>
        </div>

        <div className="mb-4">
          <label htmlFor="sortBy" className="mr-2 font-medium">Sort by:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="created_desc">Newest First</option>
            <option value="created_asc">Oldest First</option>
            <option value="title_asc">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
          </select>
        </div>

        <div className={`bg-white p-4 rounded shadow border border-[${theme.secondary}]`}>
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
                {lists
                  .slice()
                  .sort((a, b) => {
                    if (sortBy === 'created_desc') return new Date(b.created_at) - new Date(a.created_at)
                    if (sortBy === 'created_asc') return new Date(a.created_at) - new Date(b.created_at)
                    if (sortBy === 'title_asc') return a.title.localeCompare(b.title)
                    if (sortBy === 'title_desc') return b.title.localeCompare(a.title)
                    return 0
                  })
                  .map((list) => (
                  <div key={list.id} className={`border border-[${theme.secondary}] p-4 rounded mb-2 flex justify-between items-center bg-white shadow-sm`}>
                    <div>
                      <Link to={`/list/${list.id}/compare`} className={`font-semibold text-[${theme.accentDark}] hover:underline`}>
                        {list.title}
                      </Link>
                      <p className="text-sm text-gray-600">Created: {new Date(list.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-4 items-center">
                      <a href={`/list/${list.id}/results`} className={`text-[${theme.accent}] text-sm underline flex items-center gap-1`}>
                        📈 View Results
                      </a>
                      <a href={`/edit/${list.id}`} className={`text-[${theme.accent}] text-sm underline flex items-center gap-1`}>
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
