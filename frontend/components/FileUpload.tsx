'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onDemoClick: () => void;
  isLoading?: boolean;
}

export default function FileUpload({ onFileUpload, onDemoClick, isLoading = false }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-5xl">📁</div>
          {isDragActive ? (
            <p className="text-lg text-primary-600 font-semibold">Drop your file here...</p>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-700">
                Drag & drop your CSV or Excel file here
              </p>
              <p className="text-gray-500">or click to browse</p>
              {uploadedFile && (
                <p className="text-sm text-green-600 font-medium mt-2">
                  ✓ {uploadedFile.name}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600 mb-4">or</p>
        <button
          onClick={onDemoClick}
          disabled={isLoading}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Try Demo Data'}
        </button>
      </div>
    </div>
  );
}

