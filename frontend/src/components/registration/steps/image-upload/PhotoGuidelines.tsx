import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

export const PhotoGuidelines: React.FC = () => (
  <div className="bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-800 dark:to-purple-900/20 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
    <h4 className="font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
      <ImageIcon className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
      Conseils pour de belles photos
    </h4>
    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
      <li className="flex items-start">
        <span className="text-purple-500 dark:text-purple-400 mr-2 mt-0.5">•</span>
        <span>Utilisez des photos récentes et de bonne qualité</span>
      </li>
      <li className="flex items-start">
        <span className="text-purple-500 dark:text-purple-400 mr-2 mt-0.5">•</span>
        <span>Montrez clairement votre visage sur la photo principale</span>
      </li>
      <li className="flex items-start">
        <span className="text-purple-500 dark:text-purple-400 mr-2 mt-0.5">•</span>
        <span>Variez les angles et les contextes</span>
      </li>
      <li className="flex items-start">
        <span className="text-purple-500 dark:text-purple-400 mr-2 mt-0.5">•</span>
        <span>Évitez les photos de groupe confuses</span>
      </li>
      <li className="flex items-start">
        <span className="text-purple-500 dark:text-purple-400 mr-2 mt-0.5">•</span>
        <span>Souriez ! Les photos joyeuses attirent plus de matches</span>
      </li>
    </ul>
  </div>
);