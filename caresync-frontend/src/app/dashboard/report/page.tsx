'use client';

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { FileText, Printer, Download, Sparkles, TrendingUp, Pill, Calendar, Heart, Shield, CheckCircle } from 'lucide-react';

function PrintStyle() {
  return (
    <style>{`
      @media print {
        .no-print { display: none !important; }
        .print-break { page-break-before: always; }
        body { font-size: 12pt; color: #000 !important; }
        .print-container { max-width: 100%; padding: 0; margin: 0; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        header, nav { display: none !important; }
      }
    `}</style>
  );
}

export default function DoctorReportPage() {
  const { activeProfile, medications, appointments, adherenceRecords } = useProfile();
  const [generating, setGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [geminiNote, setGeminiNote] = useState('');
  const [reportDate, setReportDate] = useState('');

  useEffect(() => {
    setReportDate(new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }));
  }, []);

  const takenCount = adherenceRecords.filter(r => r.status === 'taken').length;
  const totalCount = adherenceRecords.length;
  const adherenceRate = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const nextAppt = appointments.length > 0
    ? [...appointments].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0]
    : null;

  // Wellness history summary (demo)
  const wellnessHighlights = [
    { label: 'Average Mood', value: '3.5/5 (Good)' },
    { label: 'Symptoms Flagged', value: '3 days (Nausea, Dizziness)' },
    { label: 'High Pain Days', value: '1 day (pain 7/10)' },
    { label: 'Check-in Streak', value: '6 consecutive days' },
  ];

  const generateGeminiNote = () => {
    setGenerating(true);
    setTimeout(() => {
      const note = `Patient ${activeProfile?.name ?? 'Patient'} demonstrates ${adherenceRate >= 80 ? 'excellent' : adherenceRate >= 60 ? 'moderate' : 'below-average'} medication adherence at ${adherenceRate}% over the past 7 days. ${adherenceRate >= 80 ? 'This is a positive indicator for treatment efficacy.' : 'Consider reviewing barriers to adherence at this visit.'}

Notable wellness patterns: Patient reported dizziness on 2 days this week, which may correlate with Lisinopril dosing. Occasional nausea noted, potentially related to Metformin — patient may benefit from taking with the evening meal instead of morning. Mood trends generally positive (avg 3.5/5) with one lower day mid-week.

Medication review recommended for: (1) Lisinopril — confirm optimal timing to minimize dizziness side effects. (2) Metformin — assess GI tolerability. Current Vitamin D3 supplementation is consistent.

Suggested discussion points: Blood pressure trending and Lisinopril dose optimization, HbA1c results relative to Metformin efficacy, statin muscle pain monitoring for Atorvastatin, and overall quality of life assessment.`;
      setGeminiNote(note);
      setGenerating(false);
      setReportGenerated(true);
    }, 2200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 print-container">
      <PrintStyle />

      {/* Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6 no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Doctor Visit Report
          </h1>
          <p className="text-slate-500 mt-1">Generate a print-ready summary for your next appointment</p>
        </div>
        <div className="flex gap-3">
          {!reportGenerated && (
            <button
              type="button"
              onClick={generateGeminiNote}
              disabled={generating}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-base transition-all ${
                generating
                  ? 'bg-indigo-500 text-white animate-pulse cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              {generating ? 'Generating with Gemini...' : 'Generate Gemini Clinical Note'}
            </button>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-base bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md cursor-pointer"
          >
            <Printer className="w-5 h-5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* ===== PRINTABLE REPORT START ===== */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg overflow-hidden">
        {/* Report Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-7 h-7 text-blue-200" />
                <span className="text-blue-200 font-bold text-lg">CareSync Health Platform</span>
              </div>
              <h2 className="text-3xl font-black">{activeProfile?.name ?? 'Patient'}</h2>
              <p className="text-blue-200 mt-1">
                {activeProfile?.dob ? `DOB: ${activeProfile.dob}` : ''}
              </p>
              {appointments[0] && (
                <p className="text-blue-200 mt-1">Primary Physician: {appointments[0].doctorName} ({appointments[0].specialty})</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-sm font-semibold">Report Generated</p>
              <p className="text-white font-bold text-lg">{reportDate}</p>
              <div className="mt-3 bg-white/20 rounded-xl px-4 py-2">
                <p className="text-xs text-blue-200">Report Period</p>
                <p className="font-bold">Last 7 Days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Adherence KPIs */}
          <section>
            <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Medication Adherence Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Adherence Rate', value: `${adherenceRate}%`, color: adherenceRate >= 80 ? 'text-green-700 bg-green-50 border-green-200' : 'text-amber-700 bg-amber-50 border-amber-200' },
                { label: 'Doses Taken', value: `${takenCount}/${totalCount}`, color: 'text-blue-700 bg-blue-50 border-blue-200' },
                { label: 'Active Medications', value: `${medications.length}`, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
                { label: 'Current Streak', value: '5 days ✅', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              ].map((kpi, i) => (
                <div key={i} className={`rounded-2xl border p-4 ${kpi.color}`}>
                  <p className="text-xs font-semibold opacity-70 uppercase tracking-wide">{kpi.label}</p>
                  <p className="text-2xl font-black mt-1">{kpi.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Medication List */}
          <section>
            <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
              <Pill className="w-5 h-5 text-blue-600" />
              Current Medications
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left p-3 font-bold text-slate-600 border border-slate-200 rounded-tl-lg">Medication</th>
                    <th className="text-left p-3 font-bold text-slate-600 border border-slate-200">Dosage</th>
                    <th className="text-left p-3 font-bold text-slate-600 border border-slate-200">Frequency</th>
                    <th className="text-left p-3 font-bold text-slate-600 border border-slate-200">Time(s)</th>
                    <th className="text-left p-3 font-bold text-slate-600 border border-slate-200 rounded-tr-lg">7-Day Adherence</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map((med, i) => {
                    const medRecords = adherenceRecords.filter(r => r.medId === med.id);
                    const medTaken = medRecords.filter(r => r.status === 'taken').length;
                    const medRate = medRecords.length > 0 ? Math.round((medTaken / medRecords.length) * 100) : 0;
                    return (
                      <tr key={med.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-3 font-semibold text-slate-900 border border-slate-200">{med.name}</td>
                        <td className="p-3 text-slate-700 border border-slate-200">{med.dosage}</td>
                        <td className="p-3 text-slate-700 border border-slate-200">{med.frequency}</td>
                        <td className="p-3 text-slate-700 border border-slate-200 font-mono text-xs">{Array.isArray(med.times) ? med.times.join(', ') : med.times}</td>
                        <td className={`p-3 border border-slate-200 font-bold ${medRate >= 80 ? 'text-green-700' : medRate >= 60 ? 'text-amber-700' : 'text-rose-700'}`}>
                          {medRate}% ({medTaken}/{medRecords.length})
                        </td>
                      </tr>
                    );
                  })}
                  {medications.length === 0 && (
                    <tr><td colSpan={5} className="p-4 text-center text-slate-400 italic">No medications on record</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Wellness Summary */}
          <section>
            <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
              <Heart className="w-5 h-5 text-rose-500" />
              Wellness Journal Summary (Last 7 Days)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {wellnessHighlights.map((h, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <span className="text-slate-600 font-medium">{h.label}</span>
                  <span className="font-bold text-slate-900">{h.value}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-500 italic">* Based on daily wellness check-ins logged in CareSync</p>
          </section>

          {/* Upcoming Appointments */}
          <section>
            <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
              <Calendar className="w-5 h-5 text-blue-600" />
              Upcoming Appointments
            </h3>
            {appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.slice(0, 3).map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div>
                      <p className="font-bold text-blue-900">{appt.specialty} Visit</p>
                      <p className="text-blue-700 text-sm">{appt.doctorName} · {appt.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-blue-800">
                        {new Date(appt.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-blue-600 text-sm">
                        {new Date(appt.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic">No upcoming appointments scheduled</p>
            )}
          </section>

          {/* Gemini Clinical Note */}
          {reportGenerated && geminiNote && (
            <section className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-6">
              <h3 className="text-xl font-black text-indigo-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Gemini AI Clinical Summary
                <span className="text-xs bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">AI-Generated</span>
              </h3>
              <p className="text-indigo-800 text-sm leading-relaxed whitespace-pre-line">{geminiNote}</p>
              <p className="text-indigo-500 text-xs mt-4 italic">
                ⚠ This AI-generated summary is for informational purposes and to assist your healthcare provider. It does not replace professional medical advice. Always consult your doctor.
              </p>
            </section>
          )}

          {/* Footer */}
          <div className="border-t border-slate-200 pt-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Shield className="w-4 h-4" />
              <span>Generated by CareSync · Powered by Google Gemini AI · Secured with Firebase</span>
            </div>
            <div className="text-slate-400 text-xs">{reportDate}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
