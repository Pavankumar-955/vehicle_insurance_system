import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { listAdminPlans, createAdminPlan, updateAdminPlan } from '../api/api'

export default function AdminPlans() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    planName: '',
    policyType: 'COMPREHENSIVE',
    extraAmount: '',
    extraPercentage: '',
    minEngineCC: '',
    maxEngineCC: '',
    description: '',
    isActive: true,
  })

  // Load plans
  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const res = await listAdminPlans()
      setPlans(res.data || [])
    } catch (err) {
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.planName.trim()) {
      toast.error('Plan name is required')
      return
    }

    if (!formData.policyType) {
      toast.error('Policy type is required')
      return
    }

    if (!formData.extraAmount && !formData.extraPercentage) {
      toast.error('At least one of extra amount or extra percentage must be provided')
      return
    }

    try {
      const payload = {
        planName: formData.planName,
        policyType: formData.policyType,
        extraAmount: formData.extraAmount ? parseFloat(formData.extraAmount) : null,
        extraPercentage: formData.extraPercentage ? parseFloat(formData.extraPercentage) : null,
        minEngineCC: formData.minEngineCC ? parseInt(formData.minEngineCC) : null,
        maxEngineCC: formData.maxEngineCC ? parseInt(formData.maxEngineCC) : null,
        description: formData.description,
        isActive: formData.isActive,
      }

      if (editingPlan) {
        await updateAdminPlan(editingPlan.id, payload)
        toast.success('Plan updated successfully')
      } else {
        await createAdminPlan(payload)
        toast.success('Plan created successfully')
      }

      resetForm()
      loadPlans()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plan')
    }
  }

  const resetForm = () => {
    setFormData({
      planName: '',
      policyType: 'COMPREHENSIVE',
      extraAmount: '',
      extraPercentage: '',
      minEngineCC: '',
      maxEngineCC: '',
      description: '',
      isActive: true,
    })
    setEditingPlan(null)
    setShowForm(false)
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan)
    setFormData({
      planName: plan.planName,
      policyType: plan.policyType,
      extraAmount: plan.extraAmount || '',
      extraPercentage: plan.extraPercentage || '',
      minEngineCC: plan.minEngineCC || '',
      maxEngineCC: plan.maxEngineCC || '',
      description: plan.description || '',
      isActive: plan.isActive,
    })
    setShowForm(true)
  }

  if (loading) {
    return <div className="p-6 text-center">Loading plans...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-8 pb-6 border-b border-gold-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="heading-serif text-3xl text-neutral-900 mb-2">Admin Plans</h1>
            <p className="text-neutral-600">Manage insurance plans and their pricing</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="px-6 py-3 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95"
          >
            + Add Plan
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card-minimal p-8 border-t-4 border-gold-600 mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">Plan Name *</label>
                <input
                  type="text"
                  name="planName"
                  value={formData.planName}
                  onChange={handleChange}
                  placeholder="e.g., Silver Plan, Gold Plan"
                  className="input-minimal w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">Policy Type *</label>
                <select
                  name="policyType"
                  value={formData.policyType}
                  onChange={handleChange}
                  className="input-minimal w-full"
                >
                  <option value="COMPREHENSIVE">Comprehensive</option>
                  <option value="THIRD_PARTY">Third Party</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">Extra Amount (₹) (optional)</label>
                <input
                  type="number"
                  name="extraAmount"
                  value={formData.extraAmount}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                  step="0.01"
                  className="input-minimal w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">Extra Percentage (%) (optional)</label>
                <input
                  type="number"
                  name="extraPercentage"
                  value={formData.extraPercentage}
                  onChange={handleChange}
                  placeholder="e.g., 2.5"
                  step="0.01"
                  className="input-minimal w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">Min Engine CC (optional)</label>
                <input
                  type="number"
                  name="minEngineCC"
                  value={formData.minEngineCC}
                  onChange={handleChange}
                  placeholder="e.g., 1000"
                  className="input-minimal w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">Max Engine CC (optional)</label>
                <input
                  type="number"
                  name="maxEngineCC"
                  value={formData.maxEngineCC}
                  onChange={handleChange}
                  placeholder="e.g., 1500"
                  className="input-minimal w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Plan benefits and details"
                rows="4"
                className="input-minimal w-full"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-neutral-900 cursor-pointer">
                Active Plan
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95"
              >
                {editingPlan ? '✓ Update Plan' : '+ Create Plan'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-neutral-200 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-300 transition-all duration-200 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plans List */}
      {plans.length === 0 ? (
        <div className="card-minimal p-12 text-center border-t-4 border-gold-600">
          <p className="text-neutral-500 text-lg mb-4">No admin plans created yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 transition-all"
          >
            Create Your First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className={`card-minimal p-6 border-t-4 ${plan.isActive ? 'border-gold-600' : 'border-gray-300 opacity-60'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">{plan.planName}</h3>
                  <p className="text-xs text-neutral-600 mt-1">
                    {plan.policyType === 'COMPREHENSIVE' ? '🛡️ Comprehensive' : '📋 Third Party'}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${plan.isActive ? 'bg-gold-100 text-gold-700' : 'bg-gray-100 text-gray-700'}`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="bg-neutral-50 p-4 rounded-lg mb-4">
                <div className="space-y-2">
                  {plan.extraAmount ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Extra Amount:</span>
                      <span className="font-semibold text-neutral-900">₹{Number(plan.extraAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  ) : null}
                  {plan.extraPercentage ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Extra %:</span>
                      <span className="font-semibold text-neutral-900">{Number(plan.extraPercentage).toFixed(2)}%</span>
                    </div>
                  ) : null}
                  {plan.minEngineCC || plan.maxEngineCC ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Engine CC:</span>
                      <span className="font-semibold text-neutral-900">
                        {plan.minEngineCC ? `${plan.minEngineCC} - ` : ''}{plan.maxEngineCC || '∞'}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              {plan.description && (
                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{plan.description}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="flex-1 px-4 py-2 bg-gold-100 text-gold-700 font-semibold rounded-lg hover:bg-gold-200 transition-all duration-200 text-sm"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
