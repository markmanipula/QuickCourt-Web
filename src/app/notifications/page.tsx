'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ENDPOINTS } from '@/lib/api';
import { Bell, Check, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    // Load user's dismissed/read lists from Firestore
    const userRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(userRef, snap => setUserData(snap.data()));

    // Load notifications
    const q = query(
      collection(db, 'notifications'),
      where('recipientUid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubNotif = onSnapshot(q, snap => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));

    return () => { unsubUser(); unsubNotif(); };
  }, [user]);

  const dismissed = new Set(userData?.dismissedNotifications ?? []);
  const visible = notifications.filter(n => !dismissed.has(n.id));

  const dismiss = async (notifId: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      dismissedNotifications: arrayUnion(notifId),
      readNotifications: arrayUnion(notifId),
    });
  };

  const dismissAll = async () => {
    if (!user || visible.length === 0) return;
    const ids = visible.map(n => n.id);
    await updateDoc(doc(db, 'users', user.uid), {
      dismissedNotifications: arrayUnion(...ids),
      readNotifications: arrayUnion(...ids),
    });
    toast.success('All notifications cleared');
  };

  const handleApprove = async (notif: any) => {
    if (!user) return;
    setActing(notif.id);
    try {
      const endpoint = notif.type === 'join_request'
        ? ENDPOINTS.APPROVE_REQUEST(notif.eventId, notif.requestId)
        : ENDPOINTS.APPROVE_TEAM_REQUEST(notif.eventId, notif.teamId, notif.requestId);
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizerUid: user.uid }),
      });
      if (!r.ok) throw new Error();
      toast.success('Request approved');
      await dismiss(notif.id);
    } catch {
      toast.error('Failed to approve');
    } finally {
      setActing(null);
    }
  };

  const handleDeny = async (notif: any) => {
    if (!user) return;
    setActing(notif.id + '_deny');
    try {
      const endpoint = notif.type === 'join_request'
        ? ENDPOINTS.DENY_REQUEST(notif.eventId, notif.requestId)
        : ENDPOINTS.DENY_TEAM_REQUEST(notif.eventId, notif.teamId, notif.requestId);
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizerUid: user.uid }),
      });
      if (!r.ok) throw new Error();
      toast.success('Request denied');
      await dismiss(notif.id);
    } catch {
      toast.error('Failed to deny');
    } finally {
      setActing(null);
    }
  };

  const isRequest = (n: any) => n.type === 'join_request' || n.type === 'team_join_request';

  if (authLoading || !user) return <div className="flex items-center justify-center py-32"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {visible.length > 0 && (
          <button onClick={dismissAll} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Bell size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="font-medium">No notifications</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map(n => {
            const isRead = userData?.readNotifications?.includes(n.id);
            return (
              <div key={n.id} className={`bg-white rounded-2xl border p-4 ${isRead ? 'border-gray-100' : 'border-blue-100'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${isRead ? 'bg-gray-200' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{n.message ?? n.body ?? n.title}</p>
                    {n.eventId && (
                      <Link href={`/events/${n.eventId}`} className="text-xs text-blue-600 hover:underline mt-1 block">
                        View event →
                      </Link>
                    )}
                    {isRequest(n) && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleApprove(n)}
                          disabled={!!acting}
                          className="flex items-center gap-1 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                        >
                          {acting === n.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleDeny(n)}
                          disabled={!!acting}
                          className="flex items-center gap-1 border border-red-200 text-red-500 text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
                        >
                          {acting === n.id + '_deny' ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                          Deny
                        </button>
                      </div>
                    )}
                  </div>
                  <button onClick={() => dismiss(n.id)} className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
