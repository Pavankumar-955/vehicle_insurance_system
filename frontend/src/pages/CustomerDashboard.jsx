import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getVehicles, getMyPolicies, getMyActivePolicies, renewPolicy, downloadPolicyPdf } from '../api/api'

export default function CustomerDashboard() {
  const [vehicles, setVehicles] = useState([])
  const [policies, setPolicies] = useState([])
  const [activeCount, setActiveCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [renewing, setRenewing] = useState(null)

  const loadDashboard = async () => {
    try {
      const [v, p, a] = await Promise.all([getVehicles(), getMyPolicies(), getMyActivePolicies()])
      setVehicles(v.data)
      setPolicies(p.data?.slice(0, 5) || [])
      setActiveCount(Array.isArray(a.data) ? a.data.length : 0)
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const handleRenew = async (policyId, policy) => {
    const daysLeft = daysRemaining(policy.endDate)
    if (daysLeft > 30) {
      toast.error('🔒 Renewal allowed only within 30 days of policy expiry date')
      return
    }
    setRenewing(policyId)
    try {
      await renewPolicy(policyId)
      toast.success('Policy renewed successfully!')
      loadDashboard()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to renew policy'
      toast.error(msg)
    } finally {
      setRenewing(null)
    }
  }

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

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const daysRemaining = (endDate) => {
    if (!endDate) return Infinity
    const today = new Date()
    const end = new Date(endDate)
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
    return diff
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
        <h1 className="heading-serif text-neutral-900 mb-2">Welcome Back</h1>
        <p className="text-neutral-600">Manage your vehicles, policies, and insurance with ease</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="card-minimal group p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">My Vehicles</p>
            <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition duration-300">
              <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-gold-600 mb-4">{vehicles.length}</p>
          <div className="space-y-2 flex flex-col">
            <Link to="/my-vehicles" className="link-underline text-gold-600 text-sm font-semibold flex items-center gap-1">
              📋 My Vehicles <span>→</span>
            </Link>
            <Link to="/add-vehicle" className="link-underline text-gold-600 text-sm font-semibold flex items-center gap-1">
              ➕ Add Vehicle <span>→</span>
            </Link>
          </div>
        </div>

        <div className="card-minimal group p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Active Policies</p>
            <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition duration-300">
              <svg className="w-6 h-6 text-gold-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-2.77 3.066 3.066 0 00-3.58 3.03A3.066 3.066 0 006.267 3.455z" clipRule="evenodd" />
                <path d="M12.935 11.75a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-gold-600 mb-4">{activeCount}</p>
          <Link to="/manage-policies" className="link-underline text-gold-600 text-sm font-semibold flex items-center gap-1">
            Manage <span>→</span>
          </Link>
        </div>

        <div className="card-minimal group p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Total Policies</p>
            <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition duration-300">
              <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-gold-600 mb-4">{policies.length}</p>
          {/* <Link to="/buy-policy" className="link-underline text-gold-600 text-sm font-semibold flex items-center gap-1">
            Buy More <span>→</span>
          </Link> */}
        </div>

        <div className="card-minimal group p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Quick Links</p>
            <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition duration-300">
              <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <Link to="/claims" className="link-underline text-gold-600 text-sm font-semibold flex items-center gap-1">
              Claims <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Content Cards */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Vehicles Section */}
        <div className="card-minimal overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center">
            <h2 className="heading-md text-neutral-900">My Vehicles</h2>
            {/*<Link to="/buy-policy" className="px-4 py-2 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95">
              + Add
            </Link>*/}
          </div>
          <div className="divide-y max-h-80 overflow-y-auto">
            {vehicles.length === 0 ? (
              <p className="p-6 text-neutral-500 text-center text-sm">No vehicles yet. Add one when buying a policy.</p>
            ) : (
              vehicles.map((v) => (
                <div key={v.id} className="px-6 py-4 hover:bg-gold-50 transition duration-300 group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900">{v.vehicleNumber}</p>
                      <p className="text-sm text-neutral-600 mt-1">
                        {v.vehicleType} • {v.brand} {v.model}
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-gold-100 text-gold-700 rounded-lg text-xs font-semibold group-hover:bg-gold-200 transition">
                      {v.vehicleType}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Policies Section */}
        <div className="card-minimal overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center">
            <h2 className="heading-md text-neutral-900">Recent Policies</h2>
            <Link to="/buy-policy" className="px-4 py-2 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95">
              New Policy
            </Link>
          </div>
          <div className="divide-y max-h-80 overflow-y-auto">
            {policies.length === 0 ? (
              <p className="p-6 text-neutral-500 text-center text-sm">No policies yet. Start protecting your vehicle.</p>
            ) : (
              policies.map((p) => (
                <div key={p.id} className="px-6 py-4 hover:bg-gold-50 transition duration-300">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900">{p.policyNumber}</p>
                      <p className="text-sm text-neutral-600 mt-1">{p.insuranceCategory === 'COMPREHENSIVE' ? 'Comprehensive' : p.insuranceCategory === 'THIRD_PARTY' ? 'Third Party' : (p.policyType || p.insuranceCategory || '')}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
                      p.status === 'ACTIVE' 
                        ? 'bg-gold-50 text-gold-700' 
                        : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="text-neutral-600">
                      <span className="font-semibold text-neutral-900">{formatDate(p.startDate)}</span>
                      <span className="block text-neutral-500 text-xs">Start Date</span>
                    </div>
                    <div className="text-neutral-600">
                      <span className="font-semibold text-neutral-900">{formatDate(p.endDate)}</span>
                      <span className="block text-neutral-500 text-xs">Expiry Date</span>
                    </div>
                    <div className="col-span-2 text-neutral-600">
                      <span className="font-bold text-neutral-900">₹{p.premiumAmount?.toLocaleString()}</span>
                      <span className="text-neutral-500 text-xs"> Premium Amount</span>
                    </div>
                  </div>
                  {p.status === 'ACTIVE' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleRenew(p.id, p)}
                        disabled={renewing === p.id}
                        className="flex-1 px-4 py-2 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 disabled:opacity-50"
                      >
                        {renewing === p.id ? 'Renewing...' : '🔄 Renew'}
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(p.id)}
                        className="flex-1 px-4 py-2 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95"
                      >
                        📄 PDF
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
