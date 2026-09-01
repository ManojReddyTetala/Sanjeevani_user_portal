import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, Stethoscope, FileText, Sparkles, X, ChevronRight } from 'lucide-react';
import { fetchSearchSuggestions } from '../api';
import { useLanguage } from '../context/LanguageContext';

interface SearchAutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  onSelectSuggestion?: (suggestion: any) => void;
  placeholder?: string;
  lat?: number;
  lng?: number;
}

export const SearchAutocompleteInput: React.FC<SearchAutocompleteInputProps> = ({
  value,
  onChange,
  onSelectSuggestion,
  placeholder,
  lat,
  lng
}) => {
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activePlaceholder = placeholder || t('search_placeholder_global');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!value.trim() || value.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetchSearchSuggestions(value, lat, lng);
        setSuggestions(res.suggestions || []);
        setIsOpen(res.suggestions && res.suggestions.length > 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [value, lat, lng]);

  const getCategoryIcon = (category: string) => {
    if (category === 'Facility') return <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (category === 'Specialist Doctor') return <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />;
    if (category === 'Diagnostic Test') return <FileText className="w-4 h-4 text-blue-600 shrink-0" />;
    return <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />;
  };

  const getBadgeStyle = (category: string) => {
    if (category === 'Facility') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (category === 'Specialist Doctor') return 'bg-teal-50 text-teal-800 border-teal-200';
    if (category === 'Diagnostic Test') return 'bg-blue-50 text-blue-800 border-blue-200';
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={activePlaceholder}
          className="w-full pl-9 pr-8 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00695C] focus:border-[#00695C] bg-white text-[#263238] placeholder-slate-400"
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
            <span>Matching Healthcare Suggestions</span>
            {loading && <span className="text-emerald-600 animate-pulse">Searching...</span>}
          </div>

          {suggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (onSelectSuggestion) onSelectSuggestion(item);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                {getCategoryIcon(item.category)}
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-slate-800 truncate group-hover:text-[#00695C] transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate">
                    {item.subtitle}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${getBadgeStyle(item.category)}`}>
                  {item.category}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#00695C] transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
