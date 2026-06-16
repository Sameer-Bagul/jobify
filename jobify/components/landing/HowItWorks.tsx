import { CheckCircle2, ArrowRight, Mail, MessageSquare, Search } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            number: "01",
            title: "Create Your Profile",
            description: "Import your LinkedIn or upload your resume. Let our AI understand your unique value."
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

    const stats = [
        { label: 'Emails Sent', val: '412', icon: <Mail className="h-4 w-4 text-purple-400" /> },
        { label: 'Replies', val: '28', icon: <MessageSquare className="h-4 w-4 text-emerald-400" /> },
        { label: 'Interviews', val: '12', icon: <CheckCircle2 className="h-4 w-4 text-blue-400" /> },
        { label: 'Matches', val: '1.2k', icon: <Search className="h-4 w-4 text-pink-400" /> },
    ];

    return (
        <section id="how-it-works" className="py-24 bg-dark-900/50 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 font-outfit text-white">How Jobify works for you</h2>
                        <p className="text-gray-400 text-lg mb-12 leading-relaxed">
                            Finding a job shouldn't be a full-time job. Our streamlined process puts your career on autopilot.
                        </p>

                        <div className="space-y-8">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold font-outfit text-white">
                                        {step.number}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-2">{step.title}</h4>
                                        <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <span className="text-sm font-bold text-white">Guaranteed Outreach</span>
                            </div>
                            <p className="text-xs text-gray-500">We send at least 50 targeted emails per week on our Pro plan.</p>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full blur-[100px] absolute inset-0 -z-10" />
                        <div className="card glass relative p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Campaign Statistics</h3>
                                    <p className="text-xs text-gray-500">Last 30 days active</p>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                                    Active
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {stats.map((stat, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                                            {stat.icon}
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white font-outfit">{stat.val}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-4 rounded-xl bg-purple-600 flex items-center justify-between cursor-pointer hover:bg-purple-700 transition-colors">
                                <div className="text-sm font-bold text-white">Upgrade to Pro</div>
                                <ArrowRight className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
