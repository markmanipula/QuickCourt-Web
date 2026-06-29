'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ENDPOINTS } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getSportEmoji, formatDateShort } from '@/lib/utils';
import { MapPin, Users, Calendar, Search, Plus } from 'lucide-react';

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('');
  const [city, setCity] = useState('');
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    fetch(ENDPOINTS.EVENTS)
      .then(r => r.json())
      .then(d => setEvents(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sports = [...new Set(events.map((e: any) => e.sport).filter(Boolean))].sort();
  const cities = [...new Set(events.map((e: any) => e.city).filter(Boolean))].sort();
  const now = new Date();

  const filtered = events.filter((e: any) => {
    const isPast = e.date && new Date(e.date) < now;
    if (!showPast && isPast) return false;
    if (showPast && !isPast) return false;
    if (sport && e.sport?.toLowerCase() !== sport.toLowerCase()) return false;
    if (city && e.city !== city) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!e.title?.toLowerCase().includes(q) && !e.location?.toLowerCase().includes(q) && !e.city?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Events</h1>
          <p className="text-gray-500">Find and join sports events near you</p>
        </div>
        {user && (
          <Link href="/events/create"
            className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors">
            <Plus size={18} /> Create Event
          </Link>
        )}
      </div>

      {/* Upcoming / Past toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-5">
        <button onClick={() => setShowPast(false)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${!showPast ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          Upcoming
        </button>
        <button onClick={() => setShowPast(true)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${showPast ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          Past
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search events or locations…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={sport} onChange={e => setSport(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">All sports</option>
          {sports.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {cities.length > 0 && (
          <select value={city} onChange={e => setCity(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 h-48 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-medium">No events found</p>
          {user && <Link href="/events/create" className="text-blue-600 text-sm mt-2 inline-block hover:underline">Create one →</Link>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((event: any) => (
            <Link key={event._id} href={`/events/${event._id}`}>
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{getSportEmoji(event.sport)}</div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      event.status === 'open' ? 'bg-green-100 text-green-700' :
                      event.status === 'full' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'}`}>
                      {event.status ?? 'open'}
                    </span>
                    {event.isPrivate && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Private</span>}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-0.5 line-clamp-1">{event.title}</h3>
                <p className="text-xs text-gray-500 mb-3 capitalize">{event.sport}{event.skillLevel && event.skillLevel !== 'All Levels' ? ` · ${event.skillLevel}` : ''}</p>
                <div className="flex flex-col gap-1.5 mt-auto">
                  {event.date && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar size={12} /><span>{formatDateShort(event.date)}</span>
                    </div>
                  )}
                  {(event.city || event.location) && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin size={12} /><span className="line-clamp-1">{event.city ?? event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Users size={12} />
                    <span>{event.participants?.length ?? 0}{event.maxParticipants ? ` / ${event.maxParticipants}` : ''} players</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
