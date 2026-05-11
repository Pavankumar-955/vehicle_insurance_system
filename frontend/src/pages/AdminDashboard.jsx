import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getAdminDashboard,
  getAdminCustomers,
  getAdminPolicies,
  getAdminClaims,
  getAllTickets,
  updateClaimStatus,
  updateTicketStatus,
  getClaimDocuments,
  downloadDocument,
  getAdminPendingCancellationRequests,
  approveCancellationRequest,
  rejectCancellationRequest,
  getUserProfile,
} from '../api/api'

const TABS = ['dashboard', 'customers', 'policies', 'claims', 'cancellations', 'tickets', 'plans']

export default function AdminDashboard({ tab = 'dashboard' }) {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [customers, setCustomers] = useState([])
  
  const [policies, setPolicies] = useState([])
  const [claims, setClaims] = useState([])
  const [tickets, setTickets] = useState([])
  const [cancellations, setCancellations] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [claimModal, setClaimModal] = useState(null)
  const [claimDocuments, setClaimDocuments] = useState([])
  const [cancellationModal, setCancellationModal] = useState(null)
  const [cancellationAction, setCancellationAction] = useState(null)
  const [adminRemarks, setAdminRemarks] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [customerDetailsModal, setCustomerDetailsModal] = useState(null)
  const [customerDetails, setCustomerDetails] = useState(null)
  const [loadingCustomerDetails, setLoadingCustomerDetails] = useState(false)

  const load = () => {
    setLoading(true)
    const t = TABS.includes(tab) ? tab : 'dashboard'
    const p = [getAdminDashboard().then((r) => setStats(r.data))]
    if (t === 'customers') p.push(getAdminCustomers().then((r) => setCustomers(r.data || [])))
    if (t === 'policies') p.push(getAdminPolicies().then((r) => setPolicies(r.data || [])))
    if (t === 'claims') p.push(getAdminClaims().then((r) => setClaims(r.data || [])))
    if (t === 'cancellations') p.push(getAdminPendingCancellationRequests().then((r) => setCancellations(r.data || [])))
    if (t === 'tickets') p.push(getAllTickets().then((r) => setTickets(r.data || [])))
    Promise.all(p).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [tab])

  // Plan management removed from admin UI

  const handleClaimStatus = async (id, status, remark) => {
    try {
      await updateClaimStatus(id, { status, adminRemark: remark })
      toast.success('Claim updated')
      setClaimModal(null)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleOpenClaimModal = async (claim) => {
    setClaimModal(claim)
    try {
      const docs = await getClaimDocuments(claim.id)
      setClaimDocuments(docs.data || [])
    } catch (err) {
      toast.error('Failed to load documents')
      setClaimDocuments([])
    }
  }

  const handleApproveCancellation = async (requestId) => {
    setActionLoading(true)
    try {
      await approveCancellationRequest(requestId, { adminRemarks })
      toast.success('✓ Policy cancellation approved!')
      setAdminRemarks('')
      setCancellationModal(null)
      setCancellationAction(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectCancellation = async (requestId) => {
    if (!adminRemarks.trim()) {
      toast.error('Please provide reason for rejection')
      return
    }
    setActionLoading(true)
    try {
      await rejectCancellationRequest(requestId, { adminRemarks })
      toast.success('✕ Cancellation request rejected')
      setAdminRemarks('')
      setCancellationModal(null)
      setCancellationAction(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDownloadDocument = async (docId, fileName) => {
    try {
      const response = await downloadDocument(docId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      toast.error('Download failed')
    }
  }

  const handleOpenCustomerDetails = async (customerId) => {
    setCustomerDetailsModal(customerId)
    setLoadingCustomerDetails(true)
    try {
      const response = await getUserProfile(customerId)
      setCustomerDetails(response.data?.data)
    } catch (err) {
      toast.error('Failed to load customer details')
    } finally {
      setLoadingCustomerDetails(false)
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex justify-center py-12">
        <div className="skeleton h-12 w-12 rounded-full" />
      </div>
    )
  }

  const activeTab = TABS.includes(tab) ? tab : 'dashboard'

  return (
    <div>
      <div className="mb-8 pb-6 border-b border-gold-100">
        <div className="mb-6">
          <h1 className="heading-serif text-3xl text-neutral-900 mb-2">Admin Dashboard</h1>
          <p className="text-neutral-600 text-lg">Manage plans, policies, customers, claims and tickets</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => navigate(`/admin${t === 'dashboard' ? '' : '/' + t}`)}
              className={`px-6 py-2.5 rounded-lg font-medium capitalize transition-all duration-200 focus:ring-2 focus:ring-gold-300 outline-none ${activeTab === t ? 'bg-gold-600 text-white shadow-lg shadow-gold-200 hover:bg-gold-700 active:scale-95' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'dashboard' && stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="card-minimal p-6 bg-gradient-to-br from-neutral-50 to-white border-l-4 border-gold-600 hover:shadow-lg transition-all animate-fade-in">
            <p className="text-sm text-neutral-600 font-medium mb-2">Customers</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.totalCustomers ?? 0}</p>
            <p className="text-xs text-neutral-500 mt-2">Registered users</p>
          </div>
          <div className="card-minimal p-6 bg-gradient-to-br from-neutral-50 to-white border-l-4 border-gold-600 hover:shadow-lg transition-all animate-fade-in">
            <p className="text-sm text-neutral-600 font-medium mb-2">Total Policies</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.totalPolicies ?? 0}</p>
            <p className="text-xs text-neutral-500 mt-2">All policies</p>
          </div>
          <div className="card-minimal p-6 bg-gradient-to-br from-gold-50 to-white border-l-4 border-gold-600 hover:shadow-lg transition-all animate-fade-in">
            <p className="text-sm text-neutral-600 font-medium mb-2">Active Policies</p>
            <p className="text-3xl font-bold text-gold-600">{stats.activePolicies ?? 0}</p>
            <p className="text-xs text-gold-600 mt-2">Currently active</p>
          </div>
          <div className="card-minimal p-6 bg-gradient-to-br from-neutral-50 to-white border-l-4 border-gold-600 hover:shadow-lg transition-all animate-fade-in">
            <p className="text-sm text-neutral-600 font-medium mb-2">Total Claims</p>
            <p className="text-3xl font-bold text-neutral-900">{stats.totalClaims ?? 0}</p>
            <p className="text-xs text-neutral-500 mt-2">All claims</p>
          </div>
          <div className="card-minimal p-6 bg-gradient-to-br from-amber-50 to-white border-l-4 border-gold-600 hover:shadow-lg transition-all animate-fade-in">
            <p className="text-sm text-neutral-600 font-medium mb-2">Pending Claims</p>
            <p className="text-3xl font-bold text-amber-600">{stats.pendingClaims ?? 0}</p>
            <p className="text-xs text-amber-600 mt-2">Awaiting approval</p>
          </div>
        </div>
      )}

      {/* Plans removed from admin UI */}

      {activeTab === 'customers' && (
        <div className="card-minimal overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-4">{c.fullName}</td>
                  <td className="px-6 py-4">{c.email}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleOpenCustomerDetails(c.id)}
                      className="text-gold-600 hover:text-gold-700 font-medium text-sm"
                    >
                      More Info
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="card-minimal overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50"><tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">POLICY TYPE</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premium</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200">
              {policies.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{p.policyNumber}</td>
                  <td className="px-6 py-4">{p.userFullName}</td>
                  <td className="px-6 py-4">{p.vehicleNumber}</td>
                   <td className="px-6 py-4">{p.insuranceCategory === 'COMPREHENSIVE' ? 'Comprehensive' : p.insuranceCategory === 'THIRD_PARTY' ? 'Third Party' : (p.policyType || p.insuranceCategory || '-')}</td>
                  <td className="px-6 py-4">₹{Number(p.premiumAmount).toLocaleString()}</td>
                  <td className="px-6 py-4">{p.startDate ? new Date(p.startDate).toLocaleDateString('en-IN') : '-'}</td>
                  <td className="px-6 py-4">{p.endDate ? new Date(p.endDate).toLocaleDateString('en-IN') : '-'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-medium ${p.status === 'ACTIVE' ? 'bg-gold-100 text-gold-700' : 'bg-neutral-100 text-neutral-700'}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'claims' && (
        <div className="card-minimal overflow-hidden border border-gold-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gold-50 to-gold-100"><tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gold-900 uppercase">Claim #</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gold-900 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gold-900 uppercase">Policy</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gold-900 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gold-900 uppercase">Coverage Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gold-900 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gold-900 uppercase">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200">
              {claims.map((c) => (
                <tr key={c.id} className="hover:bg-gold-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-neutral-900">{c.claimNumber}</td>
                  <td className="px-6 py-4 text-neutral-700">{c.userFullName}</td>
                  <td className="px-6 py-4 text-neutral-700">{c.policyNumber}</td>
                  <td className="px-6 py-4 max-w-xs truncate text-neutral-700">{c.claimDescription}</td>
                  <td className="px-6 py-4 font-semibold text-gold-600">{c.claimSettlementType === 'CASHLESS' ? '💳 Cashless' : c.claimSettlementType === 'REIMBURSEMENT' ? '💰 Reimbursement' : c.claimSettlementType || '—'}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.status === 'APPROVED' ? 'bg-gold-100 text-gold-700' : c.status === 'REJECTED' ? 'bg-neutral-100 text-neutral-700' : 'bg-orange-100 text-orange-700'}`}>{c.status}</span></td>
                  <td className="px-6 py-4">
                    {c.status === 'PENDING' && (
                      <button onClick={() => handleOpenClaimModal(c)} className="px-4 py-2 bg-gold-600 text-white font-medium text-sm rounded-lg hover:bg-gold-700 transition-all duration-200 active:scale-95">Review</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'cancellations' && (
        <div className="space-y-4">
          {cancellations.length === 0 ? (
            <div className="card-minimal p-12 text-center border-t-4 border-gold-600">
              <p className="text-neutral-500 text-lg">No pending policy cancellation requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cancellations.map((req) => (
                <div key={req.id} className="card-minimal border-t-4 border-gold-600 overflow-hidden">
                  <div className="p-6 hover:bg-gold-50 transition-all duration-200">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-mono text-xs bg-gold-100 text-gold-900 px-3 py-1 rounded-lg font-semibold">{req.policyNumber}</span>
                          <span className="text-sm font-semibold text-neutral-600">Category: {req.insuranceCategory === 'COMPREHENSIVE' ? '🛡️ Comprehensive' : '📋 Third Party'}</span>
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-2">Customer: {req.userFullName}</h3>
                        <p className="text-neutral-600 text-sm mb-3">Email: {req.userEmail}</p>
                        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 mb-4">
                          <p className="text-sm text-neutral-600 mb-1 font-semibold">Cancellation Reason:</p>
                          <p className="text-neutral-900">{req.cancellationReason}</p>
                        </div>
                        <div className="text-xs text-neutral-500">
                          📅 Requested on: {new Date(req.requestedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => { setCancellationModal(req); setCancellationAction('approve'); setAdminRemarks(''); }}
                          className="px-6 py-3 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 whitespace-nowrap"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => { setCancellationModal(req); setCancellationAction('reject'); setAdminRemarks(''); }}
                          className="px-6 py-3 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 whitespace-nowrap"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="card-minimal p-12 text-center">
              <p className="text-neutral-500">No support tickets</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="card-minimal p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs bg-neutral-100 px-2 py-1 rounded">{ticket.ticketNumber}</span>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          ticket.status === 'OPEN' ? 'bg-orange-100 text-orange-700' :
                          ticket.status === 'IN_PROGRESS' ? 'bg-gold-100 text-gold-700' :
                          ticket.status === 'RESOLVED' ? 'bg-gold-100 text-gold-700' :
                          'bg-neutral-100 text-neutral-700'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900">{ticket.subject}</h4>
                      <p className="text-sm text-gray-600 mt-1">{ticket.description.substring(0, 100)}...</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>From: {ticket.userFullName}</span>
                        <span>Category: {ticket.category}</span>
                        <span>{ticket.replyCount} replies</span>
                      </div>
                    </div>
                    <select
                      value={ticket.status}
                      onChange={(e) => {
                        if (e.target.value !== ticket.status) {
                          updateTicketStatus(ticket.id, e.target.value)
                            .then(() => { toast.success('Ticket status updated'); load() })
                            .catch(() => toast.error('Failed to update'))
                        }
                      }}
                      className="input-minimal text-xs ml-4"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="WAITING_FOR_CUSTOMER">Waiting for Customer</option>
                      <option value="WAITING_FOR_ADMIN">Waiting for Admin</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'plans' && (
        <div>
          <p className="mb-6 text-neutral-600">Navigate to <button onClick={() => navigate('/admin/plans')} className="font-semibold text-gold-600 hover:text-gold-700 underline">Insurance Plans Manager</button> to manage plans.</p>
        </div>
      )}

      {cancellationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="card-minimal p-8 max-w-2xl w-full border-t-4 border-gold-600 shadow-2xl">
            <h3 className="text-2xl font-semibold text-neutral-900 mb-2">
              {cancellationAction === 'approve' ? '✓ Approve Cancellation' : '✕ Reject Cancellation'}
            </h3>
            <p className="text-neutral-600 mb-6">Policy: <span className="font-mono font-bold">{cancellationModal.policyNumber}</span></p>
            
            <div className="mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <p className="text-sm text-neutral-600 mb-1 font-semibold">Customer Reason:</p>
              <p className="text-neutral-900">{cancellationModal.cancellationReason}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                {cancellationAction === 'approve' ? 'Optional Approval Notes' : 'Reason for Rejection (Required)'}
              </label>
              <textarea
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder={cancellationAction === 'approve' ? 'Add any notes...' : 'Provide reason for rejection...'}
                maxLength={500}
                rows={4}
                className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all p-3"
              />
              <p className="text-xs text-neutral-500 mt-1">{adminRemarks.length}/500 characters</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => cancellationAction === 'approve' ? handleApproveCancellation(cancellationModal.id) : handleRejectCancellation(cancellationModal.id)}
                disabled={actionLoading || (cancellationAction === 'reject' && !adminRemarks.trim())}
                className={`flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 ${
                  cancellationAction === 'approve'
                    ? 'bg-gold-600 hover:bg-gold-700 shadow-lg shadow-gold-200'
                    : 'bg-gold-600 hover:bg-gold-700 shadow-lg shadow-gold-200'
                }`}
              >
                {actionLoading ? 'Processing...' : (cancellationAction === 'approve' ? '✓ Approve Cancellation' : '✕ Reject Cancellation')}
              </button>
              <button
                onClick={() => { setCancellationModal(null); setCancellationAction(null); setAdminRemarks(''); }}
                className="flex-1 px-6 py-3 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {claimModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="card-minimal p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-t-4 border-gold-600 shadow-2xl">
            <div className="mb-6 pb-6 border-b border-gold-100">
              <h3 className="text-2xl font-semibold text-neutral-900 mb-2">Claim {claimModal.claimNumber}</h3>
              <p className="text-neutral-600">{claimModal.claimDescription}</p>
              
              {/* Claim Details Grid */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-gold-50 rounded-lg">
                  <p className="text-xs text-neutral-600 font-semibold uppercase">Policy</p>
                  <p className="text-sm font-semibold text-neutral-900">{claimModal.policyNumber}</p>
                </div>
                <div className="p-3 bg-gold-50 rounded-lg">
                  <p className="text-xs text-neutral-600 font-semibold uppercase">Settlement Type</p>
                  <p className="text-sm font-semibold text-gold-600">
                    {claimModal.claimSettlementType === 'CASHLESS' ? '💳 Cashless' : claimModal.claimSettlementType === 'REIMBURSEMENT' ? '💰 Reimbursement' : claimModal.claimSettlementType || 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-gold-50 rounded-lg">
                  <p className="text-xs text-neutral-600 font-semibold uppercase">Status</p>
                  <p className="text-sm font-semibold text-gold-600">{claimModal.status}</p>
                </div>
                <div className="p-3 bg-gold-50 rounded-lg">
                  <p className="text-xs text-neutral-600 font-semibold uppercase">Submitted</p>
                  <p className="text-sm font-semibold text-neutral-900">{claimModal.submittedAt ? new Date(claimModal.submittedAt).toLocaleDateString('en-IN') : '—'}</p>
                </div>
              </div>
            </div>
            
            {/* Documents Section */}
            <div className="mb-6 p-4 bg-gold-50 rounded-lg border-l-4 border-gold-600">
              <h4 className="font-semibold text-neutral-900 text-lg mb-4">Uploaded Documents</h4>
              {claimDocuments.length === 0 ? (
                <p className="text-neutral-600 text-center py-4">No documents attached</p>
              ) : (
                <div className="space-y-3">
                  {claimDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gold-200 hover:shadow-md transition-all">
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-900">{doc.fileName}</p>
                        <p className="text-sm text-neutral-500">{(doc.fileSize / 1024).toFixed(2)} KB</p>
                      </div>
                      <button
                        onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                        className="ml-4 px-4 py-2 bg-gold-600 text-white font-medium rounded-lg hover:bg-gold-700 transition-all duration-200 active:scale-95"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Admin Remark (Optional)</label>
              <textarea id="claim-remark" placeholder="Add your remarks or decision notes..." className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all" rows={3} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleClaimStatus(claimModal.id, 'APPROVED', document.getElementById('claim-remark')?.value)} className="flex-1 px-4 py-3 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95">✓ Approve</button>
              <button onClick={() => handleClaimStatus(claimModal.id, 'REJECTED', document.getElementById('claim-remark')?.value)} className="flex-1 px-4 py-3 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95">✕ Reject</button>
              <button onClick={() => setClaimModal(null)} className="flex-1 px-4 py-3 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {customerDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-auto">
            <div className="bg-gradient-to-r from-gold-600 to-gold-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Customer Details</h2>
              <button
                onClick={() => setCustomerDetailsModal(null)}
                className="text-white text-2xl leading-none hover:opacity-75"
              >
                ✕
              </button>
            </div>

            {loadingCustomerDetails ? (
              <div className="p-6 text-center">Loading...</div>
            ) : customerDetails ? (
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-semibold">Full Name</p>
                  <p className="text-base font-medium text-neutral-900">{customerDetails.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-semibold">Email</p>
                  <p className="text-base font-medium text-neutral-900">{customerDetails.email}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-semibold">Mobile Number</p>
                  <p className="text-base font-medium text-neutral-900">{customerDetails.mobileNumber || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-semibold">Date of Birth</p>
                  <p className="text-base font-medium text-neutral-900">{customerDetails.dateOfBirth || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-semibold">Address</p>
                  <p className="text-base font-medium text-neutral-900">{customerDetails.addressLine || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-semibold">City</p>
                  <p className="text-base font-medium text-neutral-900">{customerDetails.city || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-semibold">State</p>
                  <p className="text-base font-medium text-neutral-900">{customerDetails.state || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-semibold">Pincode</p>
                  <p className="text-base font-medium text-neutral-900">{customerDetails.pincode || '—'}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-neutral-600">Failed to load customer details</div>
            )}

            <div className="border-t px-6 py-4 bg-neutral-50 flex justify-end">
              <button
                onClick={() => setCustomerDetailsModal(null)}
                className="px-4 py-2 bg-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-400 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
