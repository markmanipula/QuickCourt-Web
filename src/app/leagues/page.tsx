'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ENDPOINTS } from '@/lib/api';
import { Users, Trophy } from 'lucide-react';

const SPORT_EMOJIS: Record<string, string> = {
  volleyball: '🏐', 'beach volleyball': '🏖️', basketball: '🏀',
  badminton: '🏸', gym: '💪', softball: '🥎', golf: '⛳', pickleball: '🏓', other: '🎯',
};

function getSportEmoji(sport: string) {
  return SPORT_EMOJIS[sport?.toLowerCase()] ?? '🏆';
}

const STATUS_STYLES: Record<string, string> = {
  registration: 'bg-green-100 text-green-700',
  active: 'bg-blue-100 text-blue-700',
  playoffs: 'bg-purple-100 text-purple-700',
  completed: 'bg-gray-100 text-gray-500',
};

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(ENDPOINTS.LEAGUES)
      .then(r => r.json())
      .then(d => setLeagues(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leagues</h1>
        <p className="text-gray-500">Join a competitive league and track your standings</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 h-44 animate-pulse" />
          ))}
        </div>
      ) : leagues.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🏆</p>
          <p className="font-medium">No leagues yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leagues.map((league: any) => (
            <Link key={league._id} href={`/leagues/${league._id}`}>
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{getSportEmoji(league.sport)}</div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${STATUS_STYLES[league.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {league.status ?? 'registration'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{league.name}</h3>
                <p className="text-xs text-gray-500 mb-3 capitalize">{league.sport}</p>
                <div className="flex flex-col gap-1.5 mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Users size={12} />
                    <span>{league.maxTeams ? `Up to ${league.maxTeams} teams` : 'Open registration'}</span>
                  </div>
                  {(league.level || league.leagueType) && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Trophy size={12} />
                      <span>{[league.level, league.leagueType].filter(Boolean).join(' · ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
