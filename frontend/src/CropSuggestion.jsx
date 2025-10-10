import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { trackCropSuggestion, trackFeatureUsage } from './analytics';

const CropSuggestion = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropResults, setCropResults] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const url = URL.createObjectURL(uploadedFile);
      setPreviewUrl(url);
      setCropResults(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp', '.avif']
    },
    multiple: false
  });

  const handleCropSuggestion = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/suggest-crop/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setCropResults(response.data);
        setError(null);
        trackCropSuggestion(true);
        trackFeatureUsage('crop_suggestion');
      } else {
        setError('Crop suggestion failed: ' + response.data.message);
        trackCropSuggestion(false);
      }
    } catch (error) {
      setError('Crop suggestion failed: ' + (error.response?.data?.detail || error.message));
      trackCropSuggestion(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4" style={{color: '#2d3748'}}>
          🎯 Smart Crop Suggestion
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get AI-powered crop suggestions based on Rule of Thirds and subject detection. 
          Upload an image to see how it can be optimized for better composition.
        </p>
      </div>

      {/* Upload Area */}
      <div className="mb-8">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'scale-105'
              : 'hover:bg-stone-50'
          }`}
          style={{
            borderColor: isDragActive ? '#10b981' : '#059669', // Sage green
            backgroundColor: isDragActive ? '#f0fdf4' : 'transparent' // Light sage
          }}
        >
          <input {...getInputProps()} />
          <div className="text-6xl mb-4">📸</div>
          {isDragActive ? (
            <p className="text-lg font-semibold" style={{color: '#059669'}}>
              Drop your image here...
            </p>
          ) : (
            <div>
              <p className="text-lg font-semibold mb-2" style={{color: '#2d3748'}}>
                Drag & drop an image here, or click to select
              </p>
              <p className="text-gray-500">
                Supports: JPG, PNG, GIF, BMP, WebP, AVIF
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview and Process Button */}
      {previewUrl && (
        <div className="mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4" style={{color: '#2d3748'}}>
              📷 Your Image
            </h3>
            <div className="flex justify-center mb-6">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-96 rounded-lg shadow-md"
              />
            </div>
            
            <div className="text-center">
              <button
                onClick={handleCropSuggestion}
                disabled={isProcessing}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all transform ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'text-white shadow-lg hover:shadow-xl hover:scale-105'
                }`}
                style={!isProcessing ? {
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Sage green gradient
                } : {}}
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Analyzing Composition...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>✂️</span>
                    <span>Suggest Optimal Crop</span>
                  </div>
                )}
              </button>
              <p className="text-sm text-gray-500 mt-2">
                AI will analyze your image and suggest the best crop for composition
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Crop Results */}
      {cropResults && (
        <div className="space-y-8">
          {/* Processing Summary */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-2xl font-bold mb-4" style={{color: '#2d3748'}}>
              📊 Analysis Results
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2" style={{color: '#059669'}}>Subject Detection</h4>
                <p className="text-gray-600">
                  {cropResults.processing_info.subject_detected 
                    ? `✅ Subject detected at (${cropResults.subject_center[0]}, ${cropResults.subject_center[1]})`
                    : '❌ No clear subject detected'
                  }
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2" style={{color: '#059669'}}>Crop Ratio</h4>
                <p className="text-gray-600">
                  {cropResults.crop_ratio.toFixed(2)}:1 (Width:Height)
                </p>
              </div>
            </div>
          </div>

          {/* Image Comparison */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-center" style={{color: '#2d3748'}}>
              🖼️ Image Comparison
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Original Image */}
              <div className="text-center">
                <h4 className="text-lg font-semibold mb-3" style={{color: '#2d3748'}}>
                  📷 Original
                </h4>
                <div className="relative">
                  <img
                    src={cropResults.images.original}
                    alt="Original"
                    className="w-full rounded-lg shadow-md"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    Your uploaded image
                  </div>
                </div>
              </div>

              {/* Cropped Image */}
              <div className="text-center">
                <h4 className="text-lg font-semibold mb-3" style={{color: '#2d3748'}}>
                  ✂️ Suggested Crop
                </h4>
                <div className="relative">
                  <img
                    src={cropResults.images.cropped}
                    alt="Cropped"
                    className="w-full rounded-lg shadow-md"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    Optimized composition
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = cropResults.images.cropped;
                  link.download = `cropped_${file?.name || 'image.jpg'}`;
                  link.click();
                }}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                💾 Download Cropped Image
              </button>
            </div>
          </div>

          {/* Composition Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4" style={{color: '#2d3748'}}>
              💡 Composition Tips
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2" style={{color: '#059669'}}>Rule of Thirds</h4>
                <p className="text-gray-600 text-sm">
                  The crop places your subject at one of the four Rule of Thirds intersection points for better visual balance.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2" style={{color: '#059669'}}>Subject Focus</h4>
                <p className="text-gray-600 text-sm">
                  The AI detected your main subject and positioned it optimally within the frame for maximum impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropSuggestion;
