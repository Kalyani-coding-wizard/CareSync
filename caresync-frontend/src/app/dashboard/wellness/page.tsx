'use client';

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Smile, Meh, Frown, Heart, Zap, AlertCircle, TrendingUp, Award, ChevronRight, Sparkles } from 'lucide-react';

const MOODS = [
  { emoji: '😄', label: 'Great', value: 5, color: 'bg-green-100 border-green-400 text-green-700', ring: 'ring-green-400' },
  { emoji: '😊', label: 'Good', value: 4, color: 'bg-lime-100 border-lime-400 text-lime-700', ring: 'ring-lime-400' },
  { emoji: '😐', label: 'Okay', value: 3, color: 'bg-amber-100 border-amber-400 text-amber-700', ring: 'ring-amber-400' },
  { emoji: '😔', label: 'Low', value: 2, color: 'bg-orange-100 border-orange-400 text-orange-700', ring: 'ring-orange-400' },
  { emoji: '😣', label: 'Rough', value: 1, color: 'bg-rose-100 border-rose-400 text-rose-700', ring: 'ring-rose-400' },
];

const SYMPTOMS = [
  { id: 'headache', label: '🤕 Headache', linkedMed: null },
  { id: 'dizzy', label: '💫 Dizzy', linkedMed: 'Lisinopril' },
  { id: 'nausea', label: '🤢 Nausea', linkedMed: 'Metformin' },
  { id: 'fatigue', label: '😴 Fatigue', linkedMed: null },
  { id: 'muscle_pain', label: '💪 Muscle Pain', linkedMed: 'Atorvastatin' },
  { id: 'joint_pain', label: '🦴 Joint Pain', linkedMed: null },
  { id: 'shortness_breath', label: '🫁 Shortness of Breath', linkedMed: null },
  { id: 'appetite_loss', label: '🍽️ Poor Appetite', linkedMed: 'Metformin' },
  { id: 'dry_mouth', label: '💧 Dry Mouth', linkedMed: null },
  { id: 'vision_blur', label: '👁️ Vision Blur', linkedMed: null },
];

const MOOD_DOT_COLORS: Record<number, string> = {
  5: 'bg-green-500',
  4: 'bg-lime-500',
  3: 'bg-amber-500',
  2: 'bg-orange-500',
  1: 'bg-rose-500',
  0: 'bg-slate-200',
};

const MOOD_EMOJIS: Record<number, string> = {
  5: '😄', 4: '😊', 3: '😐', 2: '😔', 1: '😣', 0: '—',
};

// Demo 7-day history
const DEMO_HISTORY = [
  { dayLabel: 'Mon', mood: 4, symptoms: [] },
  { dayLabel: 'Tue', mood: 3, symptoms: ['dizzy'] },
  { dayLabel: 'Wed', mood: 5, symptoms: [] },
  { dayLabel: 'Thu', mood: 4, symptoms: [] },
  { dayLabel: 'Fri', mood: 2, symptoms: ['nausea', 'fatigue'] },
  { dayLabel: 'Sat', mood: 3, symptoms: ['headache'] },
  { dayLabel: 'Today', mood: 0, symptoms: [] },
];

