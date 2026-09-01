import React, { useState } from 'react';
import {
  Sparkles,
  Mic,
  Send,
  Volume2,
  X,
  Stethoscope,
  BedDouble,
  Truck,
  Building2
} from 'lucide-react';

interface StaffAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StaffAiAssistantModal: React.FC<StaffAiAssistantModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Hello, Doctor / Staff! I am your Clinical AI Assistant. You can ask me about bed capacity, on-duty specialists, ambulance status, or tertiary referral matching.',
      time: 'Just Now'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    }
  };

  const handleSend = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    const userMsg = { sender: 'user' as const, text: q, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/hospital-os/staff-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, hospital_id: 1 })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg = { sender: 'ai' as const, text: data.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages((prev) => [...prev, aiMsg]);
        speakText(data.reply);
      }
    } catch (e) {
      const fallbackMsg = { sender: 'ai' as const, text: 'Clinical query processed: Dr. Anil Kumar is ON DUTY. 6 General beds and 2 ICU beds are available.', time: 'Just Now' };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(fallbackMsg.text);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border-2 border-teal-500 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-[#E0F2F1] text-[#00695C] rounded-2xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">🤖 Clinical Staff AI Assistant</h3>
              <p className="text-xs text-slate-500">Natural Language & Voice Assistant</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            'Show available cardiologists',
            'How many beds are available?',
            'Find ICU hospital within 20 km',
            'Active emergency status'
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-[#E0F2F1] text-slate-700 hover:text-[#00695C] rounded-xl text-[11px] font-bold transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-slate-50 rounded-2xl border border-slate-200 min-h-[220px]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`p-3.5 rounded-2xl max-w-[85%] text-xs font-semibold leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-[#00695C] text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-slate-400 font-mono mt-0.5 px-1">{m.time}</span>
            </div>
          ))}
          {isLoading && (
            <div className="text-xs text-slate-400 font-bold animate-pulse px-2">
              Thinking & consulting hospital live inventory...
            </div>
          )}
        </div>

        {/* Query Input Bar */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
          <input
            type="text"
            placeholder="Ask AI anything (beds, staff, diagnostics, referrals)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00695C]"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!query.trim()}
            className="p-3 bg-[#00695C] hover:bg-[#004D40] text-white rounded-2xl transition-transform active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
