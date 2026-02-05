import { Briefcase } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative z-10 border-t border-white/5 py-20">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-left">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                            <Briefcase className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xl font-bold font-outfit text-white">Jobify</span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6 font-medium">
                        Redefining the job search experience with AI-first automation. Land your next role faster.
                    </p>
                </div>

                <div>
                    <h5 className="text-white font-bold mb-6 uppercase text-xs tracking-[0.2em]">Product</h5>
                    <ul className="space-y-4 text-sm text-gray-500 font-medium">
                        <li><a href="#features" className="hover:text-purple-400 transition-colors">Features</a></li>
                        <li><a href="#how-it-works" className="hover:text-purple-400 transition-colors">How it works</a></li>
                        <li><a href="#" className="hover:text-purple-400 transition-colors">Pricing</a></li>
                        <li><a href="#" className="hover:text-purple-400 transition-colors">Support</a></li>
                    </ul>
                </div>

                <div>
                    <h5 className="text-white font-bold mb-6 uppercase text-xs tracking-[0.2em]">Company</h5>
                    <ul className="space-y-4 text-sm text-gray-500 font-medium">
                        <li><a href="#" className="hover:text-purple-400 transition-colors">About Us</a></li>
                        <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
                    </ul>
                </div>

                <div>
                    <h5 className="text-white font-bold mb-6 uppercase text-xs tracking-[0.2em]">Newsletter</h5>
                    <p className="text-xs text-gray-600 mb-4 font-bold uppercase tracking-widest">Get the latest career tips & AI updates.</p>
                    <div className="flex gap-2">
                        <input type="email" placeholder="Your email" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs flex-1 focus:outline-none focus:border-purple-500 text-gray-300" />
                        <button className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-xs font-bold text-white">Join</button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                &copy; 2026 Jobify. Built with passion for professionals.
            </div>
        </footer>
    );
}
