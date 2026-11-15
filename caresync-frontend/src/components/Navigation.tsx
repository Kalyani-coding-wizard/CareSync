'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import SOSModal from './SOSModal';
import {
  Heart,
  Pill,
  Calendar,
  BarChart3,
  Bot,
  AlertOctagon,
  Copy,
  Check,
  Type,
  SunMoon,
  ChevronDown,
  LogOut,
  UserCheck,
  Smile,
  FileText,
  Activity,
  ClipboardList,
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const {
    activeProfile,
    profiles,
    setActiveProfile,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
  } = useProfile();
  const { signOut, user } = useAuth();

  const [copied, setCopied] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Today\'s Routine', icon: Heart },
    { href: '/dashboard/medications', label: 'Medications', icon: Pill },
    { href: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
    { href: '/dashboard/adherence', label: 'Adherence', icon: BarChart3 },
    { href: '/dashboard/wellness', label: 'Wellness Log', icon: Smile },
    { href: '/dashboard/report', label: 'Doctor Report', icon: FileText },
    { href: '/dashboard/carefeed', label: 'Care Feed', icon: Activity },
    { href: '/dashboard/handover', label: 'Handover', icon: ClipboardList },
    { href: '/dashboard/ai', label: 'Gemini AI', icon: Bot, badge: 'AI' },
  ];

  const handleCopyPasscode = () => {
    if (activeProfile?.passcode) {
      navigator.clipboard.writeText(activeProfile.passcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        {/* Top Accessibility & Emergency Banner */}
        <div className="bg-slate-900 text-white px-4 py-2 text-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-slate-300 font-medium hidden sm:inline">Accessibility Controls:</span>
            {/* Font scaling */}
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                  fontSize === 'normal' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
                title="Normal text"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                  fontSize === 'large' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
                title="Large text for seniors"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xl')}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                  fontSize === 'xl' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
                title="Extra Large text"
              >
                A++
              </button>
            </div>

            {/* High contrast switch */}
            <button
              type="button"
              onClick={() => setHighContrast(!highContrast)}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold border transition-colors ${
                highContrast
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <SunMoon className="w-3.5 h-3.5" />
              <span>{highContrast ? 'High Contrast ON' : 'High Contrast'}</span>
            </button>
          </div>

          {/* Passcode Sharing Badge */}
          {activeProfile && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs hidden md:inline">Care Circle Passcode:</span>
              <button
                type="button"
                onClick={handleCopyPasscode}
                className="inline-flex items-center gap-1.5 bg-blue-950 text-blue-300 border border-blue-800 hover:bg-blue-900 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold transition-colors"
                title="Click to copy sharing passcode"
              >
                <span>{activeProfile.passcode}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Profile Switcher */}
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1">
                    CareSync
                    <span className="text-xs bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded-md ml-1">
                      PRO
                    </span>
                  </span>
                  <p className="text-xs text-slate-500 font-medium">Smart Elderly Care</p>
                </div>
              </Link>

              {/* Active Profile Dropdown */}
              <div className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-xl text-slate-800 text-sm font-semibold transition-colors border border-slate-200"
                >
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>{activeProfile?.name || 'Select Patient'}</span>
                  <span className="text-xs font-normal text-slate-500">
                    ({activeProfile?.relationship || 'Patient'})
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Switch Managed Profile
                    </div>
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setActiveProfile(p);
                          setProfileDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between hover:bg-blue-50 transition-colors ${
                          activeProfile?.id === p.id ? 'bg-blue-50/80 text-blue-700 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <div>{p.name}</div>
                          <div className="text-xs text-slate-500">{p.relationship || 'Patient'}</div>
                        </div>
                        {activeProfile?.id === p.id && <Check className="w-4 h-4 text-blue-600" />}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <Link
                        href="/auth/join"
                        className="block px-3.5 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        + Join with New Passcode
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-base transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-xs bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Emergency SOS & User Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSOSOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-rose-600/25 flex items-center gap-2 text-base transition-all cursor-pointer"
                title="Trigger Emergency SOS notification"
              >
                <AlertOctagon className="w-5 h-5 animate-pulse text-white" />
                <span className="tracking-wide">SOS</span>
              </button>

              <button
                type="button"
                onClick={() => signOut()}
                className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex overflow-x-auto border-t border-slate-200 px-2 py-2 gap-1 bg-slate-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-700 bg-white border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* SOS Modal */}
      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
    </>
  );
}
