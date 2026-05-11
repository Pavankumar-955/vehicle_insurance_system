import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { register } from '../api/api'// Import the register API function
import { useAuth } from '../context/AuthContext' //

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', mobileNumber: '', dateOfBirth: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()

  // Validation patterns
  const patterns = {
    fullName: /^[a-zA-Z ]+$/,
    email: /^[^@]+@[^@]+\.(com|in)$/,
    mobileNumber: /^[6-9]\d{9}$/,
    password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    dateOfBirth: /^\d{4}-\d{2}-\d{2}$/,
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((e) => ({ ...e, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (!patterns.fullName.test(form.fullName)) {
      newErrors.fullName = 'Full name must contain only alphabets and spaces'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!patterns.email.test(form.email)) {
      newErrors.email = 'Email must end with .com or .in'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!patterns.password.test(form.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, digit, and special character (@$!%*?&)'
    }

    if (!form.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required'
    } else if (!patterns.mobileNumber.test(form.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits starting with 6, 7, 8, or 9'
    }

    if (!form.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required'
    } else if (!patterns.dateOfBirth.test(form.dateOfBirth)) {
      newErrors.dateOfBirth = 'Date of birth must be in yyyy-MM-dd format'
    } else {
      const dob = new Date(form.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      const isBeforeBirthday = today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
      const actualAge = isBeforeBirthday ? age - 1 : age
      
      if (dob > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future'
      } else if (actualAge < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const { data } = await register(form)
      authLogin(data.accessToken, {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        roles: data.roles || [],
      })
      toast.success('Account created successfully')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.data || 'Registration failed'
      toast.error(typeof msg === 'object' ? JSON.stringify(msg) : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-4">
            <span className="text-3xl font-serif font-bold text-neutral-900">
              DriveSafe Insurance
            </span>
          </Link>
          <p className="text-sm text-neutral-600">Secure policies, simple claims</p>
        </div>

        {/* Form Card */}
        <div className="card-minimal p-8">
          <h1 className="heading-serif text-neutral-900 mb-1">Create Account</h1>
          <p className="text-sm text-neutral-600 mb-6">Register to buy insurance</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Full Name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className={`input-minimal focus-ring ${errors.fullName ? 'border-red-500 ring-red-100' : ''}`}
                required
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-2 font-medium">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`input-minimal focus-ring ${errors.email ? 'border-red-500 ring-red-100' : ''}`}
                required
              />
              {errors.email && <p className="text-red-500 text-xs mt-2 font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`input-minimal focus-ring ${errors.password ? 'border-red-500 ring-red-100' : ''}`}
                required
              />
              {errors.password && <p className="text-red-500 text-xs mt-2 font-medium">{errors.password}</p>}
              <p className="text-xs text-neutral-500 mt-2">✓ Uppercase + lowercase + number + special • Min 8 chars</p>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Mobile Number *</label>
              <input
                name="mobileNumber"
                type="tel"
                value={form.mobileNumber}
                onChange={handleChange}
                placeholder="9876543210"
                maxLength="10"
                className={`input-minimal focus-ring ${errors.mobileNumber ? 'border-red-500 ring-red-100' : ''}`}
                required
              />
              {errors.mobileNumber && <p className="text-red-500 text-xs mt-2 font-medium">{errors.mobileNumber}</p>}
              <p className="text-xs text-neutral-500 mt-2">10 digits starting with 6, 7, 8, or 9</p>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Date of Birth *</label>
              <input
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                className={`input-minimal focus-ring ${errors.dateOfBirth ? 'border-red-500 ring-red-100' : ''}`}
                required
              />
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-2 font-medium">{errors.dateOfBirth}</p>}
              <p className="text-xs text-neutral-500 mt-2">Must be at least 18 years old</p>
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center">
              {loading ? <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-100">
            <p className="text-center text-sm text-neutral-600">
              Already have an account?{' '}
              <Link to="/login" className="link-underline text-gold-600 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm mt-6 text-neutral-600">
          <Link to="/" className="link-underline text-neutral-900 hover:text-gold-600">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  )
}
