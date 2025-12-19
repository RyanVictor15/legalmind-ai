import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText } from 'lucide-react';

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
        ${isDragActive ? 'border-legal-500 bg-legal-50' : 'border-gray-300 hover:border-legal-500 hover:bg-gray-50'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-legal-100 rounded-full text-legal-500">
          {isLoading ? (
            <div className="animate-spin h-8 w-8 border-4 border-legal-500 border-t-transparent rounded-full"></div>
          ) : (
            <UploadCloud size={40} />
          )}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-700">
            {isDragActive ? "Solte o arquivo aqui..." : "Clique ou arraste um documento legal"}
          </p>
          <p className="text-sm text-gray-500 mt-1">Suporta PDF ou TXT (Max 5MB)</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;