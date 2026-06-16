import Link from 'next/link';
import { Briefcase, ArrowRight } from 'lucide-react';

export default function Navbar() {
    return (
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
    );
}
