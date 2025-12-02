import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useAppContext } from '../context/AppContext';
import ScreenWrapper from '../components/ScreenWrapper';
import TTSButton from '../components/TTSButton';
import { useTranslation } from '../hooks/useTranslation';

const RapBattleScreen: React.FC = () => {
  const { ageGroup, showToast } = useAppContext();
  const { t, language } = useTranslation();
  
  const [name, setName] = useState('');
  const [mood, setMood] = useState('');
  const [rapLyrics, setRapLyrics] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const screenTitle = t(`home.age_${ageGroup}.rap_battle_title`);

  const generateRap = async () => {
    if (!name.trim() || !mood.trim()) return;

    setIsLoading(true);
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        showToast("Key missing! Can't drop beats.");
        setIsLoading(false);
        return;
    }

    try {
        const ai = new GoogleGenAI({apiKey: apiKey});
        
        let languageInstruction = "Write in English.";
        if (language === 'mk') languageInstruction = "Write in Macedonian.";
        if (language === 'tr') languageInstruction = "Write in Turkish.";

        const prompt = `You are a cool, friendly rapper for kids. Write a short, 4-line rap song about a kid named ${name} who is feeling ${mood}. Keep it positive, rhyming, and fun. Do not use bad words. ${languageInstruction} Output ONLY the lyrics.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.9 }
        });

        setRapLyrics(response.text.trim());

    } catch (error) {
        console.error("Rap error:", error);
        showToast("Mic check failed! Try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const theme = {
      blob1: 'bg-fuchsia-300', blob2: 'bg-purple-400',
      bg: 'bg-fuchsia-50', text: 'text-fuchsia-900',
      inputBorder: 'focus:border-fuchsia-500',
      button: 'bg-fuchsia-600 hover:bg-fuchsia-700',
      buttonSecondary: 'bg-purple-200 text-purple-800 hover:bg-purple-300'
  };

  return (
    <ScreenWrapper title={screenTitle}>
      <div className="relative flex flex-col items-center justify-start pt-4 text-center flex-grow space-y-6">
        
        {/* Decorative Blobs */}
        <div className={`absolute top-10 -left-16 w-72 h-72 ${theme.blob1} rounded-full opacity-40 filter blur-xl animate-blob`}></div>
        <div className={`absolute bottom-10 -right-16 w-72 h-72 ${theme.blob2} rounded-full opacity-40 filter blur-xl animate-blob animation-delay-2000`}></div>

        <div className="z-10 w-full max-w-sm space-y-4">
            {!rapLyrics ? (
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg space-y-4">
                    <div className="text-6xl animate-bounce">🎧</div>
                    <input 
                        type="text" 
                        placeholder={t('rap_battle_screen.name_placeholder')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none ${theme.inputBorder} text-center text-lg`}
                    />
                    <input 
                        type="text" 
                        placeholder={t('rap_battle_screen.mood_placeholder')}
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none ${theme.inputBorder} text-center text-lg`}
                    />
                    <button
                        onClick={generateRap}
                        disabled={isLoading || !name || !mood}
                        className={`w-full ${theme.button} text-white font-bold py-3 px-4 rounded-xl shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:scale-100`}
                    >
                        {isLoading ? t('rap_battle_screen.loading') : t('rap_battle_screen.generate_button')}
                    </button>
                </div>
            ) : (
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl space-y-4 border-2 border-fuchsia-200">
                    <h3 className="text-xl font-bold text-fuchsia-800">{t('rap_battle_screen.result_title')}</h3>
                    <div className="text-lg font-medium text-gray-800 italic whitespace-pre-line leading-relaxed">
                        {rapLyrics}
                    </div>
                    
                    <div className="flex flex-col gap-3 pt-2">
                         <div className="flex justify-center">
                            <TTSButton textToSpeak={rapLyrics} className="bg-fuchsia-100 text-fuchsia-700 w-12 h-12 rounded-full" />
                         </div>
                        <button
                            onClick={() => { setRapLyrics(''); setName(''); setMood(''); }}
                            className={`w-full ${theme.buttonSecondary} font-bold py-2 px-4 rounded-lg transition`}
                        >
                            {t('rap_battle_screen.another_button')}
                        </button>
                    </div>
                </div>
            )}
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

export default RapBattleScreen;