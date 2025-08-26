import React from 'react';
import { Camera } from 'lucide-react';

export const EmptyState: React.FC = () => (
  <div className="text-center py-12">
    {/* 3D Camera Icon with floating animation */}
    <div className="relative mb-8">
      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 via-purple-50 to-blue-100 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-700 hover:scale-110 hover:rotate-12 animate-pulse border-4 border-white/50">
        <Camera className="w-12 h-12 text-purple-600" />
      </div>
      
      {/* Floating particles */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0s' }}></div>
      </div>
      <div className="absolute top-4 left-1/4 transform -translate-x-1/2">
        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce shadow-md" style={{ animationDelay: '0.3s' }}></div>
      </div>
      <div className="absolute top-4 right-1/4 transform translate-x-1/2">
        <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce shadow-md" style={{ animationDelay: '0.6s' }}></div>
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-blue-400/20 blur-xl animate-pulse"></div>
    </div>
    
    {/* Enhanced text with gradient */}
    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 bg-clip-text text-transparent mb-3 tracking-tight">
      Donnez vie à votre profil !
    </h3>
    <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto leading-relaxed">
      Ajoutez vos plus belles photos pour attirer l'attention et faire une première impression mémorable
    </p>
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-full border border-purple-100">
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
      <p className="text-sm text-purple-700 font-medium">
        Cliquez sur "Ajouter une photo" pour commencer
      </p>
    </div>
  </div>
);