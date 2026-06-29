'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ENDPOINTS } from '@/lib/api';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SPORTS = ['Volleyball', 'Beach Volleyball', 'Basketball', 'Badminton', 'Gym', 'Softball', 'Golf', 'Pickleball', 'Other'];
const SKILL_LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Professional'];

export default function CreateEventPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '', sport: '', location: '', date: '', endTime: '',
    maxParticipants: '', fee: '', venmoHandle: '', cashAppHandle: '',
    details: '', skillLevel: 'All Levels', isPrivate: false, passcode: '',
    isRecurring: false, recurrenceType: 'weekly', recurrenceEndDate: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/login'); return; }
    if (!form.title || !form.sport || !form.date) { toast.error('Title, sport and date are required'); return; }
    setSaving(true);
    try {
      const body: any = {
        title: form.title,
        sport: form.sport.toLowerCase(),
        location: form.location,
        date: new Date(form.date).toISOString(),
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
        fee: form.fee ? Number(form.fee) : 0,
        venmoHandle: form.venmoHandle || null,
        cashAppHandle: form.cashAppHandle || null,
        details: form.details || null,
        skillLevel: form.skillLevel,
        isPrivate: form.isPrivate,
        passcode: form.isPrivate ? form.passcode : null,
        organizerUid: user.uid,
        organizerName: user.displayName ?? user.email,
      };
      if (form.endTime) body.endTime = form.endTime;
      if (form.isRecurring) {
        body.isRecurring = true;
        body.recurrenceType = form.recurrenceType;
        body.recurrenceEndDate = form.recurrenceEndDate ? new Date(form.recurrenceEndDate).toISOString() : null;
      }

      const r = await fetch(ENDPOINTS.EVENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      toast.success('Event created!');
      router.push(`/events/${d.data._id}`);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center text-gray-400">
      <p className="mb-4">Please log in to create an event</p>
      <Link href="/login" className="text-blue-600 hover:underline">Log in</Link>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link href="/events" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to events
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Event</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 text-sm">Basic Info</h2>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              placeholder="e.g. Sunday Volleyball" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Sport *</label>
            <select value={form.sport} onChange={e => set('sport', e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Select sport…</option>
              {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Skill Level</label>
            <select value={form.skillLevel} onChange={e => set('skillLevel', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Date & Location */}
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

        {/* Participants & Cost */}
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
                <input value={form.venmoHandle} onChange={e => set('venmoHandle', e.target.value)}
                  placeholder="@username" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">CashApp Handle</label>
                <input value={form.cashAppHandle} onChange={e => set('cashAppHandle', e.target.value)}
                  placeholder="$username" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 text-sm">Details</h2>
          <textarea value={form.details} onChange={e => set('details', e.target.value)} rows={3}
            placeholder="Add any extra details, rules, or notes…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 text-sm">Privacy</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isPrivate} onChange={e => set('isPrivate', e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Invite only</p>
              <p className="text-xs text-gray-500">Players must request to join or enter a passcode</p>
            </div>
          </label>
          {form.isPrivate && (
            <input value={form.passcode} onChange={e => set('passcode', e.target.value)}
              placeholder="Passcode (optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          )}
        </div>

        {/* Recurrence */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 text-sm">Recurrence</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isRecurring} onChange={e => set('isRecurring', e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Recurring event</p>
              <p className="text-xs text-gray-500">Repeats weekly, biweekly, or monthly</p>
            </div>
          </label>
          {form.isRecurring && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Frequency</label>
                <select value={form.recurrenceType} onChange={e => set('recurrenceType', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">End Date</label>
                <input type="date" value={form.recurrenceEndDate} onChange={e => set('recurrenceEndDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}
        </div>

        <button type="submit" disabled={saving}
          className="bg-blue-600 text-white rounded-xl py-3.5 font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? 'Creating…' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
