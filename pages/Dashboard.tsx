
import React, { useState, useEffect } from 'react';
import { User, Session, MatchSuggestion } from '../types';
import { getLoopAdvisorAdvice, getCampusPulse } from '../services/geminiService';
import SessionCard from '../components/SessionCard';

interface DashboardProps {
  user: User;
  users: User[];
  sessions: Session[];
  matchSuggestions: MatchSuggestion[];
  onNavigate: (page: string) => void;
  onUpdateSessionStatus: (id: string, status: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, users, sessions, matchSuggestions, onNavigate, onUpdateSessionStatus }) => {
  const [advice, setAdvice] = useState<string>('Loading personalized tips...');
  const [campusPulse, setCampusPulse] = useState<string>('Analyzing campus vibe...');

  useEffect(() => {
    const fetchAI = async () => {
      const [tip, pulse] = await Promise.all([
        getLoopAdvisorAdvice(user),
        getCampusPulse(sessions)
      ]);
      setAdvice(tip);
      setCampusPulse(pulse);
    };
    fetchAI();
  }, [user, sessions]);

  const activeSessions = sessions.filter(s => 
    (s.mentorId === user.id || s.learnerId === user.id) && 
    (s.status === 'REQUESTED' || s.status === 'CONFIRMED')
  ).slice(0, 2);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Loop Central</h1>
          <p className="text-slate-500 mt-1 font-medium">Your peer-to-peer knowledge hub at KRCE.</p>
        </div>
        <div className="flex space-x-4">
           <div className="bg-white border-2 border-slate-100 px-8 py-5 rounded-[2rem] shadow-sm flex items-center transition-all hover:shadow-md">
              <div className="mr-4 text-3xl">💎</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</p>
                <p className="text-2xl font-black text-indigo-600 leading-tight">{user.totalPoints}</p>
              </div>
           </div>
           <button 
             onClick={() => onNavigate('explore')}
             className="bg-indigo-600 text-white px-8 py-5 rounded-[2rem] font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
           >
             Book Session
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* AI Advisor & Pulse */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-xl group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl mb-4 shadow-lg">🤖</div>
                    <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-1">LoopBuddy Assistant</p>
                    <h3 className="text-lg font-bold leading-tight italic">"{advice}"</h3>
                  </div>
                  <button onClick={() => onNavigate('profile')} className="mt-6 text-xs font-black text-white hover:text-indigo-100 flex items-center group/btn">
                    Update Growth Plan <span className="ml-2 group-hover/btn:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
             </div>

             <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm group relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-xl mb-4 border border-emerald-100 shadow-sm">📈</div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Campus Pulse Report</p>
                  <h3 className="text-lg font-black text-slate-800 leading-tight">"{campusPulse}"</h3>
                  <div className="mt-4 flex -space-x-2">
                    {[1,2,3,4].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />)}
                    <span className="text-[10px] text-slate-400 font-bold ml-4 flex items-center">+82 students active today</span>
                  </div>
                </div>
             </div>
          </div>

          {/* AI Matches Section */}
          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI-Curated Matches</h2>
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase border border-indigo-100">Gemini Engine v3</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matchSuggestions && matchSuggestions.length > 0 ? (
                matchSuggestions.slice(0, 4).map((match, idx) => {
                  const mentor = users.find(u => u.id === match.mentorId);
                  if (!mentor) return null;
                  return (
                    <div key={idx} className="bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-2xl hover:border-indigo-200 transition-all cursor-pointer group flex flex-col relative overflow-hidden" onClick={() => onNavigate('explore')}>
                      <div className="absolute top-0 right-0 p-3">
                         <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-1 rounded-lg border border-indigo-100 uppercase tracking-tighter">
                           {match.compatibilityTag || "Skill Match"}
                         </span>
                      </div>
                      <div className="flex items-center mb-6">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl uppercase border-2 border-white shadow-lg">
                          {mentor.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <p className="font-black text-slate-900">{mentor.name}</p>
                          <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{mentor.branch} • Y{mentor.year}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 flex-grow">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Teaches</p>
                        <p className="text-sm font-black text-slate-800">{match.skillName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-amber-500 font-black text-xs">★ {mentor.ratingAverage.toFixed(1)}</span>
                        <div className="h-1 w-1 bg-slate-200 rounded-full" />
                        <span className="text-[10px] text-slate-400 italic truncate font-medium">"{match.reason}"</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-16 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">No AI Matches Detected</p>
                  <button onClick={() => onNavigate('profile')} className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl text-xs font-black border border-indigo-100 hover:bg-indigo-100">Update Your Interests</button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-6">Your Sessions</h2>
              <div className="space-y-4">
                {activeSessions.length > 0 ? (
                  activeSessions.map(session => (
                    <SessionCard 
                      key={session.id}
                      session={session}
                      isMentor={session.mentorId === user.id}
                      otherUser={users.find(u => u.id === (session.mentorId === user.id ? session.learnerId : session.mentorId))}
                      onUpdateStatus={onUpdateSessionStatus}
                    />
                  ))
                ) : (
                  <div className="py-10 text-center opacity-40">
                    <p className="text-xs font-bold italic">Clear schedule.</p>
                  </div>
                )}
              </div>
           </section>

           <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
              <h2 className="text-lg font-black mb-6 flex items-center gap-2">
                <span className="text-amber-400 text-xl">🏆</span> Leaderboard
              </h2>
              <div className="space-y-5">
                {users.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 3).map((u, i) => (
                  <div key={u.id} className="flex items-center justify-between group">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border border-white/10 ${i === 0 ? 'bg-amber-400 text-amber-900' : 'bg-white/5'}`}>
                        {i + 1}
                      </div>
                      <span className="text-sm font-bold group-hover:text-indigo-400 transition-colors">{u.name}</span>
                    </div>
                    <span className="text-sm font-black text-indigo-400">{u.totalPoints} pts</span>
                  </div>
                ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
