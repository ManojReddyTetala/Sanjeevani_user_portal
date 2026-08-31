import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export interface SearchResultItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  type: string;
  badge?: string;
  action_data?: any;
}

interface SmartModuleSearchProps {
  moduleKey: 'healthcare' | 'doctors' | 'diagnostics' | 'records' | 'referrals' | 'statistics';
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  onSelectResult: (item: SearchResultItem) => void;
  onClear: () => void;
  localDataset?: any[]; // Fallback offline search dataset
}

export const SmartModuleSearch: React.FC<SmartModuleSearchProps> = ({
  moduleKey,
  placeholder,
  value,
  onChange,
  onSelectResult,
  onClear,
  localDataset
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`sih_history_${moduleKey}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced Search Request (300ms)
  useEffect(() => {
    const cleanQuery = value.trim();
    if (!cleanQuery) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/${moduleKey}?q=${encodeURIComponent(cleanQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        } else {
          fallbackLocalSearch(cleanQuery);
        }
      } catch (e) {
        fallbackLocalSearch(cleanQuery);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, moduleKey]);

  // Fallback Local Search if Offline
  const fallbackLocalSearch = (q: string) => {
    const cleanQ = q.toLowerCase();
    if (!localDataset || localDataset.length === 0) {
      setResults([]);
      return;
    }

    const matched: SearchResultItem[] = localDataset
      .filter((item) => {
        const name = (item.name || item.title || '').toLowerCase();
        const spec = (item.specialty || item.category || '').toLowerCase();
        const city = (item.city || item.hospital_name || item.diagnosis || '').toLowerCase();
        return name.includes(cleanQ) || spec.includes(cleanQ) || city.includes(cleanQ);
      })
      .map((item, idx) => ({
        id: `LOCAL-${idx}`,
        category: (item.facility_type || item.specialty || item.category || 'RESULTS').toUpperCase(),
        title: item.name || item.title || 'Result',
        subtitle: item.address || item.hospital_name || item.diagnosis || item.city || 'Healthcare item',
        type: 'local',
        badge: 'DEMO',
        action_data: item
      }));

    setResults(matched);
  };

  // Close dropdown on Outside Click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save term to local search history
  const saveSearchTerm = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...searchHistory.filter((h) => h !== trimmed)].slice(0, 5);
    setSearchHistory(updated);
    try {
      localStorage.setItem(`sih_history_${moduleKey}`, JSON.stringify(updated));
    } catch (e) {}
  };

  // Clear history
  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(`sih_history_${moduleKey}`);
    } catch (e) {}
  };

  // Handle Selection
  const handleSelect = (item: SearchResultItem) => {
    saveSearchTerm(value || item.title);
    setIsOpen(false);
    onSelectResult(item);
  };

  // Desktop Keyboard Navigation (Up, Down, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Group Results by Category Header
  const groupedResults = results.reduce((acc: { [key: string]: SearchResultItem[] }, item) => {
    const cat = item.category || 'MATCHING RESULTS';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Highlight Matching Query Text
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-amber-200 text-[#263238] font-black rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div ref={wrapperRef} className="relative w-full font-sans z-[9999]">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-[#00695C] absolute left-3.5 top-3.5 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-300 focus:border-[#00695C] focus:ring-2 focus:ring-[#00695C]/20 rounded-2xl py-3 pl-10 pr-10 text-xs font-bold text-[#263238] placeholder-slate-400 focus:outline-none transition-all shadow-sm"
        />

        {value ? (
          <button
            type="button"
            onClick={() => {
              onClear();
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Dropdown Suggestions Panel - Elevated Z-Index (z-[9999]) to Prevent Parent Clipping */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-[#00695C]/30 rounded-2xl shadow-2xl drop-shadow-2xl overflow-hidden max-h-96 overflow-y-auto scrollbar-thin z-[9999] ring-4 ring-black/5">
          {/* Active Filtering Tag if search is active */}
          {value && (
            <div className="bg-[#E0F2F1] px-4 py-2 border-b border-[#00695C]/20 flex items-center justify-between text-[11px] font-bold text-[#00695C]">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00695C]" />
                <span>Live Search: "{value}"</span>
              </span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#00695C]/30 uppercase font-mono">
                {results.length} Found
              </span>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-4 text-center text-xs font-bold text-[#607D8B] flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-[#00695C] border-t-transparent rounded-full animate-spin" />
              <span>Searching dataset...</span>
            </div>
          )}

          {/* Recent Searches (when input is empty) */}
          {!value && searchHistory.length > 0 && (
            <div className="p-3 border-b border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#607D8B] uppercase tracking-wider">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-[#00695C]" />
                  <span>Recent Searches</span>
                </span>
                <button onClick={clearHistory} className="text-[#C62828] hover:underline text-[9px] font-extrabold">
                  CLEAR HISTORY
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {searchHistory.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onChange(term);
                      setIsOpen(true);
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-[#E0F2F1] text-[#263238] hover:text-[#00695C] rounded-lg text-xs font-bold transition-colors flex items-center space-x-1"
                  >
                    <span>{term}</span>
                    <ArrowRight className="w-3 h-3 opacity-40" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grouped Results Display */}
          {!isLoading && value && results.length > 0 && (
            <div className="divide-y divide-slate-100">
              {Object.keys(groupedResults).map((category, catIdx) => (
                <div key={catIdx} className="p-2 space-y-1">
                  <div className="px-3 py-1 text-[10px] font-black text-[#00695C] bg-[#F7FAF9] rounded-lg uppercase tracking-wider flex items-center justify-between">
                    <span>{category}</span>
                    <span className="text-[9px] text-[#607D8B] font-mono">DEMO</span>
                  </div>

                  {groupedResults[category].map((item) => {
                    const globalIdx = results.findIndex((r) => r.id === item.id);
                    const isSelected = globalIdx === selectedIndex;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`p-3 rounded-xl cursor-pointer transition-all flex items-start justify-between ${
                          isSelected ? 'bg-[#E0F2F1] text-[#00695C]' : 'hover:bg-slate-50 text-[#263238]'
                        }`}
                      >
                        <div>
                          <h5 className="font-extrabold text-xs leading-tight">
                            {renderHighlightedText(item.title, value)}
                          </h5>
                          <p className="text-[11px] text-[#607D8B] mt-0.5">{item.subtitle}</p>
                        </div>

                        {item.badge && (
                          <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-50 text-[#2E7D32] border border-emerald-300 rounded-full shrink-0 ml-2">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && value && results.length === 0 && (
            <div className="p-6 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-[#607D8B] mx-auto opacity-50" />
              <h5 className="font-black text-xs text-[#263238]">No matching results found</h5>
              <p className="text-[11px] text-[#607D8B] max-w-xs mx-auto">
                No matching items found for <span className="font-bold text-[#00695C]">"{value}"</span>. Try searching by specialty, city, or record name.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
