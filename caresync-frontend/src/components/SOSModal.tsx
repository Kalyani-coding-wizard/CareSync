'use client';

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { AlertTriangle, PhoneCall, Mail, X, CheckCircle, ShieldAlert } from 'lucide-react';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SOSModal({ isOpen, onClose }: SOSModalProps) {
  const { activeProfile, triggerSOS } = useProfile();
  const [countdown, setCountdown] = useState<number>(5);
  const [isSent, setIsSent] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && !isSent && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (isOpen && !isSent && countdown === 0) {
      // Auto-trigger when countdown reaches zero
      triggerAlert();
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown, isSent]);

  const triggerAlert = async () => {
    const res = await triggerSOS('Immediate assistance requested by senior user.');
    setIsSent(true);
    setRecipientCount(res.recipientCount);
  };

  const handleManualTriggerNow = () => {
    setCountdown(0);
    triggerAlert();
  };

  const handleCancel = () => {
    setCountdown(5);
    setIsSent(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border-4 border-rose-500 relative">
        <button
          onClick={handleCancel}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          aria-label="Close SOS"
        >
          <X className="w-6 h-6" />
        </button>

        {!isSent ? (
          <div className="text-center">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <ShieldAlert className="w-14 h-14 text-rose-600" />
            </div>

            <h2 className="text-3xl font-black text-rose-600 mb-2">EMERGENCY SOS ALERT</h2>
            <p className="text-lg text-slate-700 mb-6">
              Dispatching urgent email and SMS alerts to {activeProfile?.name}&apos;s registered care network in:
            </p>

            {/* Countdown Big Display */}
            <div className="text-6xl font-black text-slate-900 mb-8 font-mono tracking-tighter">
              00:0{countdown}
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleManualTriggerNow}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-5 rounded-2xl text-2xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                Send Alert IMMEDIATELY
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl text-lg transition-colors cursor-pointer"
              >
                Cancel (False Alarm)
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-12 h-12" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-2">Emergency Alert Dispatched!</h3>
            <p className="text-slate-600 mb-6">
              Urgent notifications with current health vitals &amp; location have been sent to{' '}
              <span className="font-semibold text-slate-900">{recipientCount} emergency contacts</span>:
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 text-left mb-6 border border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-700 mb-2">
                <Mail className="w-4 h-4 text-rose-600" />
                <span className="font-medium">Emergency Emails:</span> {activeProfile?.emergencyEmails.join(', ')}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">Primary Contact:</span> {activeProfile?.emergencyPhones?.[0] || '+1 (555) 911-HELP'}
              </div>
            </div>

            <button
              onClick={handleCancel}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl text-lg hover:bg-slate-800 transition-colors"
            >
              Close &amp; Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
