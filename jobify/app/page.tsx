"use client";

import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  Mail,
  Users,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle2,
  Star,
  ArrowUpRight,
  Target,
  Rocket,
  Search,
  MessageSquare
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: <Mail className="h-6 w-6 text-tangerine-dream" />,
      title: "Cold Email Automation",
      description: "Send personalized emails to recruiters with your resume attached. Smart delivery to avoid spam filters.",
      color: "purple"
    },
    {
      icon: <Target className="h-6 w-6 text-tangerine-dream" />,
      title: "Smart Job Discovery",
      description: "Our intelligent algorithm scans thousands of listings to find the perfect matches for your specific skill set.",
      color: "blue"
    },
    {
      icon: <Users className="h-6 w-6 text-tangerine-dream" />,
      title: "Recruiter Database",
      description: "Access verified contact information for hiring managers at top tech companies.",
      color: "pink"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-emerald-400" />,
      title: "Analytics Dashboard",
      description: "Track open rates, click-through rates, and responses for your outreach campaigns.",
      color: "emerald"
    },
    {
      icon: <Shield className="h-6 w-6 text-amber-400" />,
      title: "Dynamic Resume Tailoring",
      description: "Automatically adjust your resume keywords to match job descriptions for higher ATS scores.",
      color: "amber"
    },
    {
      icon: <Zap className="h-6 w-6 text-indigo-400" />,
      title: "Instant Match Alerts",
      description: "Be the first to apply with real-time notifications when new matching jobs are posted.",
      color: "indigo"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description: "Import your LinkedIn or upload your resume. Let our advanced system understand your unique value."
    },
    {
      number: "02",
      title: "Find Your Matches",
      description: "Browse high-intent job opportunities matched specifically to your experience level."
    },
    {
      number: "03",
      title: "Automate Outreach",
      description: "Schedule your personalized cold email sequences and watch the interviews roll in."
    }
  ];

  const faqs = [
    {
      question: "How does the email automation work?",
      answer: "We connect to your email provider and send highly personalized, research-backed sequences to recruiters. Each email is unique and includes your tailored resume."
    },
    {
      question: "Is it safe for my email reputation?",
      answer: "Yes! We use advanced 'warming' techniques and spread out your emails to ensure high deliverability and protect your account from being flagged."
    },
    {
      question: "Can I use Jobify as a recruiter?",
      answer: "Absolutely. Recruiters can post jobs, manage candidates, and use our smart-matching to find the best talent match for their open roles."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Background Orbs */}
      
      

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cayenne-red to-tangerine-dream flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Briefcase className="h-5 w-5 text-dark-walnut" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent font-outfit">Jobify</span>
        </div>
        <div className="hidden md:flex items-center gap-8 mr-auto ml-12">
          <a href="#features" className="text-sm font-medium text-gray-600 hover:text-dark-walnut transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-dark-walnut transition-colors">How it Works</a>
          <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-dark-walnut transition-colors">Testimonials</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-dark-walnut transition-colors">
            Login
          </Link>
          <Link href="/signup" className="btn-primary flex items-center gap-2 text-sm">
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-8 border-tangerine-dream/20 animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-tangerine-dream">Newly Launched v2.0</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[1.1] font-outfit">
              <span className="text-dark-walnut">Stop Applying.</span>
              <br />
              <span className="gradient-text">Start Connecting.</span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-xl leading-relaxed">
              The world's premier automated job search platform that doesn't just find jobs, but lands you interviews through automated, personalized recruiter outreach.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link href="/signup" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2 group">
                Start for Free <Rocket className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link href="/recruiter" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2">
                Hiring Talent? <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-dark-900 bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-dark-900 bg-white flex items-center justify-center text-[10px] font-bold">
                  99+
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <span className="text-dark-walnut font-bold">2,500+</span> professionals already landed roles
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            
            <div className="card border-gray-200 p-2 overflow-hidden shadow-2xl relative">
              <div className="bg-gray-50 rounded-xl p-6 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="ml-4 flex-1 h-6 bg-white/5 rounded-full flex items-center px-3">
                    <span className="text-[10px] text-gray-500">recruiter@toptech.com - Cold Outreach Sequence</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="shimmer h-10 w-3/4 rounded-lg bg-white/5" />
                  <div className="space-y-2">
                    <div className="shimmer h-4 w-full rounded bg-white/5" />
                    <div className="shimmer h-4 w-5/6 rounded bg-white/5" />
                    <div className="shimmer h-4 w-4/6 rounded bg-white/5" />
                  </div>
                  <div className="flex items-center gap-4 mt-8">
                    <div className="w-12 h-12 rounded-lg bg-white border border-tangerine-dream/30 flex items-center justify-center">
                      <CheckCircle2 className="text-tangerine-dream h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-dark-walnut uppercase tracking-widest">Matched via AI</div>
                      <div className="text-[10px] text-gray-500">Skill overlap: 94%</div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 animate-float">
                  <div className="glass p-3 rounded-xl border-white/20 shadow-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-[10px] font-bold text-dark-walnut">Interview Invitation</span>
                    </div>
                    <div className="text-[9px] text-gray-500 italic">"Love your background in React..."</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="border-y border-gray-200 bg-white/50 py-12">
          <div className="max-w-7xl mx-auto px-6 overflow-hidden">
            <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-10">Trusted by Professionals from</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {['Google', 'Meta', 'Amazon', 'Netflix', 'Stripe', 'Airbnb'].map((brand) => (
                <span key={brand} className="text-2xl font-black text-dark-walnut/50 tracking-tighter hover:text-dark-walnut transition-colors cursor-default">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-outfit">The Next-Gen Toolkit</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                We've built everything you need to transition from a job seeker to a sought-after professional.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="group card glass-card cursor-pointer">
                  <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-${feature.color}-500/20`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-dark-walnut mb-4 group-hover:gradient-text transition-all">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                  <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-2 text-xs font-bold text-gray-500 group-hover:text-dark-walnut transition-colors uppercase tracking-widest">
                    Learn More <ArrowUpRight className="h-3 w-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-white/50 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-8 font-outfit">How Jobify works for you</h2>
                <p className="text-gray-600 text-lg mb-12 leading-relaxed">
                  Finding a job shouldn't be a full-time job. Our streamlined process puts your career on autopilot.
                </p>

                <div className="space-y-8">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full border border-tangerine-dream/30 flex items-center justify-center text-tangerine-dream font-bold font-outfit">
                        {step.number}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-dark-walnut mb-2">{step.title}</h4>
                        <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-cayenne-red/10 to-tangerine-dream/10 border border-tangerine-dream/20">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-bold text-dark-walnut">Guaranteed Outreach</span>
                  </div>
                  <p className="text-xs text-gray-500">We send at least 50 targeted emails per week on our Pro plan.</p>
                </div>
              </div>

              <div className="relative">
                
                <div className="card glass relative p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-dark-walnut">Campaign Statistics</h3>
                      <p className="text-xs text-gray-500">Last 30 days active</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold">
                      Active
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Emails Sent', val: '412', icon: <Mail className="h-4 w-4 text-tangerine-dream" /> },
                      { label: 'Replies', val: '28', icon: <MessageSquare className="h-4 w-4 text-emerald-400" /> },
                      { label: 'Interviews', val: '12', icon: <CheckCircle2 className="h-4 w-4 text-tangerine-dream" /> },
                      { label: 'Matches', val: '1.2k', icon: <Search className="h-4 w-4 text-tangerine-dream" /> },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 rounded-xl bg-white/5 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                          {stat.icon}
                          <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-dark-walnut font-outfit">{stat.val}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-4 rounded-xl bg-white flex items-center justify-between">
                    <div className="text-sm font-bold text-dark-walnut">Upgrade to Pro</div>
                    <ArrowRight className="h-4 w-4 text-dark-walnut" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="rounded-[3rem] bg-gradient-to-br from-cayenne-red/40 via-olive-bark to-dark-950 p-[1px]">
            <div className="rounded-[3rem] bg-gray-50 px-8 py-20 text-center relative overflow-hidden">
              
              <h2 className="text-5xl md:text-7xl font-bold mb-8 font-outfit relative z-10">
                Ready to land your <span className="gradient-text">dream job?</span>
              </h2>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto relative z-10">
                Join thousands of professionals who are landing roles at top tech companies without the headache of manual applications.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                <Link href="/signup" className="btn-primary text-xl px-12 py-5 shadow-2xl">
                  Get Started for Free
                </Link>
                <Link href="/recruiter" className="text-dark-walnut font-bold hover:text-tangerine-dream transition-colors underline decoration-tangerine-dream/30 decoration-2 underline-offset-8">
                  I'm hiring talent instead
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pb-24 max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 font-outfit">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="card glass-card">
                <h4 className="text-lg font-bold text-dark-walnut mb-2">{faq.question}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-gray-200 py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cayenne-red to-tangerine-dream flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-dark-walnut" />
              </div>
              <span className="text-xl font-bold font-outfit text-dark-walnut">Jobify</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Redefining the job search experience with advanced workflow automation. Land your next role faster.
            </p>
          </div>

          <div>
            <h5 className="text-dark-walnut font-bold mb-6 uppercase text-xs tracking-[0.2em]">Product</h5>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-tangerine-dream transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-tangerine-dream transition-colors">How it works</a></li>
              <li><a href="#" className="hover:text-tangerine-dream transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-tangerine-dream transition-colors">Support</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-dark-walnut font-bold mb-6 uppercase text-xs tracking-[0.2em]">Company</h5>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-tangerine-dream transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-tangerine-dream transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-tangerine-dream transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-dark-walnut font-bold mb-6 uppercase text-xs tracking-[0.2em]">Newsletter</h5>
            <p className="text-xs text-gray-600 mb-4">Get the latest career tips & automation updates.</p>
            <div className="flex gap-2">
              <input type="text" placeholder="Your email" className="bg-white/5 border border-gray-200 rounded-lg px-3 py-2 text-xs flex-1 focus:outline-none focus:border-gray-300" />
              <button className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-xs font-bold text-dark-walnut">Join</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-gray-200 text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest">
          &copy; 2026 Jobify. Built with passion for professionals.
        </div>
      </footer>
    </div>
  );
}
