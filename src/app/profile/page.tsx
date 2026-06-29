'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ENDPOINTS } from '@/lib/api';
import { getSportEmoji, formatDateShort } from '@/lib/utils';
import { LogOut, Calendar, Trophy, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [myLeagues, setMyLeagues] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(ENDPOINTS.EVENTS)
        .then(r => r.json())
        .then(d => (d.data ?? []).filter((e: any) =>
          e.participants?.some((p: any) => p.uid === user.uid) || e.organizerUid === user.uid
        )),
      fetch(ENDPOINTS.MY_LEAGUES(user.uid))
        .then(r => r.json())
        .then(d => d.data ?? []),
    ]).then(([events, leagues]) => {
      setMyEvents(events);
      setMyLeagues(leagues);
    }).finally(() => setDataLoading(false));
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    toast.success('Logged out');
  };

  if (authLoading || !user) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="animate-spin text-blue-500" size={32} />
    </div>
  );

  const initials = user.displayName
    ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? '?';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{user.displayName ?? 'Your Profile'}</h1>
            <p className="text-gray-500 text-sm truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
        <div className="flex gap-6 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{myEvents.length}</p>
            <p className="text-xs text-gray-500">Events</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{myLeagues.length}</p>
            <p className="text-xs text-gray-500">Leagues</p>
          </div>
        </div>
      </div>

      {/* My Events */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-blue-500" />
          <h2 className="font-semibold text-gray-900">My Events</h2>
        </div>
        {dataLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="animate-spin text-gray-300" /></div>
        ) : myEvents.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p className="text-sm mb-2">No events yet</p>
            <Link href="/events" className="text-blue-600 text-sm hover:underline">Browse events →</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {myEvents.map((e: any) => (
              <Link key={e._id} href={`/events/${e._id}`}>
                <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
                  <span className="text-xl">{getSportEmoji(e.sport)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{e.title}</p>
                    {e.date && <p className="text-xs text-gray-400">{formatDateShort(e.date)}</p>}
                  </div>
                  {e.organizerUid === user.uid && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">Host</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* My Leagues */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} className="text-blue-500" />
          <h2 className="font-semibold text-gray-900">My Leagues</h2>
        </div>
        {dataLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="animate-spin text-gray-300" /></div>
        ) : myLeagues.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p className="text-sm mb-2">No leagues yet</p>
            <Link href="/leagues" className="text-blue-600 text-sm hover:underline">Browse leagues →</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {myLeagues.map((l: any) => (
              <Link key={l._id} href={`/leagues/${l._id}`}>
                <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
                  <span className="text-xl">{getSportEmoji(l.sport)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{l.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{l.sport}</p>
                  </div>
                  {l.hostUid === user.uid && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">Host</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
