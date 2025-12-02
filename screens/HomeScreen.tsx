import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../types';
import ScreenWrapper from '../components/ScreenWrapper';
import PointsSummary from '../components/PointsSummary';
import TaskCard from '../components/TaskCard';
import { useTranslation } from '../hooks/useTranslation';
import BuddyIcon from '../components/BuddyIcon';
import AnimatedTaskCard from '../components/AnimatedTaskCard';

const HomeScreen: React.FC = () => {
  const { setCurrentScreen, ageGroup, resetApp, isInstallable, installApp } = useAppContext();
  const { t } = useTranslation();
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Check if app is already running in standalone mode (installed)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(standalone);
  }, []);

  const originalTheme = {
    '10-12': {
      storyCreator: "bg-purple-500 text-white",
      rapBattle: "bg-fuchsia-600 text-white",
      gratitude: "bg-teal-500 text-white",
      move: "bg-indigo-500 text-white",
      kindness: "bg-rose-500 text-white",
      calmZone: "bg-green-600 text-white",
    },
    '7-9': {
      storyCreator: "bg-purple-400 text-purple-800",
      rapBattle: "bg-fuchsia-400 text-fuchsia-900",
      gratitude: "bg-amber-400 text-amber-800",
      move: "bg-sky-400 text-sky-800",
      kindness: "bg-rose-400 text-rose-800",
      calmZone: "bg-teal-400 text-teal-800",
    }
  };
  
  const animatedTheme = {
    storyCreator: "bg-indigo-500 text-white",
    rapBattle: "bg-fuchsia-500 text-white",
    gratitude: "bg-yellow-400 text-yellow-900",
    move: "bg-lime-500 text-white",
    kindness: "bg-emerald-500 text-white",
    calmZone: "bg-sky-400 text-white",
  };

  const theme = ageGroup === '7-9' ? animatedTheme : originalTheme['10-12'];
  
  const ageGroupKey = `home.age_${ageGroup}`;

  const footerContent = (
    <>
      <p className="text-sm">
        by <span className="font-semibold text-teal-700">Nikolas Georgievski & Damjan Agovski</span>
      </p>
      <p className="text-xs mt-1">
        FIRSTEP Macedonia Project Competition 2025
      </p>
      <p className="text-xs mt-2 opacity-75">
        AI Features by Google
      </p>
      
      <div className="flex flex-col gap-3 mt-6 items-center w-full">
        {/* Android / Chrome Install Button */}
        {isInstallable && (
          <button 
            onClick={installApp}
            className="bg-teal-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-teal-700 transition-all flex items-center gap-2 text-sm animate-pulse w-full justify-center max-w-xs"
          >
            <span>📲</span> Install App
          </button>
        )}

        {/* iOS Instructions - Only show if on iOS and NOT installed */}
        {isIOS && !isStandalone && (
            <div className="bg-gray-100 p-3 rounded-lg text-xs text-gray-600 max-w-xs border border-gray-200">
                <p className="font-bold text-gray-800 mb-1">Install on iPhone:</p>
                <p>1. Tap the <span className="font-bold text-blue-500">Share</span> button</p>
                <p>2. Scroll down & tap <span className="font-bold">"Add to Home Screen"</span></p>
            </div>
        )}
        
        <button 
          onClick={resetApp}
          className="text-xs text-gray-400 hover:text-red-500 underline mt-2"
        >
          {t('home.reset_button_text')}
        </button>
      </div>
    </>
  );


  return (
    <ScreenWrapper title="" showBackButton={false} footerContent={footerContent}>
      <style>{`
        @keyframes living-flame {
          0% { background-position: 10% 0%; }
          20% { background-position: 60% 50%; }
          40% { background-position: 20% 100%; }
          60% { background-position: 90% 90%; }
          80% { background-position: 40% 20%; }
          100% { background-position: 10% 0%; }
        }
        .animate-living-flame {
            background-size: 300% 300%;
            animation: living-flame 8s ease-in-out infinite;
        }
      `}</style>
       <div className="flex flex-col items-center text-center mb-4">
          <div className="flex items-center justify-center gap-2">
            <BuddyIcon className="w-12 h-auto" />
            <h1 className="text-4xl font-bold text-teal-900">
              {t('home.title')}
            </h1>
          </div>
          <p className="text-lg text-gray-600 mt-1">{t('home.subtitle')}</p>
      </div>

      <div className="space-y-4">
        <PointsSummary />

        {/* Highlighted Mood Check */}
        <button
          onClick={() => setCurrentScreen(Screen.MoodCheck)}
          className="w-full p-5 mt-4 rounded-xl flex items-center space-x-4 text-white bg-gradient-to-br from-yellow-300 via-red-500 to-orange-500 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 animate-living-flame"
        >
          <span className="text-4xl">❤️‍🩹</span>
          <div>
            <p className="text-2xl font-bold text-left">{t(`${ageGroupKey}.mood_check_title`)}</p>
            <p className="text-base opacity-90 text-left">{t(`${ageGroupKey}.mood_check_description`)}</p>
          </div>
        </button>

        <div className="pt-4">
          <h2 className="text-xl font-bold text-gray-700 text-center mb-2">{t('home.more_activities_title', 'More Fun Activities')}</h2>
        </div>
        
        <div className="flex flex-col space-y-4">
          {ageGroup === '7-9' ? (
            <>
              <AnimatedTaskCard 
                  title={t(`${ageGroupKey}.story_creator_title`)}
                  description={t(`${ageGroupKey}.story_creator_description`)}
                  icon="📖"
                  color={theme.storyCreator}
                  animationType="story-bubbles"
                  onClick={() => setCurrentScreen(Screen.StoryCreator)}
              />
              {/* 
              <AnimatedTaskCard 
                  title={t(`${ageGroupKey}.rap_battle_title`)}
                  description={t(`${ageGroupKey}.rap_battle_description`)}
                  icon="🎤"
                  color={theme.rapBattle}
                  animationType="mood-bubbles"
                  onClick={() => setCurrentScreen(Screen.RapBattle)}
              /> 
              */}
              <AnimatedTaskCard 
                  title={t(`${ageGroupKey}.gratitude_jar_title`)}
                  description={t(`${ageGroupKey}.gratitude_jar_description`)}
                  icon="🌟"
                  color={theme.gratitude}
                  animationType="rising-stars"
                  onClick={() => setCurrentScreen(Screen.Gratitude)}
              />
              <AnimatedTaskCard 
                  title={t(`${ageGroupKey}.get_moving_title`)}
                  description={t(`${ageGroupKey}.get_moving_description`)}
                  icon="💪"
                  color={theme.move}
                  animationType="running-man"
                  onClick={() => setCurrentScreen(Screen.Move)}
              />
              <AnimatedTaskCard 
                  title={t(`${ageGroupKey}.kindness_act_title`)}
                  description={t(`${ageGroupKey}.kindness_act_description`)}
                  icon="💖"
                  color={theme.kindness}
                  animationType="fireworks"
                  onClick={() => setCurrentScreen(Screen.Kindness)}
              />
              <AnimatedTaskCard 
                  title={t(`${ageGroupKey}.calm_zone_title`)}
                  description={t(`${ageGroupKey}.calm_zone_description`)}
                  icon="🌬️"
                  color={theme.calmZone}
                  animationType="floating-cloud"
                  onClick={() => setCurrentScreen(Screen.CalmZone)}
              />
            </>
          ) : (
             <>
                 <TaskCard 
                    title={t(`${ageGroupKey}.story_creator_title`)}
                    description={t(`${ageGroupKey}.story_creator_description`)}
                    icon="📖"
                    color={theme.storyCreator}
                    onClick={() => setCurrentScreen(Screen.StoryCreator)}
                />
                {/* 
                <TaskCard 
                    title={t(`${ageGroupKey}.rap_battle_title`)}
                    description={t(`${ageGroupKey}.rap_battle_description`)}
                    icon="🎤"
                    color={theme.rapBattle}
                    onClick={() => setCurrentScreen(Screen.RapBattle)}
                /> 
                */}
                <TaskCard 
                    title={t(`${ageGroupKey}.gratitude_jar_title`)}
                    description={t(`${ageGroupKey}.gratitude_jar_description`)}
                    icon="🌟"
                    color={theme.gratitude}
                    onClick={() => setCurrentScreen(Screen.Gratitude)}
                />
                <TaskCard 
                    title={t(`${ageGroupKey}.get_moving_title`)}
                    description={t(`${ageGroupKey}.get_moving_description`)}
                    icon="💪"
                    color={theme.move}
                    onClick={() => setCurrentScreen(Screen.Move)}
                />
                 <TaskCard 
                    title={t(`${ageGroupKey}.kindness_act_title`)}
                    description={t(`${ageGroupKey}.kindness_act_description`)}
                    icon="💖"
                    color={theme.kindness}
                    onClick={() => setCurrentScreen(Screen.Kindness)}
                />
                 <TaskCard 
                    title={t(`${ageGroupKey}.calm_zone_title`)}
                    description={t(`${ageGroupKey}.calm_zone_description`)}
                    icon="🌬️"
                    color={theme.calmZone}
                    onClick={() => setCurrentScreen(Screen.CalmZone)}
                />
            </>
          )}
        </div>
      </div>
       <div className="mt-6">
            <AnimatedTaskCard
                onClick={() => setCurrentScreen(Screen.Reflection)}
                title={t(`${ageGroupKey}.reflections_title`)}
                icon="📝"
                color="bg-teal-100 text-teal-800"
                animationType="writing-pencil"
                animationColor="text-orange-500"
            />
       </div>
    </ScreenWrapper>
  );
};

export default HomeScreen;