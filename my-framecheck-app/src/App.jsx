import { useState } from 'react'
import ImageUploader from './ImageUploader'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
          FrameCheck
        </h1>
        <p className="text-center text-gray-600 mb-6 max-w-xl mx-auto text-sm">
          Upload your photos and get AI-powered feedback on composition, 
          including rule of thirds and leading lines analysis.
        </p>
        <ImageUploader />
      </div>
    </div>
  )
}

export default App
