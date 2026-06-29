'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ENDPOINTS } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getSportEmoji, formatDateShort } from '@/lib/utils';
import { ArrowLeft, MapPin, Users, Trophy, Loader2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'schedule' | 'standings' | 'playoffs';

export default function LeagueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [league, setLeague] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [playoffs, setPlayoffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(ENDPOINTS.LEAGUE_BY_ID(id)).then(r => r.json()).then(d => setLeague(d.data ?? d)),
      fetch(ENDPOINTS.LEAGUE_TEAMS(id)).then(r => r.json()).then(d => setTeams(d.data ?? [])),
      fetch(ENDPOINTS.LEAGUE_SCHEDULE(id)).then(r => r.json()).then(d => setSchedule(d.data ?? [])),
      fetch(ENDPOINTS.LEAGUE_PLAYOFFS(id)).then(r => r.json()).then(d => setPlayoffs(d.data ?? [])),
    ]).finally(() => setLoading(false));
  }, [id]);

  const myTeam = teams.find((t: any) => t.players?.some((p: any) => p.uid === user?.uid));

  const handleJoinTeam = async (teamId: string) => {
    if (!user) { toast.error('Please log in first'); return; }
    setJoining(teamId);
    try {
      const r = await fetch(ENDPOINTS.JOIN_LEAGUE_TEAM(id, teamId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, name: user.displayName ?? user.email }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      toast.success('Joined team!');
      const updated = await fetch(ENDPOINTS.LEAGUE_TEAMS(id)).then(r => r.json());
      setTeams(updated.data ?? []);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to join');
    } finally {
      setJoining(null);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!user) return;
    setJoining(teamId);
    try {
      const r = await fetch(ENDPOINTS.LEAVE_LEAGUE_TEAM(id, teamId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      toast.success('Left team');
      const updated = await fetch(ENDPOINTS.LEAGUE_TEAMS(id)).then(r => r.json());
      setTeams(updated.data ?? []);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to leave');
    } finally {
      setJoining(null);
    }
  };

  // Compute standings
  const standings = teams.map((t: any) => {
    const matches = schedule.filter((m: any) =>
      m.status === 'completed' && (m.homeTeamId === t._id || m.awayTeamId === t._id)
    );
    let pts = 0, w = 0, l = 0, d = 0, sf = 0, sa = 0;
    for (const m of matches) {
      const isHome = m.homeTeamId === t._id;
      const mySets = isHome ? m.homeScore : m.awayScore;
      const theirSets = isHome ? m.awayScore : m.homeScore;
      sf += mySets ?? 0; sa += theirSets ?? 0;
      if (m.winnerId === t._id) { pts += 3; w++; }
      else if (!m.winnerId) { pts += 1; d++; }
      else l++;
    }
    return { ...t, pts, w, l, d, sf, sa, gd: sf - sa };
  }).sort((a, b) => b.pts - a.pts || b.gd - a.gd);

  // Group schedule by round
  const rounds = schedule.reduce((acc: Record<number, any[]>, m: any) => {
    const r = m.round ?? 1;
    if (!acc[r]) acc[r] = [];
    acc[r].push(m);
    return acc;
  }, {});

  // Group playoffs by bracketType
  const bracketGroups = playoffs.reduce((acc: Record<string, any[]>, m: any) => {
    const key = m.bracketType ?? 'Bracket';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'standings', label: 'Standings' },
    { key: 'playoffs', label: 'Playoffs' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="animate-spin text-blue-500" size={32} />
    </div>
  );

  if (!league) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">
      <p className="text-4xl mb-3">😕</p>
      <p>League not found</p>
      <Link href="/leagues" className="text-blue-600 mt-4 inline-block">← Back to leagues</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/leagues" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm transition-colors">
          <ArrowLeft size={16} /> Back to leagues
        </Link>
        {league.hostUid === user?.uid && (
          <Link href={`/leagues/${id}/edit`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors">
            <Pencil size={15} /> Edit
          </Link>
        )}
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-5xl">{getSportEmoji(league.sport)}</div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{league.name}</h1>
            <p className="text-gray-500 capitalize text-sm">{league.sport}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                league.status === 'active' ? 'bg-blue-100 text-blue-700' :
                league.status === 'playoffs' ? 'bg-purple-100 text-purple-700' :
                league.status === 'completed' ? 'bg-gray-100 text-gray-500' :
                'bg-green-100 text-green-700'
              }`}>{league.status ?? 'registration'}</span>
              {league.level && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">{league.level}</span>}
              {league.leagueType && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">{league.leagueType}</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {league.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={14} className="text-blue-500 shrink-0" />
              <span>{league.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={14} className="text-blue-500 shrink-0" />
            <span>{teams.length}{league.maxTeams ? ` / ${league.maxTeams}` : ''} teams</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-4">
          {league.description && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{league.description}</p>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Teams ({teams.length})</h2>
            {teams.length === 0 ? (
              <p className="text-sm text-gray-400">No teams yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {teams.map((team: any) => {
                  const isMember = team.players?.some((p: any) => p.uid === user?.uid);
                  const isMyTeam = myTeam?._id === team._id;
                  return (
                    <div key={team._id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{team.name}</p>
                        <p className="text-xs text-gray-400">{team.players?.length ?? 0} players</p>
                      </div>
                      {league.status === 'registration' && (
                        isMyTeam ? (
                          <button
                            onClick={() => handleLeaveTeam(team._id)}
                            disabled={joining === team._id}
                            className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
                          >
                            {joining === team._id ? <Loader2 size={12} className="animate-spin" /> : 'Leave'}
                          </button>
                        ) : !myTeam ? (
                          <button
                            onClick={() => handleJoinTeam(team._id)}
                            disabled={joining === team._id}
                            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                          >
                            {joining === team._id ? <Loader2 size={12} className="animate-spin" /> : 'Join'}
                          </button>
                        ) : null
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {tab === 'schedule' && (
        <div className="flex flex-col gap-4">
          {Object.keys(rounds).length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">📅</p>
              <p>No schedule yet</p>
            </div>
          ) : Object.entries(rounds).map(([round, matches]) => (
            <div key={round} className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Round {round}</h3>
              <div className="flex flex-col gap-2">
                {(matches as any[]).map((m: any) => (
                  <div key={m._id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{m.homeTeamName} <span className="text-gray-400 font-normal">vs</span> {m.awayTeamName}</p>
                      {m.date && <p className="text-xs text-gray-400 mt-0.5">{formatDateShort(m.date)}</p>}
                    </div>
                    {m.status === 'completed' ? (
                      <span className="shrink-0 font-bold text-gray-900 ml-3">{m.homeScore} – {m.awayScore}</span>
                    ) : (
                      <span className="shrink-0 text-xs text-gray-400 ml-3">Scheduled</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Standings Tab */}
      {tab === 'standings' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {standings.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">🏆</p><p>No standings yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Team</th>
                  <th className="text-center px-3 py-3 font-semibold text-gray-600">W</th>
                  <th className="text-center px-3 py-3 font-semibold text-gray-600">D</th>
                  <th className="text-center px-3 py-3 font-semibold text-gray-600">L</th>
                  <th className="text-center px-3 py-3 font-semibold text-gray-600">GD</th>
                  <th className="text-center px-3 py-3 font-semibold text-blue-600">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((t: any, i: number) => (
                  <tr key={t._id} className={`border-b border-gray-50 last:border-0 ${myTeam?._id === t._id ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3 text-gray-400 font-medium">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                    <td className="px-3 py-3 text-center text-green-600">{t.w}</td>
                    <td className="px-3 py-3 text-center text-gray-400">{t.d}</td>
                    <td className="px-3 py-3 text-center text-red-500">{t.l}</td>
                    <td className="px-3 py-3 text-center text-gray-600">{t.gd > 0 ? '+' : ''}{t.gd}</td>
                    <td className="px-3 py-3 text-center font-bold text-blue-600">{t.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Playoffs Tab */}
      {tab === 'playoffs' && (
        <div className="flex flex-col gap-6">
          {Object.keys(bracketGroups).length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
              <p className="text-3xl mb-2"><Trophy size={32} className="mx-auto text-gray-300" /></p>
              <p>Playoffs not started yet</p>
            </div>
          ) : Object.entries(bracketGroups).map(([bracketName, matches]) => {
            const rounds = [...new Set((matches as any[]).map(m => m.round))].sort((a, b) => a - b);
            return (
              <div key={bracketName}>
                {Object.keys(bracketGroups).length > 1 && (
                  <h3 className="font-semibold text-gray-700 mb-3 capitalize">{bracketName} Bracket</h3>
                )}
                <div className="flex flex-col gap-4">
                  {rounds.map(round => {
                    const roundMatches = (matches as any[]).filter(m => m.round === round);
                    const totalRounds = (matches as any[])[0]?.totalRounds ?? 1;
                    const label = round === totalRounds ? 'Final' : round === totalRounds - 1 ? 'Semi-Finals' : `Round ${round}`;
                    return (
                      <div key={round} className="bg-white rounded-2xl border border-gray-200 p-5">
                        <h4 className="font-semibold text-gray-600 text-sm mb-3">{label}</h4>
                        <div className="flex flex-col gap-2">
                          {roundMatches.map((m: any) => (
                            <div key={m._id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                              <div className="flex-1">
                                <p className={`font-medium ${m.winnerId === m.homeTeamId ? 'text-blue-600' : 'text-gray-900'}`}>{m.homeTeamName}</p>
                                <p className="text-xs text-gray-400">vs</p>
                                <p className={`font-medium ${m.winnerId === m.awayTeamId ? 'text-blue-600' : 'text-gray-900'}`}>{m.awayTeamName}</p>
                              </div>
                              {m.status === 'completed' ? (
                                <div className="text-right shrink-0 ml-3">
                                  <p className="font-bold text-gray-900">{m.homeScore} – {m.awayScore}</p>
                                  <p className="text-xs text-gray-400">Final</p>
                                </div>
                              ) : m.status === 'bye' ? (
                                <span className="text-xs text-gray-400 ml-3">BYE</span>
                              ) : (
                                <span className="text-xs text-gray-400 ml-3">TBD</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
