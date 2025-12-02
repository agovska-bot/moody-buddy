import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Language } from '../types';
import ScreenWrapper from '../components/ScreenWrapper';
// useTranslation is no longer needed here as the text is hardcoded
// import { useTranslation } from '../hooks/useTranslation';

const FlagUK: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" {...props}>
    <clipPath id="a"><path d="M0 0h60v30H0z"/></clipPath>
    <g clipPath="url(#a)">
      <path d="M0 0v30h60V0z" fill="#012169"/>
      <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6"/>
      <path d="M0 0l60 30m0-30L0 30" clipPath="url(#b)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
    <clipPath id="b">
      <path d="M0 0l30 15H0zm30 0l30 15V0zm0 15l30 15H30zM0 15l30 15V15z"/>
    </clipPath>
  </svg>
);

const FlagMK: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" {...props}>
    <rect width="60" height="30" fill="#d20000"/>
    <g fill="#ffe600">
      <polygon points="0,0 6,0 30,15 0,3"/>
      <polygon points="0,30 0,27 30,15 6,30"/>
      <polygon points="60,0 60,3 30,15 54,0"/>
      <polygon points="60,30 54,30 30,15 60,27"/>
      <rect x="0" y="13.5" width="60" height="3"/>
      <rect x="28.5" y="0" width="3" height="30"/>
    </g>
    <circle cx="30" cy="15" r="4.5" fill="#ffe600"/>
    <circle cx="30" cy="15" r="3.5" fill="#d20000"/>
  </svg>
);

const FlagTR: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" {...props}>
    <path fill="#e30a17" d="M0 0h60v30H0z"/>
    <circle cx="22.5" cy="15" r="7.5" fill="#fff"/>
    <circle cx="24.3" cy="15" r="6" fill="#e30a17"/>
    <path fill="#fff" d="M29 15l5.8-1.8-3.6 4.7v-5.8l3.6 4.7z"/>
  </svg>
);


