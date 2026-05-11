import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getVehicles, getVehicle, buyPolicy, calculatePremium, listAdminPlans } from '../api/api'

export default function BuyPolicy() {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState([])
  const [vehicleId, setVehicleId] = useState('')
  const [policyType, setPolicyType] = useState('COMPREHENSIVE')
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [premium, setPremium] = useState(null)
  const [adminPlans, setAdminPlans] = useState([])
  const [selectedAdminPlanId, setSelectedAdminPlanId] = useState(null)
  const [loadingAdminPlans, setLoadingAdminPlans] = useState(false)
  const [loading, setLoading] = useState(true)
  const [calculatingPremium, setCalculatingPremium] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [paying, setPaying] = useState(false)

  // Load vehicles
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true)
        const vehiclesRes = await getVehicles()
        setVehicles(vehiclesRes.data)
      } catch (err) {
        toast.error('Failed to load vehicles')
      } finally {
        setLoading(false)
      }
    }
    loadVehicles()
  }, [])

  // When vehicle is selected, fetch full details
  useEffect(() => {
    const handleVehicleChange = async () => {
      if (!vehicleId) {
        setSelectedVehicle(null)
        setPremium(null)
        return
      }

      try {
        const res = await getVehicle(vehicleId)
        setSelectedVehicle(res.data)
        // Auto-calculate premium when vehicle is selected
        await calculatePremiumForVehicle(res.data.id)
        // Load applicable admin plans for this vehicle & policy type
        loadAdminPlans(res.data, policyType)
      } catch (err) {
        toast.error('Failed to load vehicle details')
        setSelectedVehicle(null)
      }
    }

    handleVehicleChange()
  }, [vehicleId])

  // When policy type changes, recalculate premium
  useEffect(() => {
    if (vehicleId) {
      calculatePremiumForVehicle(vehicleId, selectedAdminPlanId)
      // reload admin plans when policy type changes
      if (selectedVehicle) loadAdminPlans(selectedVehicle, policyType)
    }
  }, [policyType])

  // Load admin plans applicable to the vehicle and policy type
  const loadAdminPlans = async (vehicle, policyTypeParam) => {
    try {
      setLoadingAdminPlans(true)
      const res = await listAdminPlans(policyTypeParam, vehicle?.engineCC)
      setAdminPlans(res.data || [])
    } catch (err) {
      setAdminPlans([])
    } finally {
      setLoadingAdminPlans(false)
    }
  }

  const calculatePremiumForVehicle = async (vId, adminPlanId = null) => {
    try {
      setCalculatingPremium(true)
      const res = await calculatePremium(vId, policyType, adminPlanId)
      setPremium(res.data)
    } catch (err) {
      toast.error('Failed to calculate premium')
      setPremium(null)
    } finally {
      setCalculatingPremium(false)
    }
  }

  const handleBuyPolicy = async (e) => {
    e.preventDefault()

    if (!vehicleId || !premium) {
      toast.error('Please select vehicle and policy type')
      return
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method')
      return
    }

    setPaying(true)
    try {
      // Show loading for 2-3 seconds
      await new Promise(resolve => setTimeout(resolve, 2000))

      const finalAmount = premium?.finalPremium ?? premium?.totalPremium

      const policyData = {
        vehicleId: parseInt(vehicleId),
        insurancePlanId: 1,
        policyType,
        premiumAmount: finalAmount,
        paymentMethod, // Include selected payment method
        adminPlanId: selectedAdminPlanId || null,
      }

      const res = await buyPolicy(policyData)
      toast.success('Policy purchased successfully!')
      navigate('/dashboard')
    } catch (err) {
      // Handle authentication errors
      if (err.response?.status === 401) {
        toast.error('Your session has expired. Please login again.')
        navigate('/login')
      } else if (err.response?.status === 400) {
        toast.error(err.response?.data?.message || 'Invalid request. Please try again.')
      } else {
        toast.error(err.response?.data?.message || 'Failed to purchase policy. Please try again.')
      }
      console.error('Policy purchase error:', err)
    } finally {
      setPaying(false)
      setPaymentMethod('')
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading vehicles...</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-10">
        <button onClick={() => navigate(-1)} className="text-gold-600 font-semibold flex items-center gap-2 mb-4 hover:text-gold-700">
          ← Back
        </button>
        <h1 className="heading-serif text-3xl text-neutral-900 mb-2">Buy Insurance Policy</h1>
        <p className="text-neutral-600 text-lg">Select your vehicle to view premium details</p>
      </div>

      <form onSubmit={handleBuyPolicy} className="space-y-8">
        {/* STEP 1: Vehicle Selection */}
        <div className="card-minimal p-8 border-t-4 border-gold-600">
          <label className="block text-sm font-bold text-neutral-900 mb-3">🚗 Step 1: Select Your Vehicle</label>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all py-3 px-4"
          >
            <option value="">— Choose a vehicle —</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vehicleNumber} · {v.vehicleType} · {v.brand} {v.model} ({v.manufacturingYear})
              </option>
            ))}
          </select>
          {vehicles.length === 0 && (
            <p className="text-neutral-600 text-sm mt-3">
              No vehicles found. <button type="button" onClick={() => navigate('/add-vehicle')} className="text-gold-600 font-semibold hover:underline">Add a vehicle</button>
            </p>
          )}
        </div>

        {/* STEP 2: Vehicle Details Display */}
        {selectedVehicle && (
          <div className="card-minimal p-8 border-t-4 border-blue-600 bg-blue-50">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">📋 Vehicle Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-neutral-600 font-semibold">Vehicle Number</p>
                <p className="text-lg font-bold text-neutral-900">{selectedVehicle.vehicleNumber}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-600 font-semibold">Vehicle Type</p>
                <p className="text-lg font-bold text-neutral-900">{selectedVehicle.vehicleType === 'CAR' ? '🚗 Car' : '🏍️ Bike'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-600 font-semibold">Brand & Model</p>
                <p className="text-lg font-bold text-neutral-900">{selectedVehicle.brand} {selectedVehicle.model}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-600 font-semibold">Manufacturing Year</p>
                <p className="text-lg font-bold text-neutral-900">{selectedVehicle.manufacturingYear}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-600 font-semibold">Engine CC</p>
                <p className="text-lg font-bold text-neutral-900">{selectedVehicle.engineCC} CC</p>
              </div>
              <div>
                <p className="text-xs text-neutral-600 font-semibold">Ex-Showroom Price</p>
                <p className="text-lg font-bold text-neutral-900">₹{selectedVehicle.exShowroomPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4b: Admin Plans (optional) */}
        {selectedVehicle && premium && !calculatingPremium && (
          <div className="card-minimal p-8 border-t-4 border-indigo-600 bg-indigo-50">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">⭐ Optional: Admin Plans</h3>
            {loadingAdminPlans ? (
              <div className="text-center text-neutral-600">Loading plans...</div>
            ) : adminPlans.length === 0 ? (
              <div className="text-neutral-600">No admin plans available for your vehicle and selected policy type.</div>
            ) : (
              <div className="space-y-3">
                <label className={`flex items-start p-3 border rounded-lg ${!selectedAdminPlanId ? 'border-gold-300 bg-gold-50' : 'border-neutral-200'}`}>
                  <input type="radio" name="adminPlan" value="" checked={!selectedAdminPlanId} onChange={async () => { setSelectedAdminPlanId(null); await calculatePremiumForVehicle(selectedVehicle.id, null); }} className="mt-1" />
                  <div className="ml-3">
                    <div className="font-semibold">No plan (Standard)</div>
                    <div className="text-xs text-neutral-600">Proceed without any admin plan benefits or extras.</div>
                  </div>
                </label>
                {adminPlans.map((p) => (
                  <label key={p.id} className={`flex items-start p-3 border rounded-lg ${selectedAdminPlanId === p.id ? 'border-gold-300 bg-gold-50' : 'border-neutral-200'}`}>
                    <input
                      type="radio"
                      name="adminPlan"
                      value={p.id}
                      checked={selectedAdminPlanId === p.id}
                      onChange={async () => { setSelectedAdminPlanId(p.id); await calculatePremiumForVehicle(selectedVehicle.id, p.id); }}
                      className="mt-1"
                    />
                    <div className="ml-3">
                      <div className="font-semibold">{p.planName} {p.isActive ? '' : '(inactive)'}</div>
                      <div className="text-xs text-neutral-600">{p.description}</div>
                      <div className="text-xs text-neutral-700 mt-2">
                        {p.extraAmount ? <span>+ ₹{Number(p.extraAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </span> : null}
                        {p.extraPercentage ? <span>+ {p.extraPercentage}%</span> : null}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Policy Type Selection */}
        {selectedVehicle && (
          <div className="card-minimal p-8 border-t-4 border-gold-600">
            <label className="block text-sm font-bold text-neutral-900 mb-3">🛡️ Step 2: Select Policy Type</label>
            <div className="grid grid-cols-2 gap-4">
              {['COMPREHENSIVE', 'THIRD_PARTY'].map((type) => (
                <label 
                  key={type}
                  className="flex items-center p-4 border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-gold-600 hover:bg-gold-50 transition-all" 
                  style={{borderColor: policyType === type ? '#d4a017' : ''}}
                >
                  <input
                    type="radio"
                    name="policyType"
                    value={type}
                    checked={policyType === type}
                    onChange={(e) => setPolicyType(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <div className="ml-3">
                    <p className="font-bold text-neutral-900">{type === 'COMPREHENSIVE' ? 'Comprehensive' : 'Third Party'}</p>
                    <p className="text-xs text-neutral-600">
                      {type === 'COMPREHENSIVE' ? 'Full coverage including theft, damage, third-party' : 'Third-party liability coverage only'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Premium Breakup */}
        {selectedVehicle && premium && !calculatingPremium && (
          <div className="card-minimal p-8 border-t-4 border-green-600 bg-green-50">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">💎 Step 3: Premium Breakup</h3>
            <div className="space-y-3">
              {policyType === 'COMPREHENSIVE' && premium.vehicleAge !== undefined && (
                <>
                  <div className="flex justify-between text-neutral-700">
                    <span>Vehicle Age:</span>
                    <span className="font-semibold">{premium.vehicleAge} year(s)</span>
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <span>Depreciation:</span>
                    <span className="font-semibold">{premium.depreciationPercentage}%</span>
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <span>IDV (Insured Declared Value):</span>
                    <span className="font-semibold">₹{premium.idv?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
              {parseFloat(premium.ownDamagePremium) > 0 && (
                <div className="flex justify-between text-neutral-700">
                  <span>Own Damage Premium (2% of IDV):</span>
                  <span className="font-semibold">₹{premium.ownDamagePremium?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-700">
                <span>Third Party Premium:</span>
                <span className="font-semibold">₹{premium.thirdPartyPremium?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>GST (18%):</span>
                <span className="font-semibold">₹{premium.gst?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-neutral-300 pt-3 flex justify-between text-neutral-900">
                <span className="font-bold text-lg">Base Premium:</span>
                <span className="font-bold text-lg text-gold-600">₹{premium.totalPremium?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {/* Show admin plan extras if applied */}
              {premium.adminPlanName && (
                <div className="border-t border-indigo-300 pt-3 mt-3 bg-indigo-100 p-3 rounded-lg">
                  <div className="flex justify-between text-neutral-700 mb-2">
                    <span className="font-semibold">📋 Admin Plan Applied:</span>
                    <span className="font-semibold text-indigo-700">{premium.adminPlanName}</span>
                  </div>
                  {premium.adminExtraAmount && parseFloat(premium.adminExtraAmount) > 0 && (
                    <div className="flex justify-between text-neutral-700 ml-2">
                      <span>Plan Fixed Amount:</span>
                      <span className="font-semibold">+ ₹{premium.adminExtraAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {premium.adminExtraPercentage && parseFloat(premium.adminExtraPercentage) > 0 && (
                    <div className="flex justify-between text-neutral-700 ml-2">
                      <span>Plan Percentage ({premium.adminExtraPercentage}% of base):</span>
                      <span className="font-semibold">+ ₹{((parseFloat(premium.totalPremium) * parseFloat(premium.adminExtraPercentage)) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
              )}

              <div className={`border-t pt-3 flex justify-between text-neutral-900 ${premium.adminPlanName ? 'bg-indigo-100 p-3 rounded-lg' : ''}`}>
                <span className={`font-bold text-lg ${premium.adminPlanName ? 'text-indigo-900' : ''}`}>Final Premium:</span>
                <span className={`font-bold text-lg ${premium.adminPlanName ? 'text-indigo-700' : 'text-gold-600'}`}>₹{(premium.finalPremium ?? premium.totalPremium)?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        )}

        {selectedVehicle && calculatingPremium && (
          <div className="card-minimal p-8 text-center">
            <span className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gold-600 border-t-transparent" />
            <p className="mt-2 text-neutral-600">Calculating premium...</p>
          </div>
        )}

        {/* STEP 4: Payment Method Selection */}
        {selectedVehicle && premium && !calculatingPremium && (
          <div className="card-minimal p-8 border-t-4 border-purple-600">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">💳 Step 4: Select Payment Method</h3>
            <div className="space-y-3">
              {['UPI', 'CREDIT_DEBIT_CARD', 'NET_BANKING'].map((method) => (
                <label
                  key={method}
                  className="flex items-center p-4 border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-gold-600 hover:bg-gold-50 transition-all"
                  style={{ borderColor: paymentMethod === method ? '#d4a017' : '' }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <div className="ml-3">
                    <p className="font-bold text-neutral-900">
                      {method === 'UPI' && '📱 UPI'}
                      {method === 'CREDIT_DEBIT_CARD' && '💳 Credit / Debit Card'}
                      {method === 'NET_BANKING' && '🏦 Net Banking'}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {method === 'UPI' && 'Fast and secure payment via UPI'}
                      {method === 'CREDIT_DEBIT_CARD' && 'Pay using your credit or debit card'}
                      {method === 'NET_BANKING' && 'Direct bank transfer via net banking'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {selectedVehicle && premium && !calculatingPremium && (
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!premium || !paymentMethod || paying}
              className="flex-1 px-6 py-4 bg-gold-600 text-white font-bold text-lg rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {paying ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Processing Payment...
                </span>
              ) : (
                `💳 Pay ₹${(premium?.finalPremium ?? premium?.totalPremium)?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0'}`
              )}
            </button>
            {/* <button
              type="button"
              onClick={() => navigate('/my-policies')}
              disabled={paying}
              className="flex-1 px-6 py-4 bg-neutral-600 text-white font-bold text-lg rounded-lg hover:bg-neutral-700 shadow-lg shadow-neutral-200 transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              View My Policies
            </button> */}
          </div>
        )}
      </form>
    </div>
  )
}
