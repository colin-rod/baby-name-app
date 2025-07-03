import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'
import NameComparison from './NameComparison'
import { theme } from './theme'



export default function ListDetail({ user }) {
  const { id } = useParams()
  const [list, setList] = useState(null)
  const [names, setNames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchListAndNames = async () => {
      // Fetch the list (ensure it belongs to the user)
      const { data: listData, error: listError } = await supabase
        .from('name_lists')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (listError) {
        setError(listError.message)
        setLoading(false)
        return
      }

      setList(listData)
      console.log('List fetched from Supabase:', listData)

      // Fetch names associated with this list
      const { data: nameData, error: nameError } = await supabase
        .from('names')
        .select('*')
        .eq('list_id', id)
        .order('name', { ascending: true })

      if (nameError) {
        setError(nameError.message)
      } else {
        setNames(nameData)
      }

      setLoading(false)
    }

    fetchListAndNames()
  }, [id, user.id])

  if (loading) return <p className="p-4">Loading...</p>
  if (error) return <p className="p-4 text-red-500">{error}</p>
  if (!list) return <p className="p-4 text-gray-500">List not found</p>

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: theme.background }}>
      <div className="max-w-2xl mx-auto p-6 rounded shadow" style={{ backgroundColor: theme.primary }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold text-[${theme.text}]`}>{list.title}</h2>
          <Link to="/" className="text-blue-600 underline">← Back</Link>
        </div>

        <p className={`mb-4 text-[${theme.text}]`}>
          Created on: {new Date(list.created_at).toLocaleDateString()}
        </p>

        <Link
  to={`/list/${id}/results`}
  className={`text-[${theme.accent}] underline hover:text-[${theme.accentDark}] mb-4 block`}
>
  📈 View Rankings
</Link>


        {names.length < 2 ? (
  <p className={`text-[${theme.text}]`}>You need at least 2 names to start comparing.</p>
) : (
  

  <NameComparison
    listId={list.id}
    user={user}
    names={names}
    lastName={list.last_name}
    parentsName={list.parent_names}
    siblingsName={list.sibling_names}
    attributes={list.preferred_attributes}
  />

)}

      </div>
    </div>
  )
}
