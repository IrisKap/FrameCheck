import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const ImageUploader = () => {
  // useState hooks to manage file state and preview URL
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // useDropzone callback to handle file dropping and selection
  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      // Create preview URL using URL.createObjectURL
      const url = URL.createObjectURL(uploadedFile);
      setPreviewUrl(url);
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
      const response = await axios.post('http://localhost:8000/analyze-image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload successful:', response.data);
      // Handle successful response here
      
    } catch (error) {
      console.error('Upload failed:', error);
      // Handle error here
      
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
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-bold text-center mb-4">Upload Your Image</h2>
      
      {/* Dropzone area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-600">Drop the image here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag & drop an image here, or click to select
            </p>
            <p className="text-sm text-gray-400">
              Supports: JPEG, PNG, GIF, BMP, WebP
            </p>
          </div>
        )}
      </div>

      {/* Image preview */}
      {previewUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Preview:</h3>
          <div className="border rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-auto max-h-80 object-contain"
            />
          </div>
          
          {/* Upload button */}
          <div className="mt-4 text-center">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isUploading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
