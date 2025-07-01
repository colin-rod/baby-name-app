import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import NameComparison from './NameComparison'

export default function NameComparisonPage({ user }) {
  const { id } = useParams()
  const [names, setNames] = useState([])
  const [list, setList] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchListAndNames = async () => {
      // Fetch list details
      const { data: listData, error: listError } = await supabase
        .from('name_lists')
        .select('*')
        .eq('id', id)
        .single()

      if (listError) {
        setError(listError.message)
        setLoading(false)
        return
      }

      setList(listData)

      // Fetch names
      const { data: nameData, error: nameError } = await supabase
        .from('names')
        .select('*')
        .eq('list_id', id)

      if (nameError) {
        setError(nameError.message)
      } else {
        setNames(nameData)
      }

      setLoading(false)
    }

    fetchListAndNames()
  }, [id])

  if (loading) return <p className="p-4">Loading...</p>
  if (error) return <p className="p-4 text-red-600">Error: {error}</p>

  return (
    <div className="p-4">
      <NameComparison
        listId={id}
        user={user}
        names={names}
        lastName={list?.last_name}
        parentNames={list?.parent_names}
        siblingNames={list?.sibling_names}
        attributes={list?.preferred_attributes}
        gender={list?.gender}
      />
    </div>
  )
}
