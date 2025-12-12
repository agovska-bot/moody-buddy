
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { useAppContext } from '../context/AppContext';
import ScreenWrapper from '../components/ScreenWrapper';
import { useTranslation } from '../hooks/useTranslation';

// --- Web Audio API Helpers for the Beat ---
const createDrumMachine = (ctx: AudioContext) => {
    // Basic synthesis for a hip-hop beat
    const playKick = (time: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.5);
    };

    const playSnare = (time: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        // Tone
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, time);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.1);

        // Noise
        const bufferSize = ctx.sampleRate * 0.2; // 200ms
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(time);
    };

    const playHiHat = (time: number, open: boolean = false) => {
        const bufferSize = ctx.sampleRate * (open ? 0.3 : 0.05);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            // High pass noise roughly
            data[i] = (Math.random() * 2 - 1);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        // Filter to remove lows
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 5000;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + (open ? 0.3 : 0.05));

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(time);
    };

    // Add a simple bass synth for "Real Song" feel
    const playBass = (time: number, freq: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);
        
        // Low pass filter for deep bass
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, time);
        filter.frequency.exponentialRampToValueAtTime(100, time + 0.3);

        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.4);
    };

    return { playKick, playSnare, playHiHat, playBass };
};

// --- Audio Decoding Helper ---
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  
  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

const RapBattleScreen: React.FC = () => {
  const { ageGroup, showToast } = useAppContext();
  const { t, language } = useTranslation();
  
  const [name, setName] = useState('');
  const [mood, setMood] = useState('');
  const [rapLyrics, setRapLyrics] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const nextNoteTimeRef = useRef(0);
  const timerIDRef = useRef<number | null>(null);
  const beatCountRef = useRef(0);
  const vocalSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const screenTitle = t(`home.age_${ageGroup}.rap_battle_title`);

  useEffect(() => {
      return () => stopPlayback();
  }, []);

  const stopPlayback = () => {
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
      if (vocalSourceRef.current) {
          try { vocalSourceRef.current.stop(); } catch(e) {}
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
          audioContextRef.current = null;
      }
  };

  const generateRap = async () => {
    if (!name.trim() || !mood.trim()) return;

    setIsLoading(true);
    setAudioData(null);
    stopPlayback();

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

        // 1. Generate Lyrics
        const prompt = `You are a cool, rhythmic rapper. Write a 4-line rap song about a kid named ${name} who is feeling ${mood}. 
        IMPORTANT: The lyrics must fit a standard 4/4 beat at 90 BPM. Keep the lines roughly the same length.
        Do not use bad words. ${languageInstruction} Output ONLY the lyrics.`;

        const textResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 1.0 }
        });

        const lyrics = textResponse.text.trim();
        setRapLyrics(lyrics);

        // 2. Generate Vocal Audio (Male Voice - Fenrir)
        const audioResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `(Rapping energetically over a beat) Yo, check it! ${lyrics}` }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Male voice for "Real Rap" feel
                  },
              },
            },
          });

        const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            setAudioData(base64Audio);
        } else {
            throw new Error("No audio returned");
        }

    } catch (error) {
        console.error("Rap error:", error);
        showToast("Mic check failed! Try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const playRapWithBeat = async () => {
      if (!audioData) return;
      if (isPlaying) {
          stopPlayback();
          return;
      }

      setIsPlaying(true);
      isPlayingRef.current = true;
      beatCountRef.current = 0;

      // Init Audio Context
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
      const ctx = audioContextRef.current!;
      
      const drumMachine = createDrumMachine(ctx);
      const tempo = 90;
      const secondsPerBeat = 60.0 / tempo;
      const lookahead = 25.0; // ms
      const scheduleAheadTime = 0.1; // s

      nextNoteTimeRef.current = ctx.currentTime + 0.1;

      // Decode Vocal
      const vocalBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
      
      // Scheduler for the beat
      const scheduleNote = (beatNumber: number, time: number) => {
          // Classic "Boom Bap" Hip Hop Pattern with Bass
          // 16th notes grid (0 to 15)

          // Hi-Hats: Every 8th note (0, 2, 4, 6...)
          if (beatNumber % 2 === 0) {
             // Open hat on the 'and' of 4? maybe just steady closed hats for flow
             drumMachine.playHiHat(time, beatNumber === 14); // Open hat at the end of the bar
          }

          // Kick: Heavy on 1, Syncopated on 11 (beat 3.75) or 10 (beat 3.5)
          // Beat 0 (1.0), Beat 6 (2.5), Beat 10 (3.5)
          if (beatNumber === 0 || beatNumber === 10) {
              drumMachine.playKick(time);
          }
          if (beatNumber === 16) { // Start of next bar logic
             drumMachine.playKick(time);
          }

          // Snare: Strictly on 4 and 12 (Beats 2 and 4)
          if (beatNumber === 4 || beatNumber === 12) {
              drumMachine.playSnare(time);
          }

          // Bass Line: Simple Root-Fifth movement
          // C2 (approx 65.41 Hz) -> G1 (approx 49.00 Hz)
          // Play bass on Beat 1 and Beat 3 (with syncopation)
          if (beatNumber === 0) {
              drumMachine.playBass(time, 65.41); // Root
          }
          if (beatNumber === 3) {
              drumMachine.playBass(time, 65.41); // Short syncopated stab
          }
          if (beatNumber === 8) {
              drumMachine.playBass(time, 49.00); // Fifth (lower)
          }
           if (beatNumber === 11) {
              drumMachine.playBass(time, 49.00); 
          }
      };

      const scheduler = () => {
        if (!isPlayingRef.current) return;

        while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
            scheduleNote(beatCountRef.current % 16, nextNoteTimeRef.current); // 16th note grid
            nextNoteTimeRef.current += 0.25 * secondsPerBeat; // Advance by 16th note
            beatCountRef.current++;
        }
        timerIDRef.current = window.setTimeout(scheduler, lookahead);
      };

      // Start the beat
      scheduler();

      // Start the Vocal after 1 bar (4 beats) intro
      // 4 beats * secondsPerBeat
      const vocalStartTime = ctx.currentTime + (secondsPerBeat * 4);
      const source = ctx.createBufferSource();
      source.buffer = vocalBuffer;
      source.connect(ctx.destination);
      source.start(vocalStartTime);
      vocalSourceRef.current = source;

      // When vocals end, stop the beat after 2 seconds
      source.onended = () => {
          setTimeout(() => {
              stopPlayback();
          }, 2000);
      };
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
                        {/* Custom Player Button */}
                         <button
                            onClick={playRapWithBeat}
                            disabled={!audioData}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-fuchsia-600 hover:bg-fuchsia-700'}`}
                        >
                            <span className="text-2xl">{isPlaying ? '⏹️' : '▶️'}</span>
                            {isPlaying ? "Stop the Beat" : "Play Full Rap Song! 🎵"}
                        </button>
                        
                        {!audioData && <p className="text-xs text-fuchsia-500 animate-pulse">Loading audio...</p>}

                        <button
                            onClick={() => { setRapLyrics(''); setName(''); setMood(''); setAudioData(null); stopPlayback(); }}
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
