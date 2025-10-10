import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const ImageUploader = () => {
  // useState hooks to manage file state and preview URL
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);

  // useDropzone callback to handle file dropping and selection
  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      // Create preview URL using URL.createObjectURL
      const url = URL.createObjectURL(uploadedFile);
      setPreviewUrl(url);
      // Reset previous results
      setAnalysisResults(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false
  });

  // Function to handle file upload to backend
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    
    // Create FormData object containing the file
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send to FastAPI endpoint using axios
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/analyze-image/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        console.log('Analysis successful:', response.data);
        setAnalysisResults(response.data);
        setError(null);
      } else {
        setError('Analysis failed: ' + response.data.message);
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Upload failed: ' + (error.response?.data?.detail || error.message));
      
    } finally {
      setIsUploading(false);
    }
  };


  // Cleanup preview URL when component unmounts or file changes
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-white/20">{/* Wrapper for the entire component */}
      
      {/* Dropzone area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'scale-105'
            : 'hover:bg-stone-50'
        }`}
        style={{
          borderColor: isDragActive ? '#8fa67e' : '#9caf88',
          backgroundColor: isDragActive ? '#f8f9f8' : 'transparent'
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <div style={{color: '#8fa67e'}}>
            <div className="text-4xl mb-4">📸</div>
            <p className="text-lg font-semibold">Drop your photo here!</p>
          </div>
        ) : (
          <div>
            <div className="text-6xl mb-4">📷</div>
            <p className="text-gray-700 mb-2 text-lg font-medium">
              Drag & drop your photo here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports: JPEG, PNG, GIF, BMP, WebP
            </p>
          </div>
        )}
      </div>

      {/* Image preview */}
      {previewUrl && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-gray-800">📸 Preview</h3>
          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-auto max-h-80 object-contain"
            />
          </div>
          
          {/* Upload button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all transform ${
                isUploading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'text-white shadow-lg hover:shadow-xl hover:scale-105'
              }`}
              style={!isUploading ? {
                background: 'linear-gradient(135deg, #8fa67e 0%, #a8b896 100%)',
              } : {}}
            >
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Analyzing with AI...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>🤖</span>
                  <span>Analyze with AI</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Close wrapper div */}
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">❌ Error</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResults && (
        <div className="mt-8 space-y-8">
          <div className="text-center text-white p-6 rounded-2xl shadow-lg" style={{background: 'linear-gradient(135deg, #8fa67e 0%, #a8b896 100%)'}}>
            <h2 className="text-3xl font-bold mb-2">
              🎉 Analysis Complete!
            </h2>
            <p className="text-white/90">Your photo has been analyzed with AI-powered computer vision</p>
          </div>

          {/* AI Feedback Section */}
          {analysisResults.ai_feedback && (
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                🤖 AI Photography Feedback
                {analysisResults.ai_feedback.success && (
                  <span className="ml-2 text-sm px-2 py-1 rounded bg-green-100 text-green-700">
                    GPT-4 Powered
                  </span>
                )}
              </h3>
              
              {analysisResults.ai_feedback.success ? (
                <div className="space-y-4">
                  {analysisResults.ai_feedback.feedback && (
                    <>
                      {analysisResults.ai_feedback.feedback.overall_assessment && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">📊 Overall Assessment</h4>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-xl border-l-4 border-green-400 shadow-sm">
                            {analysisResults.ai_feedback.feedback.overall_assessment}
                          </p>
                        </div>
                      )}
                      
                      {analysisResults.ai_feedback.feedback.what_works_well && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">💪 What Works Well</h4>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-xl border-l-4 border-emerald-400 shadow-sm">
                            {analysisResults.ai_feedback.feedback.what_works_well}
                          </p>
                        </div>
                      )}
                      
                      {analysisResults.ai_feedback.feedback.suggestions && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">💡 Suggestions for Improvement</h4>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-xl border-l-4 border-teal-400 shadow-sm">
                            {analysisResults.ai_feedback.feedback.suggestions}
                          </p>
                        </div>
                      )}
                      
                      {analysisResults.ai_feedback.feedback.advanced_technique && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">🎯 Advanced Technique</h4>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-xl border-l-4 border-green-500 shadow-sm">
                            {analysisResults.ai_feedback.feedback.advanced_technique}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {analysisResults.ai_feedback.tokens_used && (
                    <p className="text-sm text-gray-500 text-center">
                      🪙 Generated using {analysisResults.ai_feedback.tokens_used} AI tokens
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
                  <p className="text-yellow-800">
                    <strong>Fallback Analysis:</strong> {analysisResults.ai_feedback.feedback?.overall_assessment || 'Analysis completed with basic feedback.'}
                  </p>
                  {analysisResults.ai_feedback.feedback?.suggestions && (
                    <p className="text-yellow-700 mt-2">
                      <strong>Suggestion:</strong> {analysisResults.ai_feedback.feedback.suggestions}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Analysis Images */}
          {analysisResults.images && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-800">🔍 Visual Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResults.images.analysis_overlay && (
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold mb-2 text-gray-700">📐 Complete Analysis</h4>
                    <img
                      src={analysisResults.images.analysis_overlay}
                      alt="Complete Analysis"
                      className="w-full h-auto rounded border"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Combined rule of thirds and leading lines analysis
                    </p>
                  </div>
                )}
                
                {analysisResults.images.rule_of_thirds && (
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold mb-2 text-gray-700">📏 Rule of Thirds</h4>
                    <img
                      src={analysisResults.images.rule_of_thirds}
                      alt="Rule of Thirds Analysis"
                      className="w-full h-auto rounded border"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Grid overlay with intersection points
                    </p>
                  </div>
                )}
                
                {analysisResults.images.leading_lines && (
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold mb-2 text-gray-700">📈 Leading Lines</h4>
                    <img
                      src={analysisResults.images.leading_lines}
                      alt="Leading Lines Analysis"
                      className="w-full h-auto rounded border"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Detected lines and composition guides
                    </p>
                  </div>
                )}
                
                {analysisResults.images.original && (
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-semibold mb-2 text-gray-700">📷 Original</h4>
                    <img
                      src={analysisResults.images.original}
                      alt="Original Image"
                      className="w-full h-auto rounded border"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Your uploaded image
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Technical Analysis Summary */}
          {analysisResults.analysis_summary && (
            <div className="bg-white p-6 rounded-lg border shadow">
              <h3 className="text-xl font-bold mb-4 text-gray-800">📊 Technical Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysisResults.analysis_summary.rule_of_thirds && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-blue-800">📐 Rule of Thirds</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Follows Rule:</span>
                        <span className={`font-medium ${
                          analysisResults.analysis_summary.rule_of_thirds.follows_rule 
                            ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {analysisResults.analysis_summary.rule_of_thirds.follows_rule ? '✅ Yes' : '⚠️ No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subject Detected:</span>
                        <span className={`font-medium ${
                          analysisResults.analysis_summary.rule_of_thirds.subject_detected 
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {analysisResults.analysis_summary.rule_of_thirds.subject_detected ? '✅ Yes' : '❌ No'}
                        </span>
                      </div>
                      {analysisResults.analysis_summary.rule_of_thirds.distance_to_intersection && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Distance to Grid:</span>
                          <span className="font-medium text-gray-800">
                            {Math.round(analysisResults.analysis_summary.rule_of_thirds.distance_to_intersection)}px
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {analysisResults.analysis_summary.leading_lines && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-green-800">📈 Leading Lines</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Lines:</span>
                        <span className="font-medium text-gray-800">
                          {analysisResults.analysis_summary.leading_lines.total_lines}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Diagonal Lines:</span>
                        <span className="font-medium text-gray-800">
                          {analysisResults.analysis_summary.leading_lines.diagonal_lines}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Corner Lines:</span>
                        <span className="font-medium text-gray-800">
                          {analysisResults.analysis_summary.leading_lines.corner_lines}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Strong Lines:</span>
                        <span className={`font-medium ${
                          analysisResults.analysis_summary.leading_lines.has_strong_leading_lines 
                            ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {analysisResults.analysis_summary.leading_lines.has_strong_leading_lines ? '✅ Yes' : '⚠️ No'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* Reset button */}
          <div className="text-center">
            <button
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
                setAnalysisResults(null);
                setDeskewResults(null);
                setError(null);
              }}
              className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              📷 Analyze Another Image
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ImageUploader;
