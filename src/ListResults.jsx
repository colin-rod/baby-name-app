import { theme } from './theme';
import { useEffect, useState } from 'react'
import { useParams, Link, Outlet } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Navbar from './Navbar'

export default function ListResultsLayout() {
  return (
    <Outlet />
  )
}


export function ListResultsContent() {
  const [names, setNames] = useState([])
  const { id } = useParams()
  const [comparisons, setComparisons] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedbackMap, setFeedbackMap] = useState({})
  const [activeNameId, setActiveNameId] = useState(null)
  const [feedbackOptions, setFeedbackOptions] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: namesData, error: namesError } = await supabase
        .from('names')
        .select('*')
        .eq('list_id', id)

      const { data: compsData, error: compsError } = await supabase
        .from('comparisons')
        .select('*')
        .eq('list_id', id)

      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*, comparisons!inner(*)')
        .in('comparisons.list_id', [id])

      const { data: optionsData, error: optionsError } = await supabase
        .from('feedback_options')
        .select('*')

      if (namesError || compsError || feedbackError || optionsError) {
        console.error(namesError || compsError || feedbackError || optionsError)
      } else {
        setNames(namesData)
        setComparisons(compsData)
        setFeedbackOptions(optionsData)

        const feedbackGrouped = {}
        feedbackData.forEach((fb) => {
          const relatedNameId =
            fb.comparisons.chosen === 'a' ? fb.comparisons.name_a_id : fb.comparisons.name_b_id
          if (!feedbackGrouped[relatedNameId]) feedbackGrouped[relatedNameId] = []
          feedbackGrouped[relatedNameId].push(fb)
        })
        setFeedbackMap(feedbackGrouped)
      }

      setLoading(false)
    }

    fetchData()
  }, [id])

  const calculateScores = () => {
    const initialRating = 1000
    const K = 32
    const ratingMap = {}

    names.forEach((n) => {
      ratingMap[n.id] = {
        id: n.id,
        name: n.name,
        rating: initialRating,
        wins: 0,
        losses: 0,
        draws: 0,
      }
    })

    comparisons.forEach((comp) => {
      const a = ratingMap[comp.name_a_id]
      const b = ratingMap[comp.name_b_id]

      if (!a || !b) return

      const expectedA = 1 / (1 + Math.pow(10, (b.rating - a.rating) / 400))
      const expectedB = 1 / (1 + Math.pow(10, (a.rating - b.rating) / 400))

      let scoreA = 0.5
      let scoreB = 0.5

      if (comp.chosen === 'a') {
        scoreA = 1
        scoreB = 0
        a.wins++
        b.losses++
      } else if (comp.chosen === 'b') {
        scoreA = 0
        scoreB = 1
        a.losses++
        b.wins++
      } else if (comp.chosen === 'both') {
        a.draws++
        b.draws++
      } else {
        return
      }

      a.rating += K * (scoreA - expectedA)
      b.rating += K * (scoreB - expectedB)
    })

    return Object.values(ratingMap).sort((a, b) => b.rating - a.rating)
  }

  const getOptionLabel = (id) => {
    const found = feedbackOptions.find(opt => opt.id === id)
    return found ? found.label : id
  }

  const getOptionCounts = (feedbacks) => {
    const counts = {}
    feedbacks.forEach(fb => {
      if (fb.option_id) {
        const label = getOptionLabel(fb.option_id)
        counts[label] = (counts[label] || 0) + 1
      }
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }

  const getCustomReasons = (feedbacks) => {
    return feedbacks
      .filter(fb => fb.custom_reason && fb.custom_reason.trim() !== '')
      .map(fb => fb.custom_reason)
  }

  const rankedNames = calculateScores()

  return (
    <main style={{ backgroundColor: theme.background }} className="p-8 max-w-2xl mx-auto rounded">
      <h1 className="text-2xl font-bold mb-6 text-center">📊 Name Rankings</h1>

      {loading ? (
        <p>Loading...</p>
      ) : rankedNames.length === 0 ? (
        <p className="text-gray-500">No comparisons yet. Start choosing between names!</p>
      ) : (
        <ol className="space-y-4">
          {rankedNames.map((entry) => (
            <li
              key={entry.id}
              className="bg-white p-4 rounded border shadow hover:shadow-md transition relative"
              style={{ borderColor: theme.primary }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">{entry.name}</h3>
                  <p className="text-sm text-gray-600">
                    Elo: {Math.round(entry.rating)} — W: {entry.wins} | L: {entry.losses} | D: {entry.draws}
                  </p>
                </div>
                {feedbackMap[entry.id] && (
                  <button
                    onClick={() =>
                      setActiveNameId(activeNameId === entry.id ? null : entry.id)
                    }
                    className="underline text-sm"
                    style={{ color: theme.accent }}
                  >
                    {activeNameId === entry.id ? 'Hide Feedback' : 'View Feedback'}
                  </button>
                )}
              </div>

              {activeNameId === entry.id && (
                <div className="mt-4">
                  <div className="mb-2">
                    <h4 className="font-semibold text-sm mb-1">Feedback Summary</h4>
                    <ul className="text-sm text-gray-700 list-disc pl-4 mb-2">
                      {getOptionCounts(feedbackMap[entry.id]).map(([label, count]) => (
                        <li key={label}>{label}: {count}</li>
                      ))}
                    </ul>
                    <h5 className="font-semibold text-sm mb-1">Other Feedback</h5>
                    <ul className="text-sm text-gray-700 list-disc pl-4">
                      {getCustomReasons(feedbackMap[entry.id]).map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8 text-center">
        <Link
          to={`/list/${id}`}
          className="underline hover:opacity-80"
          style={{ color: theme.accent }}
        >
          ← Back to List
        </Link>
      </div>
    </main>
  )
}
