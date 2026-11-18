import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  AlertTriangle, 
  Map, 
  Bot, 
  HelpCircle, 
  BarChart3, 
  Bookmark, 
  User, 
  LogOut,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { setAuthToken, setCurrentUser } from '../services/api';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Initial Assessment', path: '/diagnostic', icon: Target },
  { name: 'Knowledge Gaps', path: '/gaps', icon: AlertTriangle },
  { name: 'Adaptive Roadmap', path: '/roadmap', icon: Map },
  { name: 'AI Tutor', path: '/tutor', icon: Bot },
  { name: 'Quizzes & Practice', path: '/quiz', icon: HelpCircle },
  { name: 'Progress Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Learning Resources', path: '/resources', icon: Bookmark },
  { name: 'Profile & Settings', path: '/profile', icon: User },
];

export default function Sidebar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    navigate('/auth');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900 tracking-tight text-base">LearnPath</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200/50">AI</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Adaptive Learning Agent</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Platform
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 font-semibold flex items-center justify-center text-xs border border-brand-200">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-900 truncate">{user?.name || 'Student'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.education_level || 'Learner'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
