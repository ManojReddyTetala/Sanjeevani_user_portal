import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, Send, X, Volume2, VolumeX, Sparkles, AlertTriangle } from 'lucide-react';
import { sendAiChatMessage } from '../api';
import { useLanguage } from '../context/LanguageContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isEmergency?: boolean;
  quickActions?: string[];
  matchedFacilities?: any[];
  timestamp: string;
}

interface AiChatbotWidgetProps {
  onExecuteAction?: (action: any) => void;
}

export const AiChatbotWidget: React.FC<AiChatbotWidgetProps> = ({ onExecuteAction }) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'Namaste! 👋 I am your Sanjeevani AI Healthcare Assistant. I can help you find nearby ICU beds, specialist doctors, diagnostic scans, or answer healthcare questions. How may I assist you today?',
      quickActions: ['Find Nearby ICU Beds', 'Search MRI Diagnostics', 'Cardiologist Near Me', 'Emergency Services'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTtsActive, setIsTtsActive] = useState(true);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is unsupported in this browser. Please type your message.');
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
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const speakTts = (text: string) => {
    if (!isTtsActive || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const resp = await sendAiChatMessage(query, language);
      const lowerQ = query.toLowerCase();
      const isEmergencyQuery = lowerQ.includes('emergency') || lowerQ.includes('chest pain') || lowerQ.includes('stroke') || lowerQ.includes('ambulance') || lowerQ.includes('bleeding') || lowerQ.includes('unconscious');
      const isEmergency = resp.is_emergency || isEmergencyQuery || resp.reply.toLowerCase().includes('emergency') || resp.reply.toLowerCase().includes('108');

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: resp.reply,
        isEmergency,
        quickActions: resp.quick_actions,
        matchedFacilities: resp.matched_hospitals,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakTts(resp.reply);

      const isHealthTrackQuery = lowerQ.includes('next') || lowerQ.includes('track') || lowerQ.includes('doing') || lowerQ.includes('waiting') || lowerQ.includes('progress') || lowerQ.includes('blocking') || lowerQ.includes('journey');

      if (isHealthTrackQuery && onExecuteAction) {
        onExecuteAction({ type: 'NAVIGATE', view: 'health_track' });
      } else if (isEmergencyQuery && onExecuteAction) {
        onExecuteAction({ type: 'NAVIGATE', view: 'emergency' });
      } else if (resp.action && onExecuteAction) {
        onExecuteAction(resp.action);
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'I am experiencing connectivity issues reaching the healthcare server. If this is an emergency, please call 108 or 102 immediately.',
        isEmergency: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-[#00695C] hover:bg-[#004D40] text-white p-4 rounded-full shadow-2xl flex items-center space-x-2 border-2 border-white transition-transform active:scale-95"
          title="AI Healthcare Assistant"
        >
          <Bot className="w-6 h-6 text-white" />
          <span className="font-extrabold text-xs tracking-wider pr-1 hidden sm:inline">AI Health Assistant</span>
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
        </button>
      )}

      {/* Main Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-md bg-white border border-slate-300 rounded-3xl shadow-2xl flex flex-col overflow-hidden font-sans h-[580px] my-auto">
          {/* Header */}
          <div className="bg-[#00695C] text-white p-4 flex items-center justify-between relative shadow-sm">
            <div className="tricolour-strip absolute top-0 left-0 right-0" />
            <div className="flex items-center space-x-3 pt-1">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center space-x-1.5">
                  <span>SIH AI Health Assistant</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h3>
                <span className="text-[10px] text-teal-100 font-medium block">
                  Official Public Triage & EHR Guidance
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsTtsActive(!isTtsActive)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title={isTtsActive ? 'Mute Speech Output' : 'Enable Speech Output'}
              >
                {isTtsActive ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4 text-slate-300" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 bg-[#F7FAF9] overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-2 shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-[#00695C] text-white rounded-br-none'
                      : m.isEmergency
                      ? 'bg-red-50 text-red-900 border border-red-300 rounded-bl-none'
                      : 'bg-white text-[#263238] border border-slate-200 rounded-bl-none'
                  }`}
                >
                  {m.isEmergency && (
                    <div className="flex items-center space-x-1 text-[#C62828] font-black text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Medical Emergency Response</span>
                    </div>
                  )}

                  <p className="leading-relaxed whitespace-pre-line font-medium">{m.text}</p>

                  <span className={`text-[9px] block text-right font-mono ${m.sender === 'user' ? 'text-teal-200' : 'text-[#607D8B]'}`}>
                    {m.timestamp}
                  </span>
                </div>

                {/* Quick Actions Buttons */}
                {m.quickActions && m.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {m.quickActions.map((qa, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(qa)}
                        className="px-2.5 py-1 bg-white hover:bg-[#E0F2F1] text-[#00695C] border border-[#00695C]/30 rounded-lg text-[11px] font-bold shadow-sm transition-all"
                      >
                        ⚡ {qa}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs font-bold text-[#00695C] bg-white p-3 rounded-2xl border border-slate-200 max-w-[200px]">
                <div className="w-2 h-2 bg-[#00695C] rounded-full animate-ping" />
                <span>AI analyzing health inquiry...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <button
                type="button"
                onClick={toggleVoiceRecognition}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isListening ? 'bg-red-50 text-red-600 border-red-300 animate-pulse' : 'bg-slate-50 text-[#607D8B] hover:text-[#00695C] border-slate-300'
                }`}
                title="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about doctors, ICU beds, MRI scans..."
                className="flex-1 bg-slate-50 border border-slate-300 focus:border-[#00695C] rounded-xl py-2.5 px-3 text-xs font-bold text-[#263238] placeholder-slate-400 focus:outline-none"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="p-2.5 bg-[#00695C] hover:bg-[#004D40] text-white rounded-xl shadow transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
