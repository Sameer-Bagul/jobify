export default function Trust() {
    const brands = ['Google', 'Meta', 'Amazon', 'Netflix', 'Stripe', 'Airbnb'];

    return (
        <section className="border-y border-gray-200 bg-white/50 py-12">
            <div className="max-w-7xl mx-auto px-6 overflow-hidden">
                <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-10">Trusted by Professionals from</p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {brands.map((brand) => (
                        <span key={brand} className="text-2xl font-black text-dark-walnut/50 tracking-tighter hover:text-dark-walnut transition-colors cursor-default">
                            {brand}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
