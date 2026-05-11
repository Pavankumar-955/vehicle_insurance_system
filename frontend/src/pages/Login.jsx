import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../api/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await login({ email, password })
      authLogin(data.accessToken, {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        roles: data.roles || [],
      })
      toast.success('Logged in successfully')
      navigate(data.roles?.includes('ROLE_ADMIN') ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return ( 
    <>
  {/* 1. Main Wrapper: Covers the whole screen and sets the base context */}
  <div className="relative min-h-screen w-full overflow-hidden bg-neutral-50 flex flex-col items-center justify-center px-4">
    
    {/* 2. Background Image: Positioned absolute to the main wrapper */}
    <div className="absolute flex justify-between inset-0 z-0 pointer-events-none w-full">
      <img 
        src="home-left.svg" 
        alt="Background Illustration"
        className="h-full w-full object-contain object-right-bottom opacity-50 md:opacity-100"
      /> 
      <div></div>
      <img 
        src="guy.svg" 
        alt="Background Illustration"
        className="h-full w-full relative right-[150px] object-contain object-right-bottom opacity-50 md:opacity-100"
      />
    </div>

    {/* 3. Content Layer: Elevated with z-10 */}
    <div className="relative z-10 w-full max-w-md animate-fade-in p-10">
      
      {/* Header */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-block mb-6">
          <span className="text-3xl font-serif font-bold text-neutral-900">
            DriveSafe Insurance
          </span>
        </Link>
        <p className="text-neutral-600 text-sm">Secure your vehicle today</p>
      </div>

      {/* Form Card */}
      <div className="card-minimal animate-slide-up bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
        <h1 className="heading-serif text-neutral-900 mb-2 ">Welcome Back</h1>
        <p className="text-neutral-600 mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-minimal focus-ring w-full"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-minimal focus-ring w-full"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-gold w-full flex justify-center py-3 bg-gold-600 text-white rounded-lg font-bold hover:bg-gold-700 transition-colors"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-100">
          <p className="text-center text-neutral-600 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="link-underline text-gold-600 font-semibold">
              Create one
            </Link>
          </p>
        </div>

        {/* Demo Account Box */}
        {/* <div className="mt-6 p-4 bg-gold-50 rounded-2xl border border-gold-100">
          <p className="text-center text-xs text-neutral-900 font-semibold uppercase tracking-wider">
            Demo Admin Account
          </p>
          <div className="mt-2 space-y-1 text-center text-xs text-neutral-600">
            <p>Email: <code className="font-mono text-neutral-900 font-bold">admin@vehicleinsurance.com</code></p>
            <p>Password: <code className="font-mono text-neutral-900 font-bold">admin123</code></p>
          </div>
        </div> */}
      </div>
    </div> 
  </div>
  {/* Footer Link */}
      <p className="text-center text-neutral-600 text-sm mt-6 p-5 bg-neutral-5">
        <Link to="/" className="link-underline text-neutral-900 hover:text-gold-600">
          ← Back to Home
        </Link>
      </p>
</>
    
    
    /*
    <>
      <div class="absolute right-[200px] z-0  h-screen w-full overflow-hidden bg-slate-50">
        <img 
          src="guy.svg" 
          alt="Background Illustration"
          class="z-0 h-full w-full object-contain object-right-bottom overflow-x-hidden"
        />
      </div>
      <div className="relative z-10 min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in">
          
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <span className="text-3xl font-serif font-bold text-neutral-900">
                DriveSafe Insurance
              </span>
            </Link>
            <p className="text-neutral-600 text-sm">Secure your vehicle today</p>
          </div>

        <div className="relative h-screen w-full overflow-hidden bg-slate-50">
          <div className="relative z-10 ">
        
            <div className="card-minimal animate-slide-up">
              <h1 className="heading-serif text-neutral-900 mb-2">Welcome Back</h1>
              <p className="text-neutral-600 mb-8">Sign in to your account</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-minimal focus-ring"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-minimal focus-ring"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="btn-gold w-full justify-center"
                >
                  {loading ? (
                    <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-neutral-100">
                <p className="text-center text-neutral-600 text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="link-underline text-gold-600 font-semibold">
                    Create one
                  </Link>
                </p>
              </div>

              <div className="mt-6 p-4 bg-gold-50 rounded-2xl border border-gold-100">
                <p className="text-center text-xs text-neutral-900 font-semibold">
                  Demo Admin Account
                </p>
                <p className="text-center text-xs text-neutral-600 mt-2">
                  Email: <code className="font-mono text-neutral-900 font-bold">admin@vehicleinsurance.com</code>
                </p>
                <p className="text-center text-xs text-neutral-600">
                  Password: <code className="font-mono text-neutral-900 font-bold">admin123</code>
                </p>
              </div>
            </div>
          </div>
        </div>
        


          
          <p className="text-center text-neutral-600 text-sm mt-6">
            <Link to="/" className="link-underline text-neutral-900 hover:text-gold-600">
              ← Back to Home
            </Link>
          </p>
        </div>
      </div>
    </>
    */
    
  )
}
