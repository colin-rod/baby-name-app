import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { FaCheckDouble, FaTimesCircle, FaInfoCircle } from 'react-icons/fa'
import { Tooltip } from 'react-tooltip'

export default function NameComparison({ listId, user, names, lastName, parentNames, siblingNames, attributes, gender }) {
  const [pair, setPair] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [fade, setFade] = useState(true)
  const [feedbackOptions, setFeedbackOptions] = useState([])

  const [lastComparison, setLastComparison] = useState(null)
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false)
  const [presetReason, setPresetReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [lastPair, setLastPair] = useState(null)
  const [lastChoice, setLastChoice] = useState(null)
  const [showFullNames, setShowFullNames] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const [showParentNames, setShowParentNames] = useState(false)
  const [showSiblingNames, setShowSiblingNames] = useState(false)
  const [showGender, setShowGender] = useState(false)
  const [showAttributes, setShowAttributes] = useState(false)

console.log('Received props in NameComparison:', {
  lastName,
  parentNames,
  siblingNames,
  attributes
})
  


  useEffect(() => {
    supabase
      .from('feedback_options')
      .select('*')
      .then(({ data, error }) => {
        if (error) console.error('Failed to load feedback options:', error.message)
        else setFeedbackOptions(data)
      })
  }, [])

  useEffect(() => {
    if (names?.length >= 2) {
      getNewPair()
    }
  }, [names])

  const getNewPair = () => {
    const shuffled = [...names].sort(() => 0.5 - Math.random())
    setFade(false)
    setTimeout(() => {
      setPair([shuffled[0], shuffled[1]])
      setFade(true)
    }, 150)
  }

  const handleChoice = async (choice) => {
    setSubmitting(true)

    const { data, error } = await supabase
      .from('comparisons')
      .insert({
        user_id: user.id,
        list_id: listId,
        name_a_id: pair[0].id,
        name_b_id: pair[1].id,
        chosen: choice,
      })
      .select()
      .single()

    setSubmitting(false)

    if (error) return alert('Error saving comparison: ' + error.message)

    setLastComparison(data)
    setLastPair(pair)
    setLastChoice(choice)
    setShowFeedbackPrompt(true)
    setPresetReason('')
    setCustomReason('')
    getNewPair()
  }

  const handleSubmitFeedback = async () => {
    if (!lastComparison) return

    const selectedOption = feedbackOptions.find(opt => opt.label === presetReason)

    const { error } = await supabase.from('feedback').insert({
      comparison_id: lastComparison.id,
      option_id: selectedOption ? selectedOption.id : null,
      custom_reason: customReason || null,
    })

    if (error) return alert('Error saving feedback: ' + error.message)

    setShowFeedbackPrompt(false)
    setPresetReason('')
    setCustomReason('')
  }

  if (!names || names.length < 2) {
    return <div className="text-center mt-10 text-gray-500">Not enough names to compare.</div>
  }

  const renderNameButton = (nameObj, position) => (
    <div className="relative flex-1">
      <button
        className="w-full py-8 px-6 bg-accent text-text text-3xl rounded shadow hover:bg-secondaryDark active:scale-95 transition-all"
        onClick={() => handleChoice(position)}
        disabled={submitting}
      >
        {showFullNames && lastName ? `${nameObj?.name} ${lastName}` : nameObj?.name}
      </button>
    </div>
  )
  

  return (
    <div className={`mt-6 relative transition-opacity duration-300 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'}`}>
<h3 className="text-lg font-semibold mb-4 text-center text-text">
  Which name do you prefer?
</h3>

<div className="flex items-center justify-center gap-4 mb-4">
  {renderNameButton(pair[0], 'a')}
  <div className="text-lg text-text font-semibold px-2">or</div>
  {renderNameButton(pair[1], 'b')}
</div>

<div className="mt-6 space-y-2 max-w-md mx-auto">
  <button
    className="w-full py-3 bg-accentDark text-white rounded shadow hover:bg-secondaryDark flex items-center justify-center gap-2"
    onClick={() => handleChoice('both')}
    disabled={submitting}
  >
    <FaCheckDouble /> Both <FaCheckDouble />
  </button>
  <button
    className="w-full py-3 bg-accentDark text-white rounded shadow hover:bg-secondaryDark flex items-center justify-center gap-2"
    onClick={() => handleChoice('skip')}
    disabled={submitting}
  >
    <FaTimesCircle /> Neither <FaTimesCircle />
  </button>
</div>

  {(showParentNames || showSiblingNames || showGender || showAttributes) && (
    <div className="mt-4 p-4 bg-secondary border rounded shadow max-w-xl mx-auto text-text space-y-1 text-sm">
      {showParentNames && <p><strong>Parents:</strong> {parentNames || 'N/A'}</p>}
      {showSiblingNames && <p><strong>Siblings:</strong> {siblingNames || 'N/A'}</p>}
      {showAttributes && <p><strong>Preferred Attributes:</strong> {attributes?.join(', ') || 'None selected'}</p>}
      {showGender && <p><strong>Gender:</strong> {gender || 'Not specified'}</p>}
    </div>
  )}

      {showFeedbackPrompt && lastComparison && (
        <div className="mt-6 p-4 bg-secondaryDark border rounded shadow max-w-xl mx-auto text-text">
          <h4 className="font-semibold mb-2 text-sm">
            Why did you choose{' '}
            <span className="font-bold text-accent">
              {lastChoice === 'a' && lastPair?.[0]?.name}
              {lastChoice === 'b' && lastPair?.[1]?.name}
              {lastChoice === 'both' && 'Both'}
              {lastChoice === 'skip' && 'Neither'}
            </span>{' '}
            over{' '}
            <span className="text-text">
              {lastChoice === 'a' && lastPair?.[1]?.name}
              {lastChoice === 'b' && lastPair?.[0]?.name}
              {['both', 'skip'].includes(lastChoice) && `${lastPair?.[0]?.name} & ${lastPair?.[1]?.name}`}
            </span>
            ?
          </h4>

          <div className="space-y-1 mb-2">
            {feedbackOptions.map(option => (
              <label key={option.id} className="block text-sm text-text">
                <input
                  type="radio"
                  name="preset"
                  value={option.label}
                  checked={presetReason === option.label}
                  onChange={() => {
                    setPresetReason(option.label)
                    setCustomReason('')
                  }}
                  className="mr-2"
                />
                {option.label}
              </label>
            ))}
          </div>

          <textarea
            className="w-full p-2 border rounded text-sm mb-2 bg-secondaryDark text-text"
            placeholder="Other reason..."
            value={customReason}
            onChange={(e) => {
              setCustomReason(e.target.value)
              setPresetReason('')
            }}
          />

          <div className="flex justify-end gap-2">
            <button
              className="text-text text-sm hover:underline"
              onClick={() => setShowFeedbackPrompt(false)}
            >
              Dismiss
            </button>
            <button
              className="bg-accent text-text px-4 py-1 rounded text-sm hover:bg-secondaryDark"
              onClick={handleSubmitFeedback}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}

<div className="mt-8 border rounded bg-white shadow max-w-xl mx-auto">
  <button
    className="w-full text-left px-4 py-3 font-semibold bg-primary text-text rounded-t"
    onClick={() => setShowOptions(!showOptions)}
  >
    Options {showOptions ? '▲' : '▼'}
  </button>
  {showOptions && (
    <div className="px-4 py-3 border-t space-y-3 text-sm text-text">
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={showFullNames} onChange={() => setShowFullNames(!showFullNames)} />
        Show full names
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={showParentNames} onChange={() => setShowParentNames(!showParentNames)} />
        Show Parent Names
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={showSiblingNames} onChange={() => setShowSiblingNames(!showSiblingNames)} />
        Show Sibling Names
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={showGender} onChange={() => setShowGender(!showGender)} />
        Show Gender
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={showAttributes} onChange={() => setShowAttributes(!showAttributes)} />
        Show Preferred Attributes
      </label>
    </div>
  )}
</div>
    </div>
  )
}
