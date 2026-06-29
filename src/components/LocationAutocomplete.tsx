'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { ENDPOINTS } from '@/lib/api';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function LocationAutocomplete({ value, onChange, placeholder = 'Enter location…' }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (v: string) => {
    onChange(v);
    if (timer.current) clearTimeout(timer.current);
    if (v.length < 3) { setSuggestions([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(ENDPOINTS.PLACES_AUTOCOMPLETE(v));
        const d = await r.json();
        const results = (d.predictions ?? d.data ?? []).map((p: any) => p.description ?? p);
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch { setSuggestions([]); }
    }, 300);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <div className="relative">
      <div className="relative">
        <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => { onChange(s); setOpen(false); setSuggestions([]); }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
