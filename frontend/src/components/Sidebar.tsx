import React from 'react';
import { WeatherFile } from '../lib/api';
import { FileJson, Loader2, X } from 'lucide-react';

interface SidebarProps {
  files: WeatherFile[];
  onSelectFile: (fileName: string) => void;
  selectedFile: string | null;
  isLoading: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ files, onSelectFile, selectedFile, isLoading, isOpen, onClose }) => {
  return (
    <div className={`
      ${isOpen ? 'fixed inset-0 z-50 flex' : 'hidden md:flex md:static'}
      w-full md:w-80 bg-gray-50 border-r border-gray-200 h-screen flex-shrink-0 overflow-y-auto flex-col shadow-xl md:shadow-none
    `}>
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Stored Files</h2>
          <p className="text-sm text-gray-500">{files.length} files available</p>
        </div>
        {isOpen && onClose && (
          <button onClick={onClose} className="md:hidden p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <div className="flex-1 p-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : files.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No files found.</p>
        ) : (
          files.map((file) => (
            <button
              key={file.name}
              onClick={() => onSelectFile(file.name)}
              className={`w-full text-left p-3 rounded-lg flex items-start space-x-3 transition-colors ${
                selectedFile === file.name
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-white border border-gray-100 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FileJson className={`w-5 h-5 mt-0.5 flex-shrink-0 ${selectedFile === file.name ? 'text-blue-500' : 'text-gray-400'}`} />
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
