import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Layout from './components/Layout'
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import Register from './pages/Register'
import CityMap from './pages/CityMap'
import AddIssue from './pages/AddIssue'
import MyIssues from './pages/MyIssues'
import MyReports from './pages/MyReports'
import EcologyInfo from './pages/EcologyInfo'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import IssueDetails from './pages/IssueDetails'

function App() {
  const hasCompletedOnboarding = useSelector(state => state.app.hasCompletedOnboarding)

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          hasCompletedOnboarding ? (
            <Layout />
          ) : (
            <Navigate to="/onboarding" replace />
          )
        }
      >
        <Route index element={<CityMap />} />
        <Route path="map" element={<CityMap />} />
        <Route path="add" element={<AddIssue />} />
        <Route path="add-issue" element={<AddIssue />} />
        <Route path="my-issues" element={<MyIssues />} />
        <Route path="my-reports" element={<MyReports />} />
        <Route path="ecology" element={<EcologyInfo />} />
        <Route path="profile" element={<Profile />} />
        <Route path="edit-profile" element={<EditProfile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="issue/:id" element={<IssueDetails />} />
      </Route>
    </Routes>
  )
}

export default App
