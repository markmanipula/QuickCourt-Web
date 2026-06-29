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
const FORMATS = ['Round Robin', 'Double Round Robin', 'Bracket'];
const LEVELS = ['B', 'BB', 'A'];
const TYPES = ['Mens', 'Womens', 'Coed'];

export default function EditLeaguePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    fetch(ENDPOINTS.LEAGUE_BY_ID(id)).then(r => r.json()).then(d => {
      const l = d.data ?? d;
      setForm({
        name: l.name ?? '',
        sport: l.sport ?? '',
        location: l.location ?? '',
        description: l.description ?? '',
        maxTeams: l.maxTeams ?? '',
        playersPerTeam: l.playersPerTeam ?? '',
        format: l.format ?? 'Round Robin',
        numberOfCourts: l.numberOfCourts ?? 1,
        cost: l.cost ?? '',
        venmoHandle: l.venmoHandle ?? '',
        cashAppHandle: l.cashAppHandle ?? '',
        level: l.level ?? '',
        leagueType: l.leagueType ?? '',
        registrationDeadline: l.registrationDeadline ? new Date(l.registrationDeadline).toISOString().slice(0, 10) : '',
        startDate: l.startDate ? new Date(l.startDate).toISOString().slice(0, 10) : '',
        endDate: l.endDate ? new Date(l.endDate).toISOString().slice(0, 10) : '',
      });
    }).finally(() => setLoading(false));
  }, [id]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const toggle = (k: string, v: string) => set(k, form[k] === v ? '' : v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const r = await fetch(ENDPOINTS.LEAGUE_BY_ID(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sport: form.sport.toLowerCase(),
          maxTeams: form.maxTeams ? Number(form.maxTeams) : null,
          playersPerTeam: form.playersPerTeam ? Number(form.playersPerTeam) : null,
          numberOfCourts: Number(form.numberOfCourts) || 1,
          cost: form.cost ? Number(form.cost) : 0,
          level: form.level || null,
          leagueType: form.leagueType || null,
          hostUid: user.uid,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      toast.success('League updated!');
      router.push(`/leagues/${id}`);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <div className="flex items-center justify-center py-32"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  const pillClass = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link href={`/leagues/${id}`} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to league
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit League</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700 text-sm">Basic Info</h2>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">League Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
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
            <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Venue</label>
            <LocationAutocomplete value={form.location} onChange={v => set('location', v)} placeholder="Enter venue address…" />
          </div>
        </div>

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
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Format</label>
              <select value={form.format} onChange={e => set('format', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {FORMATS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Number of Courts</label>
              <input type="number" min="1" value={form.numberOfCourts} onChange={e => set('numberOfCourts', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Level</label>
            <div className="flex gap-2">{LEVELS.map(l => <button key={l} type="button" onClick={() => toggle('level', l)} className={pillClass(form.level === l)}>{l}</button>)}</div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Type</label>
            <div className="flex gap-2">{TYPES.map(t => <button key={t} type="button" onClick={() => toggle('leagueType', t)} className={pillClass(form.leagueType === t)}>{t}</button>)}</div>
          </div>
        </div>

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
                <label className="text-xs font-medium text-gray-600 mb-1 block">Venmo</label>
                <input value={form.venmoHandle} onChange={e => set('venmoHandle', e.target.value)} placeholder="@username"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">CashApp</label>
                <input value={form.cashAppHandle} onChange={e => set('cashAppHandle', e.target.value)} placeholder="$username"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}
        </div>

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
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
