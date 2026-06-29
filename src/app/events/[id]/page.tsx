'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ENDPOINTS } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getSportEmoji, formatDate } from '@/lib/utils';
import { MapPin, Users, Calendar, ArrowLeft, Send, Loader2, Pencil, Check, X, Star, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const RATING_CATEGORIES = ['skill', 'sportsmanship', 'communication', 'punctuality'];

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [acting, setActing] = useState(false);
  const [actingReq, setActingReq] = useState<string | null>(null);

  // Passcode modal
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcode, setPasscode] = useState('');

  // Ratings
  const [myRatings, setMyRatings] = useState<Record<string, any>>({});
  const [ratingDraft, setRatingDraft] = useState<Record<string, Record<string, number>>>({});
  const [submittingRating, setSubmittingRating] = useState<string | null>(null);

  const fetchEvent = async () => {
    const r = await fetch(ENDPOINTS.EVENT_BY_ID(id));
    const d = await r.json();
    setEvent(d.data ?? d);
  };

  const fetchComments = async () => {
    const r = await fetch(ENDPOINTS.EVENT_COMMENTS(id));
    const d = await r.json();
    setComments(d.data ?? []);
  };

  const fetchRequests = async (organizerUid: string) => {
    const r = await fetch(ENDPOINTS.GET_REQUESTS(id, organizerUid));
    const d = await r.json();
    setRequests(d.data ?? []);
  };

  useEffect(() => {
    Promise.all([fetchEvent(), fetchComments()]).finally(() => setLoading(false));
  }, [id]);

  const fetchMyRatings = async (raterUid: string) => {
    try {
      const r = await fetch(ENDPOINTS.MY_EVENT_RATINGS(id, raterUid));
      const d = await r.json();
      const map: Record<string, any> = {};
      for (const rating of (d.data ?? [])) { map[rating.ratedUid] = rating; }
      setMyRatings(map);
    } catch {}
  };

  useEffect(() => {
    if (event && user && event.organizerUid === user.uid) fetchRequests(user.uid);
    if (event && user) fetchMyRatings(user.uid);
  }, [event, user]);

  const isParticipant = event?.participants?.some((p: any) => p.uid === user?.uid);
  const isOrganizer = event?.organizerUid === user?.uid;
  const isFull = event?.maxParticipants && event?.participants?.length >= event?.maxParticipants;

  const handleJoin = async (enteredPasscode?: string) => {
    if (!user) { router.push('/login'); return; }
    if (event?.isPrivate && event?.passcode && !enteredPasscode) {
      setShowPasscode(true); return;
    }
    setActing(true);
    try {
      const body: any = { uid: user.uid, name: user.displayName ?? user.email };
      if (enteredPasscode) body.passcode = enteredPasscode;
      const r = await fetch(ENDPOINTS.JOIN_EVENT(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      toast.success('Joined event!');
      setShowPasscode(false); setPasscode('');
      await fetchEvent();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to join');
    } finally {
      setActing(false);
    }
  };

  const handleSubmitRating = async (ratedUid: string) => {
    if (!user) return;
    const draft = ratingDraft[ratedUid];
    if (!draft || Object.keys(draft).length === 0) { toast.error('Please select at least one rating'); return; }
    setSubmittingRating(ratedUid);
    try {
      const r = await fetch(ENDPOINTS.SUBMIT_RATING(id, ratedUid), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raterUid: user.uid, ratings: draft }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      toast.success('Rating submitted!');
      await fetchMyRatings(user.uid);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to submit rating');
    } finally {
      setSubmittingRating(null);
    }
  };

  const handleLeave = async () => {
    if (!user) return;
    setActing(true);
    try {
      const r = await fetch(ENDPOINTS.LEAVE_EVENT(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      toast.success('Left event');
      await fetchEvent();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to leave');
    } finally {
      setActing(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;
    try {
      await fetch(ENDPOINTS.EVENT_COMMENTS(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, name: user.displayName ?? user.email, text: comment.trim() }),
      });
      setComment('');
      await fetchComments();
    } catch {
      toast.error('Failed to post comment');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="animate-spin text-blue-500" size={32} />
    </div>
  );

  if (!event) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">
      <p className="text-4xl mb-3">😕</p>
      <p>Event not found</p>
      <Link href="/events" className="text-blue-600 mt-4 inline-block">← Back to events</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/events" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm transition-colors">
          <ArrowLeft size={16} /> Back to events
        </Link>
        {isOrganizer && (
          <Link href={`/events/${id}/edit`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors">
            <Pencil size={15} /> Edit
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="text-5xl">{getSportEmoji(event.sport)}</div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{event.title}</h1>
            <p className="text-gray-500 capitalize">{event.sport}</p>
          </div>
          <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
            event.status === 'open' ? 'bg-green-100 text-green-700' :
            event.status === 'full' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {event.status ?? 'open'}
          </span>
        </div>

        {/* Info rows */}
        <div className="flex flex-col gap-3 mb-6">
          {event.date && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar size={16} className="shrink-0 text-blue-500" />
              <span>{formatDate(event.date)}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <MapPin size={16} className="shrink-0 text-blue-500" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Users size={16} className="shrink-0 text-blue-500" />
            <span>
              {event.participants?.length ?? 0}
              {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} players
            </span>
          </div>
        </div>

        {event.description && (
          <p className="text-sm text-gray-600 leading-relaxed mb-6">{event.description}</p>
        )}

        {/* Fee */}
        {event.fee != null && event.fee > 0 && (
          <div className="bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-lg inline-block mb-6">
            Entry fee: ${event.fee}
          </div>
        )}

        {/* Action button */}
        {!isOrganizer && (
          isParticipant ? (
            <button onClick={handleLeave} disabled={acting}
              className="w-full border border-red-300 text-red-600 rounded-xl py-3 font-semibold hover:bg-red-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {acting && <Loader2 size={16} className="animate-spin" />} Leave Event
            </button>
          ) : (
            <button onClick={() => handleJoin()} disabled={acting || isFull}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {acting && <Loader2 size={16} className="animate-spin" />}
              {event.isPrivate && event.passcode && <Lock size={15} />}
              {isFull ? 'Event Full' : 'Join Event'}
            </button>
          )
        )}

        {/* Passcode modal */}
        {showPasscode && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="font-bold text-gray-900 mb-1">Enter Passcode</h3>
              <p className="text-sm text-gray-500 mb-4">This event requires a passcode to join.</p>
              <input value={passcode} onChange={e => setPasscode(e.target.value)}
                placeholder="Enter passcode…" autoFocus
                onKeyDown={e => e.key === 'Enter' && handleJoin(passcode)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
              <div className="flex gap-2">
                <button onClick={() => { setShowPasscode(false); setPasscode(''); }}
                  className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleJoin(passcode)} disabled={!passcode.trim() || acting}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-1">
                  {acting && <Loader2 size={14} className="animate-spin" />} Join
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Participants */}
      {event.participants?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Players ({event.participants.length})</h2>
          <div className="flex flex-col gap-2">
            {event.participants.map((p: any, i: number) => (
              <div key={p.uid ?? i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold shrink-0">
                  {(p.name ?? p.uid ?? '?')[0].toUpperCase()}
                </div>
                <span className="text-sm text-gray-700">{p.name ?? 'Player'}</span>
                {p.uid === event.organizerUid && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-auto">Host</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player Ratings (post-event, participants only) */}
      {user && isParticipant && event.date && new Date(event.date) < new Date() && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-amber-400" />
            <h2 className="font-semibold text-gray-900">Rate Players</h2>
          </div>
          <div className="flex flex-col gap-4">
            {(event.participants ?? []).filter((p: any) => p.uid !== user.uid).map((p: any) => {
              const alreadyRated = !!myRatings[p.uid];
              const draft = ratingDraft[p.uid] ?? {};
              return (
                <div key={p.uid} className={`border rounded-xl p-4 ${alreadyRated ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold shrink-0">
                      {(p.name ?? '?')[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-sm text-gray-900">{p.name}</span>
                    {alreadyRated && <span className="ml-auto text-xs text-green-600 font-medium flex items-center gap-1"><Check size={12} /> Rated</span>}
                  </div>
                  {!alreadyRated && (
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {RATING_CATEGORIES.map(cat => (
                          <div key={cat}>
                            <p className="text-xs text-gray-500 mb-1 capitalize">{cat}</p>
                            <div className="flex gap-1">
                              {[1,2,3,4,5].map(star => (
                                <button key={star} type="button"
                                  onClick={() => setRatingDraft(prev => ({ ...prev, [p.uid]: { ...draft, [cat]: star } }))}
                                  className={`transition-colors ${(draft[cat] ?? 0) >= star ? 'text-amber-400' : 'text-gray-200'}`}>
                                  <Star size={18} className="fill-current" />
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => handleSubmitRating(p.uid)} disabled={submittingRating === p.uid || Object.keys(draft).length === 0}
                        className="w-full bg-amber-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-1">
                        {submittingRating === p.uid ? <Loader2 size={14} className="animate-spin" /> : null}
                        Submit Rating
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Join Requests (organizer only) */}
      {isOrganizer && requests.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Join Requests ({requests.length})</h2>
          <div className="flex flex-col gap-3">
            {requests.map((req: any) => (
              <div key={req._id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-800">{req.name ?? req.uid}</span>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={async () => {
                      setActingReq(req._id);
                      try {
                        await fetch(ENDPOINTS.APPROVE_REQUEST(id, req._id), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ organizerUid: user!.uid }) });
                        toast.success('Approved'); fetchRequests(user!.uid); fetchEvent();
                      } catch { toast.error('Failed'); } finally { setActingReq(null); }
                    }}
                    disabled={actingReq === req._id}
                    className="flex items-center gap-1 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                  >
                    {actingReq === req._id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Approve
                  </button>
                  <button
                    onClick={async () => {
                      setActingReq(req._id + '_d');
                      try {
                        await fetch(ENDPOINTS.DENY_REQUEST(id, req._id), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ organizerUid: user!.uid }) });
                        toast.success('Denied'); fetchRequests(user!.uid);
                      } catch { toast.error('Failed'); } finally { setActingReq(null); }
                    }}
                    disabled={actingReq === req._id + '_d'}
                    className="flex items-center gap-1 border border-red-200 text-red-500 text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
                  >
                    {actingReq === req._id + '_d' ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />} Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Comments ({comments.length})</h2>
        <div className="flex flex-col gap-4 mb-4">
          {comments.length === 0 && (
            <p className="text-sm text-gray-400">No comments yet. Be the first!</p>
          )}
          {comments.map((c: any) => (
            <div key={c._id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-semibold shrink-0">
                {(c.name ?? '?')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">{c.name}</p>
                <p className="text-sm text-gray-800">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        {user ? (
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Add a comment…"
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!comment.trim()}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-400">
            <Link href="/login" className="text-blue-600 hover:underline">Log in</Link> to comment
          </p>
        )}
      </div>
    </div>
  );
}
