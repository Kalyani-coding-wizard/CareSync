'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/contexts/ProfileContext';
import { Shield, KeyRound, UserCheck, ArrowRight, Heart, Info, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function JoinPasscodePage() {
  const router = useRouter();
  const { joinProfileWithPasscode, profiles } = useProfile();
  const [passcode, setPasscode] = useState('');
  const [profileId, setProfileId] = useState('');
  const [relationship, setRelationship] = useState('Daughter/Son');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passcode.length < 4) {
      setError('Please enter a valid passcode (at least 4 to 6 digits)');
      return;
    }

    setLoading(true);
    try {
      const ok = await joinProfileWithPasscode(profileId || 'prof-demo-1', passcode, relationship);
      if (ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      } else {
        setError('Invalid passcode. Double-check with the family owner or try demo code: 482910');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setProfileId('prof-demo-1');
    setPasscode('482910');
    setRelationship('Family Caregiver');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50/40 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-blue-500/20">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Access Loved One&apos;s Profile</h1>
          <p className="text-slate-600 mt-2 text-lg">
            Enter the secure 6-digit passcode shared by the patient or primary caregiver.
          </p>
        </div>

        {/* Demo Quick Banner */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <span className="font-semibold">Hackathon Evaluator Quick Access:</span>
            <p className="mt-0.5 text-blue-700">
              Try Eleanor&apos;s sample profile using passcode{' '}
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="underline font-bold text-blue-800 hover:text-blue-950 px-1 py-0.5 rounded bg-blue-100/80"
              >
                482910
              </button>{' '}
              (Click to auto-fill)
            </p>
          </div>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-emerald-900">Access Granted!</h3>
            <p className="text-emerald-700 mt-1">Connecting to Eleanor Vance&apos;s Care Circle...</p>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="space-y-6">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-base flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-base font-semibold text-slate-800 mb-2">
                6-Digit Security Passcode
              </label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                <input
                  type="text"
                  maxLength={8}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-13 pr-4 py-4 text-2xl tracking-widest font-mono font-bold text-center border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-600 transition-colors bg-slate-50/50"
                  placeholder="••••••"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5 ml-1">
                Passcode is generated inside the elderly patient&apos;s profile dashboard.
              </p>
            </div>

            <div>
              <label className="block text-base font-semibold text-slate-800 mb-2">
                Your Relationship / Role
              </label>
              <div className="relative">
                <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-600 transition-colors bg-white appearance-none text-slate-800 font-medium"
                >
                  <option value="Daughter/Son">Family Member (Son / Daughter)</option>
                  <option value="Spouse">Spouse / Partner</option>
                  <option value="Primary Caretaker">Primary In-Home Caregiver</option>
                  <option value="Visiting Nurse">Visiting Nurse / Healthcare Worker</option>
                  <option value="Legal Guardian">Legal Guardian / Healthcare Proxy</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || passcode.length < 4}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-xl font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                'Verifying Passcode...'
              ) : (
                <>
                  <span>Join Healthcare Profile</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-base">
          <Link href="/auth/login" className="text-slate-600 hover:text-slate-900 font-medium">
            ← Back to Login
          </Link>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
            <span>Direct to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
