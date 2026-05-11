import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getVehicles, deleteVehicle } from '../api/api'

export default function MyVehicles() {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedVehicle, setExpandedVehicle] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const loadVehicles = async () => {
    try {
      const response = await getVehicles()
      setVehicles(response.data || [])
    } catch (err) {
      toast.error('Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVehicles()
  }, [])

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return
    }

    setDeleting(vehicleId)
    try {
      await deleteVehicle(vehicleId)
      toast.success('Vehicle deleted successfully')
      loadVehicles()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete vehicle'
      toast.error(msg)
    } finally {
      setDeleting(null)
    }
  }

  const getVehicleEmoji = (type) => {
    return type === 'BIKE' ? '🏍️' : '🚗'
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
        <h1 className="heading-serif text-3xl text-neutral-900 mb-2">My Vehicles</h1>
        <p className="text-neutral-600 text-lg">View your registered vehicles</p>
      </div>

      {vehicles.length === 0 ? (
        <div className="card-minimal p-8 text-center border-t-4 border-gold-600">
          <p className="text-neutral-600 text-lg mb-4">No vehicles registered yet</p>
          <button onClick={() => navigate('/add-vehicle')} className="px-6 py-3 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95">
            + Add Vehicle
          </button>
        </div>
      ) : (
        <div className="space-y-4 mb-10">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="card-minimal border-t-4 border-gold-600 overflow-hidden">
              <div 
                onClick={() => setExpandedVehicle(expandedVehicle === vehicle.id ? null : vehicle.id)}
                className="p-6 cursor-pointer hover:bg-gold-50 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{getVehicleEmoji(vehicle.vehicleType)}</span>
                      <div>
                        <p className="font-bold text-xl text-neutral-900">{vehicle.vehicleNumber}</p>
                        <p className="text-neutral-600 text-sm">{vehicle.brand} {vehicle.model}</p>
                      </div>
                    </div>
                  </div>
                  <svg className={`w-6 h-6 text-neutral-400 transition-transform ${expandedVehicle === vehicle.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>

              {expandedVehicle === vehicle.id && (
                <div className="px-6 py-4 border-t border-neutral-200 bg-gold-50">
                  <div className="grid grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-gold-200">
                    <div>
                      <p className="text-neutral-600 text-sm">Vehicle Type</p>
                      <p className="font-semibold text-neutral-900">{vehicle.vehicleType}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600 text-sm">Manufacturing Year</p>
                      <p className="font-semibold text-neutral-900">{vehicle.manufacturingYear}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600 text-sm">Brand</p>
                      <p className="font-semibold text-neutral-900">{vehicle.brand}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600 text-sm">Model</p>
                      <p className="font-semibold text-neutral-900">{vehicle.model}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-neutral-600 text-sm">Vehicle Number</p>
                      <p className="font-semibold text-neutral-900">{vehicle.vehicleNumber}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/buy-policy')}
                      className="flex-1 px-6 py-3 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95"
                    >
                      🛡️ Buy Policy
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      disabled={deleting === vehicle.id}
                      className="flex-1 px-6 py-3 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 disabled:opacity-50"
                    >
                      {deleting === vehicle.id ? 'Deleting...' : '✕ Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 pt-8 border-t border-gold-100">
        <button 
          onClick={() => navigate('/add-vehicle')} 
          className="w-full px-6 py-4 bg-gold-600 text-white font-bold text-lg rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-gold-300"
        >
          + Add New Vehicle
        </button>
      </div>
    </div>
  )
}
