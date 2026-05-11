import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <span className="text-2xl font-serif font-bold text-neutral-900 hover:text-gold-600 transition">
            DriveSafe Insurance
          </span>
          <div className="flex gap-3">
            <Link 
              to="/login" 
              className="px-6 py-2.5 text-neutral-700 font-semibold hover:text-gold-600 transition duration-300 focus-ring"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="btn-gold focus-ring"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-32">
          <div className="relative z-10 animate-fade-in">
            <h1 className="heading-lg text-neutral-900 mb-6 leading-tight">
              Protect Your Vehicle,<br/>
              <span className="text-gold-600">Drive with Confidence</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mb-12 leading-relaxed">
              Comprehensive insurance plans for cars and bikes. Quick claims, reliable coverage, and peace of mind on every journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/register" 
                className="btn-gold focus-ring"
              >
                Get Started
              </Link>
              <Link 
                to="/login" 
                className="px-8 py-3 border-2 border-neutral-300 text-neutral-700 font-bold rounded-full hover:border-neutral-400 hover:bg-neutral-50 transition duration-300 focus-ring"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="heading-md text-neutral-900 mb-4">Why Choose Us</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Everything you need for complete peace of mind
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group p-8 card-minimal animate-slide-up">
            <div className="w-16 h-16 bg-gold-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="heading-sm text-neutral-900 mb-3">Comprehensive Coverage</h3>
            <p className="text-neutral-600 leading-relaxed">Plans for both cars and bikes with flexible terms and transparent pricing.</p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 card-minimal animate-slide-up">
            <div className="w-16 h-16 bg-gold-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="heading-sm text-neutral-900 mb-3">Fast Claims</h3>
            <p className="text-neutral-600 leading-relaxed">Submit claims online and track status in real time. Quick resolution guaranteed.</p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 card-minimal animate-slide-up">
            <div className="w-16 h-16 bg-gold-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="heading-sm text-neutral-900 mb-3">24/7 Support</h3>
            <p className="text-neutral-600 leading-relaxed">Our team is always here to help with any questions or concerns.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-gold-500 to-gold-600 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="heading-md text-white mb-6">Ready to Get Protected?</h2>
          <p className="text-xl text-white/90 mb-10">
            Join thousands of customers who trust us with their insurance needs.
          </p>
          <Link 
            to="/register" 
            className="inline-block px-10 py-4 bg-white text-neutral-900 font-bold text-lg rounded-full hover:shadow-2xl transition duration-300 transform hover:scale-105 focus-ring"
          >
            Start Your Quote Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-medium">
            © {new Date().getFullYear()} DriveSafe Insurance. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
