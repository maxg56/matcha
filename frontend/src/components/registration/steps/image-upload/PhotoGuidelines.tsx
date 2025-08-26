import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

export const PhotoGuidelines: React.FC = () => (
  <div className="bg-gray-50 rounded-lg p-4">
    <h4 className="font-medium mb-3 flex items-center text-gray-900">
      <ImageIcon className="w-4 h-4 mr-2 text-purple-600" />
      Conseils pour de belles photos
    </h4>
    <ul className="text-sm text-gray-600 space-y-1">
      <li>• Utilisez des photos récentes et de bonne qualité</li>
      <li>• Montrez clairement votre visage sur la photo principale</li>
      <li>• Variez les angles et les contextes</li>
      <li>• Évitez les photos de groupe confuses</li>
      <li>• Souriez ! Les photos joyeuses attirent plus de matches</li>
    </ul>
  </div>
);