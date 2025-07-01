import { useState } from 'react'
import { supabase } from './supabaseClient'
import { useNavigate } from 'react-router-dom'

const ATTRIBUTE_OPTIONS = [
  'Short', 'Long', 'Unique', 'Classic', 'Trendy', 'Biblical', 'Nature-inspired',
  'Unisex', 'Vintage', 'Modern', 'Easy to spell', 'Easy to pronounce',
  'One syllable', 'Two syllables', 'International', 'Royal', 'Mythological'
]

export default function NameListUpload({ user }) {
  const [title, setTitle] = useState('')
  const [namesText, setNamesText] = useState('')
  const [description, setDescription] = useState('')
  const [tag, setTag] = useState('')
  const [visibility, setVisibility] = useState('private')
  const [attributes, setAttributes] = useState([])
  const [showAttrPopup, setShowAttrPopup] = useState(false)
  const [showDetailsPopup, setShowDetailsPopup] = useState(false)
  const [error, setError] = useState('')
  const [parentNames, setParentNames] = useState('')
  const [siblingNames, setSiblingNames] = useState('')
  const [lastName, setLastName] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setConfirmation('')

    if (!title.trim()) {
      setError('List title is required')
      return
    }

    const names = namesText
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0)

    if (names.length === 0) {
      setError('You must enter at least one name')
      return
    }

    const { data, error: listError } = await supabase
      .from('name_lists')
      .insert([
        {
          user_id: user.id,
          title,
          description,
          tags: [tag],
          visibility,
          preferred_attributes: attributes,
          parent_names: parentNames,
          sibling_names: siblingNames,
          last_name: lastName,
        },
      ])
      .select()
      .single()

    if (listError) {
      setError(listError.message)
    } else {
      const listId = data.id

      const { error: roleError } = await supabase
    .from('list_user_roles')
    .insert({
      list_id: listId,
      user_id: user.id,
      role: 'admin'
    })

  if (roleError) {
    setError('List created, but failed to assign role: ' + roleError.message)
    return
  }

      const nameRecords = names.map((name) => ({ name, list_id: listId }))
      const { error: namesError } = await supabase.from('names').insert(nameRecords)

      if (namesError) {
        setError(namesError.message)
      } else {
        setConfirmation('Name list saved successfully!')
        setTimeout(() => navigate(`/list/${listId}`), 1000)
      }
    }
  }

  const toggleAttribute = (attr) => {
    if (attributes.includes(attr)) {
      setAttributes(attributes.filter((a) => a !== attr))
    } else {
      setAttributes([...attributes, attr])
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-lg font-semibold mb-4">Upload a New Name List</h2>

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {confirmation && <p className="text-green-600 mb-2">{confirmation}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="List title (e.g., Favorites)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          <button
            type="button"
            onClick={() => setShowDetailsPopup(!showDetailsPopup)}
            className="text-sm text-blue-600 underline"
          >
            {showDetailsPopup ? 'Hide detailed options' : 'Show detailed options'}
          </button>

          {showDetailsPopup && (
            <div className="space-y-4 border rounded p-4 bg-gray-50">
              <textarea
                placeholder="Description of this list (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />

              <div>
                <label className="font-medium block mb-1">Gender</label>
                <span className="text-xs text-gray-500 block mb-2">ℹ️ Choose the primary gender focus of this name list</span>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="tag" value="boy" checked={tag === 'boy'} onChange={(e) => setTag(e.target.value)} />
                    <span role="img" aria-label="Boy">👦 Boy</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="tag" value="girl" checked={tag === 'girl'} onChange={(e) => setTag(e.target.value)} />
                    <span role="img" aria-label="Girl">👧 Girl</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="tag" value="unisex" checked={tag === 'unisex'} onChange={(e) => setTag(e.target.value)} />
                    <span role="img" aria-label="Unisex">⚧️ Unisex</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-medium block mb-1">Visibility</label>
                <span className="text-xs text-gray-500 block mb-2">ℹ️ Control who can see this list</span>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="visibility" value="private" checked={visibility === 'private'} onChange={(e) => setVisibility(e.target.value)} />
                    <span>Private (default)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="visibility" value="shared" checked={visibility === 'shared'} onChange={(e) => setVisibility(e.target.value)} />
                    <span>Shared (with link)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="visibility" value="public" checked={visibility === 'public'} onChange={(e) => setVisibility(e.target.value)} />
                    <span>Public (discoverable)</span>
                  </label>
                </div>
              </div>

              <input
                type="text"
                placeholder="Parent names (optional)"
                value={parentNames}
                onChange={(e) => setParentNames(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Sibling names (optional)"
                value={siblingNames}
                onChange={(e) => setSiblingNames(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Last name (optional)"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />

              <div>
                <label className="font-medium block mb-1">Preferred Attributes (optional)</label>
                <button type="button" onClick={() => setShowAttrPopup(!showAttrPopup)} className="text-sm text-blue-600 underline">
                  {showAttrPopup ? 'Hide options' : 'Choose attributes'}
                </button>
                {showAttrPopup && (
                  <div className="grid grid-cols-2 gap-2 border rounded p-3 bg-gray-50 mt-2">
                    {ATTRIBUTE_OPTIONS.map((attr) => (
                      <label key={attr} className="flex items-center space-x-2">
                        <input type="checkbox" value={attr} checked={attributes.includes(attr)} onChange={() => toggleAttribute(attr)} />
                        <span>{attr}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-right">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700">
              Save List
            </button>
          </div>
        </div>

        <div>
          <textarea
            rows="20"
            placeholder="Enter one name per line"
            value={namesText}
            onChange={(e) => setNamesText(e.target.value)}
            className="w-full border px-3 py-2 rounded h-full"
          />
        </div>
      </form>
    </div>
  )
}
