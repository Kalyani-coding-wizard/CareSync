'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Shield, Bell, Users } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && userProfile) {
      router.push('/dashboard');
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading CareSync...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">CareSync</span>
        </div>
        <Link
          href="/auth/login"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Sign In
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-base font-medium mb-6">
          <Shield className="w-4 h-4" />
          Secure · Collaborative · Smart
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Healthcare Management
          <span className="text-blue-600"> For The Ones You Love</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          CareSync helps elderly individuals, family members, and caretakers manage medications,
          track appointments, and stay connected — all in one secure platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl text-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Get Started Free
          </Link>
          <Link
            href="/auth/join"
            className="bg-white text-blue-600 border-2 border-blue-200 px-8 py-4 rounded-xl text-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            Join with Passcode
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Heart, color: 'bg-red-100 text-red-600', title: 'Medication Tracking', desc: 'Never miss a dose with smart reminders and adherence tracking' },
          { icon: Bell, color: 'bg-blue-100 text-blue-600', title: 'Email Reminders', desc: 'Automated alerts for medications and upcoming doctor appointments' },
          { icon: Users, color: 'bg-green-100 text-green-600', title: 'Family Sharing', desc: 'Securely share access with family members via passcode' },
          { icon: Shield, color: 'bg-purple-100 text-purple-600', title: 'AI Assistant', desc: 'Powered by Gemini AI for drug interaction checks and health Q&A' },
        ].map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm">
        <p>Built with ❤️ for Catalyst Hackathon · Powered by Firebase + Gemini AI</p>
      </footer>
    </main>
  );
}
