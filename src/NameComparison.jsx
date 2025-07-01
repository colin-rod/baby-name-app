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
        className="w-full py-8 px-6 bg-blue-600 text-white text-3xl rounded shadow hover:bg-blue-700 active:scale-95 transition-all"
        onClick={() => handleChoice(position)}
        disabled={submitting}
      >
        {showFullNames && lastName ? `${nameObj?.name} ${lastName}` : nameObj?.name}
      </button>
    </div>
  )
  

  return (
    <div className={`mt-6 relative transition-opacity duration-300 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'}`}>
<h3 className="text-lg font-semibold mb-4 text-center">
  Which name do you prefer?
  <span className="ml-2 text-sm text-gray-600 inline-flex items-center gap-1">
    <span className="underline decoration-dotted">Family context & preferences</span>
    <span className="cursor-pointer" data-tooltip-id="context-tooltip">
      <FaInfoCircle />
    </span>
  </span>
</h3>

<Tooltip id="context-tooltip" place="top" effect="solid" renderInPortal={true} className="!text-sm !p-3 !bg-gray-800 !text-white !rounded shadow-lg" style={{ maxWidth: '250px', whiteSpace: 'normal',zIndex: 9999 }}>
  <div className="text-sm text-left">
    <p><strong>Parents:</strong> {parentNames || 'N/A'}</p>
    <p><strong>Siblings:</strong> {siblingNames || 'N/A'}</p>
    <p><strong>Preferred Attributes:</strong> {attributes?.join(', ') || 'None selected'}</p>
    <p><strong>Gender:</strong> {gender || 'Not specified'}</p>
  </div>
</Tooltip>

<div className="flex justify-center items-center mb-2 text-sm text-gray-700 gap-2">
  <label htmlFor="showFullNames" className="cursor-pointer">
    <input
      type="checkbox"
      id="showFullNames"
      checked={showFullNames}
      onChange={() => setShowFullNames(!showFullNames)}
      className="mr-1"
    />
    Show full names
  </label>
</div>


      <div className="flex items-center justify-center gap-4 mb-4">
        {renderNameButton(pair[0], 'a')}
        <div className="text-lg text-gray-500 font-semibold px-2">or</div>
        {renderNameButton(pair[1], 'b')}
      </div>

      <div className="mt-6 space-y-2 max-w-md mx-auto">
        <button
          className="w-full py-3 bg-green-500 text-white rounded shadow hover:bg-green-600 flex items-center justify-center gap-2"
          onClick={() => handleChoice('both')}
          disabled={submitting}
        >
          <FaCheckDouble /> Both <FaCheckDouble />
        </button>
        <button
          className="w-full py-3 bg-red-500 text-white rounded shadow hover:bg-red-600 flex items-center justify-center gap-2"
          onClick={() => handleChoice('skip')}
          disabled={submitting}
        >
          <FaTimesCircle /> Neither <FaTimesCircle />
        </button>
      </div>

      {showFeedbackPrompt && lastComparison && (
        <div className="mt-6 p-4 bg-white border rounded shadow max-w-xl mx-auto">
          <h4 className="font-semibold mb-2 text-sm">
            Why did you choose{' '}
            <span className="font-bold text-blue-600">
              {lastChoice === 'a' && lastPair?.[0]?.name}
              {lastChoice === 'b' && lastPair?.[1]?.name}
              {lastChoice === 'both' && 'Both'}
              {lastChoice === 'skip' && 'Neither'}
            </span>{' '}
            over{' '}
            <span className="text-gray-700">
              {lastChoice === 'a' && lastPair?.[1]?.name}
              {lastChoice === 'b' && lastPair?.[0]?.name}
              {['both', 'skip'].includes(lastChoice) && `${lastPair?.[0]?.name} & ${lastPair?.[1]?.name}`}
            </span>
            ?
          </h4>

          <div className="space-y-1 mb-2">
            {feedbackOptions.map(option => (
              <label key={option.id} className="block text-sm">
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
            className="w-full p-2 border rounded text-sm mb-2"
            placeholder="Other reason..."
            value={customReason}
            onChange={(e) => {
              setCustomReason(e.target.value)
              setPresetReason('')
            }}
          />

          <div className="flex justify-end gap-2">
            <button
              className="text-gray-600 text-sm hover:underline"
              onClick={() => setShowFeedbackPrompt(false)}
            >
              Dismiss
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700"
              onClick={handleSubmitFeedback}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
