import { CheckCircle2, ArrowRight, Mail, MessageSquare, Search } from 'lucide-react';

export default function HowItWorks() {
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

    const stats = [
        { label: 'Emails Sent', val: '412', icon: <Mail className="h-4 w-4 text-tangerine-dream" /> },
        { label: 'Replies', val: '28', icon: <MessageSquare className="h-4 w-4 text-emerald-400" /> },
        { label: 'Interviews', val: '12', icon: <CheckCircle2 className="h-4 w-4 text-tangerine-dream" /> },
        { label: 'Matches', val: '1.2k', icon: <Search className="h-4 w-4 text-tangerine-dream" /> },
    ];

    return (
        <section id="how-it-works" className="py-24 bg-white/50 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 font-outfit text-dark-walnut">How Jobify works for you</h2>
                        <p className="text-gray-600 text-lg mb-12 leading-relaxed">
                            Finding a job shouldn't be a full-time job. Our streamlined process puts your career on autopilot.
                        </p>

                        <div className="space-y-8">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-tangerine-dream/30 flex items-center justify-center text-tangerine-dream font-bold font-outfit text-dark-walnut">
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
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                                    Active
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {stats.map((stat, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-gray-200">
                                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                                            {stat.icon}
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
                                        </div>
                                        <div className="text-2xl font-bold text-dark-walnut font-outfit">{stat.val}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-4 rounded-xl bg-white flex items-center justify-between cursor-pointer hover:bg-white transition-colors">
                                <div className="text-sm font-bold text-dark-walnut">Upgrade to Pro</div>
                                <ArrowRight className="h-4 w-4 text-dark-walnut" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
