import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Screen, MoodEntry, Points, ReflectionEntry, AgeGroup, StoryEntry, Language } from '../types';
import { Chat } from '@google/genai';

interface AppContextType {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  moodHistory: MoodEntry[];
  addMood: (mood: MoodEntry) => void;
  reflections: ReflectionEntry[];
  addReflection: (reflection: ReflectionEntry) => void;
  stories: StoryEntry[];
  addStory: (story: StoryEntry) => void;
  points: Points;
  addPoints: (category: keyof Points, amount: number) => void;
  totalPoints: number;
  toastMessage: string | null;
  showToast: (message: string) => void;
  streakDays: number;
  ageGroup: AgeGroup | null;
  setAgeGroup: (ageGroup: AgeGroup) => void;
  language: Language | null;
  setLanguage: (language: Language) => void;
  storyInProgress: string[];
  chatSession: Chat | null;
  startNewStory: (chat: Chat, firstSentence: string) => void;
  continueStory: (userSentence: string, aiSentence: string) => void;
  finishStory: (finalSentence: string) => void;
  resetApp: () => void;
  t: (key: string, fallback?: string) => any;
  isInstallable: boolean;
  installApp: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageStorage] = useLocalStorage<Language | null>('language', null);
  const [ageGroup, setAgeGroupStorage] = useLocalStorage<AgeGroup | null>('ageGroup', null);
  
  const [translationsData, setTranslationsData] = useState<Record<string, any> | null>(null);
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      console.log("PWA Install event captured!");
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  useEffect(() => {
    const fetchTranslations = async () => {
        try {
            const [en, mk, tr] = await Promise.all([
                fetch('/locales/en.json').then(res => res.json()),
                fetch('/locales/mk.json').then(res => res.json()),
                fetch('/locales/tr.json').then(res => res.json())
            ]);
            setTranslationsData({ en, mk, tr });
        } catch (error) {
            console.error("Failed to load translation files:", error);
            setTranslationsData({ en: {}, mk: {}, tr: {} }); 
        }
    };
    fetchTranslations();
  }, []);

  const determineInitialScreen = () => {
    const savedLang = localStorage.getItem('language');
    const savedAge = localStorage.getItem('ageGroup');
    
    if (!savedLang || savedLang === 'null') return Screen.LanguageSelection;
    if (!savedAge || savedAge === 'null') return Screen.AgeSelection;
    return Screen.Home;
  };
  
  const [currentScreen, setCurrentScreen] = useState<Screen>(determineInitialScreen());
  const [moodHistory, setMoodHistory] = useLocalStorage<MoodEntry[]>('moodHistory', []);
  const [reflections, setReflections] = useLocalStorage<ReflectionEntry[]>('reflections', []);
  const [stories, setStories] = useLocalStorage<StoryEntry[]>('stories', []);
  const [points, setPoints] = useLocalStorage<Points>('points', { gratitude: 0, physical: 0, kindness: 0, creativity: 0 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [streakDays, setStreakDays] = useLocalStorage<number>('streakDays', 0);
  const [storyInProgress, setStoryInProgress] = useState<string[]>([]);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const t = useCallback((key: string, fallback?: string): any => {
    if (!translationsData) return fallback || key;

    const currentTranslations = language ? translationsData[language] : translationsData.en;
    if (!key || !currentTranslations) return fallback || key;

    const keys = key.split('.');
    let result: any = currentTranslations;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return fallback || key;
      }
    }
    return result;
  }, [language, translationsData]);
  
  const setLanguage = useCallback((lang: Language) => {
    setLanguageStorage(lang);
    setCurrentScreen(Screen.AgeSelection);
  }, [setLanguageStorage]);

  const setAgeGroup = useCallback((age: AgeGroup) => {
    setAgeGroupStorage(age);
    setCurrentScreen(Screen.Home);
  }, [setAgeGroupStorage]);

  const addMood = useCallback((mood: MoodEntry) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastEntry = moodHistory.length > 0
        ? [...moodHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
        : null;

    setMoodHistory(prevHistory => [...prevHistory, mood]);

    if (lastEntry) {
        const lastEntryDate = new Date(lastEntry.date);
        lastEntryDate.setHours(0, 0, 0, 0);
        
        if (lastEntryDate.getTime() === today.getTime()) {
            showToast(`Mood saved: ${mood.mood}`);
            return;
        }

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (lastEntryDate.getTime() === yesterday.getTime()) {
            setStreakDays(prevStreak => {
                const newStreak = prevStreak + 1;
                showToast(`You're on a ${newStreak}-day streak! 🔥`);
                return newStreak;
            });
        } else {
            setStreakDays(1);
            showToast(`Mood saved! New streak started! 🔥`);
        }
    } else {
        setStreakDays(1);
        showToast(`First mood saved! Streak started! 🔥`);
    }
  }, [moodHistory, setMoodHistory, setStreakDays, showToast]);


  const addReflection = useCallback((reflection: ReflectionEntry) => {
    setReflections(prev => [...prev, reflection]);
  }, [setReflections]);

  const addStory = useCallback((story: StoryEntry) => {
    setStories(prev => [...prev, story]);
  }, [setStories]);

  const addPoints = useCallback((category: keyof Points, amount: number) => {
    setPoints(prevPoints => ({
      ...prevPoints,
      [category]: prevPoints[category] + amount,
    }));
  }, [setPoints]);
  
  const startNewStory = useCallback((chat: Chat, firstSentence: string) => {
    setChatSession(chat);
    setStoryInProgress([firstSentence]);
  }, []);

  const continueStory = useCallback((userSentence: string, aiSentence: string) => {
    setStoryInProgress(prev => [...prev, userSentence, aiSentence]);
  }, []);

  const finishStory = useCallback((finalSentence: string) => {
    if (storyInProgress.length === 0) return;

    const finalStoryParts = [...storyInProgress, finalSentence];
    const title = finalStoryParts[0].split(' ').slice(0, 5).join(' ') + '...';
    const newStory: StoryEntry = {
        title,
        content: finalStoryParts,
        date: new Date().toISOString(),
    };
    
    addStory(newStory);
    setStoryInProgress([]);
    setChatSession(null);
  }, [storyInProgress, addStory]);

  const totalPoints = useMemo(() => {
    return points.gratitude + points.physical + points.kindness + points.creativity;
  }, [points]);

  const resetApp = useCallback(() => {
    setLanguageStorage(null);
    setAgeGroupStorage(null);
    setMoodHistory([]);
    setReflections([]);
    setStories([]);
    setPoints({ gratitude: 0, physical: 0, kindness: 0, creativity: 0 });
    setStreakDays(0);
    setStoryInProgress([]);
    setChatSession(null);
    setCurrentScreen(Screen.LanguageSelection);
  }, [setLanguageStorage, setAgeGroupStorage, setMoodHistory, setReflections, setStories, setPoints, setStreakDays]);

  if (!translationsData) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-amber-50 text-teal-700 font-semibold">
              Loading Buddy...
          </div>
      )
  }

  return (
    <AppContext.Provider value={{
      currentScreen,
      setCurrentScreen,
      moodHistory,
      addMood,
      reflections,
      addReflection,
      stories,
      addStory,
      points,
      addPoints,
      totalPoints,
      toastMessage,
      showToast,
      streakDays,
      ageGroup,
      setAgeGroup,
      language,
      setLanguage,
      storyInProgress,
      chatSession,
      startNewStory,
      continueStory,
      finishStory,
      resetApp,
      t,
      isInstallable: !!deferredPrompt,
      installApp,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};