"use client";
import { useRouter } from 'next/navigation';


import { useState } from 'react';

import Link from 'next/link';
import { Briefcase, Mail, Lock, User, ArrowRight, Loader2, Target, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'seeker' | 'recruiter'>('seeker');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/signup', { email, password, role });
      setAuth(res.data.token, res.data.user);

      router.push('/onboarding');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden lg:grid lg:grid-cols-2">
      {/* Left Side: Brand & Value Prop */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-pearl-beige via-white to-peach-fuzz/40 relative overflow-hidden border-r border-gray-200">
        
        

        <div>
          <Link href="/" className="inline-flex items-center gap-3 mb-16 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cayenne-red to-tangerine-dream flex items-center justify-center  group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="h-6 w-6 text-dark-walnut" />
            </div>
            <span className="text-3xl font-extrabold font-outfit bg-gradient-to-r from-cayenne-red to-tangerine-dream bg-clip-text text-transparent tracking-tight">Jobify</span>
          </Link>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-6 border-gray-300">
              <Target className="h-4 w-4 text-tangerine-dream" />
              <span className="text-xs font-bold uppercase tracking-wider text-tangerine-dream">Future of Work</span>
            </div>
            <h2 className="text-5xl font-bold text-dark-walnut mb-8 leading-tight font-outfit">
              Build your career on <span className="gradient-text">autopilot.</span>
            </h2>
            <div className="space-y-6">
              {[
                "Access verified recruiters directly",
                "Comprehensive skill gap analysis",
                "Personalized career roadmaps"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border-gray-200 relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-300 overflow-hidden" />
            <div>
              <p className="text-sm font-bold text-dark-walnut">Sarah Chen</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Product Manager @ Meta</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed italic">
            "The matching algorithm is scarily accurate. Jobify found roles I didn't even know existed but were perfect for my skills."
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-24 relative">
        
        

        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-bold text-dark-walnut mb-3 font-outfit tracking-tight">Create your account</h1>
            <p className="text-gray-500 font-medium">Join 2,500+ professionals landing dream roles.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-3 animate-shake">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('seeker')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${role === 'seeker'
                    ? 'border-gray-300 bg-white text-dark-walnut '
                    : 'border-gray-200 bg-white/[0.02] text-gray-500 hover:border-gray-200 hover:bg-white/[0.04]'
                  }`}
              >
                <div className={`p-2 rounded-xl mb-2 ${role === 'seeker' ? 'bg-white' : 'bg-gray-800'}`}>
                  <User className={`h-5 w-5 ${role === 'seeker' ? 'text-tangerine-dream' : 'text-gray-500'}`} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Job Seeker</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${role === 'recruiter'
                    ? 'border-gray-300 bg-white text-dark-walnut '
                    : 'border-gray-200 bg-white/[0.02] text-gray-500 hover:border-gray-200 hover:bg-white/[0.04]'
                  }`}
              >
                <div className={`p-2 rounded-xl mb-2 ${role === 'recruiter' ? 'bg-white' : 'bg-gray-800'}`}>
                  <Briefcase className={`h-5 w-5 ${role === 'recruiter' ? 'text-tangerine-dream' : 'text-gray-500'}`} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Recruiter</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-focus-within:text-tangerine-dream transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark pl-12 h-14"
                  placeholder="sarah@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-focus-within:text-tangerine-dream transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark pl-12 h-14"
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary h-14 text-base font-bold flex items-center justify-center gap-2 mt-8 group"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-dark-walnut" />
              ) : (
                <>
                  Create Account <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center text-gray-500 text-sm font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-dark-walnut hover:text-tangerine-dream font-bold transition-colors underline underline-offset-4 decoration-tangerine-dream/30 hover:decoration-tangerine-dream">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
