import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useAppContext } from '../context/AppContext';
import ScreenWrapper from '../components/ScreenWrapper';
import { POINTS_PER_ACTIVITY } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

const GratitudeScreen: React.FC = () => {
  const { addPoints, showToast, ageGroup } = useAppContext();
  const { t, language } = useTranslation();
  const [task, setTask] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const screenTitle = t(`home.age_${ageGroup}.gratitude_jar_title`);

  const getNewTask = useCallback(async () => {
    setIsLoading(true);
    // FIX: Use process.env.API_KEY as per the guidelines.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables.");
      const fallbackTasks = t('gratitude_screen.fallback_tasks');
      setTask(fallbackTasks[Math.floor(Math.random() * fallbackTasks.length)]);
      setIsLoading(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({apiKey: apiKey});
      let agePromptSegment = "";
      switch (ageGroup) {
        case '7-9':
          agePromptSegment = "for a child aged 7-9. It can be about a friendship, a fun activity, or something beautiful in nature.";
          break;
        case '10-12':
          agePromptSegment = "for a child aged 10-12. It can be about a personal strength, an opportunity they have, or a challenging experience that taught them something.";
          break;
      }

      let languageInstruction = "Use simple, clear English suitable for a non-native speaker of that age.";
      if (language === 'mk') {
        languageInstruction = "The response must be in the Macedonian language.";
      } else if (language === 'tr') {
        languageInstruction = "The response must be in the Turkish language.";
      }
      
      const prompt = `Generate a single, short, simple gratitude activity question ${agePromptSegment}. ${languageInstruction} The response must be only one sentence and be a direct question. For example: 'What is one thing that made you smile today?' Do not use lists or bullet points.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.9,
        }
      });
      const text = response.text;
      setTask(text.trim());
    } catch (error) {
      console.error("Error fetching gratitude task:", error);
      const fallbackTasks = t('gratitude_screen.fallback_tasks');
      if (Array.isArray(fallbackTasks) && fallbackTasks.length > 0) {
        setTask(fallbackTasks[Math.floor(Math.random() * fallbackTasks.length)]);
      } else {
        setTask("Think of something you're grateful for!");
      }
    } finally {
      setIsLoading(false);
    }
  }, [ageGroup, language, t]);
  
  useEffect(() => {
    getNewTask();
  }, [getNewTask]);

  const handleComplete = () => {
    addPoints('gratitude', POINTS_PER_ACTIVITY);
    showToast(`+${POINTS_PER_ACTIVITY} points for gratitude! 🌟`);
    getNewTask();
  };
  
  const getTheme = () => {
    switch (ageGroup) {
      case '7-9':
        return {
          blob1: 'bg-amber-200', blob2: 'bg-amber-300',
          bg: 'bg-amber-100/80', text: 'text-amber-800',
          button: 'bg-amber-500 hover:bg-amber-600',
          button2: 'bg-amber-200 text-amber-800 hover:bg-amber-300',
        };
      case '10-12':
        return {
          blob1: 'bg-teal-200', blob2: 'bg-teal-300',
          bg: 'bg-teal-100/80', text: 'text-teal-800',
          button: 'bg-teal-500 hover:bg-teal-600',
          button2: 'bg-teal-200 text-teal-800 hover:bg-teal-300',
        };
      default: // Fallback to 7-9
        return {
          blob1: 'bg-amber-200', blob2: 'bg-amber-300',
          bg: 'bg-amber-100/80', text: 'text-amber-800',
          button: 'bg-amber-500 hover:bg-amber-600',
          button2: 'bg-amber-200 text-amber-800 hover:bg-amber-300',
        };
    }
  };

  const theme = getTheme();

  return (
    <ScreenWrapper title={screenTitle}>
      <div className="relative flex flex-col items-center justify-start pt-8 text-center space-y-8 flex-grow">
        {/* Decorative blobs */}
        <div className={`absolute top-20 -left-16 w-72 h-72 ${theme.blob1} rounded-full opacity-50 filter blur-xl animate-blob`}></div>
        <div className={`absolute top-40 -right-16 w-72 h-72 ${theme.blob2} rounded-full opacity-50 filter blur-xl animate-blob animation-delay-2000`}></div>
        
        <div className={`${theme.bg} backdrop-blur-sm p-6 rounded-lg shadow-inner min-h-[120px] flex items-center justify-center w-full max-w-sm z-10 mx-4`}>
          {isLoading ? (
            <p className={`text-xl ${theme.text} animate-pulse`}>{t('gratitude_screen.loading')}</p>
          ) : (
            <p className={`text-xl ${theme.text}`}>{task}</p>
          )}
        </div>
        <div className="w-full pt-4 z-10 space-y-3 max-w-sm mx-4">
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className={`w-full ${theme.button} text-white font-bold py-3 px-4 rounded-lg transition disabled:bg-gray-400`}
            >
              {t('gratitude_screen.complete_button')}
            </button>
            <button
              onClick={getNewTask}
              disabled={isLoading}
              className={`w-full ${theme.button2} font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-200`}
            >
              {t('gratitude_screen.another_button')}
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

export default GratitudeScreen;