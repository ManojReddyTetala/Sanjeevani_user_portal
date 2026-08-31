import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Volume2, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceSearch: (transcript: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onVoiceSearch
}) => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  if (!isOpen) return null;

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition unsupported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        bn: 'bn-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        mr: 'mr-IN',
        gu: 'gu-IN',
        kn: 'kn-IN'
      };
      recognition.lang = langMap[language] || 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((res: any) => res[0])
          .map((res) => res.transcript)
          .join('');
        setTranscript(text);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleApply = () => {
    if (transcript) {
      onVoiceSearch(transcript);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 text-center border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center">
          <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Voice Command</span>
          </span>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4">
          <button
            onClick={startListening}
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all shadow-lg ${
              isListening ? 'bg-red-600 text-white animate-ping' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <span className="text-xs font-bold text-slate-600 block mt-3">
            {isListening ? 'Listening... Speak now' : 'Tap microphone to speak'}
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs min-h-[60px] font-semibold text-slate-800 flex items-center justify-center">
          {transcript || 'e.g. "Find ICU beds near me" or "छाती में दर्द है"'}
        </div>

        <button
          onClick={handleApply}
          disabled={!transcript}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
        >
          Search with Voice
        </button>
      </div>
    </div>
  );
};
