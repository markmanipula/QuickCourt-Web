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
const FORMATS = ['Round Robin', 'Double Round Robin', 'Bracket'];
const LEVELS = ['B', 'BB', 'A'];
const TYPES = ['Mens', 'Womens', 'Coed'];

export default function CreateLeaguePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '', sport: '', location: '', description: '',
    maxTeams: '', playersPerTeam: '', format: 'Round Robin',
    numberOfCourts: '1', cost: '', venmoHandle: '', cashAppHandle: '',
    level: '', leagueType: '',
    registrationDeadline: '', startDate: '', endDate: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (k: 'level' | 'leagueType', v: string) => set(k, form[k] === v ? '' : v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/login'); return; }
    if (!form.name || !form.sport) { toast.error('Name and sport are required'); return; }
    setSaving(true);
    try {
      const r = await fetch(ENDPOINTS.LEAGUES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          sport: form.sport.toLowerCase(),
          location: form.location,
          description: form.description || null,
          maxTeams: form.maxTeams ? Number(form.maxTeams) : null,
          playersPerTeam: form.playersPerTeam ? Number(form.playersPerTeam) : null,
          format: form.format,
          numberOfCourts: Number(form.numberOfCourts) || 1,
          cost: form.cost ? Number(form.cost) : 0,
          venmoHandle: form.venmoHandle || null,
          cashAppHandle: form.cashAppHandle || null,
          level: form.level || null,
          leagueType: form.leagueType || null,
          registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline).toISOString() : null,
          startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
          endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
          hostUid: user.uid,
          hostName: user.displayName ?? user.email,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      toast.success('League created!');
      router.push(`/leagues/${d.data._id}`);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to create league');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center text-gray-400">
      <p className="mb-4">Please log in to create a league</p>
      <Link href="/login" className="text-blue-600 hover:underline">Log in</Link>
    </div>
  );

  const pillClass = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link href="/leagues" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to leagues
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create League</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 text-sm">Basic Info</h2>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">League Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              placeholder="e.g. Summer Volleyball League" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
            <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Tell players about this league…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Venue</label>
            <LocationAutocomplete value={form.location} onChange={v => set('location', v)} placeholder="Enter venue address…" />
          </div>
        </div>

        {/* League settings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 text-sm">League Settings</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Max Teams</label>
              <input type="number" min="2" value={form.maxTeams} onChange={e => set('maxTeams', e.target.value)}
                placeholder="No limit" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Players per Team</label>
              <input type="number" min="1" value={form.playersPerTeam} onChange={e => set('playersPerTeam', e.target.value)}
                placeholder="Any" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Format</label>
              <select value={form.format} onChange={e => set('format', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Number of Courts</label>
              <input type="number" min="1" value={form.numberOfCourts} onChange={e => set('numberOfCourts', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Level (optional)</label>
            <div className="flex gap-2 flex-wrap">
              {LEVELS.map(l => <button key={l} type="button" onClick={() => toggle('level', l)} className={pillClass(form.level === l)}>{l}</button>)}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Type (optional)</label>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(t => <button key={t} type="button" onClick={() => toggle('leagueType', t)} className={pillClass(form.leagueType === t)}>{t}</button>)}
            </div>
          </div>
        </div>

        {/* Cost */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 text-sm">Cost</h2>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Entry Fee ($)</label>
            <input type="number" min="0" step="0.01" value={form.cost} onChange={e => set('cost', e.target.value)}
              placeholder="Free" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {Number(form.cost) > 0 && (
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

        {/* Dates */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 text-sm">Dates</h2>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Registration Deadline</label>
            <input type="date" value={form.registrationDeadline} onChange={e => set('registrationDeadline', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">End Date</label>
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="bg-blue-600 text-white rounded-xl py-3.5 font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? 'Creating…' : 'Create League'}
        </button>
      </form>
    </div>
  );
}
