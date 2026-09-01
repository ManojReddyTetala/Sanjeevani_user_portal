import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface PhcVoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (action: { type: string; payload?: any }) => void;
  facilityName: string;
}

export const PhcVoiceAssistant: React.FC<PhcVoiceAssistantProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
  facilityName
}) => {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [systemResponse, setSystemResponse] = useState('');
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState(true);
  const [stepState, setStepState] = useState<'idle' | 'awaiting_count' | 'confirming'>('idle');
  const [pendingAction, setPendingAction] = useState<any>(null);

  // Supported Speech Recognition language codes
  const getRecognitionLangCode = (lang: string) => {
    switch (lang) {
      case 'hi': return 'hi-IN';
      case 'te': return 'te-IN';
      case 'ta': return 'ta-IN';
      case 'kn': return 'kn-IN';
      case 'ml': return 'ml-IN';
      case 'mr': return 'mr-IN';
      case 'bn': return 'bn-IN';
      case 'gu': return 'gu-IN';
      case 'pa': return 'pa-IN';
      default: return 'en-IN';
    }
  };

  const speakText = (text: string) => {
    if (!speechSynthesisActive || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getRecognitionLangCode(language);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Text-to-speech error:', e);
    }
  };

  const handleStartListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSystemResponse('Speech recognition is not supported in this browser. Please type or use touch controls.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = getRecognitionLangCode(language);
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('Listening...');
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(spoken);
        processSpokenInput(spoken);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setTranscript('');
        setSystemResponse('Could not hear clearly. Please tap the microphone and speak again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setIsListening(false);
    }
  };

  const processSpokenInput = (input: string) => {
    const clean = input.toLowerCase().trim();

    // Check if confirming pending action
    if (stepState === 'confirming') {
      if (clean.includes('yes') || clean.includes('save') || clean.includes('ha') || clean.includes('sari') || clean.includes('avunu')) {
        if (pendingAction) {
          onExecuteCommand(pendingAction);
          const reply = 'Saved successfully.';
          setSystemResponse(reply);
          speakText(reply);
        }
        setStepState('idle');
        setPendingAction(null);
        return;
      } else {
        const reply = 'Update cancelled.';
        setSystemResponse(reply);
        speakText(reply);
        setStepState('idle');
        setPendingAction(null);
        return;
      }
    }

    // Number extraction for steppers
    const matchNumber = clean.match(/\d+/);

    // Bed updates
    if (clean.includes('bed') || clean.includes('bist') || clean.includes('paduk') || clean.includes('mancham')) {
      if (matchNumber) {
        const num = parseInt(matchNumber[0]);
        setPendingAction({ type: 'UPDATE_BEDS', payload: { available_beds: num } });
        setStepState('confirming');
        const reply = `${num} available beds requested. Say YES or tap Confirm to save.`;
        setSystemResponse(reply);
        speakText(reply);
      } else {
        setStepState('awaiting_count');
        const reply = 'How many beds are available at the facility?';
        setSystemResponse(reply);
        speakText(reply);
      }
      return;
    }

    // Queue updates
    if (clean.includes('queue') || clean.includes('line') || clean.includes('katar') || clean.includes('opd')) {
      if (matchNumber) {
        const num = parseInt(matchNumber[0]);
        setPendingAction({ type: 'UPDATE_QUEUE', payload: { count: num } });
        setStepState('confirming');
        const reply = `OPD queue count set to ${num} patients. Say YES or tap Confirm to save.`;
        setSystemResponse(reply);
        speakText(reply);
      } else {
        const reply = 'What is the current patient count in the OPD queue?';
        setSystemResponse(reply);
        speakText(reply);
      }
      return;
    }

    // Doctor & Staff status query
    if (clean.includes('doctor') || clean.includes('staff') || clean.includes('nurse') || clean.includes('duty')) {
      onExecuteCommand({ type: 'NAVIGATE', payload: 'staff' });
      const reply = 'Opening Staff on Duty view. You can see all active physicians and nurses.';
      setSystemResponse(reply);
      speakText(reply);
      return;
    }

    // Medicine check
    if (clean.includes('medicine') || clean.includes('dawa') || clean.includes('tablet') || clean.includes('stock')) {
      onExecuteCommand({ type: 'NAVIGATE', payload: 'medicines' });
      const reply = 'Opening Medicines & Supplies inventory.';
      setSystemResponse(reply);
      speakText(reply);
      return;
    }

    // Diagnostics / Tests
    if (clean.includes('test') || clean.includes('x-ray') || clean.includes('ecg') || clean.includes('blood')) {
      onExecuteCommand({ type: 'NAVIGATE', payload: 'diagnostics' });
      const reply = 'Opening Diagnostic Tests management.';
      setSystemResponse(reply);
      speakText(reply);
      return;
    }

    // Patient QR scan
    if (clean.includes('patient') || clean.includes('qr') || clean.includes('record') || clean.includes('scan')) {
      onExecuteCommand({ type: 'NAVIGATE', payload: 'patient' });
      const reply = 'Opening Patient QR scanner and Medical Identity access.';
      setSystemResponse(reply);
      speakText(reply);
      return;
    }

    // Referral
    if (clean.includes('refer') || clean.includes('transfer') || clean.includes('hospital')) {
      onExecuteCommand({ type: 'NAVIGATE', payload: 'referrals' });
      const reply = 'Opening Doctor-to-Doctor Digital Referral section.';
      setSystemResponse(reply);
      speakText(reply);
      return;
    }

    // Fallback response with speech
    const reply = `I heard: "${input}". You can say "Update beds to 12", "Check staff on duty", "Check medicines", or "Update queue to 15".`;
    setSystemResponse(reply);
    speakText(reply);
  };

  useEffect(() => {
    if (isOpen) {
      setSystemResponse(`Namaste! PHC Voice Assistant ready for ${facilityName}. Tap microphone or speak your command.`);
      speakText(`PHC Voice Assistant ready for ${facilityName}. How can I assist you?`);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white border-2 border-[#00695C] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="PHC Voice Assistant"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-[#E0F2F1] text-[#00695C] flex items-center justify-center border border-[#00695C]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-[#263238]">PHC Voice Assistant</h3>
              <p className="text-xs text-[#607D8B] font-medium">{facilityName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setSpeechSynthesisActive(!speechSynthesisActive)}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center space-x-1 ${
                speechSynthesisActive ? 'bg-[#E0F2F1] text-[#00695C] border-[#00695C]/30' : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title={speechSynthesisActive ? 'Audio Response Enabled' : 'Audio Muted'}
              aria-label={speechSynthesisActive ? 'Audio Response Enabled' : 'Audio Muted'}
            >
              {speechSynthesisActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              aria-label="Close Voice Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central Audio / Wave State */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
          <button
            type="button"
            onClick={handleStartListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${
              isListening
                ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-200 scale-105'
                : 'bg-[#00695C] text-white hover:bg-[#004D40] hover:scale-105 active:scale-95 ring-8 ring-[#E0F2F1]'
            }`}
            aria-label={isListening ? 'Listening. Tap to stop' : 'Tap to speak'}
          >
            {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </button>

          <div className="space-y-1">
            <span className="font-extrabold text-sm text-[#263238] block">
              {isListening ? '🎙️ Listening... Speak now' : '👉 Tap Microphone to Speak'}
            </span>
            {transcript && (
              <p className="text-xs bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-800 font-semibold max-w-xs">
                "{transcript}"
              </p>
            )}
          </div>
        </div>

        {/* System Response Box */}
        {systemResponse && (
          <div
            className="bg-[#F0FDF4] border-2 border-emerald-400/50 p-4 rounded-2xl text-xs text-emerald-950 font-bold space-y-2 shadow-sm"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{systemResponse}</p>
            </div>

            {/* Quick Confirmation Button if action pending */}
            {pendingAction && (
              <div className="flex items-center space-x-2 pt-2 border-t border-emerald-200">
                <button
                  type="button"
                  onClick={() => {
                    onExecuteCommand(pendingAction);
                    setSystemResponse('Saved successfully!');
                    speakText('Saved successfully!');
                    setPendingAction(null);
                    setStepState('idle');
                  }}
                  className="flex-1 py-2 bg-[#00695C] text-white rounded-xl text-xs font-black shadow hover:bg-[#004D40]"
                >
                  ✓ CONFIRM & SAVE
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingAction(null);
                    setStepState('idle');
                    setSystemResponse('Cancelled.');
                  }}
                  className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Voice Suggestions */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <span className="text-[11px] font-bold text-[#607D8B] uppercase tracking-wider block">
            💡 Sample Voice Commands:
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => processSpokenInput('Update beds to 12')}
              className="p-2 bg-slate-50 hover:bg-[#E0F2F1] text-left rounded-xl border border-slate-200 text-[#263238] transition-colors"
            >
              🛏️ "Update beds to 12"
            </button>
            <button
              type="button"
              onClick={() => processSpokenInput('Check doctors on duty')}
              className="p-2 bg-slate-50 hover:bg-[#E0F2F1] text-left rounded-xl border border-slate-200 text-[#263238] transition-colors"
            >
              👨‍⚕️ "Doctors on duty"
            </button>
            <button
              type="button"
              onClick={() => processSpokenInput('Check medicines stock')}
              className="p-2 bg-slate-50 hover:bg-[#E0F2F1] text-left rounded-xl border border-slate-200 text-[#263238] transition-colors"
            >
              💊 "Check medicines"
            </button>
            <button
              type="button"
              onClick={() => processSpokenInput('Update queue count to 8')}
              className="p-2 bg-slate-50 hover:bg-[#E0F2F1] text-left rounded-xl border border-slate-200 text-[#263238] transition-colors"
            >
              👥 "Update queue to 8"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
