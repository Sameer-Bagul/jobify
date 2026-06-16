import Link from 'next/link';
import { Rocket, ArrowRight, CheckCircle2, Star } from 'lucide-react';

export default function Hero() {
    return (
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-8 border-purple-500/20 animate-fade-in">
                    <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Newly Launched v2.0</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[1.1] font-outfit">
                    <span className="text-white">Stop Applying.</span>
                    <br />
                    <span className="gradient-text">Start Connecting.</span>
                </h1>

                <p className="text-xl text-gray-400 mb-12 max-w-xl leading-relaxed">
                    The world's first AI-powered job search platform that doesn't just find jobs, but lands you interviews through automated, personalized recruiter outreach.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <Link href="/signup" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2 group">
                        Start for Free <Rocket className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                    <Link href="/login" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2">
                        Hiring Talent? <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>

                <div className="mt-12 flex items-center gap-6">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-dark-900 bg-dark-700 flex items-center justify-center text-[10px] font-bold text-white">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-2 border-dark-900 bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                            99+
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">
                        <span className="text-white font-bold">2,500+</span> professionals already landed roles
                    </div>
                </div>
            </div>

            <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-[100px] -z-10" />
                <div className="card border-white/10 p-2 overflow-hidden shadow-2xl relative">
                    <div className="bg-dark-950 rounded-xl p-6 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
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
                                <div className="w-12 h-12 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                                    <CheckCircle2 className="text-purple-400 h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white uppercase tracking-widest">Matched via AI</div>
                                    <div className="text-[10px] text-gray-500">Skill overlap: 94%</div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-4 right-4 animate-float">
                            <div className="glass p-3 rounded-xl border-white/20 shadow-xl">
                                <div className="flex items-center gap-2 mb-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-[10px] font-bold text-white">Interview Invitation</span>
                                </div>
                                <div className="text-[9px] text-gray-500 italic">"Love your background in React..."</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
