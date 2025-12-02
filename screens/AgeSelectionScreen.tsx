import React from 'react';
import { useAppContext } from '../context/AppContext';
import { AgeGroup, Screen } from '../types';
import ScreenWrapper from '../components/ScreenWrapper';
import { useTranslation } from '../hooks/useTranslation';

const AgeSelectionScreen: React.FC = () => {
  const { setAgeGroup } = useAppContext();
  const { t } = useTranslation();

  const handleSelectAge = (ageGroup: AgeGroup) => {
    setAgeGroup(ageGroup);
  };

  return (
    <ScreenWrapper title="" showBackButton={false}>
      <div className="flex flex-col items-center justify-center text-center flex-grow space-y-6">
        
        <div className="flex items-center justify-center gap-2">
            <h1 className="text-4xl font-bold text-teal-800">{t('age_selection.welcome')}</h1>
            <img 
                src="https://i.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif" 
                alt="Waving hand animation" 
                className="w-14 h-14"
            />
        </div>

        <h2 className="text-2xl font-semibold text-teal-700">
          {t('age_selection.happy_to_see_you')}
        </h2>
        <p className="text-lg text-gray-600 max-w-sm">
          {t('age_selection.prompt')}
        </p>
        <div className="w-full max-w-xs space-y-4 pt-4">
          <button
            onClick={() => handleSelectAge('7-9')}
            className="w-full bg-orange-400 text-orange-800 font-bold text-xl py-6 px-4 rounded-2xl shadow-lg hover:bg-orange-500 transition-transform transform hover:scale-105"
          >
            {t('age_selection.age_7_9')}
          </button>
          <button
            onClick={() => handleSelectAge('10-12')}
            className="w-full bg-slate-500 text-white font-bold text-xl py-6 px-4 rounded-2xl shadow-lg hover:bg-slate-600 transition-transform transform hover:scale-105"
          >
            {t('age_selection.age_10_12')}
          </button>
        </div>
        <p className="text-sm text-gray-500 pt-4">
            {t('age_selection.reset_note')}
        </p>
      </div>
    </ScreenWrapper>
  );
};

export default AgeSelectionScreen;