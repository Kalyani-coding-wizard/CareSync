'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Bot, Send, Volume2, VolumeX, Sparkles, Utensils, Pill, MessageSquare, AlertTriangle, CheckCircle, ChevronRight, Loader } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── MEAL SCANNER DATA ────────────────────────────────────────────────
const QUICK_MEALS = [
  { name: 'Grapefruit', emoji: '🍊', risk: 'high', detail: 'Grapefruit contains furanocoumarins that BLOCK CYP3A4 enzymes, causing dangerous blood level spikes in Atorvastatin (statins). This can cause muscle damage (rhabdomyolysis). Avoid grapefruit and grapefruit juice entirely while on your current medications.', severity: 'danger' },
  { name: 'Leafy Greens (Spinach)', emoji: '🥬', risk: 'moderate', detail: 'Spinach, kale, and other leafy greens are high in Vitamin K. If you were on blood thinners (warfarin), this could reduce effectiveness. Your current medications (Metformin, Lisinopril, Atorvastatin) are unaffected — enjoy leafy greens freely! Great for blood pressure too.', severity: 'safe' },
  { name: 'Banana', emoji: '🍌', risk: 'moderate', detail: 'Bananas are high in potassium. With Lisinopril (ACE inhibitor), potassium can accumulate (hyperkalemia risk). Moderate consumption (1/day) is typically fine, but avoid potassium supplements and large daily quantities. Monitor for muscle weakness or irregular heartbeat.', severity: 'caution' },
  { name: 'Oatmeal', emoji: '🥣', risk: 'low', detail: 'Excellent choice! Oatmeal is high in soluble fiber (beta-glucan), which helps lower LDL cholesterol — complementing your Atorvastatin. Also great for blood sugar control with Metformin. Take Metformin with this meal to reduce GI side effects. Highly recommended!', severity: 'safe' },
];

// ─── PILL IDENTIFIER DATA ─────────────────────────────────────────────
const QUICK_PILLS = [
  {
    name: 'Round White Tablet M500',
    emoji: '⚪',
    result: {
      name: 'Metformin 500mg',
      class: 'Biguanide / Antidiabetic',
      purpose: 'Controls blood sugar in Type 2 Diabetes',
      takeWith: 'With food to reduce nausea',
      sideEffects: 'Nausea, diarrhea (usually improves), GI upset',
      storage: 'Room temperature, away from moisture',
    },
  },
  {
    name: 'Oval Pink Tablet L10',
    emoji: '🟤',
    result: {
      name: 'Lisinopril 10mg',
      class: 'ACE Inhibitor / Antihypertensive',
      purpose: 'Lowers blood pressure, protects kidneys',
      takeWith: 'At same time each day, with or without food',
      sideEffects: 'Dry cough (common), dizziness when standing, monitor potassium',
      storage: 'Room temperature, dry place',
    },
  },
  {
    name: 'Oval Yellow Tablet A40',
    emoji: '🟡',
    result: {
      name: 'Atorvastatin 40mg',
      class: 'Statin / Cholesterol-lowering',
      purpose: 'Reduces LDL cholesterol and cardiovascular risk',
      takeWith: 'Evening preferred; AVOID grapefruit',
      sideEffects: 'Muscle aches (report if severe), liver enzyme changes',
      storage: 'Room temperature, away from light',
    },
  },
  {
    name: 'Soft Gel Capsule Yellow',
    emoji: '💛',
    result: {
      name: 'Vitamin D3 2000 IU',
      class: 'Vitamin / Supplement',
      purpose: 'Bone health, immune support, mood regulation',
      takeWith: 'With a fatty meal for best absorption',
      sideEffects: 'Generally very well tolerated. Excess may cause hypercalcemia.',
      storage: 'Cool, dry place away from light',
    },
  },
];

