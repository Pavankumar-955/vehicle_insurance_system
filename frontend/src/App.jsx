import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import CustomerDashboard from './pages/CustomerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminTickets from './pages/AdminTickets'
import AdminPlans from './pages/AdminPlans'
import BuyPolicy from './pages/BuyPolicy'
import ManageActivePolicies from './pages/ManageActivePolicies'
import MyVehicles from './pages/MyVehicles'
import AddVehicle from './pages/AddVehicle'
import Claims from './pages/Claims'
import Tickets from './pages/Tickets'
import UserProfile from './pages/UserProfile'
import Layout from './components/Layout'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.some(r => user.roles?.includes(r))) {
    return <Navigate to={user.roles?.includes('ROLE_ADMIN') ? '/admin' : '/dashboard'} replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
          <Layout><CustomerDashboard /></Layout>
        </ProtectedRoute>
      } />
      {/* Plans page removed from UI */}
      <Route path="/buy-policy" element={
        <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
          <Layout><BuyPolicy /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/manage-policies" element={
        <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
          <Layout><ManageActivePolicies /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/my-vehicles" element={
        <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
          <Layout><MyVehicles /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/add-vehicle" element={
        <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
          <Layout><AddVehicle /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/claims" element={
        <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
          <Layout><Claims /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/tickets" element={
        <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
          <Layout><Tickets /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
          <Layout><UserProfile /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
          <Layout><AdminDashboard /></Layout>
        </ProtectedRoute>
      } />
      {/* Admin plans route removed */}
      <Route path="/admin/customers" element={
        <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
          <Layout><AdminDashboard tab="customers" /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/policies" element={
        <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
          <Layout><AdminDashboard tab="policies" /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/claims" element={
        <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
          <Layout><AdminDashboard tab="claims" /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/cancellations" element={
        <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
          <Layout><AdminDashboard tab="cancellations" /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/tickets" element={
        <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
          <Layout><AdminTickets /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/plans" element={
        <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
          <Layout><AdminPlans /></Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
