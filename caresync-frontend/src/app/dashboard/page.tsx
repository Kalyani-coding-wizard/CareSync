'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProfile, AdherenceRecord } from '@/contexts/ProfileContext';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Sparkles,
  Flame,
  ArrowRight,
  Shield,
  Pill,
  Send,
  MapPin,
  Bot,
  Camera,
  Check,
  Undo2,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    activeProfile,
    adherenceRecords,
    markAdherence,
    appointments,
    medications,
  } = useProfile();

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [currentDateStr, setCurrentDateStr] = useState('Sunday, November 15, 2026');

  React.useEffect(() => {
    setCurrentDateStr(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    );
  }, []);

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleTake = async (record: AdherenceRecord) => {
    await markAdherence(record.id, 'taken');
    showToast(`✅ Marked ${record.medName} (${record.dosage}) as Taken! Caregivers notified.`);
  };

  const handleMiss = async (record: AdherenceRecord) => {
    await markAdherence(record.id, 'missed');
    showToast(`⚠️ Marked ${record.medName} as Missed. Escalation alert logged.`);
  };

  // Group adherence records by time period
  const morningRecords = adherenceRecords.filter((r) => {
    const hour = parseInt(r.scheduledTime.split(':')[0], 10);
    return hour < 12;
  });

  const afternoonRecords = adherenceRecords.filter((r) => {
    const hour = parseInt(r.scheduledTime.split(':')[0], 10);
    return hour >= 12 && hour < 17;
  });

  const eveningRecords = adherenceRecords.filter((r) => {
    const hour = parseInt(r.scheduledTime.split(':')[0], 10);
    return hour >= 17;
  });

  const nextAppointment = appointments[0];

  const takenCount = adherenceRecords.filter((r) => r.status === 'taken').length;
  const totalCount = adherenceRecords.length;
  const progressPercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="font-semibold text-base">{notificationMsg}</span>
        </div>
      )}

      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-sm font-semibold mb-3 backdrop-blur-xs">
              <Calendar className="w-4 h-4" />
              <span>{currentDateStr}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Good day, {activeProfile?.name || 'Friend'}! 👋
            </h1>
            <p className="text-blue-100 text-lg sm:text-xl mt-2 max-w-xl font-medium">
              You have completed <span className="font-bold underline decoration-amber-400">{takenCount} of {totalCount}</span> doses today.
              Keep up the wonderful routine!
            </p>
          </div>

          {/* Adherence Streak Badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 flex items-center gap-4 min-w-[220px]">
            <div className="w-14 h-14 bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center font-black text-2xl shadow-md">
              <Flame className="w-8 h-8 text-rose-600" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-blue-200 font-bold">Adherence Streak</div>
              <div className="text-2xl font-black">14 Days</div>
              <div className="text-xs text-blue-100 font-semibold">{progressPercent}% on-time this week</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Main Section: Today's Routine vs Sidebar Widgets */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Medication Schedule (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <Pill className="w-7 h-7 text-blue-600" />
                Today&apos;s Medication Routine
              </h2>
              <p className="text-base text-slate-600 mt-0.5">
                Large-button tracking designed for ease of use &amp; immediate caregiver sync.
              </p>
            </div>
            <Link
              href="/dashboard/medications"
              className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Manage Meds</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Routine Blocks */}
          <div className="space-y-6">
            {/* Morning Section */}
            {morningRecords.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-lg mb-4">
                  <Clock className="w-5 h-5" />
                  <span>Morning Doses (8:00 AM)</span>
                </div>
                <div className="space-y-4">
                  {morningRecords.map((rec) => (
                    <ScheduleCard
                      key={rec.id}
                      record={rec}
                      onTake={() => handleTake(rec)}
                      onMiss={() => handleMiss(rec)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Afternoon Section */}
            {afternoonRecords.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-lg mb-4">
                  <Clock className="w-5 h-5" />
                  <span>Afternoon Doses (12:30 PM - 1:00 PM)</span>
                </div>
                <div className="space-y-4">
                  {afternoonRecords.map((rec) => (
                    <ScheduleCard
                      key={rec.id}
                      record={rec}
                      onTake={() => handleTake(rec)}
                      onMiss={() => handleMiss(rec)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Evening Section */}
            {eveningRecords.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-lg mb-4">
                  <Clock className="w-5 h-5" />
                  <span>Evening &amp; Bedtime Doses (8:00 PM - 9:00 PM)</span>
                </div>
                <div className="space-y-4">
                  {eveningRecords.map((rec) => (
                    <ScheduleCard
                      key={rec.id}
                      record={rec}
                      onTake={() => handleTake(rec)}
                      onMiss={() => handleMiss(rec)}
                    />
                  ))}
                </div>
              </div>
            )}

            {adherenceRecords.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
                <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-slate-700">No Medications Scheduled Today</h3>
                <p className="text-slate-500 mt-1 mb-4">Add your daily prescriptions to begin smart tracking.</p>
                <Link
                  href="/dashboard/medications"
                  className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 inline-block"
                >
                  + Add Medication
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Key Highlights & AI Quick Actions */}
        <div className="space-y-6">
          {/* Next Appointment Card */}
          {nextAppointment && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
                  <Calendar className="w-5 h-5" />
                  <span>Upcoming Appointment</span>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Email Alert Set
                </span>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 mb-4">
                <div className="text-xl font-black text-slate-900">{nextAppointment.doctorName}</div>
                <div className="text-sm font-semibold text-blue-700 mt-0.5">{nextAppointment.specialty}</div>
                <div className="text-sm text-slate-600 mt-2 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {new Date(nextAppointment.dateTime).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
                <div className="text-sm text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {nextAppointment.location}
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Automated reminder emails will be sent 24 hours and 1 hour before appointment time to all family contacts.
              </p>

              <Link
                href="/dashboard/appointments"
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
              >
                <span>View All Appointments</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Passcode Sharing Card (Slide 13 Core Requirement) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-base mb-2">
              <Shield className="w-5 h-5" />
              <span>Passcode-Based Care Sharing</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Authorize caretakers and family members to view and manage {activeProfile?.name}&apos;s medication routine securely.
            </p>
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-700 flex items-center justify-between mb-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Care Circle Passcode</span>
                <div className="text-3xl font-mono font-black text-amber-400 tracking-wider">
                  {activeProfile?.passcode}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(activeProfile?.passcode || '');
                  showToast('📋 Passcode copied to clipboard!');
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                Copy Code
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Family members can join by visiting{' '}
              <span className="text-teal-300 font-mono">/auth/join</span> and entering this 6-digit code.
            </p>
          </div>

          {/* Gemini AI Assistant Card */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-3xl p-6">
            <div className="flex items-center gap-2 text-purple-700 font-bold text-lg mb-2">
              <Bot className="w-6 h-6" />
              <span>Gemini Health Assistant</span>
            </div>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Ask questions about medication side effects, food interactions, or refill advice in natural language.
            </p>
            <div className="space-y-2">
              <Link
                href="/dashboard/ai"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-between text-sm shadow-sm transition-all"
              >
                <span>Ask Gemini AI Assistant</span>
                <Sparkles className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/medications"
                className="w-full bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 font-bold py-3 px-4 rounded-xl flex items-center justify-between text-sm transition-all"
              >
                <span>Check Drug Interactions</span>
                <Pill className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ScheduleCardProps {
  record: AdherenceRecord;
  onTake: () => void;
  onMiss: () => void;
}

function ScheduleCard({ record, onTake, onMiss }: ScheduleCardProps) {
  const isTaken = record.status === 'taken';
  const isMissed = record.status === 'missed';

  return (
    <div
      className={`p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isTaken
          ? 'bg-emerald-50/70 border-emerald-300 text-slate-900'
          : isMissed
          ? 'bg-rose-50/70 border-rose-300 text-slate-900'
          : 'bg-slate-50 border-slate-200 hover:border-blue-400'
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-slate-900">{record.medName}</span>
          <span className="text-sm bg-white border border-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-lg shadow-2xs">
            {record.dosage}
          </span>
          <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
            ⏰ {record.scheduledTime}
          </span>
        </div>
        <p className="text-sm text-slate-600 font-medium">{record.notes || 'Take as prescribed.'}</p>
      </div>

      {/* Big Action Buttons */}
      <div className="flex items-center gap-2.5">
        {isTaken ? (
          <div className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-black px-5 py-3 rounded-xl text-base shadow-sm">
            <Check className="w-5 h-5 stroke-[3]" />
            <span>Taken</span>
          </div>
        ) : isMissed ? (
          <div className="inline-flex items-center gap-1.5 bg-rose-600 text-white font-black px-5 py-3 rounded-xl text-base shadow-sm">
            <AlertCircle className="w-5 h-5" />
            <span>Missed</span>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onTake}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold px-6 py-3.5 rounded-xl text-lg shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>Take Dose</span>
            </button>
            <button
              type="button"
              onClick={onMiss}
              className="bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 font-bold px-4 py-3.5 rounded-xl text-base transition-colors cursor-pointer"
            >
              Skip
            </button>
          </>
        )}
      </div>
    </div>
  );
}
