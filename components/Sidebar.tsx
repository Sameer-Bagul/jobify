"use client";
import { useRouter, usePathname } from 'next/navigation';

import Link from 'next/link';
import {
  LayoutDashboard,
  Briefcase,
  Mail,
  Bookmark,
  User as UserIcon,
  LogOut,
  PlusCircle,
  Users,
  CreditCard,
  Settings,
  FileText,
  Shield,
  Star,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface SidebarProps {
  role: 'seeker' | 'recruiter' | 'admin';
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const seekerLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/email', label: 'Cold Email', icon: Mail },
    { href: '/saved', label: 'Saved', icon: Bookmark },
    { href: '/subscription', label: 'Subscription', icon: CreditCard },
    { href: '/account', label: 'My Account', icon: UserIcon },
  ];

  const recruiterLinks = [
    { href: '/dashboard/recruiter', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/recruiter/post-job', label: 'Post Job', icon: PlusCircle },
    { href: '/dashboard/recruiter/jobs', label: 'My Jobs', icon: Briefcase },
    { href: '/dashboard/recruiter/candidates', label: 'Candidates', icon: Users },
    { href: '/dashboard/recruiter/account', label: 'My Account', icon: UserIcon },
  ];

  const adminLinks = [
    { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/admin/users', label: 'Users', icon: Users },
    { href: '/dashboard/admin/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/dashboard/admin/email-logs', label: 'Email Logs', icon: FileText },
    { href: '/dashboard/admin/recruiters', label: 'Recruiters', icon: Shield },
    { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
  ];

  const links = role === 'admin' ? adminLinks : role === 'recruiter' ? recruiterLinks : seekerLinks;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Failed to clear cookie', e);
    }
    logout();
    router.push('/');
  };

  return (
    <div className="w-64 glass-dark h-screen fixed left-0 top-0 border-r border-gray-200 flex flex-col">
      <div className="p-8 pb-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cayenne-red to-tangerine-dream flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
            <Briefcase className="h-5 w-5 text-dark-walnut" />
          </div>
          <span className="text-2xl font-bold font-outfit bg-gradient-to-r from-cayenne-red to-tangerine-dream bg-clip-text text-transparent">
            Jobify
          </span>
        </Link>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${isActive
                  ? 'bg-gradient-to-r from-cayenne-red/10 to-tangerine-dream/10 text-dark-walnut shadow-[inset_0_0_20px_rgba(139,92,246,0.05)] border border-tangerine-dream/20'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/[0.03] border border-transparent'
                }`}
            >
              <div className="flex items-center">
                <Icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-tangerine-dream' : 'group-hover:text-gray-700'}`} />
                {link.label}
              </div>
              {isActive && <ChevronRight className="h-4 w-4 text-tangerine-dream" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-4">
        {/* Pro Badge/Promo */}
        {role === 'seeker' && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cayenne-red/20 to-tangerine-dream/20 border border-tangerine-dream/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold text-dark-walnut uppercase tracking-wider">Go Pro</span>
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed">Unlock unlimited cold emails and recruiter matching.</p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-200 flex items-center justify-center text-sm font-bold text-dark-walnut">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-dark-walnut truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-500 truncate capitalize">{role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-bold text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
          >
            <LogOut className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