const LanguageSelectionScreen: React.FC = () => {
  const { setLanguage } = useAppContext();
  
  const handleSelectLang = (lang: Language) => {
    setLanguage(lang);
  };
  
  const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
      const [isJiggling, setIsJiggling] = useState(false);

      const handleInteraction = () => {
        if (isJiggling) return;
        setIsJiggling(true);
        setTimeout(() => {
          setIsJiggling(false);
        }, 500); // Duration of the jiggle animation
      };

      const { onClick, onKeyDown, className, ...rest } = props;
      const mergedClassName = `${className || ''} cursor-pointer focus:outline-none`;


      return (
        <svg
            viewBox="0 0 210 60"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Say hi to Moody Buddy"
            role="button"
            tabIndex={0}
            onClick={(e) => {
                handleInteraction();
                if (onClick) onClick(e);
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleInteraction();
                if (onKeyDown) onKeyDown(e);
            }}
            className={mergedClassName}
            {...rest}
        >
            <style>
                {`
                @keyframes blink-logo {
                    0%, 90%, 100% { transform: scaleY(1); }
                    95% { transform: scaleY(0.1); }
                }
                @keyframes jiggle-logo {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(8deg); }
                    50% { transform: rotate(-8deg); }
                    75% { transform: rotate(8deg); }
                }
                .buddy-body-logo {
                    transform-origin: center 80%;
                }
                .buddy-eye-logo {
                    animation: blink-logo 5s infinite ease-in-out;
                    transform-origin: center center;
                }
                .jiggle-logo {
                    animation: jiggle-logo 0.5s ease-in-out;
                    transform-origin: 27.5px 49.5px;
                }
                `}
            </style>
            <g className={isJiggling ? 'jiggle-logo' : ''}>
                {/* Moody Buddy Icon */}
                <g transform="translate(5, 5)" className="buddy-body-logo">
                    <path
                        d="M45.7,21.9c0-12.1-9.8-21.9-21.9-21.9S2,9.8,2,21.9c0,9.1,5.6,16.9,13.6,20.2l-0.7,5.7c-0.1,0.8,0.5,1.5,1.3,1.5c0.1,0,0.2,0,0.3-0.1l7.3-5.2c1.3,0.2,2.6,0.2,4,0.2C35.9,43.8,45.7,34,45.7,21.9z"
                        fill="#50C878"
                        stroke="#004D40"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <circle className="buddy-eye-logo" cx="15.8" cy="20.5" r="2.5" fill="#004D40" />
                    <circle className="buddy-eye-logo" cx="32.8" cy="20.5" r="2.5" fill="#004D40" />
                    <path
                        d="M18.8,29.5c0,0,3,4,8,0"
                        fill="none"
                        stroke="#004D40"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </g>
            </g>

            {/* Large Plus Icon */}
            <g transform="translate(48, 22)">
                <path
                d="M12,2v20M2,12h20"
                fill="none"
                stroke="#004D40"
                strokeWidth="10"
                strokeLinecap="round"
                />
                <path
                d="M12,2v20M2,12h20"
                fill="none"
                stroke="#FBBF24"
                strokeWidth="6"
                strokeLinecap="round"
                />
            </g>

            {/* Text */}
            <text x="85" y="27" fontFamily="Nunito, sans-serif" fontWeight="900" fontSize="24" fill="#004D40">
                Moody
            </text>
            <text x="85" y="54" fontFamily="Nunito, sans-serif" fontWeight="900" fontSize="24" fill="#004D40">
                Buddy
            </text>
            
            {/* Small Plus Icon */}
            <g transform="translate(180, 45)">
                <path
                d="M-5,0h10 M0,-5v10"
                fill="none"
                stroke="#004D40"
                strokeWidth="5"
                strokeLinecap="round"
                />
                <path
                d="M-5,0h10 M0,-5v10"
                fill="none"
                stroke="#FBBF24"
                strokeWidth="3"
                strokeLinecap="round"
                />
            </g>
        </svg>
      );
  };


  return (
    <ScreenWrapper title="" showBackButton={false}>
      <div className="relative flex flex-col items-center justify-center text-center flex-grow py-8 gap-20">
        
        {/* Decorative blobs */}
        <div className="absolute top-10 -left-16 w-72 h-72 bg-teal-200 rounded-full opacity-50 filter blur-xl animate-blob"></div>
        <div className="absolute bottom-10 -right-16 w-72 h-72 bg-amber-200 rounded-full opacity-50 filter blur-xl animate-blob animation-delay-2000"></div>

        <div className="flex flex-col items-center z-10 w-full max-w-md">
          <Logo className="w-full h-auto drop-shadow-lg" />
        </div>

        <div className="w-full max-w-sm z-10">
            <h2 className="text-xl font-semibold text-teal-700 mb-6">
                Choose your language
            </h2>
            <div className="space-y-4">
                <button
                    onClick={() => handleSelectLang('mk')}
                    className="w-full bg-yellow-400 text-yellow-900 font-bold py-4 px-4 rounded-2xl shadow-lg hover:bg-yellow-500 transition-transform transform hover:scale-105"
                >
                    <span className="flex items-center justify-center gap-3">
                        <FlagMK className="waving-flag w-10 h-auto rounded" />
                        <span className="text-xl font-bold">Македонски</span>
                    </span>
                </button>
                <button
                    onClick={() => handleSelectLang('tr')}
                    className="w-full bg-red-500 text-white font-bold py-4 px-4 rounded-2xl shadow-lg hover:bg-red-600 transition-transform transform hover:scale-105"
                >
                    <span className="flex items-center justify-center gap-3">
                        <FlagTR className="waving-flag w-10 h-auto rounded" />
                        <span className="text-xl font-bold">Türkçe</span>
                    </span>
                </button>
                <button
                    onClick={() => handleSelectLang('en')}
                    className="w-full bg-blue-500 text-white font-bold py-4 px-4 rounded-2xl shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-105"
                >
                   <span className="flex items-center justify-center gap-3">
                        <FlagUK className="waving-flag w-10 h-auto rounded" />
                        <span className="text-xl font-bold">English</span>
                    </span>
                </button>
            </div>
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
        
        @keyframes gentle-wave {
            0% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(-3deg) scale(1.02); }
            50% { transform: rotate(0deg) scale(1); }
            75% { transform: rotate(3deg) scale(1.02); }
            100% { transform: rotate(0deg) scale(1); }
        }

        .waving-flag {
            display: inline-block;
            animation: gentle-wave 2.8s ease-in-out infinite;
            transform-origin: 50% 50%;
        }
      `}</style>
    </ScreenWrapper>
  );
};

export default LanguageSelectionScreen;