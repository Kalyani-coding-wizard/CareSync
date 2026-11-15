'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Activity, Send, Heart, AlertTriangle, CheckCircle, Pill, Clock, MessageCircle, User, Users } from 'lucide-react';

type FeedEventType = 'taken' | 'missed' | 'sos' | 'note' | 'milestone' | 'joined' | 'appointment' | 'wellness';

interface FeedEvent {
  id: string;
  type: FeedEventType;
  author: string;
  authorRole: string;
  authorInitials: string;
  content: string;
  time: string;
  relativeTime: string;
  details?: string;
}

const EVENT_STYLES: Record<FeedEventType, { border: string; bg: string; icon: React.ReactNode; badge: string }> = {
  taken: {
    border: 'border-l-green-500',
    bg: 'bg-green-50',
    icon: <CheckCircle className="w-4 h-4 text-green-600" />,
    badge: 'bg-green-100 text-green-700',
  },
  missed: {
    border: 'border-l-rose-500',
    bg: 'bg-rose-50',
    icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
    badge: 'bg-rose-100 text-rose-700',
  },
  sos: {
    border: 'border-l-red-600',
    bg: 'bg-red-50',
    icon: <AlertTriangle className="w-4 h-4 text-red-700" />,
    badge: 'bg-red-200 text-red-800',
  },
  note: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50',
    icon: <MessageCircle className="w-4 h-4 text-blue-600" />,
    badge: 'bg-blue-100 text-blue-700',
  },
  milestone: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50',
    icon: <span className="text-sm">🏆</span>,
    badge: 'bg-amber-100 text-amber-700',
  },
  joined: {
    border: 'border-l-purple-500',
    bg: 'bg-purple-50',
    icon: <Users className="w-4 h-4 text-purple-600" />,
    badge: 'bg-purple-100 text-purple-700',
  },
  appointment: {
    border: 'border-l-indigo-500',
    bg: 'bg-indigo-50',
    icon: <Clock className="w-4 h-4 text-indigo-600" />,
    badge: 'bg-indigo-100 text-indigo-700',
  },
  wellness: {
    border: 'border-l-pink-500',
    bg: 'bg-pink-50',
    icon: <Heart className="w-4 h-4 text-pink-600" />,
    badge: 'bg-pink-100 text-pink-700',
  },
};

const DEMO_MEMBERS = [
  { name: 'Eleanor', initials: 'EV', online: true, role: 'Patient', color: 'bg-blue-500' },
  { name: 'Sarah', initials: 'SV', online: true, role: 'Daughter', color: 'bg-green-500' },
  { name: 'Marcus', initials: 'MV', online: false, role: 'Son', color: 'bg-purple-500' },
  { name: 'Dr. Chen', initials: 'JC', online: false, role: 'Doctor', color: 'bg-rose-500' },
  { name: 'CareBot', initials: '🤖', online: true, role: 'CareSync AI', color: 'bg-amber-500' },
];

const INITIAL_FEED: FeedEvent[] = [
  {
    id: '1',
    type: 'milestone',
    author: 'CareSync',
    authorRole: 'System',
    authorInitials: '🏆',
    content: '🎉 Eleanor just achieved a 7-day medication streak! This is fantastic progress.',
    time: '9:00 AM',
    relativeTime: '2h ago',
    details: 'Consecutive days with 100% medication adherence',
  },
  {
    id: '2',
    type: 'taken',
    author: 'Eleanor',
    authorRole: 'Patient',
    authorInitials: 'EV',
    content: 'Took morning medications: Metformin 500mg + Lisinopril 10mg',
    time: '8:03 AM',
    relativeTime: '3h ago',
    details: 'All 3 morning medications confirmed ✅',
  },
  {
    id: '3',
    type: 'wellness',
    author: 'Eleanor',
    authorRole: 'Patient',
    authorInitials: 'EV',
    content: 'Morning wellness check-in: Feeling 😊 Good today. Slight dizziness noted.',
    time: '7:45 AM',
    relativeTime: '3h ago',
    details: 'Gemini flagged possible Lisinopril correlation',
  },
  {
    id: '4',
    type: 'note',
    author: 'Sarah',
    authorRole: 'Daughter',
    authorInitials: 'SV',
    content: "Dropping by for lunch today around 12:30 🍲 Mom, don't forget to have your Metformin WITH the meal!",
    time: 'Yesterday 8:12 PM',
    relativeTime: '14h ago',
  },
  {
    id: '5',
    type: 'appointment',
    author: 'CareSync',
    authorRole: 'System',
    authorInitials: '🤖',
    content: 'Reminder: Cardiology check-up with Dr. Chen is in 3 days (Nov 18, 10:30 AM)',
    time: 'Yesterday 7:00 PM',
    relativeTime: '15h ago',
    details: 'Email reminders sent to Eleanor, Sarah, and Marcus',
  },
  {
    id: '6',
    type: 'missed',
    author: 'CareSync',
    authorRole: 'AI Monitor',
    authorInitials: '🤖',
    content: "Eleanor missed her 6:00 PM Atorvastatin dose (45 min window expired). Sarah & Marcus notified.",
    time: 'Yesterday 6:48 PM',
    relativeTime: '16h ago',
    details: 'Smart escalation activated — caregiver notified at step 2',
  },
  {
    id: '7',
    type: 'note',
    author: 'Marcus',
    authorRole: 'Son',
    authorInitials: 'MV',
    content: "Hey Mom, I called — she said she was napping and forgot. I'll set up an extra alarm for her! She's doing great otherwise 💙",
    time: 'Yesterday 7:15 PM',
    relativeTime: '15h ago',
  },
  {
    id: '8',
    type: 'taken',
    author: 'Eleanor',
    authorRole: 'Patient',
    authorInitials: 'EV',
    content: 'Took evening Atorvastatin 40mg (delayed — taken at 7:22 PM)',
    time: 'Yesterday 7:22 PM',
    relativeTime: '14h ago',
    details: 'Late dose logged. Caregiver team notified.',
  },
  {
    id: '9',
    type: 'joined',
    author: 'Dr. Chen',
    authorRole: 'Primary Physician',
    authorInitials: 'JC',
    content: "Dr. Jennifer Chen joined Eleanor's Care Circle! She can now receive health summaries and emergency alerts.",
    time: '2 days ago',
    relativeTime: '2 days ago',
    details: 'Role: Primary Physician · Receives: Adherence reports, SOS alerts, Weekly summaries',
  },
  {
    id: '10',
    type: 'sos',
    author: 'CareSync',
    authorRole: 'Emergency System',
    authorInitials: '🚨',
    content: "⚠️ SOS Alert was triggered by Eleanor 3 days ago. All 4 contacts were notified. Eleanor confirmed she was okay after a brief dizzy spell.",
    time: '3 days ago',
    relativeTime: '3 days ago',
    details: 'Response time: Sarah responded in 4 min, Marcus in 12 min. No medical intervention required.',
  },
];

