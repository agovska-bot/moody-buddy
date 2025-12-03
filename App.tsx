import React from 'react';
import { useAppContext } from './context/AppContext';
import { Screen } from './types';
import HomeScreen from './screens/HomeScreen';
import MoodCheckScreen from './screens/MoodCheckScreen';
import GratitudeScreen from './screens/GratitudeScreen';
import MoveScreen from './screens/MoveScreen';
import CalmZoneScreen from './screens/CalmZoneScreen';
import KindnessScreen from './screens/KindnessScreen';
import ReflectionScreen from './screens/ReflectionScreen';
import AgeSelectionScreen from './screens/AgeSelectionScreen';
import StoryCreatorScreen from './screens/StoryCreatorScreen';
import Toast from './components/Toast';
import LanguageSelectionScreen from './screens/LanguageSelectionScreen';
// import RapBattleScreen from './screens/RapBattleScreen';

// Final Demo Build - v1.2
const App: React.FC = () => {
  const { currentScreen, toastMessage, ageGroup, language } = useAppContext();

  const getBackgroundColor = () => {
    if (!ageGroup) return 'bg-amber-50'; // Default for setup screens
    switch (ageGroup) {
      case '7-9': return 'bg-amber-50';
      case '10-12': return 'bg-slate-50';
      default: return 'bg-amber-50';
    }
  }

  const renderContent = () => {
    // Centralized logic for handling initial setup screens
    if (!language) {
      return <LanguageSelectionScreen />;
    }
  
    if (!ageGroup) {
      return <AgeSelectionScreen />;
    }

    switch (currentScreen) {
      case Screen.Home:
        return <HomeScreen />;
      case Screen.MoodCheck:
        return <MoodCheckScreen />;
      case Screen.Gratitude:
        return <GratitudeScreen />;
      case Screen.Move:
        return <MoveScreen />;
      case Screen.CalmZone:
        return <CalmZoneScreen />;
      case Screen.Kindness:
        return <KindnessScreen />;
      case Screen.Reflection:
        return <ReflectionScreen />;
      case Screen.StoryCreator:
        return <StoryCreatorScreen />;
      // case Screen.RapBattle:
      //   return <RapBattleScreen />;
      
      // The cases below are fallbacks, as the top-level if-statements should catch them.
      case Screen.LanguageSelection:
        return <LanguageSelectionScreen />;
      case Screen.AgeSelection:
        return <AgeSelectionScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className={`${getBackgroundColor()} min-h-screen font-sans`}>
      {renderContent()}
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
};

export default App;