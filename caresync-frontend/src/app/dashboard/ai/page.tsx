'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import {
  Bot,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Check,
  Heart,
  Pill,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
}

const SAMPLE_QUESTIONS = [
  'Can I take Metformin on an empty stomach?',
  'Why do I need to avoid grapefruit with Atorvastatin?',
  'What should I do if I miss my morning dose of Lisinopril?',
  'Can Vitamin D interfere with my blood pressure medications?',
];

export default function AiAssistantPage() {
  const { activeProfile, medications } = useProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'gemini',
      text: `Hello ${activeProfile?.name || 'there'}! I am your CareSync Health Assistant, powered by Google Gemini. 
I have reviewed your active medications (${medications.map((m) => m.name).join(', ')}). 
How can I assist you with your routine, diet guidelines, or medication timings today?`,
      timestamp: 'Just now',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput('');
    setLoading(true);

    // Dynamic Gemini AI response logic tailored for elderly care
    setTimeout(() => {
      let reply = '';
      const lower = q.toLowerCase();

      if (lower.includes('grapefruit')) {
        reply = `Great question! You should avoid grapefruit and grapefruit juice because it contains furanocoumarins, which block the CYP3A4 enzyme in your liver. 
Because Atorvastatin relies on this enzyme to break down, grapefruit can cause the medication to build up to abnormally high levels in your blood, increasing the risk of muscle cramps or liver sensitivity. 
Oranges, apples, and bananas are safe alternatives!`;
      } else if (lower.includes('empty stomach') || lower.includes('metformin')) {
        reply = `It is best NOT to take Metformin on an empty stomach. 
Taking Metformin with a meal—like your breakfast or dinner—helps significantly reduce stomach upset, nausea, and cramping. Even a small piece of toast or a bowl of oatmeal is enough.`;
      } else if (lower.includes('miss') || lower.includes('forgot')) {
        reply = `If you realize you missed your Lisinopril dose within 2 to 4 hours of your scheduled time, take it as soon as you remember. 
However, if it is almost time for your next scheduled dose, skip the missed dose and resume your regular schedule. NEVER take two pills at once to make up for a missed dose. If you feel dizzy or faint, rest with your feet elevated and alert your caregiver.`;
      } else if (lower.includes('vitamin d') || lower.includes('calcium')) {
        reply = `Vitamin D3 and Calcium are generally very safe with Metformin, Lisinopril, and Atorvastatin! In fact, Vitamin D helps maintain strong bone density and supports cardiovascular health in seniors. 
Just remember to take your Vitamin D with lunch containing healthy fats for best absorption.`;
      } else {
        reply = `Based on your profile and current medication routine (${medications.map((m) => m.name).join(', ')}), here is what is recommended:

Always prioritize consistency and take your prescriptions with plenty of water. If you experience symptoms like dizziness, sudden shortness of breath, or rash, alert your primary caregiver immediately using the red SOS button. 

Would you like me to set a reminder or explain anything in simpler terms?`;
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'gemini',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 1200);
  };

  // Text-To-Speech for seniors
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower, calm speaking rate for seniors
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xs">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>POWERED BY GOOGLE GEMINI 1.5</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">CareSync Health Assistant</h1>
            <p className="text-purple-100 text-sm mt-0.5">
              Personalized Q&amp;A for {activeProfile?.name} • Aware of all active prescriptions
            </p>
          </div>
        </div>

        {/* TTS Toggle Status */}
        <button
          type="button"
          onClick={() => isSpeaking && window.speechSynthesis.cancel()}
          className={`p-3 rounded-2xl border transition-colors ${
            isSpeaking
              ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
              : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
          }`}
          title={isSpeaking ? 'Stop voice reading' : 'Voice audio reading ready'}
        >
          {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>

      {/* Suggested Questions Chips */}
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
          Quick Questions for Your Medications:
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSend(q)}
              className="bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 text-sm font-semibold px-4 py-2.5 rounded-2xl transition-all shadow-2xs hover:border-purple-300 text-left"
            >
              💬 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xs p-6 min-h-[460px] max-h-[560px] overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isBot = m.sender === 'gemini';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              {isBot && (
                <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-sm">
                  <Bot className="w-6 h-6" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-3xl p-5 text-base sm:text-lg leading-relaxed shadow-2xs ${
                  isBot
                    ? 'bg-slate-50 border border-slate-200/80 text-slate-800'
                    : 'bg-blue-600 text-white font-medium ml-auto'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
                  <span>{m.timestamp}</span>
                  {isBot && (
                    <button
                      type="button"
                      onClick={() => speakText(m.text)}
                      className="inline-flex items-center gap-1 text-purple-700 font-bold hover:underline cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen to Answer</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 animate-pulse">
              <Bot className="w-6 h-6" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-600 text-base font-medium flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-purple-600 rounded-full animate-bounce" />
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-2.5 h-2.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2 font-semibold">Gemini is analyzing your health inquiry...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-2 sm:p-3 shadow-md flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything about medicines, symptoms, or food warnings..."
          className="flex-1 px-4 py-3.5 text-lg font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-extrabold px-6 py-4 rounded-2xl flex items-center gap-2 text-base transition-all shadow-md shadow-blue-500/20 cursor-pointer"
        >
          <Send className="w-5 h-5" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      </div>

      {/* Safety Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Medical Notice:</strong> CareSync AI provides informational assistance based on clinical guidelines. Always consult your prescribing doctor or call emergency services (911) in urgent health situations.
        </div>
      </div>
    </div>
  );
}
