
import React from 'react';
import { User, Session, Skill } from '../types';

interface AdminDashboardProps {
  users: User[];
  sessions: Session[];
  skills: Skill[];
  onToggleUserBan: (userId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, sessions, skills, onToggleUserBan }) => {
  const stats = {
    totalUsers: users.length,
    activeSessions: sessions.filter(s => s.status === 'CONFIRMED' || s.status === 'REQUESTED').length,
    completedSessions: sessions.filter(s => s.status === 'COMPLETED').length,
    // Fix: Explicitly type reduce parameters to avoid arithmetic type errors on number operations
    totalPointsTraded: sessions.filter(s => s.status === 'COMPLETED').reduce((acc: number, curr: Session): number => acc + (curr.points as number), 0)
  };

  const skillCounts = sessions.reduce((acc: Record<string, number>, curr: Session) => {
    // Fix: Ensure the current count is treated as a number during increment
    acc[curr.skillName] = ((acc[curr.skillName] as number) || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Fix: Explicitly cast b[1] and a[1] to number to resolve arithmetic operation type errors on line 26
  const sortedSkills = Object.entries(skillCounts).sort((a, b) => (b[1] as number) - (a[1] as number));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900">Admin Control Panel</h1>
        <p className="text-slate-500">Monitor platform activity and manage campus users.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Students</p>
          <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Sessions</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.activeSessions}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.completedSessions}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Points Traded</p>
          <p className="text-2xl font-bold text-amber-600">{stats.totalPointsTraded}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Branch/Year</th>
                  <th className="px-6 py-3">Points</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.filter(u => u.role !== 'ADMIN').map(user => (
                  <tr key={user.id} className="text-sm">
                    <td className="px-6 py-4 flex items-center">
                      <img src={user.avatarUrl} className="w-8 h-8 rounded-full mr-3" alt="" />
                      <div>
                        <p className="font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{user.branch} / Y{user.year}</td>
                    <td className="px-6 py-4 font-mono text-indigo-600">{user.totalPoints}</td>
                    <td className="px-6 py-4">
                      {user.isBanned ? 
                        <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-[10px] font-bold">BANNED</span> : 
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">ACTIVE</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onToggleUserBan(user.id)}
                        className={`text-xs font-bold ${user.isBanned ? 'text-indigo-600' : 'text-red-500'} hover:underline`}
                      >
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6">Trending Skills</h2>
          <div className="space-y-4">
            {sortedSkills.length > 0 ? sortedSkills.slice(0, 5).map(([name, count]) => (
              <div key={name} className="flex items-center">
                <div className="w-full bg-slate-50 h-8 rounded-lg relative overflow-hidden flex items-center px-4">
                   <div 
                    className="absolute left-0 top-0 h-full bg-indigo-100" 
                    // Fix: Explicitly cast count to number and use Math.max for sessions.length to avoid arithmetic type errors
                    style={{ width: `${((count as number) / Math.max(sessions.length, 1)) * 100}%` }}
                   />
                   <div className="relative z-10 flex justify-between w-full text-sm font-medium">
                      <span className="text-slate-700">{name}</span>
                      <span className="text-indigo-600 font-bold">{count} Sessions</span>
                   </div>
                </div>
              </div>
            )) : (
              <p className="text-slate-400 text-sm italic">No session data yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
