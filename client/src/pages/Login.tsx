import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Mail, Lock, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.token, res.data.user);

      if (!res.data.user.onboardingCompleted) {
        navigate('/onboarding');
      } else if (res.data.user.role === 'recruiter') {
        navigate('/dashboard/recruiter');
      } else if (res.data.user.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex overflow-hidden lg:grid lg:grid-cols-2">
      {/* Left Side: Brand & Value Prop */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-purple-900/40 via-blue-900/20 to-dark-950 relative overflow-hidden border-r border-white/5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-mesh opacity-30 -z-10" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />

        <div>
          <Link to="/" className="inline-flex items-center gap-3 mb-16 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)] group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-extrabold font-outfit bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight">Jobify</span>
          </Link>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-6 border-purple-500/20">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Join the elite</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-8 leading-tight font-outfit">
              Where talent meets its <span className="gradient-text">perfect match.</span>
            </h2>
            <div className="space-y-6">
              {[
                "AI-powered recruiter outreach sequences",
                "Verified contact data for hiring managers",
                "Real-time interview request alerts"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-400">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border-white/10 relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-dark-800 border-2 border-purple-500/30 overflow-hidden" />
            <div>
              <p className="text-sm font-bold text-white">Alex Rivera</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Software Engineer @ Stripe</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed italic">
            "Jobify didn't just help me find a job; it automated the entire interview process. I had 4 offers within 3 weeks. It's truly a game changer."
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-24 relative">
        <div className="absolute inset-0 bg-gradient-mesh opacity-10 -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]" />

        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-bold text-white mb-3 font-outfit tracking-tight">Welcome back</h1>
            <p className="text-gray-500 font-medium">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-3 animate-shake">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-focus-within:text-purple-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark pl-12 h-14"
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end ml-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" title="Forgot Password" className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors">
                  Reset password
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-focus-within:text-purple-500 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark pl-12 h-14"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
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
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <>
                  Continue with Email <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm font-medium">
              New to Jobify?{' '}
              <Link to="/signup" className="text-white hover:text-purple-400 font-bold transition-colors underline underline-offset-4 decoration-purple-500/30 hover:decoration-purple-500">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
