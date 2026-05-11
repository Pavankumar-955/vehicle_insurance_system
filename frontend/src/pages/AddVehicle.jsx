import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { addVehicle } from '../api/api'

export default function AddVehicle() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'CAR',
    brand: '',
    model: '',
    manufacturingYear: new Date().getFullYear(),
    engineCC: '',
    exShowroomPrice: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.vehicleNumber.trim() || !formData.brand.trim() || !formData.model.trim() || !formData.engineCC || !formData.exShowroomPrice) {
      toast.error('All fields are required')
      return
    }

    setSubmitting(true)
    try {
      await addVehicle(formData)
      toast.success('Vehicle added successfully!')
      navigate('/my-vehicles')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add vehicle'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const vehicleYears = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-10">
        <button onClick={() => navigate('/my-vehicles')} className="text-gold-600 font-semibold flex items-center gap-2 mb-4 hover:text-gold-700">
          ← Back to My Vehicles
        </button>
        <h1 className="heading-serif text-3xl text-neutral-900 mb-2">Add New Vehicle</h1>
        <p className="text-neutral-600 text-lg">Register a vehicle to buy insurance</p>
      </div>

      <form onSubmit={handleSubmit} className="card-minimal p-8 border-t-4 border-gold-600 space-y-6">
        <div>
          <label className="block text-sm font-bold text-neutral-900 mb-3">🚗 Vehicle Type</label>
          <div className="grid grid-cols-2 gap-4">
            {['CAR', 'BIKE'].map((type) => (
              <label key={type} className="flex items-center p-4 border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-gold-600 hover:bg-gold-50 transition-all" style={{borderColor: formData.vehicleType === type ? '#d4a017' : ''}}>
                <input
                  type="radio"
                  name="vehicleType"
                  value={type}
                  checked={formData.vehicleType === type}
                  onChange={handleChange}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="ml-3 font-bold text-neutral-900">{type === 'CAR' ? '🚗 Car' : '🏍️ Bike'}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-900 mb-3">🔢 Vehicle Number (Plate)</label>
          <input
            type="text"
            name="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={handleChange}
            placeholder="e.g., DL-01-AB-1234"
            className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all py-3 px-4"
            required
          />
          <p className="text-xs text-neutral-600 mt-1">Enter your vehicle registration number</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-3">🏭 Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g., Toyota"
              className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all py-3 px-4"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-3">🎨 Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g., Fortuner"
              className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all py-3 px-4"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-900 mb-3">📅 Manufacturing Year</label>
          <select
            name="manufacturingYear"
            value={formData.manufacturingYear}
            onChange={handleChange}
            className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all py-3 px-4"
            required
          >
            {vehicleYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-3">⚙️ Engine CC</label>
            <input
              type="number"
              name="engineCC"
              value={formData.engineCC}
              onChange={handleChange}
              placeholder="e.g., 1500"
              className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all py-3 px-4"
              min="50"
              required
            />
            <p className="text-xs text-neutral-600 mt-1">Engine displacement in CC</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-3">💰 Ex-Showroom Price</label>
            <input
              type="text"
              name="exShowroomPrice"
              value={formData.exShowroomPrice}
              onChange={handleChange}
              placeholder="e.g., 1500000"
              className="input-minimal w-full border border-neutral-200 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 transition-all py-3 px-4"
              min="0"
              required
            />
            <p className="text-xs text-neutral-600 mt-1">Price in rupees</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-4 bg-gold-600 text-white font-bold text-lg rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Adding...
              </span>
            ) : (
              '✓ Add Vehicle'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/my-vehicles')}
            className="flex-1 px-6 py-4 bg-gold-600 text-white font-bold text-lg rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95"
          >
            Back to My Vehicles
          </button>
        </div>
      </form>
    </div>
  )
}
