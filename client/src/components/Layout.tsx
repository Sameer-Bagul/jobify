import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/store/auth';
import { Bell, Search, HelpCircle } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuthStore();

  if (!user) return null;

  const role = (user.role as 'seeker' | 'recruiter' | 'admin') || 'seeker';

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <Sidebar role={role} />

      <div className="flex-1 flex flex-col min-h-screen ml-64">
        {/* Top Header */}
        <header className="h-20 glass-dark border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-96 max-w-full">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search for jobs, candidates, or tools..."
              className="bg-transparent border-none outline-none text-sm text-gray-300 w-full placeholder:text-gray-600"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full border-2 border-dark-900" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
              <HelpCircle className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
