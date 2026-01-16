import { useState } from 'react'

const LOGO_SRC = "/logo.png"

function Header() {
  const [imageError, setImageError] = useState(false)

  return (
    <header className="bg-black border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">
              WhatsApp Audio Transcriber
            </h1>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="text-sm font-semibold text-white">
              Arndev10
            </div>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/30 shadow-lg bg-black">
              {!imageError ? (
                <img
                  src={LOGO_SRC}
                  alt="Arndev10 Logo"
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                  A10
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