const SUGGESTED_QUESTIONS = [
  'Is it safe to take Metformin and Lisinopril together?',
  'What foods should I avoid with Atorvastatin?',
  'What are the signs of low blood sugar?',
  'How should I take my medications if I wake up late?',
  'What is HbA1c and why does it matter?',
  'Can I drink alcohol with my current medications?',
];

// ─── Helper: Simulated Gemini Response ───────────────────────────────
function getGeminiResponse(question: string, medNames: string[]): string {
  const q = question.toLowerCase();
  if (q.includes('metformin') && q.includes('lisinopril')) {
    return `Yes, Metformin and Lisinopril are commonly co-prescribed and are generally safe together. Metformin controls blood sugar (Type 2 Diabetes) while Lisinopril manages blood pressure and protects kidney function — both important for diabetic patients.\n\nKey point: ACE inhibitors like Lisinopril can slightly increase potassium levels. Avoid high-potassium supplements (like potassium chloride salt substitutes) and monitor potassium via regular labs. No direct drug interaction between these two. ✅`;
  }
  if (q.includes('grapefruit') || (q.includes('food') && q.includes('atorvastatin'))) {
    return `🚨 Important food interactions with Atorvastatin:\n\n• **Grapefruit/Grapefruit juice** — AVOID completely. It inhibits the enzyme (CYP3A4) that metabolises Atorvastatin, causing dangerous drug buildup → risk of myopathy/rhabdomyolysis.\n• **Large amounts of alcohol** — Increases liver stress; limit alcohol.\n• **High-fat meals at the same time** — Reduces absorption efficiency; prefer evening dosing on an empty stomach or light meal.\n\nSafe foods: Oatmeal, olive oil, avocados (in moderation), berries — all heart-healthy and complementary! ✅`;
  }
  if (q.includes('low blood sugar') || q.includes('hypoglycemia')) {
    return `Signs of low blood sugar (hypoglycemia) to watch for:\n\n• Shakiness or trembling\n• Sweating (cold sweat)\n• Rapid heartbeat\n• Confusion or difficulty concentrating\n• Irritability or anxiety\n• Hunger\n• Pale skin\n• Blurred vision\n\n**What to do:** Follow the 15-15 rule: eat 15g of fast-acting carbs (4 glucose tablets, 4 oz juice, or regular soda), wait 15 minutes, check blood sugar. If still low, repeat. If unconscious or unresponsive — CALL 911 immediately. Alert your care team of frequent episodes.`;
  }
  if (q.includes('late') || q.includes('miss') || q.includes('wake up')) {
    return `If you wake up late and miss a scheduled dose:\n\n• **Within 2 hours of scheduled time:** Take the medication as soon as you remember.\n• **More than 2 hours late:** Skip the missed dose and take your next dose at the regular time. Never double-dose.\n• **Never take two doses at once** to make up for a missed one — this applies to all your current medications.\n\nFor Metformin specifically: since you take it with meals, if you skip a meal, skip that dose too. Log missed doses in CareSync so your care team is notified and can track your adherence pattern.`;
  }
  if (q.includes('alcohol')) {
    return `Alcohol interactions with ${medNames.join(', ')}:\n\n• **Metformin + Alcohol:** Significant risk of lactic acidosis (a rare but serious buildup of lactic acid). Avoid heavy drinking. Light, occasional alcohol (1 drink) is generally acceptable but discuss with Dr. Chen.\n• **Lisinopril + Alcohol:** Alcohol enhances blood pressure-lowering effects → increased dizziness and fall risk. Use caution, especially in hot weather.\n• **Atorvastatin + Alcohol:** Both stress the liver. Keep alcohol consumption minimal.\n\n**Recommendation:** Limit to 0-1 drink per occasion, never on an empty stomach, and always stay hydrated. Discuss at your next appointment. 🏥`;
  }
  return `Great question about "${question}".\n\nBased on your current medications (${medNames.join(', ')}), here's what I can share:\n\nThis is an important topic to discuss with your healthcare provider. Regular monitoring and open communication with Dr. Chen ensures your medications are working optimally for your specific health profile.\n\n**General guidance:** Always take medications as prescribed, report any new or unusual symptoms promptly, and keep your CareSync wellness log updated so your care team has full context.\n\n*This response is for informational purposes only and does not replace professional medical advice.*`;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────
export default function AIPage() {
  const { medications } = useProfile();
  const medNames = medications.map(m => m.name);
  const [activeTab, setActiveTab] = useState<'chat' | 'meal' | 'pill'>('chat');

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `👋 Hello! I'm your Gemini Health Assistant, trained to help with questions about your medications, symptoms, nutrition, and senior wellness.\n\nI can see you're currently taking: **${medNames.join(', ')}**.\n\nHow can I help you today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Meal scanner state
  const [selectedMeal, setSelectedMeal] = useState<typeof QUICK_MEALS[0] | null>(null);
  const [mealScanLoading, setMealScanLoading] = useState(false);
  const [mealResult, setMealResult] = useState<typeof QUICK_MEALS[0] | null>(null);

  // Pill identifier state
  const [selectedPill, setSelectedPill] = useState<typeof QUICK_PILLS[0] | null>(null);
  const [pillLoading, setPillLoading] = useState(false);
  const [pillResult, setPillResult] = useState<typeof QUICK_PILLS[0] | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const q = text ?? input;
    if (!q.trim() || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);
    setTimeout(() => {
      const response = getGeminiResponse(q, medNames);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setLoading(false);
      if (ttsEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(response.replace(/\*\*/g, '').replace(/•/g, '.'));
        utter.rate = 0.9;
        window.speechSynthesis.speak(utter);
      }
    }, 1600);
  };

  const handleMealScan = (meal: typeof QUICK_MEALS[0]) => {
    setSelectedMeal(meal);
    setMealResult(null);
    setMealScanLoading(true);
    setTimeout(() => {
      setMealResult(meal);
      setMealScanLoading(false);
    }, 1500);
  };

  const handlePillScan = (pill: typeof QUICK_PILLS[0]) => {
    setSelectedPill(pill);
    setPillResult(null);
    setPillLoading(true);
    setTimeout(() => {
      setPillResult(pill);
      setPillLoading(false);
    }, 1500);
  };

  const TABS = [
    { id: 'chat', label: 'Health Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'meal', label: 'Meal Scanner', icon: <Utensils className="w-4 h-4" /> },
    { id: 'pill', label: 'Pill Identifier', icon: <Pill className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Bot className="w-8 h-8 text-indigo-600" />
            Gemini Health Assistant
          </h1>
          <p className="text-slate-500 mt-1">Powered by Google Gemini 1.5 Flash — Personalized to your medications</p>
        </div>
        <button
          type="button"
          onClick={() => setTtsEnabled(!ttsEnabled)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${ttsEnabled ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {ttsEnabled ? 'Voice On' : 'Voice Off'}
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-base transition-all ${
              activeTab === tab.id
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: HEALTH CHAT ── */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" style={{ height: '65vh', minHeight: '500px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-indigo-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
                  {msg.role === 'assistant' ? <Sparkles className="w-5 h-5" /> : <span className="text-sm font-bold">You</span>}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'assistant' ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-indigo-600 text-white'}`}>
                  <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="px-5 pb-3 flex gap-2 flex-wrap border-t border-slate-100 pt-3">
              {SUGGESTED_QUESTIONS.slice(0, 3).map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-200 p-4 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Ask about medications, symptoms, nutrition, side effects..."
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className={`px-4 py-3 rounded-xl font-bold transition-all ${!input.trim() || loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'}`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: MEAL SCANNER ── */}
      {activeTab === 'meal' && (
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-6">
            <h2 className="text-xl font-black text-green-900 mb-1 flex items-center gap-2">
              <Utensils className="w-5 h-5" /> Food-Medication Interaction Checker
            </h2>
            <p className="text-green-700 text-sm mb-5">Select a food to check for interactions with your current medications</p>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_MEALS.map(meal => (
                <button
                  key={meal.name}
                  type="button"
                  onClick={() => handleMealScan(meal)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 font-semibold text-left transition-all cursor-pointer ${
                    selectedMeal?.name === meal.name
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                >
                  <span className="text-3xl">{meal.emoji}</span>
                  <span className="text-base">{meal.name}</span>
                </button>
              ))}
            </div>
          </div>

          {mealScanLoading && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-3">
              <Loader className="w-5 h-5 text-green-600 animate-spin" />
              <span className="text-slate-600 font-medium">Gemini is checking interactions with your medications...</span>
            </div>
          )}

          {mealResult && !mealScanLoading && (
            <div className={`rounded-3xl border-2 p-6 ${
              mealResult.severity === 'danger' ? 'bg-rose-50 border-rose-400' :
              mealResult.severity === 'caution' ? 'bg-amber-50 border-amber-400' :
              'bg-green-50 border-green-400'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{mealResult.emoji}</span>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{mealResult.name}</h3>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                    mealResult.severity === 'danger' ? 'bg-rose-200 text-rose-800' :
                    mealResult.severity === 'caution' ? 'bg-amber-200 text-amber-800' :
                    'bg-green-200 text-green-800'
                  }`}>
                    {mealResult.severity === 'danger' ? '🚨 Avoid' : mealResult.severity === 'caution' ? '⚠️ Caution' : '✅ Safe'}
                  </span>
                </div>
              </div>
              <p className="text-slate-800 leading-relaxed">{mealResult.detail}</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: PILL IDENTIFIER ── */}
      {activeTab === 'pill' && (
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-3xl p-6">
            <h2 className="text-xl font-black text-purple-900 mb-1 flex items-center gap-2">
              <Pill className="w-5 h-5" /> Pill Identifier
            </h2>
            <p className="text-purple-700 text-sm mb-5">Select a pill description to identify it and get detailed information</p>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_PILLS.map(pill => (
                <button
                  key={pill.name}
                  type="button"
                  onClick={() => handlePillScan(pill)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 font-semibold text-left transition-all cursor-pointer ${
                    selectedPill?.name === pill.name
                      ? 'border-purple-500 bg-purple-50 text-purple-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  <span className="text-3xl">{pill.emoji}</span>
                  <span className="text-sm">{pill.name}</span>
                </button>
              ))}
            </div>
          </div>

          {pillLoading && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-3">
              <Loader className="w-5 h-5 text-purple-600 animate-spin" />
              <span className="text-slate-600 font-medium">Gemini is identifying this medication...</span>
            </div>
          )}

          {pillResult && !pillLoading && (
            <div className="bg-white border-2 border-purple-300 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-4xl">{pillResult.emoji}</span>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{pillResult.result.name}</h3>
                  <span className="text-sm font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">{pillResult.result.class}</span>
                </div>
              </div>
              <div className="grid gap-3">
                {[
                  { label: 'Purpose', value: pillResult.result.purpose, icon: '🎯' },
                  { label: 'How to Take', value: pillResult.result.takeWith, icon: '⏰' },
                  { label: 'Common Side Effects', value: pillResult.result.sideEffects, icon: '⚠️' },
                  { label: 'Storage', value: pillResult.result.storage, icon: '📦' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 bg-purple-50 rounded-xl p-3">
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">{item.label}</p>
                      <p className="text-slate-800 text-sm mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500 italic flex items-start gap-1.5">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0 text-amber-500" />
                Disclaimer: This identification is AI-assisted and for informational purposes only. Never take or stop any medication without consulting your healthcare provider.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Suggested Questions (Chat tab only) */}
      {activeTab === 'chat' && messages.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">More Questions to Ask</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.slice(3).map(q => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
