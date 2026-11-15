'use client';

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { ClipboardList, Plus, Clock, User, CheckCircle, AlertCircle, Coffee, Utensils, Moon, Activity, ChevronDown, ChevronUp } from 'lucide-react';

interface HandoverEntry {
  id: string;
  shift: string;
  caregiver: string;
  time: string;
  mood: string;
  meds: string;
  meals: string;
  bp: string;
  incidents: string;
  notes: string;
  tags: string[];
}

const DEMO_ENTRIES: HandoverEntry[] = [
  {
    id: '1',
    shift: 'Morning Shift (6AM – 2PM)',
    caregiver: 'Sarah Vance (Daughter)',
    time: 'Today, 2:00 PM',
    mood: '😊 Good — talkative and engaged during breakfast',
    meds: '✅ All 3 morning meds taken (Metformin, Lisinopril, Vitamin D3) — 8:03 AM',
    meals: '🍳 Breakfast: Oatmeal + orange juice. Good appetite. Drank ~1.2L water.',
    bp: '128/82 mmHg at 9:00 AM — slightly elevated but within acceptable range',
    incidents: 'Mentioned mild dizziness when standing up at 10 AM. Sat down, resolved in 2 min. No fall.',
    notes: 'Mom asked about Thanksgiving plans — she seemed excited. Dr. Chen appointment in 3 days, prep questions list started. Left dinner in fridge (chicken soup).',
    tags: ['dizziness noted', 'good appetite', 'meds taken'],
  },
  {
    id: '2',
    shift: 'Evening Shift (2PM – 10PM)',
    caregiver: 'Marcus Vance (Son)',
    time: 'Yesterday, 10:15 PM',
    mood: '😐 Okay — slightly tired but cheerful after her favorite show',
    meds: '⚠️ Evening Atorvastatin missed initially (napping). Reminded at 7:22 PM — taken. All others on time.',
    meals: '🍲 Chicken soup from fridge. Light snack at 8 PM (crackers + cheese). Good fluid intake.',
    bp: '132/84 mmHg at 6:00 PM — slightly higher, monitoring. Will note for Dr. Chen.',
    incidents: 'None. Slipped on rug at 4 PM but caught herself on counter — no injury. Rug removed.',
    notes: 'Remove the small bathroom rug (fall hazard — DONE). Set up extra phone alarm for 6 PM meds. Mom wants video call with grandkids this weekend. Night meds all done by 9 PM.',
    tags: ['rug removed', 'bp elevated', 'fall risk noted'],
  },
];

const SHIFT_OPTIONS = [
  'Morning Shift (6AM – 2PM)',
  'Afternoon Shift (2PM – 6PM)',
  'Evening Shift (6PM – 10PM)',
  'Night Shift (10PM – 6AM)',
  'Full Day',
];

const MOOD_OPTIONS = [
  '😄 Great — very active and positive',
  '😊 Good — normal, engaged',
  '😐 Okay — quiet but stable',
  '😔 Low — withdrawn or sad',
  '😣 Difficult — distressed or agitated',
];

