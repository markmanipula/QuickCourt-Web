'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ENDPOINTS } from '@/lib/api';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SPORTS = ['Volleyball', 'Beach Volleyball', 'Basketball', 'Badminton', 'Gym', 'Softball', 'Golf', 'Pickleball', 'Other'];
const SKILL_LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Professional'];

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    fetch(ENDPOINTS.EVENT_BY_ID(id)).then(r => r.json()).then(d => {
      const e = d.data ?? d;
      setForm({
        title: e.title ?? '',
        sport: e.sport ?? '',
        location: e.location ?? '',
        date: e.date ? new Date(e.date).toISOString().slice(0, 16) : '',
        endTime: e.endTime ?? '',
        maxParticipants: e.maxParticipants ?? '',
        fee: e.fee ?? '',
        venmoHandle: e.venmoHandle ?? '',
        cashAppHandle: e.cashAppHandle ?? '',
        details: e.details ?? '',
        skillLevel: e.skillLevel ?? 'All Levels',
        isPrivate: e.isPrivate ?? false,
        passcode: e.passcode ?? '',
      });
    }).finally(() => setLoading(false));
  }, [id]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const r = await fetch(ENDPOINTS.EVENT_BY_ID(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sport: form.sport.toLowerCase(),
          date: new Date(form.date).toISOString(),
          maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
          fee: form.fee ? Number(form.fee) : 0,
          organizerUid: user.uid,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      toast.success('Event updated!');
      router.push(`/events/${id}`);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <div className="flex items-center justify-center py-32"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link href={`/events/${id}`} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to event
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Event</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 text-sm">Basic Info</h2>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Sport *</label>
            <select value={form.sport} onChange={e => set('sport', e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {SPORTS.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Skill Level</label>
            <select value={form.skillLevel} onChange={e => set('skillLevel', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {SKILL_LEVELS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 text-sm">Date & Location</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Date & Start Time *</label>
              <input type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">End Time</label>
              <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Location</label>
            <LocationAutocomplete value={form.location} onChange={v => set('location', v)} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 text-sm">Participants & Cost</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Max Participants</label>
              <input type="number" min="1" value={form.maxParticipants} onChange={e => set('maxParticipants', e.target.value)}
                placeholder="Unlimited" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Entry Fee ($)</label>
              <input type="number" min="0" step="0.01" value={form.fee} onChange={e => set('fee', e.target.value)}
                placeholder="Free" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {Number(form.fee) > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Venmo Handle</label>
                <input value={form.venmoHandle} onChange={e => set('venmoHandle', e.target.value)} placeholder="@username"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">CashApp Handle</label>
                <input value={form.cashAppHandle} onChange={e => set('cashAppHandle', e.target.value)} placeholder="$username"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 text-sm">Details</h2>
          <textarea value={form.details} onChange={e => set('details', e.target.value)} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 text-sm">Privacy</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isPrivate} onChange={e => set('isPrivate', e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
            <span className="text-sm font-medium text-gray-900">Invite only</span>
          </label>
          {form.isPrivate && (
            <input value={form.passcode} onChange={e => set('passcode', e.target.value)} placeholder="Passcode (optional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          )}
        </div>

        <button type="submit" disabled={saving}
          className="bg-blue-600 text-white rounded-xl py-3.5 font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
