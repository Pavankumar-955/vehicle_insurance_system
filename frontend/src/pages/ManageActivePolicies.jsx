import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getMyActivePolicies, downloadPolicyPdf, requestPolicyCancellation, getMyCancellationRequests } from '../api/api'

export default function ManageActivePolicies() {
  const navigate = useNavigate()
  const [policies, setPolicies] = useState([])
  const [cancellationRequests, setCancellationRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedPolicy, setExpandedPolicy] = useState(null)
  const [cancellationReason, setCancellationReason] = useState('')
  const [cancelling, setCancelling] = useState(null)

  const loadPolicies = async () => {
    try {
      const [policiesRes, cancellationsRes] = await Promise.all([
        getMyActivePolicies(),
        getMyCancellationRequests()
      ])
      setPolicies(policiesRes.data || [])
      setCancellationRequests(cancellationsRes.data || [])
    } catch (err) {
      toast.error('Failed to load policies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPolicies()
  }, [])

  const handleDownloadPdf = async (policyId) => {
    try {
      const response = await downloadPolicyPdf(policyId)
      const url = window.URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `policy-${policyId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Policy PDF downloaded')
    } catch (err) {
      toast.error('Failed to download PDF')
    }
  }

  const handleCancelRequest = async (policyId) => {
    if (!cancellationReason.trim()) {
      toast.error('Please provide a reason for cancellation')
      return
    }

    if (cancellationReason.trim().length < 10) {
      toast.error('Reason must be at least 10 characters')
      return
    }

    setCancelling(policyId)
    try {
      await requestPolicyCancellation(policyId, { cancellationReason })
      toast.success('✓ Cancellation request submitted! Admin will review and approve/reject your request.')
      setCancellationReason('')
      setExpandedPolicy(null)
      loadPolicies()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit cancellation request'
      toast.error(msg)
    } finally {
      setCancelling(null)
    }
  }

  const handleRenew = async (policyId, policy) => {
    const daysLeft = daysRemaining(policy.endDate)
    if (daysLeft > 30) {
      toast.error('🔒 Renewal allowed only within 30 days of policy expiry date')
      return
    }
    try {
      await downloadPolicyPdf(policyId)
      toast.success('Policy renewed successfully!')
      loadPolicies()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to renew policy'
      toast.error(msg)
    }
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const daysRemaining = (endDate) => {
    const today = new Date()
    const end = new Date(endDate)
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getCancellationStatus = (policyId) => {
    const request = cancellationRequests.find(r => r.policyId === policyId)
    return request
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="skeleton h-12 w-12 rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-10">
        <button onClick={() => navigate('/dashboard')} className="text-gold-600 font-semibold flex items-center gap-2 mb-4 hover:text-gold-700">
          ← Back to Dashboard
        </button>
        <h1 className="heading-serif text-3xl text-neutral-900 mb-2">Manage Active Policies</h1>
        <p className="text-neutral-600 text-lg">View and manage your active insurance policies</p>
      </div>

      {policies.length === 0 ? (
        <div className="card-minimal p-8 text-center border-t-4 border-gold-600">
          <p className="text-neutral-600 text-lg mb-4">No active policies found</p>
          <button onClick={() => navigate('/buy-policy')} className="px-6 py-3 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95">
            Buy a Policy
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {policies.map((policy) => (
            <div key={policy.id} className="card-minimal border-t-4 border-gold-600 overflow-hidden">
              <div 
                onClick={() => setExpandedPolicy(expandedPolicy === policy.id ? null : policy.id)}
                className="p-6 cursor-pointer hover:bg-gold-50 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <p className="font-bold text-xl text-neutral-900">{policy.policyNumber}</p>
                      <span className="px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-xs font-semibold">
                        {policy.insuranceCategory === 'COMPREHENSIVE' ? '🛡️ Comprehensive' : '📋 Third Party'}
                      </span>
                      {getCancellationStatus(policy.id) && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          getCancellationStatus(policy.id).status === 'PENDING' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : getCancellationStatus(policy.id).status === 'APPROVED'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {getCancellationStatus(policy.id).status === 'PENDING' && '⏳ Cancellation Pending'}
                          {getCancellationStatus(policy.id).status === 'APPROVED' && '✓ Cancellation Approved'}
                          {getCancellationStatus(policy.id).status === 'REJECTED' && '✕ Cancellation Rejected'}
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-700 mb-2">{policy.insuranceCategory === 'COMPREHENSIVE' ? 'Comprehensive' : policy.insuranceCategory === 'THIRD_PARTY' ? 'Third Party' : (policy.policyType || policy.insuranceCategory || '')}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-600">Start Date</p>
                        <p className="font-semibold text-neutral-900">{formatDate(policy.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-neutral-600">Expiry Date</p>
                        <p className="font-semibold text-neutral-900">{formatDate(policy.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-neutral-600">Days Remaining</p>
                        <p className={`font-semibold ${daysRemaining(policy.endDate) <= 30 ? 'text-red-600' : 'text-green-600'}`}>
                          {daysRemaining(policy.endDate)} days
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-neutral-600 text-sm">Premium Amount</p>
                    <p className="font-bold text-2xl text-gold-600">₹{policy.premiumAmount?.toLocaleString()}</p>
                    <svg className={`w-6 h-6 text-neutral-400 mt-4 transition-transform ${expandedPolicy === policy.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              </div>

              {expandedPolicy === policy.id && (
                <div className="px-6 py-4 border-t border-neutral-200 bg-gold-50">
                  {getCancellationStatus(policy.id) && (
                    <div className="mb-6 p-4 bg-white rounded-lg border-2 border-orange-200">
                      <h3 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                        <span className="text-lg">
                          {getCancellationStatus(policy.id).status === 'PENDING' && '⏳'}
                          {getCancellationStatus(policy.id).status === 'APPROVED' && '✓'}
                          {getCancellationStatus(policy.id).status === 'REJECTED' && '✕'}
                        </span>
                        Cancellation Request - {getCancellationStatus(policy.id).status}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold text-neutral-700">Reason:</span> {getCancellationStatus(policy.id).cancellationReason}</p>
                        <p><span className="font-semibold text-neutral-700">Requested:</span> {formatDate(getCancellationStatus(policy.id).requestedAt)}</p>
                        {getCancellationStatus(policy.id).status !== 'PENDING' && (
                          <>
                            <p><span className="font-semibold text-neutral-700">Decision Date:</span> {formatDate(getCancellationStatus(policy.id).approvedAt)}</p>
                            {getCancellationStatus(policy.id).adminRemarks && (
                              <p><span className="font-semibold text-neutral-700">Admin Remarks:</span> {getCancellationStatus(policy.id).adminRemarks}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mb-6 p-4 bg-white rounded-lg border border-gold-200">
                    <h3 className="font-bold text-neutral-900 mb-3">Cancel This Policy</h3>
                    <textarea
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder="Please provide a reason for cancellation (minimum 10 characters)..."
                      maxLength={500}
                      rows={4}
                      className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all p-3 mb-2"
                    />
                    <p className="text-xs text-neutral-600 mb-3">{cancellationReason.length}/500 characters</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCancelRequest(policy.id)}
                        disabled={cancelling === policy.id || cancellationReason.trim().length < 10 || getCancellationStatus(policy.id)}
                        className="px-6 py-3 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 disabled:opacity-50"
                      >
                        {cancelling === policy.id ? 'Submitting...' : '✕ Submit Cancellation Request'}
                      </button>
                      <button
                        onClick={() => setCancellationReason('')}
                        className="px-6 py-3 bg-neutral-200 text-neutral-900 font-semibold rounded-lg hover:bg-neutral-300 transition-all duration-200 active:scale-95"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRenew(policy.id, policy)}
                      className="flex-1 px-6 py-3 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95"
                    >
                      🔄 Renew Policy
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(policy.id)}
                      className="flex-1 px-6 py-3 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95"
                    >
                      📄 Download PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
