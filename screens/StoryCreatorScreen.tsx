import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useAppContext } from '../context/AppContext';
import ScreenWrapper from '../components/ScreenWrapper';
import { POINTS_PER_ACTIVITY } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

const StoryCreatorScreen: React.FC = () => {
    const { 
      addPoints, showToast, ageGroup,
      storyInProgress, chatSession, startNewStory, continueStory, finishStory
    } = useAppContext();
    const { t, language } = useTranslation();
    
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isStoryFinished, setIsStoryFinished] = useState(false);

    const screenTitle = t(`home.age_${ageGroup}.story_creator_title`);

    const handleStartNewStory = useCallback(async () => {
        setIsLoading(true);
        setIsStoryFinished(false);
        // FIX: Use process.env.API_KEY as per the guidelines.
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("API_KEY is missing from environment variables.");
            // Create a dummy chat session for offline fallback
            const dummyChat = {} as Chat; // Cast to Chat to satisfy types, but it won't be used for API calls
            startNewStory(dummyChat, "Once upon a time, in a land filled with candy clouds...");
            showToast("Playing offline! Buddy is using his imagination.");
            setIsLoading(false);
            return;
        }
        
        let agePromptSegment = "";
        switch(ageGroup) {
            case '7-9':
                agePromptSegment = "for a child aged 7-9. Make it a fun adventure story about friendship, animals, or exploring a magical but familiar place like a forest or a hidden garden. Keep the language simple and clear.";
                break;
            case '10-12':
                agePromptSegment = "for a child aged 10-12. It can be a simple mystery, a school adventure, or a story about overcoming a small challenge. Focus on relatable characters and logical plot progression. Avoid complex science-fiction.";
                break;
        }

        let languageInstruction = "Use simple, clear English suitable for a non-native speaker.";
        if (language === 'mk') {
            languageInstruction = "Use clear, simple Macedonian language.";
        } else if (language === 'tr') {
            languageInstruction = "Use clear, simple Turkish language.";
        }
        
        const systemInstruction = `You are a creative and fun storyteller for a child. You are writing a story together with the child. Your role is to continue the story one sentence at a time, based on what the child writes. Keep your sentences exciting, age-appropriate, and easy to understand, focusing on logical and relatable stories rather than complex sci-fi. ${languageInstruction} Never break character.`;

        const ai = new GoogleGenAI({apiKey: apiKey});
        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
            }
        });
        
        try {
            const result = await newChat.sendMessage({ message: `Start a new story ${agePromptSegment}. Give me just one exciting first sentence to begin.` });
            const firstSentence = result.text.trim();
            startNewStory(newChat, firstSentence);
        } catch (error) {
            console.error("Error starting story:", error);
            showToast("Oops! Buddy is a bit sleepy. Try again.");
            startNewStory(newChat, "Once upon a time, in a land filled with candy clouds...");
        } finally {
            setIsLoading(false);
        }
    }, [ageGroup, language, startNewStory, showToast]);

    useEffect(() => {
        // If there's no story in progress when the screen loads, start one.
        if (storyInProgress.length === 0 && !isStoryFinished) {
            handleStartNewStory();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddSentence = async () => {
        if (!userInput.trim() || !chatSession) return;
        
        setIsLoading(true);
        const currentInput = userInput;
        setUserInput('');

        try {
            const result = await chatSession.sendMessage({ message: currentInput });
            const aiSentence = result.text.trim();
            continueStory(currentInput, aiSentence);
        } catch(error) {
             console.error("Error continuing story:", error);
             showToast("Buddy is having trouble thinking. Let's try that again!");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFinishStory = async () => {
        if (!chatSession) return;

        setIsLoading(true);
        try {
            const result = await chatSession.sendMessage({ message: `Let's write a great and happy ending for our story! Just give me one or two final sentences to wrap it all up.`});
            const ending = result.text.trim();
            
            finishStory(ending);
            
            addPoints('creativity', POINTS_PER_ACTIVITY * 2); // More points for finishing a story
            showToast(`+${POINTS_PER_ACTIVITY * 2} points for creativity! 🎨`);
            
            setIsStoryFinished(true);
        } catch(error) {
            console.error("Error finishing story:", error);
            showToast("Couldn't think of an ending! Maybe you can!");
        } finally {
            setIsLoading(false);
        }
    };

    const getTheme = () => {
        switch (ageGroup) {
            case '7-9':
                return {
                    blob1: 'bg-indigo-200', blob2: 'bg-indigo-300',
                    buddyTextBg: 'bg-indigo-100 text-indigo-800',
                    button: 'bg-indigo-500 hover:bg-indigo-600',
                    title: 'text-indigo-800',
                    inputBorder: 'focus:border-indigo-400',
                };
            case '10-12':
                return {
                    blob1: 'bg-purple-200', blob2: 'bg-purple-300',
                    buddyTextBg: 'bg-purple-100 text-purple-800',
                    button: 'bg-purple-500 hover:bg-purple-600',
                    title: 'text-purple-800',
                    inputBorder: 'focus:border-purple-400',
                };
            default:
                 return {
                    blob1: 'bg-indigo-200', blob2: 'bg-indigo-300',
                    buddyTextBg: 'bg-indigo-100 text-indigo-800',
                    button: 'bg-indigo-500 hover:bg-indigo-600',
                    title: 'text-indigo-800',
                    inputBorder: 'focus:border-indigo-400',
                };
        }
    };

    const theme = getTheme();
    const userTextBg = 'bg-amber-100 text-amber-800';
    
  return (
    <ScreenWrapper title={screenTitle}>
        <div className="relative flex flex-col items-center justify-start pt-8 text-center flex-grow">
            {/* Decorative blobs */}
            <div className={`absolute top-20 -left-16 w-72 h-72 ${theme.blob1} rounded-full opacity-50 filter blur-xl animate-blob`}></div>
            <div className={`absolute top-40 -right-16 w-72 h-72 ${theme.blob2} rounded-full opacity-50 filter blur-xl animate-blob animation-delay-2000`}></div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-inner w-full flex-grow flex flex-col z-10">
                <h2 className={`text-xl font-bold ${theme.title} mb-4`}>{t('story_creator_screen.adventure_title')}</h2>
                <div className="story-content overflow-y-auto flex-grow space-y-3 pr-2 mb-4">
                    {storyInProgress.map((part, index) => (
                        <div key={index} className={`p-2 rounded-lg ${index % 2 === 0 ? theme.buddyTextBg : userTextBg} ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                           {index % 2 === 0 && (
                                <span className="font-bold text-xs opacity-70 block">{t('story_creator_screen.buddy_says')}</span>
                           )}
                           <div>{part}</div>
                           {index % 2 !== 0 && <span className="font-bold text-xs opacity-70 block text-right">{t('story_creator_screen.you_said')}</span>}
                        </div>
                    ))}
                    {isLoading && storyInProgress.length > 0 && <p className={`text-purple-600 animate-pulse text-left p-2`}>{t('story_creator_screen.buddy_thinks')}</p>}
                </div>
                
                {isLoading && storyInProgress.length === 0 && (
                     <div className="flex items-center justify-center h-full">
                        <p className={`text-xl ${theme.title} animate-pulse`}>{t('story_creator_screen.loading')}</p>
                    </div>
                )}

                {!isStoryFinished ? (
                     <div className="mt-auto pt-4 border-t border-purple-200">
                        <textarea
                            className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none ${theme.inputBorder} text-gray-800 bg-white`}
                            rows={2}
                            placeholder={t('story_creator_screen.placeholder')}
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <div className="flex space-x-2 mt-2">
                             <button
                                onClick={handleAddSentence}
                                disabled={isLoading || !userInput.trim()}
                                className={`flex-grow ${theme.button} text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-300`}
                            >
                                {t('story_creator_screen.add_sentence_button')}
                            </button>
                             <button
                                onClick={handleFinishStory}
                                disabled={isLoading || storyInProgress.length < 3}
                                className="bg-rose-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-rose-600 transition disabled:bg-gray-300"
                                title={storyInProgress.length < 3 ? t('story_creator_screen.finish_tooltip') : "Finish the story"}
                            >
                                {t('story_creator_screen.finish_button')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-auto pt-4 text-center">
                         <h3 className="text-2xl font-bold text-rose-600">{t('story_creator_screen.end_title')}</h3>
                         <p className="text-gray-700 my-2">{t('story_creator_screen.end_subtitle')}</p>
                         <button
                            onClick={handleStartNewStory}
                            className={`w-full ${theme.button} text-white font-bold py-3 px-4 rounded-lg transition`}
                        >
                            {t('story_creator_screen.another_story_button')}
                        </button>
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
            .story-content {
                scrollbar-width: thin;
                scrollbar-color: #A5B4FC #E0E7FF;
            }
        `}</style>
    </ScreenWrapper>
  );
};

export default StoryCreatorScreen;