export default function CareFeedPage() {
  const { activeProfile } = useProfile();
  const [feed, setFeed] = useState<FeedEvent[]>(INITIAL_FEED);
  const [noteText, setNoteText] = useState('');
  const [sending, setSending] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
  }, []);

  const handlePostNote = () => {
    if (!noteText.trim()) return;
    setSending(true);
    setTimeout(() => {
      const newEvent: FeedEvent = {
        id: Date.now().toString(),
        type: 'note',
        author: activeProfile?.name?.split(' ')[0] ?? 'You',
        authorRole: 'Care Team',
        authorInitials: (activeProfile?.name?.split(' ').map(n => n[0]).join('') ?? 'YO').slice(0, 2),
        content: noteText,
        time: currentTime || 'Now',
        relativeTime: 'just now',
      };
      setFeed(prev => [newEvent, ...prev]);
      setNoteText('');
      setSending(false);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          Care Circle Feed
        </h1>
        <p className="text-slate-500 mt-1">Real-time activity stream for {activeProfile?.name ?? 'your loved one'}'s care team</p>
      </div>

      {/* Care Circle Members Row */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-4">Care Circle Members</h2>
        <div className="flex gap-4 flex-wrap">
          {DEMO_MEMBERS.map((member) => (
            <div key={member.name} className="flex flex-col items-center gap-1.5">
              <div className="relative">
                <div className={`w-12 h-12 ${member.color} rounded-full flex items-center justify-center text-white font-black text-sm`}>
                  {member.initials}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${member.online ? 'bg-green-500' : 'bg-slate-400'}`} />
              </div>
              <span className="text-xs font-semibold text-slate-700">{member.name}</span>
              <span className="text-xs text-slate-400">{member.role}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Online (3)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> Offline (2)</span>
          <span className="ml-auto text-blue-600 font-semibold cursor-pointer hover:underline">+ Invite Member</span>
        </div>
      </div>

      {/* Post a Care Note */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-3">Post a Care Note</h2>
        <div className="flex gap-3 items-end">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0">
            {(activeProfile?.name?.split(' ').map(n => n[0]).join('') ?? 'YO').slice(0, 2)}
          </div>
          <div className="flex-1">
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handlePostNote(); }}
              placeholder="Share an update, observation, or message with the care team... (Ctrl+Enter to send)"
              rows={2}
              className="w-full border border-slate-200 rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-slate-700 placeholder-slate-400"
            />
          </div>
          <button
            type="button"
            onClick={handlePostNote}
            disabled={!noteText.trim() || sending}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all flex-shrink-0 ${
              !noteText.trim() || sending
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md'
            }`}
          >
            <Send className="w-4 h-4" />
            {sending ? '...' : 'Post'}
          </button>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-3">
        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Recent Activity</h2>
        {feed.map((event) => {
          const style = EVENT_STYLES[event.type];
          return (
            <div
              key={event.id}
              className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${style.border} shadow-sm overflow-hidden`}
            >
              <div className={`${style.bg} px-4 py-3`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-sm font-black">
                      {event.authorInitials}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-slate-900">{event.author}</span>
                      <span className="text-xs text-slate-500">{event.authorRole}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${style.badge}`}>
                        {style.icon}
                        <span className="ml-1 capitalize">{event.type}</span>
                      </span>
                      <span className="text-xs text-slate-400 ml-auto">{event.relativeTime}</span>
                    </div>
                    <p className="text-slate-800 text-sm leading-relaxed">{event.content}</p>
                    {event.details && (
                      <p className="text-slate-500 text-xs mt-1.5 italic">{event.details}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={feedEndRef} />
        <div className="text-center py-4 text-slate-400 text-sm">
          <p>Care feed goes back 30 days · <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Load older events</span></p>
        </div>
      </div>
    </div>
  );
}
