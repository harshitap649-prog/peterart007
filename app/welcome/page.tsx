'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function WelcomePage() {
  const router = useRouter()

  useEffect(() => {
    // Add concentric gradient lines background
    const style = document.createElement('style')
    style.textContent = `
      .topographic-pattern {
        background-image: 
          radial-gradient(circle at 20% 30%, rgba(255, 192, 203, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(230, 230, 250, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(191, 255, 0, 0.2) 0%, transparent 60%);
        background-size: 600px 600px, 400px 400px, 800px 800px;
        background-position: 0 0, 200px 200px, 100px 100px;
        animation: float 20s ease-in-out infinite;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(2deg); }
      }
      
      .blob-shape {
        border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
        animation: morph 8s ease-in-out infinite;
      }
      
      @keyframes morph {
        0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
        50% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="min-h-screen bg-welcome-gradient topographic-pattern relative overflow-hidden">
      {/* Decorative Blob Shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-brand-lime opacity-30 blob-shape"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-brand-pink opacity-40 blob-shape"></div>
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-brand-purple opacity-30 blob-shape"></div>
      
      {/* White Star */}
      <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-white rotate-45 shadow-lg"></div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-text-primary mb-8 text-center">
          Welcome =)
        </h1>
        
        {/* Secondary Text */}
        <p className="text-lg md:text-xl text-text-secondary text-center max-w-2xl mb-12">
          Hi there! We're here to help you learn new skills. The choice is yours: Log in or create an account.
        </p>
        
        {/* Illustration Container */}
        <div className="relative mb-16">
          {/* Person with Laptop Illustration (Placeholder) */}
          <div className="w-64 h-64 md:w-80 md:h-80 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-white/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-16 h-16 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-white text-sm">Person with Laptop</p>
            </div>
          </div>
          
          {/* Additional Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-brand-lime opacity-50 rounded-full"></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-brand-pink opacity-40 rounded-full"></div>
        </div>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={() => router.push('/login?mode=signup')}
            className="flex-1 bg-white text-text-primary py-4 px-8 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            Create Account
          </button>
          
          <button
            onClick={() => router.push('/login')}
            className="flex-1 bg-transparent border-2 border-gradient-to-r from-brand-pink to-brand-purple text-text-primary py-4 px-8 rounded-full font-semibold text-lg transition-all duration-200 hover:scale-105"
            style={{
              borderImage: 'linear-gradient(135deg, #FFC0CB, #E6E6FA) 1'
            }}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  )
}
