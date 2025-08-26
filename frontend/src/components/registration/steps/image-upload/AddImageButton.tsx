import React from 'react';
import { Upload } from 'lucide-react';

interface AddImageButtonProps {
  onClick: () => void;
}

export const AddImageButton: React.FC<AddImageButtonProps> = React.memo(({ onClick }) => (
  <div className="relative group">
    <button
      onClick={onClick}
      className="w-full aspect-square rounded-xl bg-gradient-to-br from-gray-50 via-white to-gray-100 border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 transition-all duration-500 flex flex-col items-center justify-center text-gray-600 hover:text-purple-600 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transform hover:scale-[1.02] hover:-rotate-1 group"
      aria-label="Ajouter une image"
    >
      {/* Background pattern */}
      <div className="absolute inset-4 rounded-lg bg-gradient-to-br from-gray-100/50 to-transparent opacity-50"></div>
      
      {/* Upload icon with enhanced styling */}
      <div className="relative z-10 mb-3 p-3 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 group-hover:from-purple-200 group-hover:to-blue-200 transition-all duration-300 transform group-hover:scale-110 shadow-md">
        <Upload className="w-6 h-6 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
      </div>
      
      <span className="relative z-10 text-sm font-semibold transition-all duration-300 group-hover:scale-105 text-center">
        Ajouter une photo
      </span>
      
      {/* Plus icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-purple-100/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
          <div className="w-6 h-1 bg-purple-400 rounded-full"></div>
          <div className="absolute w-1 h-6 bg-purple-400 rounded-full"></div>
        </div>
      </div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-xl"></div>
    </button>
    
    {/* 3D shadow */}
    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600/5 to-blue-600/5 transform translate-y-2 translate-x-2 -z-10 transition-all duration-500 group-hover:translate-y-3 group-hover:translate-x-3 group-hover:opacity-40"></div>
  </div>
));