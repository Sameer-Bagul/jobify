import Link from 'next/link';

export default function CTA() {
    return (
        <section className="py-24 max-w-7xl mx-auto px-6">
            <div className="rounded-[3rem] bg-gradient-to-br from-purple-600/40 via-blue-600/40 to-pink-600/40 p-[1px]">
                <div className="rounded-[3rem] bg-dark-950 px-8 py-20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
                    <h2 className="text-5xl md:text-7xl font-bold mb-8 font-outfit relative z-10 text-white">
                        Ready to land your <span className="gradient-text">dream job?</span>
                    </h2>
                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto relative z-10">
                        Join thousands of professionals who are landing roles at top tech companies without the headache of manual applications.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                        <Link href="/signup" className="btn-primary text-xl px-12 py-5 shadow-2xl">
                            Get Started for Free
                        </Link>
                        <Link href="/login" className="text-white font-bold hover:text-purple-400 transition-colors underline decoration-purple-500 decoration-2 underline-offset-8">
                            I&apos;m hiring talent instead
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
