
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, currentPage }) => {
  const navItems = user?.role === 'ADMIN' 
    ? [
        { id: 'admin-dashboard', label: 'Admin Panel', icon: '📊' },
        { id: 'dashboard', label: 'Home', icon: '🏠' },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { id: 'explore', label: 'Find Mentors', icon: '🔍' },
        { id: 'sessions', label: 'My Sessions', icon: '📅' },
        { id: 'profile', label: 'Profile', icon: '👤' },
      ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div 
                className="flex-shrink-0 flex items-center cursor-pointer" 
                onClick={() => onNavigate('dashboard')}
              >
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-2">SL</div>
                <span className="text-xl font-bold tracking-tight text-indigo-600">SkillLoop</span>
              </div>
              <div className="hidden sm:flex sm:space-x-4">
                {user && navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === item.id 
                        ? 'text-indigo-600 bg-indigo-50' 
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="mr-1.5">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {user.totalPoints} Points
                    </span>
                    <span className="text-sm font-medium text-slate-700">{user.name}</span>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-x-4">
                  <button onClick={() => onNavigate('login')} className="text-slate-600 font-medium">Login</button>
                  <button onClick={() => onNavigate('signup')} className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium shadow-sm hover:bg-indigo-700">Join SkillLoop</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} SkillLoop. Built for KRCE Hackathon.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
