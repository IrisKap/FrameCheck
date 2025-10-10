import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const PhotographerSimilarity = () => {
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [similarityResults, setSimilarityResults] = useState(null);
  const [error, setError] = useState(null);

  // useDropzone callback to handle file dropping and selection
  const onDrop = useCallback((acceptedFiles) => {
    // Limit to 4 files maximum
    const newFiles = acceptedFiles.slice(0, 4);
    
    setFiles(newFiles);
    
    // Create preview URLs
    const urls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    
    // Reset previous results
    setSimilarityResults(null);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: true,
    maxFiles: 4
  });

  // Function to handle file upload to backend
  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    
    // Create FormData object containing the files
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      // Send to FastAPI endpoint using axios
      const response = await axios.post('http://localhost:8000/find-similar-photographers/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        console.log('Similarity analysis successful:', response.data);
        setSimilarityResults(response.data);
        setError(null);
      } else {
        setError('Similarity analysis failed: ' + response.data.message);
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Upload failed: ' + (error.response?.data?.detail || error.message));
      
    } finally {
      setIsUploading(false);
    }
  };

  // Cleanup preview URLs when component unmounts or files change
  React.useEffect(() => {
    return () => {
      previewUrls.forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  const resetUpload = () => {
    setFiles([]);
    setPreviewUrls([]);
    setSimilarityResults(null);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-white/20">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">🎨 Find Your Photographic Style</h2>
          <p className="text-lg text-gray-600">
            Upload up to 4 images to discover which famous photographers share your visual style
          </p>
        </div>

        {/* Dropzone area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'scale-105'
              : 'hover:bg-stone-50'
          }`}
        style={{
          borderColor: isDragActive ? '#10b981' : '#059669',
          backgroundColor: isDragActive ? '#f0fdf4' : 'transparent'
        }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <div style={{color: '#10b981'}}>
              <div className="text-4xl mb-4">📸</div>
              <p className="text-lg font-semibold">Drop your photos here!</p>
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-gray-700 mb-2 text-lg font-medium">
                Drag & drop up to 4 photos here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supports: JPEG, PNG, GIF, BMP, WebP
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {files.length}/4 images selected
              </p>
            </div>
          )}
        </div>

        {/* Image previews */}
        {previewUrls.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800">📸 Your Images</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {previewUrls.map((url, index) => (
                <div key={index} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-2 text-center">
                    <p className="text-sm text-gray-600">{files[index]?.name}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Upload button */}
            <div className="text-center">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all transform ${
                  isUploading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'text-white shadow-lg hover:shadow-xl hover:scale-105'
                }`}
                style={!isUploading ? {
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                } : {}}
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Finding Similar Photographers...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>🔍</span>
                    <span>Find Similar Photographers</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">❌ Error</p>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Similarity Results */}
        {similarityResults && (
          <div className="mt-8 space-y-8">
            <div className="text-center text-white p-6 rounded-2xl shadow-lg" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
              <h2 className="text-3xl font-bold mb-2">
                🎉 Style Analysis Complete!
              </h2>
              <p className="text-white/90">
                Found similar photographers based on {similarityResults.total_images_processed} images
              </p>
            </div>

            {/* Similar Photographers */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 text-center">🏆 Most Similar Photographers</h3>
              
              {similarityResults.similar_photographers.map((photographer, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                        <h4 className="text-2xl font-bold text-gray-800">{photographer.name}</h4>
                        <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                          {Math.round(photographer.similarity_score * 100)}% match
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{photographer.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>📊 {photographer.sample_count} reference images</span>
                        <span>🎯 {Math.round(photographer.similarity_score * 100)}% similarity</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Similarity bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="h-3 rounded-full transition-all duration-1000"
                      style={{
                        width: `${photographer.similarity_score * 100}%`,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Processing Summary */}
            {similarityResults.processed_files && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-800">📋 Processing Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {similarityResults.processed_files.map((file, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow">
                      <h4 className="font-semibold text-gray-700 mb-2">Image {index + 1}</h4>
                      <p className="text-sm text-gray-600">📁 {file.filename}</p>
                      <p className="text-sm text-gray-600">📐 {file.size[0]} × {file.size[1]} pixels</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reset button */}
            <div className="text-center">
              <button
                onClick={resetUpload}
                className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                🎨 Analyze Different Images
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotographerSimilarity;
