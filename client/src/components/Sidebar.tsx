import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const seekerLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/dashboard/email', label: 'Cold Email', icon: Mail },
    { href: '/dashboard/saved', label: 'Saved', icon: Bookmark },
    { href: '/dashboard/subscription', label: 'Subscription', icon: CreditCard },
    { href: '/dashboard/account', label: 'My Account', icon: UserIcon },
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="w-64 glass-dark h-screen fixed left-0 top-0 border-r border-white/5 flex flex-col">
      <div className="p-8 pb-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold font-outfit bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Jobify
          </span>
        </Link>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.href}
              to={link.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${isActive
                  ? 'bg-gradient-to-r from-purple-600/10 to-blue-600/10 text-white shadow-[inset_0_0_20px_rgba(139,92,246,0.05)] border border-purple-500/20'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] border border-transparent'
                }`}
            >
              <div className="flex items-center">
                <Icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-purple-400' : 'group-hover:text-gray-300'}`} />
                {link.label}
              </div>
              {isActive && <ChevronRight className="h-4 w-4 text-purple-500" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-4">
        {/* Pro Badge/Promo */}
        {role === 'seeker' && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Go Pro</span>
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed">Unlock unlimited cold emails and recruiter matching.</p>
          </div>
        )}

        <div className="pt-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-dark-700 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
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
