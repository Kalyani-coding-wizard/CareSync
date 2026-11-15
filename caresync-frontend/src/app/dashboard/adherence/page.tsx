'use client';

import React, { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import {
  BarChart3,
  Flame,
  Award,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Printer,
  Calendar,
} from 'lucide-react';

export default function AdherencePage() {
  const { activeProfile, adherenceRecords, medications } = useProfile();
  const [printSuccess, setPrintSuccess] = useState(false);

  // 7-day adherence data
  const weekDays = [
    { day: 'Mon', score: 100, taken: 4, total: 4 },
    { day: 'Tue', score: 100, taken: 4, total: 4 },
    { day: 'Wed', score: 75, taken: 3, total: 4 },
    { day: 'Thu', score: 100, taken: 4, total: 4 },
    { day: 'Fri', score: 100, taken: 4, total: 4 },
    { day: 'Sat', score: 100, taken: 4, total: 4 },
    { day: 'Sun', score: 100, taken: 4, total: 4 },
  ];

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Adherence Analytics &amp; Reports
          </h1>
          <p className="text-slate-600 text-lg mt-1">
            Tracking compliance history, streaks, and physician-ready reports for {activeProfile?.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-2xl shadow-sm flex items-center gap-2 text-base transition-colors self-start sm:self-auto"
        >
          <Printer className="w-5 h-5" />
          <span>Print Doctor Report</span>
        </button>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xs flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-slate-400">30-Day Adherence</div>
            <div className="text-3xl font-black text-slate-900">94.2%</div>
            <div className="text-xs text-emerald-600 font-bold">Excellent compliance</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xs flex items-center gap-5">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center font-black">
            <Flame className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-slate-400">Current Streak</div>
            <div className="text-3xl font-black text-slate-900">14 Days</div>
            <div className="text-xs text-slate-500 font-semibold">Goal: 21 Days</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xs flex items-center gap-5">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-slate-400">Doses Taken</div>
            <div className="text-3xl font-black text-slate-900">112 / 118</div>
            <div className="text-xs text-slate-500 font-semibold">Past 30 days</div>
          </div>
        </div>
      </div>

      {/* Gemini AI Adherence Coach Insight Banner */}
      <div className="bg-gradient-to-r from-teal-50 via-blue-50 to-indigo-50 border-2 border-teal-200 rounded-3xl p-6 sm:p-7 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-teal-600 to-blue-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-teal-800 bg-teal-200/60 px-2.5 py-0.5 rounded-full">
                Gemini Health Coach AI
              </span>
              <span className="text-xs text-slate-500 font-medium">Updated today at 8:15 AM</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Incredible consistency with your morning routine!
            </h3>
            <p className="text-base text-slate-700 leading-relaxed font-medium">
              &quot;Eleanor has achieved a <strong>14-day unbroken streak</strong> on Metformin and Lisinopril. Data indicates morning doses are taken within 12 minutes of scheduled time. We noticed Wednesday afternoon dose was slightly delayed—consider setting a companion sound chime on the tablet at 12:30 PM.&quot;
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Visual Adherence Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Weekly Adherence Rate</h2>
            <p className="text-sm text-slate-500 font-medium">Daily compliance percentages across all prescribed medications</p>
          </div>
          <span className="text-xs bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full">
            Target: &gt;90%
          </span>
        </div>

        {/* Custom Responsive Bar Chart */}
        <div className="grid grid-cols-7 gap-3 sm:gap-6 pt-6 pb-2 items-end min-h-[220px]">
          {weekDays.map((item) => (
            <div key={item.day} className="flex flex-col items-center gap-2">
              <div className="text-xs font-bold text-slate-500">{item.score}%</div>
              <div className="w-full bg-slate-100 rounded-2xl h-44 flex flex-col justify-end p-1.5 relative overflow-hidden">
                <div
                  style={{ height: `${item.score}%` }}
                  className={`w-full rounded-xl transition-all duration-700 ${
                    item.score === 100
                      ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-t from-amber-500 to-amber-400'
                  }`}
                />
              </div>
              <span className="text-sm font-black text-slate-800">{item.day}</span>
              <span className="text-xs font-medium text-slate-400">{item.taken}/{item.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Time-of-Day Compliance & Escalation History */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Time of Day Breakdown */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xs">
          <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Time of Day Compliance
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                <span>Morning Routine (8:00 AM)</span>
                <span className="text-emerald-600 font-black">98% On-Time</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                <span>Afternoon Routine (1:00 PM)</span>
                <span className="text-blue-600 font-black">91% On-Time</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '91%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                <span>Evening Routine (8:00 PM)</span>
                <span className="text-purple-600 font-black">93% On-Time</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '93%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Care Circle Sync Status */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xs">
          <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            Care Circle Notification Log
          </h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-emerald-950">Morning Metformin &amp; Lisinopril Taken</div>
                <div className="text-xs text-emerald-700">Logged at 8:07 AM • Verified by Patient</div>
              </div>
              <span className="text-xs font-bold text-emerald-700">Sync: OK</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Dr. Jenkins Appointment 24h Email Alert</div>
                <div className="text-xs text-slate-500">Sent to 3 authorized family members</div>
              </div>
              <span className="text-xs font-bold text-blue-600">Email Dispatched</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Refill Alert: Metformin (8 pills left)</div>
                <div className="text-xs text-slate-500">Caregiver notified for pharmacy pickup</div>
              </div>
              <span className="text-xs font-bold text-amber-600">Alert Sent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
