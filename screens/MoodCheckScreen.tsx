import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ScreenWrapper from '../components/ScreenWrapper';
import { MOOD_OPTIONS, MOOD_EMOJIS, MOOD_COLORS } from '../constants';
import { Mood, Screen } from '../types';
import { useTranslation } from '../hooks/useTranslation';

const MoodCheckScreen: React.FC = () => {
  const { addMood, setCurrentScreen, ageGroup } = useAppContext();
  const { t } = useTranslation();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');

  const screenTitle = t(`home.age_${ageGroup}.mood_check_title`);

  const handleSubmit = () => {
    if (selectedMood) {
      addMood({
        mood: selectedMood,
        note,
        date: new Date().toISOString(),
      });
      setCurrentScreen(Screen.Reflection);
    }
  };

  const getTheme = () => {
    switch (ageGroup) {
      case '7-9':
        return {
          blob1: 'bg-teal-200',
          blob2: 'bg-teal-300',
          ring: 'ring-teal-400',
          focusBorder: 'focus:border-teal-400',
          buttonBg: 'bg-teal-500',
          buttonHoverBg: 'hover:bg-teal-600',
        };
      case '10-12':
        return {
          blob1: 'bg-slate-200',
          blob2: 'bg-slate-300',
          ring: 'ring-slate-400',
          focusBorder: 'focus:border-slate-400',
          buttonBg: 'bg-slate-500',
          buttonHoverBg: 'hover:bg-slate-600',
        };
      default:
        return {
          blob1: 'bg-teal-200',
          blob2: 'bg-teal-300',
          ring: 'ring-teal-400',
          focusBorder: 'focus:border-teal-400',
          buttonBg: 'bg-teal-500',
          buttonHoverBg: 'hover:bg-teal-600',
        };
    }
  };
  const theme = getTheme();


  return (
    <ScreenWrapper title={screenTitle}>
      <div className="relative flex flex-col items-center justify-start pt-8 flex-grow">
         {/* Decorative blobs */}
        <div className={`absolute top-10 -left-16 w-72 h-72 ${theme.blob1} rounded-full opacity-50 filter blur-xl animate-blob`}></div>
        <div className={`absolute bottom-10 -right-16 w-72 h-72 ${theme.blob2} rounded-full opacity-50 filter blur-xl animate-blob animation-delay-2000`}></div>

        <div className="flex flex-col items-center space-y-8 z-10 w-full">
            <div className="grid grid-cols-3 gap-4">
            {MOOD_OPTIONS.map((mood) => (
                <button
                key={mood}
                onClick={() => setSelectedMood(mood)}
                className={`flex flex-col items-center p-3 rounded-xl w-24 h-24 justify-center transition-transform transform ${
                    selectedMood === mood ? `ring-4 ${theme.ring}` : 'hover:scale-110'
                } ${MOOD_COLORS[mood]}`}
                >
                <span className="text-4xl">{MOOD_EMOJIS[mood]}</span>
                <span className="mt-1 font-semibold text-white/90 text-sm">{t(`moods.${mood}`)}</span>
                </button>
            ))}
            </div>

            <textarea
                className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none ${theme.focusBorder} bg-white/70 backdrop-blur-sm text-gray-800`}
                rows={3}
                placeholder={t('mood_check_screen.placeholder')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />
            <button
                onClick={handleSubmit}
                disabled={!selectedMood}
                className={`w-full ${theme.buttonBg} text-white font-bold py-3 px-4 rounded-lg ${theme.buttonHoverBg} transition disabled:bg-gray-300`}
            >
                {t('mood_check_screen.save_button')}
            </button>
        </div>
      </div>
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </ScreenWrapper>
  );
};

export default MoodCheckScreen;
