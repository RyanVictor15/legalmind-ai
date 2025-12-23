import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

const FileUpload = ({ onFileUpload, isLoading }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    multiple: false,
    disabled: isLoading
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
        ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-blue-100 dark:bg-slate-800 rounded-full text-blue-600 dark:text-blue-400">
          {isLoading ? (
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          ) : (
            <UploadCloud size={40} />
          )}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            {isDragActive ? "Drop the file here..." : "Click or drag a legal document"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Supports PDF or TXT (Max 5MB)</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;