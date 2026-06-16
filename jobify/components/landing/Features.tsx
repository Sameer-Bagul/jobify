import { Mail, Target, Users, TrendingUp, Shield, Zap, ArrowUpRight } from 'lucide-react';

export default function Features() {
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

    return (
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
    );
}
