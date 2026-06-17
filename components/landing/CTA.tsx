import Link from 'next/link';

export default function CTA() {
    return (
        <section className="py-24 max-w-7xl mx-auto px-6">
            <div className="rounded-[3rem] bg-gradient-to-br from-cayenne-red/40 via-olive-bark to-dark-950 p-[1px]">
                <div className="rounded-[3rem] bg-gray-50 px-8 py-20 text-center relative overflow-hidden">
                    
                    <h2 className="text-5xl md:text-7xl font-bold mb-8 font-outfit relative z-10 text-dark-walnut">
                        Ready to land your <span className="gradient-text">dream job?</span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto relative z-10">
                        Join thousands of professionals who are landing roles at top tech companies without the headache of manual applications.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                        <Link href="/signup" className="btn-primary text-xl px-12 py-5 shadow-2xl">
                            Get Started for Free
                        </Link>
                        <Link href="/login" className="text-dark-walnut font-bold hover:text-tangerine-dream transition-colors underline decoration-tangerine-dream/30 decoration-2 underline-offset-8">
                            I&apos;m hiring talent instead
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
