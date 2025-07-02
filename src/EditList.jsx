import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { FaMars, FaVenus, FaGenderless, FaChevronRight, FaChevronDown } from 'react-icons/fa'
import AdminRoleManager from './AdminRoleManager'
import InvitesList from './InvitesList'

const ATTRIBUTE_OPTIONS = [
  'Short', 'Long', 'Unique', 'Classic', 'Trendy', 'Biblical', 'Nature-inspired',
  'Unisex', 'Vintage', 'Modern', 'Easy to spell', 'Easy to pronounce',
  'One syllable', 'Two syllables', 'International', 'Royal', 'Mythological'
]

export default function EditList({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tag, setTag] = useState('')
  const [visibility, setVisibility] = useState('private')
  const [attributes, setAttributes] = useState([])
  const [names, setNames] = useState([])
  const [newName, setNewName] = useState('')
  const [addingName, setAddingName] = useState(false)
  const [parentNames, setParentNames] = useState('')
  const [siblingNames, setSiblingNames] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showAccess, setShowAccess] = useState(false)
  const [showAttributes, setShowAttributes] = useState(false)
  const [inviteRefreshKey, setInviteRefreshKey] = useState(0)

  useEffect(() => {
    const fetchList = async () => {
      const { data, error } = await supabase
        .from('name_lists')
        .select('*, names(*)')
        .eq('id', id)
        .single()

      if (error) {
        setError('Failed to load list: ' + error.message)
      } else {
        setTitle(data.title || '')
        setDescription(data.description || '')
        setTag(data.tags?.[0] || '')
        setVisibility(data.visibility || 'private')
        setAttributes(data.preferred_attributes || [])
        setNames(data.names || [])
        setParentNames(data.parent_names || '')
        setSiblingNames(data.sibling_names || '')
        setLastName(data.last_name || '')
      }
      setLoading(false)
    }

    fetchList()
  }, [id])

  const toggleAttribute = (attr) => {
    if (attributes.includes(attr)) {
      setAttributes(attributes.filter((a) => a !== attr))
    } else {
      setAttributes([...attributes, attr])
    }
  }

  const handleSave = async () => {
    setMessage('')
    setError('')

    if (!title.trim()) {
      setError('List title is required')
      return
    }

    const { error } = await supabase
      .from('name_lists')
      .update({
        title,
        description,
        tags: [tag],
        visibility,
        preferred_attributes: attributes,
        parent_names: parentNames,
        sibling_names: siblingNames,
        last_name: lastName
      })
      .eq('id', id)

    if (error) {
      setError('Failed to update list: ' + error.message)
    } else {
      setMessage('List updated successfully!')
      setTimeout(() => navigate('/'), 1000)
    }
  }

  const handleAddName = async () => {
    if (!newName.trim()) return

    setAddingName(true)
    const { error } = await supabase
      .from('names')
      .insert({ name: newName, list_id: id })

    if (!error) {
      setNames([...names, { name: newName }])
      setNewName('')
    } else {
      alert('Failed to add name: ' + error.message)
    }

    setAddingName(false)
  }

  const handleDeleteName = async (nameId) => {
    const { error } = await supabase.from('names').delete().eq('id', nameId)

    if (!error) {
      setNames(names.filter((n) => n.id !== nameId))
    } else {
      alert('Failed to delete name: ' + error.message)
    }
  }

  const sendInvite = async (email, listId, role) => {
    console.log('Sending invite payload:', { email, listId, role })
    const { data, error } = await supabase.functions.invoke('send-invite-email', {
      body: {
        email,
        listId,
        role
      }
    })

    if (error) {
      console.error('Failed to send invite:', error)
    } else {
      console.log('Invite email sent!', data)
      setInviteRefreshKey((prev) => prev + 1)
    }
  }

  if (loading) return <p className="p-4">Loading...</p>

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Edit Name List</h2>
        {message && <p className="text-green-600 mb-2">{message}</p>}
        {error && <p className="text-red-600 mb-2">{error}</p>}

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="List Title"
          className="w-full border px-3 py-2 rounded mb-4"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full border px-3 py-2 rounded mb-4"
        />

        <div className="mb-4">
          <label className="block font-medium mb-1">Gender</label>
          <div className="space-y-2">
            {[
              { value: 'boy', icon: <FaMars className="text-blue-600" /> },
              { value: 'girl', icon: <FaVenus className="text-pink-500" /> },
              { value: 'unisex', icon: <FaGenderless className="text-gray-600" /> }
            ].map(({ value, icon }) => (
              <label key={value} className="flex items-center gap-2">
                <input type="radio" name="gender" value={value} checked={tag === value} onChange={() => setTag(value)} />
                <span className="flex items-center gap-1">{icon} {value.charAt(0).toUpperCase() + value.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Visibility</label>
          {['private', 'shared', 'public'].map((v) => (
            <label key={v} className="flex items-center gap-2">
              <input type="radio" name="visibility" value={v} checked={visibility === v} onChange={() => setVisibility(v)} />
              <span>{v === 'private' ? 'Private (default)' : v.charAt(0).toUpperCase() + v.slice(1)}</span>
            </label>
          ))}
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Parent Names</label>
          <input
            type="text"
            value={parentNames}
            onChange={(e) => setParentNames(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g. Alex & Jamie"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Sibling Names</label>
          <input
            type="text"
            value={siblingNames}
            onChange={(e) => setSiblingNames(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g. Ella, Leo"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="e.g. Thompson"
          />
        </div>
<div className="mb-4">
  <button
    onClick={() => setShowAccess(!showAccess)}
    className="text-blue-600 underline text-sm flex items-center gap-1"
  >
    {showAccess ? <FaChevronDown /> : <FaChevronRight />}
    <span>{showAccess ? 'Hide' : 'Manage'} Access & Roles</span>
  </button>
  {showAccess && (
    <div className="mt-2 overflow-auto">
      <div className="overflow-x-auto border rounded p-4 bg-white shadow">
        {/* Add min-w-max to the table container inside AdminRoleManager */}
        <AdminRoleManager listId={id} currentUserId={user.id} tableContainerClass="min-w-max" />
        {/* Invite User to List Section */}
        <div className="mt-8">
          <label className="block font-medium mb-2">Invite User to List</label>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const email = formData.get('email')
              const role = formData.get('role')

        const { error: inviteError } = await supabase
  .from('pending_invites')
  .insert({
    list_id: id,
    email,
    role,
    status: 'pending',
  })

if (inviteError) {
  alert('Failed to invite user: ' + inviteError.message)
} else {
  await sendInvite(email, id, role)
    alert('User invited and email sent!')


  e.target.reset()
}

            }}
            className="space-y-2"
          >
            <input
              type="email"
              name="email"
              placeholder="User email"
              required
              className="w-full border px-3 py-2 rounded"
            />
            <select name="role" className="w-full border px-3 py-2 rounded">
              <option value="voter">Voter</option>
              <option value="submitter">Submitter</option>
              <option value="viewer_plus">Viewer Plus</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Send Invite
            </button>
          </form>
        </div>
        <div className="mt-8">
          <h3 className="font-semibold mb-2">Invites You've Sent</h3>
          <InvitesList
            key={`sent-${inviteRefreshKey}`}
            listId={id}
            mode="sent"
            currentUserEmail={user.email}
          />
        </div>
        <div className="mt-8">
          <h3 className="font-semibold mb-2">Invites You've Received</h3>
          <InvitesList
            key={`received-${inviteRefreshKey}`}
            mode="received"
            currentUserEmail={user.email}
          />
        </div>
      </div>
    </div>
  )}
</div>

        <div className="mb-4">
          <button
            onClick={() => setShowAttributes(!showAttributes)}
            className="text-blue-600 underline text-sm flex items-center gap-1"
          >
            {showAttributes ? <FaChevronDown /> : <FaChevronRight />}
            <span>{showAttributes ? 'Hide' : 'Show'} Preferred Attributes</span>
          </button>
          {showAttributes && (
            <div className="mt-2">
              <label className="block font-medium mb-1">Preferred Attributes</label>
              <div className="grid grid-cols-2 gap-2">
                {ATTRIBUTE_OPTIONS.map((attr) => (
                  <label key={attr} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={attributes.includes(attr)}
                      onChange={() => toggleAttribute(attr)}
                    />
                    <span>{attr}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>

      {/* Right Column */}
      <div className="bg-gray-50 border border-gray-300 rounded p-4 shadow-inner">
        <h3 className="text-lg font-semibold mb-4">Names in This List</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Add a new name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 border px-3 py-2 rounded"
          />
          <button
            onClick={handleAddName}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            disabled={addingName}
          >
            Add
          </button>
        </div>

        <ul className="space-y-2">
          {names.map((name) => (
            <li key={name.id} className="flex justify-between items-center border px-3 py-2 rounded">
              <span>{name.name}</span>
              <button
                onClick={() => handleDeleteName(name.id)}
                className="text-red-600 text-sm hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