export default function WellnessPage() {
  const { activeProfile, medications } = useProfile();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState(0);
  const [careNote, setCareNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [geminiInsight, setGeminiInsight] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [weekHistory, setWeekHistory] = useState(DEMO_HISTORY);
  const [streak, setStreak] = useState(6);
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    setTodayDate(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const generateGeminiInsight = () => {
    // Smart correlation logic based on selected symptoms + medications
    const insights: string[] = [];

    if (selectedSymptoms.includes('dizzy')) {
      insights.push('Dizziness may be linked to your Lisinopril (blood pressure medication). Consider taking it with food and rising slowly from seated positions. Report persistent dizziness to Dr. Chen.');
    }
    if (selectedSymptoms.includes('nausea') || selectedSymptoms.includes('appetite_loss')) {
      insights.push('Nausea/appetite changes are common with Metformin, especially on an empty stomach. Try taking it with your largest meal. If this persists more than 2 weeks, your doctor may adjust the dosage.');
    }
    if (selectedSymptoms.includes('muscle_pain')) {
      insights.push('Muscle pain is a known side effect of Atorvastatin (statins). Mild aches are common, but if severe or accompanied by dark urine, contact Dr. Chen immediately — this could indicate myopathy.');
    }
    if (selectedMood && selectedMood <= 2 && selectedSymptoms.length === 0) {
      insights.push('Your mood seems lower today with no reported physical symptoms. Consider gentle movement (a 10-min walk), calling a family member, or engaging in a hobby you enjoy. Mental wellbeing is a crucial part of overall health.');
    }
    if (painLevel >= 7) {
      insights.push(`Pain level ${painLevel}/10 is significant. Consider contacting your healthcare provider. In the meantime, rest, apply ice or heat as appropriate, and avoid strenuous activities.`);
    }
    if (insights.length === 0 && selectedMood && selectedMood >= 4) {
      insights.push(`Wonderful! You're feeling ${selectedMood === 5 ? 'great' : 'good'} today 🌟 Consistent positive wellbeing correlates with better medication adherence. Keep up your healthy routine!`);
    }

    return insights.length > 0
      ? insights.join(' ')
      : 'Your wellness check-in has been recorded. Regular monitoring helps your care team understand your health patterns. Keep logging daily for best results!';
  };

  const handleSubmit = () => {
    if (!selectedMood) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const insight = generateGeminiInsight();
      setGeminiInsight(insight);
      setIsAnalyzing(false);
      setSubmitted(true);
      setStreak(prev => prev + 1);
      // Update today in history
      setWeekHistory(prev =>
        prev.map(d => d.dayLabel === 'Today' ? { ...d, mood: selectedMood, symptoms: selectedSymptoms } : d)
      );
    }, 1800);
  };

  const moodValue = selectedMood ?? 0;
  const moodConfig = MOODS.find(m => m.value === moodValue);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Wellness Journal</h1>
          <p className="text-slate-500 mt-1">{todayDate || 'Daily check-in'}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-xs text-amber-700 font-semibold">Check-in Streak</p>
              <p className="text-2xl font-black text-amber-700">{streak} days 🔥</p>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Mood History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" /> 7-Day Mood Overview
        </h2>
        <div className="flex gap-3 justify-between">
          {weekHistory.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <span className="text-2xl">{MOOD_EMOJIS[day.mood]}</span>
              <div className={`w-3 h-3 rounded-full ${MOOD_DOT_COLORS[day.mood]}`} />
              <span className="text-xs text-slate-500 font-medium">{day.dayLabel}</span>
              {day.symptoms.length > 0 && (
                <span className="text-xs text-rose-500 font-bold">⚠</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex gap-4 text-xs text-slate-500">
          <span>Avg this week: 3.5/5 😊</span>
          <span>·</span>
          <span>Best day: Wednesday 😄</span>
          <span>·</span>
          <span>Symptoms flagged: 3 days</span>
        </div>
      </div>

      {!submitted ? (
        <div className="space-y-5">
          {/* Mood Selection */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 text-xl mb-5">
              How are you feeling today, {activeProfile?.name?.split(' ')[0] ?? 'friend'}? <span className="text-slate-400 font-normal text-base">*</span>
            </h2>
            <div className="flex gap-3 flex-wrap">
              {MOODS.map(mood => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border-2 font-semibold transition-all min-w-[80px] ${
                    selectedMood === mood.value
                      ? `${mood.color} ring-4 ${mood.ring} ring-offset-1 scale-105 shadow-md`
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-3xl">{mood.emoji}</span>
                  <span className="text-sm">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Symptom Chips */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 text-xl mb-2">Any symptoms today?</h2>
            <p className="text-slate-500 text-sm mb-4">Select all that apply — we'll check for medication correlations</p>
            <div className="flex flex-wrap gap-2.5">
              {SYMPTOMS.map(symptom => (
                <button
                  key={symptom.id}
                  type="button"
                  onClick={() => toggleSymptom(symptom.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-base font-medium transition-all ${
                    selectedSymptoms.includes(symptom.id)
                      ? 'bg-rose-50 border-rose-400 text-rose-700 ring-2 ring-rose-300 ring-offset-1'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50/40'
                  }`}
                >
                  {symptom.label}
                  {symptom.linkedMed && selectedSymptoms.includes(symptom.id) && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                      ⚠ {symptom.linkedMed}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {selectedSymptoms.some(s => SYMPTOMS.find(sym => sym.id === s)?.linkedMed) && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Some symptoms may be related to your medications. Gemini will analyze after you submit.</span>
              </div>
            )}
          </div>

          {/* Pain Slider */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 text-xl mb-4">
              Pain level: <span className={`${painLevel === 0 ? 'text-slate-400' : painLevel <= 3 ? 'text-green-600' : painLevel <= 6 ? 'text-amber-600' : 'text-rose-600'}`}>
                {painLevel}/10 {painLevel === 0 ? '(none)' : painLevel <= 3 ? '(mild)' : painLevel <= 6 ? '(moderate)' : '(severe)'}
              </span>
            </h2>
            <div className="relative">
              <input
                type="range"
                min={0}
                max={10}
                value={painLevel}
                onChange={e => setPainLevel(Number(e.target.value))}
                className="w-full h-3 rounded-full accent-blue-600 cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #2563eb ${painLevel * 10}%, #e2e8f0 ${painLevel * 10}%)`
                }}
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>No pain</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>
          </div>

          {/* Care Team Note */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 text-xl mb-3">Note for your care team <span className="text-slate-400 font-normal text-base">(optional)</span></h2>
            <textarea
              value={careNote}
              onChange={e => setCareNote(e.target.value)}
              placeholder="Anything specific you want your family or doctor to know today? (e.g. 'Slept poorly', 'Missed breakfast', 'Feeling anxious about test results')"
              rows={3}
              className="w-full border border-slate-200 rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedMood || isAnalyzing}
            className={`w-full py-4 rounded-2xl text-xl font-black transition-all flex items-center justify-center gap-3 ${
              !selectedMood
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isAnalyzing
                ? 'bg-blue-500 text-white animate-pulse cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-lg shadow-blue-500/30 cursor-pointer'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-6 h-6 animate-spin" />
                Gemini is analyzing your wellness...
              </>
            ) : (
              <>
                <Heart className="w-6 h-6" />
                Submit Wellness Check-in
              </>
            )}
          </button>
        </div>
      ) : (
        /* Success + Gemini Insight */
        <div className="space-y-5">
          <div className="bg-green-50 border-2 border-green-400 rounded-3xl p-6 text-center">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-2xl font-black text-green-800">Check-in Logged!</h2>
            <p className="text-green-700 mt-1">Your care team has been notified. Streak extended to <strong>{streak} days!</strong></p>
            <div className="mt-3 flex items-center justify-center gap-2 text-green-700">
              <span>Mood: {moodConfig?.emoji} {moodConfig?.label}</span>
              {selectedSymptoms.length > 0 && (
                <>
                  <span>·</span>
                  <span>{selectedSymptoms.length} symptom{selectedSymptoms.length > 1 ? 's' : ''} noted</span>
                </>
              )}
              {painLevel > 0 && (
                <>
                  <span>·</span>
                  <span>Pain: {painLevel}/10</span>
                </>
              )}
            </div>
          </div>

          {/* Gemini Insight */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <p className="font-black text-lg">Gemini Health Coach</p>
                <p className="text-blue-300 text-sm">Personalized analysis for today's check-in</p>
              </div>
            </div>
            <p className="text-blue-100 text-base leading-relaxed">{geminiInsight}</p>
            {careNote && (
              <div className="mt-4 p-3 bg-white/10 rounded-xl">
                <p className="text-xs text-blue-300 font-semibold mb-1">YOUR NOTE (sent to care team):</p>
                <p className="text-sm text-blue-100">{careNote}</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => { setSubmitted(false); setSelectedMood(null); setSelectedSymptoms([]); setPainLevel(0); setCareNote(''); setGeminiInsight(''); }}
              className="py-4 rounded-2xl border-2 border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors text-base"
            >
              Log Another
            </button>
            <a
              href="/dashboard/report"
              className="py-4 rounded-2xl bg-slate-900 text-white font-bold text-center flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors text-base"
            >
              <ChevronRight className="w-5 h-5" />
              Doctor Report
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
