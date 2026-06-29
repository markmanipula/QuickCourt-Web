'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth, db } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ENDPOINTS } from '@/lib/api';
import { getSportEmoji, formatDateShort } from '@/lib/utils';
import Avatar, { AVATAR_COLORS } from '@/components/Avatar';
import { LogOut, Calendar, Trophy, Pencil, Check, X, Loader2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [myLeagues, setMyLeagues] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [avatarColor, setAvatarColor] = useState('blue');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    setNewName(user.displayName ?? '');

    // Load avatar color from Firestore
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) setAvatarColor(snap.data()?.avatarColor ?? 'blue');
    });

    Promise.all([
      fetch(ENDPOINTS.EVENTS).then(r => r.json()).then(d =>
        (d.data ?? []).filter((e: any) =>
          e.participants?.some((p: any) => p.uid === user.uid) || e.organizerUid === user.uid
        )
      ),
      fetch(ENDPOINTS.MY_LEAGUES(user.uid)).then(r => r.json()).then(d => d.data ?? []),
      fetch(ENDPOINTS.USER_RATINGS(user.uid)).then(r => r.json()).then(d => d.data ?? null),
    ]).then(([events, leagues, ratingData]) => {
      setMyEvents(events);
      setMyLeagues(leagues);
      setRatings(ratingData);
    }).finally(() => setDataLoading(false));
  }, [user]);

  const saveAvatarColor = async (color: string) => {
    if (!user) return;
    setAvatarColor(color);
    await setDoc(doc(db, 'users', user.uid), { avatarColor: color }, { merge: true });
    toast.success('Avatar updated');
  };

  const saveName = async () => {
    if (!user || !newName.trim()) return;
    setSavingName(true);
    try {
      await updateProfile(auth.currentUser!, { displayName: newName.trim() });
      toast.success('Name updated');
      setEditingName(false);
    } catch {
      toast.error('Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (authLoading || !user) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="animate-spin text-blue-500" size={32} />
    </div>
  );

  const avgRating = ratings?.averages
    ? (Object.values(ratings.averages) as number[]).reduce((a, b) => a + b, 0) / Object.values(ratings.averages).length
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4 mb-6">
          <Avatar name={user.displayName ?? user.email} color={avatarColor} size="xl" />
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input value={newName} onChange={e => setNewName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={e => e.key === 'Enter' && saveName()} autoFocus />
                <button onClick={saveName} disabled={savingName} className="text-green-600 hover:text-green-700">
                  {savingName ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                </button>
                <button onClick={() => { setEditingName(false); setNewName(user.displayName ?? ''); }} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{user.displayName ?? 'Your Profile'}</h1>
                <button onClick={() => setEditingName(true)} className="text-gray-400 hover:text-blue-500 transition-colors">
                  <Pencil size={14} />
                </button>
              </div>
            )}
            <p className="text-gray-500 text-sm truncate">{user.email}</p>
            {avgRating != null && (
              <div className="flex items-center gap-1 mt-1">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium text-gray-700">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({ratings?.count ?? 0} ratings)</span>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors shrink-0">
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Avatar color picker */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Avatar Color</p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(AVATAR_COLORS).map(([key, { bg }]) => (
              <button key={key} onClick={() => saveAvatarColor(key)}
                className={`w-7 h-7 rounded-full ${bg} transition-transform hover:scale-110 ${avatarColor === key ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`} />
            ))}
          </div>
        </div>

        <div className="flex gap-6 pt-4 mt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{myEvents.length}</p>
            <p className="text-xs text-gray-500">Events</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{myLeagues.length}</p>
            <p className="text-xs text-gray-500">Leagues</p>
          </div>
          {avgRating != null && (
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Avg Rating</p>
            </div>
          )}
        </div>
      </div>

      {/* Ratings breakdown */}
      {ratings?.averages && Object.keys(ratings.averages).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-amber-400" />
            <h2 className="font-semibold text-gray-900">Ratings</h2>
          </div>
          <div className="flex flex-col gap-3">
            {Object.entries(ratings.averages).map(([cat, avg]: [string, any]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32 capitalize">{cat}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${(avg / 5) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-gray-700 w-8 text-right">{Number(avg).toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <div className="flex flex-col gap-1">
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
          <div className="flex flex-col gap-1">
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
