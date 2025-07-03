import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Dashboard from './Dashboard'
import NameListUpload from './NameListUpload'
import ListDetail from './ListDetail'
import ListResultsLayout, { ListResultsContent } from './ListResults'
import AppLayout from './AppLayout'
import Settings from './Settings'
import ForgotPassword from './ForgotPassword'
import EditList from './EditList'
import NameComparison from './NameComparison'
import NameComparisonPage from './NameComparisonPage'
import InvitePage from './InvitePage'
import ManageLists from './ManageLists'
import FAQ from './FAQ';








function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <Router>
  <Routes>
    {!session ? (
      // Public Routes (auth, forgot password)
      <>
        <Route path="*" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </>
    ) : (
      // Private Routes (authenticated)
      <>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard user={session.user} />} />
          <Route path="/upload" element={<NameListUpload user={session.user} />} />
          <Route path="/list/:id" element={<ListDetail user={session.user} />} />
          <Route path="/list/:id/results" element={<ListResultsContent />} />
          <Route path="/list/:id/compare" element={<NameComparisonPage user={session.user} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/edit/:id" element={<EditList user={session.user} />} />
          <Route path="/manage-lists" element={<ManageLists user={session.user} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </>
    )}

    {/* ✅ Always accessible */}
    <Route path="/invite" element={<InvitePage />} />
    <Route path="/faq" element={<FAQ />} />
  </Routes>
</Router>
  )
}


export default App