export default function HandoverPage() {
  const { activeProfile } = useProfile();
  const [entries, setEntries] = useState<HandoverEntry[]>(DEMO_ENTRIES);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>('1');
  const [currentTime, setCurrentTime] = useState('');

  const [form, setForm] = useState({
    shift: SHIFT_OPTIONS[0],
    caregiver: '',
    mood: MOOD_OPTIONS[1],
    meds: '',
    meals: '',
    bp: '',
    incidents: 'None',
    notes: '',
    tags: '',
  });

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagList = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const newEntry: HandoverEntry = {
      id: Date.now().toString(),
      shift: form.shift,
      caregiver: form.caregiver || (activeProfile?.name ?? 'Caregiver'),
      time: `Today, ${currentTime}`,
      mood: form.mood,
      meds: form.meds,
      meals: form.meals,
      bp: form.bp,
      incidents: form.incidents,
      notes: form.notes,
      tags: tagList,
    };
    setEntries(prev => [newEntry, ...prev]);
    setShowForm(false);
    setExpandedId(newEntry.id);
    setForm({ shift: SHIFT_OPTIONS[0], caregiver: '', mood: MOOD_OPTIONS[1], meds: '', meals: '', bp: '', incidents: 'None', notes: '', tags: '' });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-blue-600" />
            Caregiver Handover Notes
          </h1>
          <p className="text-slate-500 mt-1">Shift-to-shift communication for {activeProfile?.name ?? 'your patient'}'s care team</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          New Handover
        </button>
      </div>

      {/* Current Shift Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-200" />
          <div>
            <p className="font-black text-lg">Current Shift Active</p>
            <p className="text-blue-200 text-sm">Evening Shift — started 2:00 PM</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
          <User className="w-4 h-4" />
          <span className="font-bold">On duty: {activeProfile?.name?.split(' ')[0] ?? 'Caregiver'}</span>
        </div>
      </div>

      {/* New Handover Form */}
      {showForm && (
        <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-lg p-6">
          <h2 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" /> New Shift Handover
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Shift</label>
                <select
                  value={form.shift}
                  onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {SHIFT_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Your Name & Role</label>
                <input
                  type="text"
                  value={form.caregiver}
                  onChange={e => setForm(f => ({ ...f, caregiver: e.target.value }))}
                  placeholder="e.g. Sarah Vance (Daughter)"
                  className="w-full border border-slate-200 rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-pink-500" /> Mood & Mental State
              </label>
              <select
                value={form.mood}
                onChange={e => setForm(f => ({ ...f, mood: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {MOOD_OPTIONS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            {[
              { key: 'meds', label: 'Medications', icon: '💊', placeholder: 'e.g. All morning meds taken at 8:00 AM. Evening Metformin taken with dinner.' },
              { key: 'meals', label: 'Meals & Hydration', icon: '🍽️', placeholder: 'e.g. Good appetite — full breakfast, light lunch. Drank ~1.5L water.' },
              { key: 'bp', label: 'Vitals (BP/Pulse)', icon: '❤️', placeholder: 'e.g. BP 128/82 mmHg at 9:00 AM. Pulse 72 bpm.' },
              { key: 'incidents', label: 'Incidents / Concerns', icon: '⚠️', placeholder: 'e.g. None. OR: Mild dizziness at 10 AM, resolved quickly.' },
              { key: 'notes', label: 'Handover Notes for Next Caregiver', icon: '📝', placeholder: 'e.g. Dinner in fridge. She wants to call Marcus tomorrow. Watch for appetite changes.' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{field.icon} {field.label}</label>
                <textarea
                  value={(form as Record<string, string>)[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Tags (comma-separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="e.g. good day, meds taken, follow up needed"
                className="w-full border border-slate-200 rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg transition-all shadow-md cursor-pointer"
              >
                Submit Handover Notes
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-3.5 rounded-xl border-2 border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Handover Entries */}
      <div className="space-y-4">
        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Handover History</h2>
        {entries.map(entry => (
          <div key={entry.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Entry Header */}
            <button
              type="button"
              onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="font-black text-slate-900">{entry.shift}</p>
                <p className="text-slate-500 text-sm mt-0.5">{entry.caregiver} · {entry.time}</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {entry.tags.map(tag => (
                    <span key={tag} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">{tag}</span>
                  ))}
                </div>
              </div>
              {expandedId === entry.id ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
            </button>

            {/* Entry Detail */}
            {expandedId === entry.id && (
              <div className="px-5 pb-5 space-y-3 border-t border-slate-100">
                {[
                  { icon: <Activity className="w-4 h-4 text-pink-500" />, label: 'Mood', value: entry.mood },
                  { icon: <span className="text-sm">💊</span>, label: 'Medications', value: entry.meds },
                  { icon: <Utensils className="w-4 h-4 text-green-500" />, label: 'Meals & Hydration', value: entry.meals },
                  { icon: <span className="text-sm">❤️</span>, label: 'Vitals', value: entry.bp },
                  { icon: <AlertCircle className="w-4 h-4 text-amber-500" />, label: 'Incidents', value: entry.incidents },
                  { icon: <ClipboardList className="w-4 h-4 text-blue-500" />, label: 'Handover Notes', value: entry.notes },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{item.label}</p>
                      <p className="text-slate-800 text-sm mt-0.5 leading-relaxed">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
