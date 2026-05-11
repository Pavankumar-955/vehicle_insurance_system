import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getMyProfile, updateMyProfile } from '../api/api'

export default function UserProfile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    mobileNumber: '',
    dateOfBirth: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await getMyProfile()
      setProfile(response.data?.data)
      setForm({
        mobileNumber: response.data?.data?.mobileNumber || '',
        dateOfBirth: response.data?.data?.dateOfBirth || '',
        addressLine: response.data?.data?.addressLine || '',
        city: response.data?.data?.city || '',
        state: response.data?.data?.state || '',
        pincode: response.data?.data?.pincode || '',
      })
    } catch (err) {
      toast.error('Failed to load profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    // Validate mobile number
    if (!form.mobileNumber.match(/^[6-9]\d{9}$/)) {
      toast.error('Invalid mobile number (must be 10 digits starting with 6-9)')
      return
    }

    // Validate pincode
    if (!form.pincode.match(/^\d{6}$/)) {
      toast.error('Invalid pincode (must be 6 digits)')
      return
    }

    // Validate date of birth
    if (!form.dateOfBirth) {
      toast.error('Date of birth is required')
      return
    }

    setSaving(true)
    try {
      const response = await updateMyProfile(form)
      setProfile(response.data?.data)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (profile) {
      setForm({
        mobileNumber: profile.mobileNumber || '',
        dateOfBirth: profile.dateOfBirth || '',
        addressLine: profile.addressLine || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
      })
    }
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
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gold-600 font-semibold flex items-center gap-2 mb-4 hover:text-gold-700"
        >
          ← Back to Dashboard
        </button>
        <h1 className="heading-serif text-3xl text-neutral-900 mb-2">My Profile</h1>
        <p className="text-neutral-600 text-lg">View and manage your profile information</p>
      </div>

      <div className="card-minimal border-t-4 border-gold-600 p-8 max-w-2xl">
        {!isEditing ? (
          <>
            {/* View Mode */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-neutral-600 text-sm font-semibold uppercase">Full Name</p>
                  <p className="text-neutral-900 font-semibold text-lg mt-1">{profile?.fullName}</p>
                </div>
                <div>
                  <p className="text-neutral-600 text-sm font-semibold uppercase">Email</p>
                  <p className="text-neutral-900 font-semibold text-lg mt-1">{profile?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-neutral-600 text-sm font-semibold uppercase">Mobile Number</p>
                  <p className="text-neutral-900 font-semibold text-lg mt-1">{profile?.mobileNumber || '—'}</p>
                </div>
                <div>
                  <p className="text-neutral-600 text-sm font-semibold uppercase">Date of Birth</p>
                  <p className="text-neutral-900 font-semibold text-lg mt-1">{profile?.dateOfBirth || '—'}</p>
                </div>
              </div>

              <div>
                <p className="text-neutral-600 text-sm font-semibold uppercase">Address</p>
                <p className="text-neutral-900 font-semibold text-lg mt-1">{profile?.addressLine || '—'}</p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-neutral-600 text-sm font-semibold uppercase">City</p>
                  <p className="text-neutral-900 font-semibold text-lg mt-1">{profile?.city || '—'}</p>
                </div>
                <div>
                  <p className="text-neutral-600 text-sm font-semibold uppercase">State</p>
                  <p className="text-neutral-900 font-semibold text-lg mt-1">{profile?.state || '—'}</p>
                </div>
                <div>
                  <p className="text-neutral-600 text-sm font-semibold uppercase">Pincode</p>
                  <p className="text-neutral-900 font-semibold text-lg mt-1">{profile?.pincode || '—'}</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full mt-8 px-6 py-3 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95"
              >
                ✏️ Edit Profile
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Edit Mode */}
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-2">Full Name (Read-Only)</label>
                  <input
                    type="text"
                    value={profile?.fullName}
                    disabled
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-2">Email (Read-Only)</label>
                  <input
                    type="email"
                    value={profile?.email}
                    disabled
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-100 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-2">Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={form.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-2">Date of Birth (Read-Only) *</label>
                  <input
                    type="text"
                    value={form.dateOfBirth}
                    disabled
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Date of birth cannot be changed</p>
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-2">Address *</label>
                <input
                  type="text"
                  name="addressLine"
                  value={form.addressLine}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-600"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit pincode"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-600"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gold-600 text-white font-semibold rounded-lg hover:bg-gold-700 shadow-lg shadow-gold-200 transition-all duration-200 active:scale-95 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : '✓ Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 bg-neutral-300 text-neutral-900 font-semibold rounded-lg hover:bg-neutral-400 transition-all duration-200 active:scale-95"
                >
                  ✕ Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
