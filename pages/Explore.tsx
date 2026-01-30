
import React, { useState, useEffect } from 'react';
import { User, Skill, UserSkill, SessionMode } from '../types';
import { semanticMentorSearch, suggestSessionAgenda } from '../services/geminiService';

interface ExploreProps {
  currentUser: User;
  users: User[];
  skills: Skill[];
  onRequestSession: (mentorId: string, skill: UserSkill, duration: number, mode: SessionMode, note: string) => void;
}

const Explore: React.FC<ExploreProps> = ({ currentUser, users, skills, onRequestSession }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [isAISearch, setIsAISearch] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [rankedMentorIds, setRankedMentorIds] = useState<string[]>([]);
  
  // Modal State
  const [requestModal, setRequestModal] = useState<{
    show: boolean;
    mentor?: User;
    skill?: UserSkill;
  }>({ show: false });
  
  const [requestNote, setRequestNote] = useState('');
  const [requestDuration, setRequestDuration] = useState(60);
  const [requestMode, setRequestMode] = useState<SessionMode>('Online');
  const [isGeneratingAgenda, setIsGeneratingAgenda] = useState(false);

  const mentors = users.filter(u => 
    u.id !== currentUser.id && 
    !u.isBanned &&
    u.skills.some(s => s.type === 'CAN_TEACH')
  );

  useEffect(() => {
    const performAISearch = async () => {
      if (isAISearch && searchTerm.length > 3) {
        setAiLoading(true);
        const results = await semanticMentorSearch(searchTerm, mentors);
        setRankedMentorIds(results);
        setAiLoading(false);
      } else {
        setRankedMentorIds([]);
      }
    };
    performAISearch();
  }, [searchTerm, isAISearch]);

  const filteredMentors = isAISearch && rankedMentorIds.length > 0
    ? mentors
        .filter(m => rankedMentorIds.includes(m.id))
        .sort((a, b) => rankedMentorIds.indexOf(a.id) - rankedMentorIds.indexOf(b.id))
    : mentors.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              m.branch.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSkill = selectedSkill === 'All' || m.skills.some(s => s.name === selectedSkill && s.type === 'CAN_TEACH');
        return matchesSearch && matchesSkill;
      });

  const openRequestModal = (mentor: User, skill: UserSkill) => {
    setRequestModal({ show: true, mentor, skill });
    setRequestNote('');
    setRequestDuration(60);
    setRequestMode('Online');
  };

  const generateAIAgenda = async () => {
    if (!requestModal.mentor || !requestModal.skill) return;
    setIsGeneratingAgenda(true);
    const agenda = await suggestSessionAgenda(requestModal.mentor, requestModal.skill.name, requestNote);
    setRequestNote(prev => prev ? `${prev}\n\nSuggested Agenda:\n${agenda}` : `Suggested Agenda:\n${agenda}`);
    setIsGeneratingAgenda(false);
  };

  const renderAvatar = (user: User | undefined, sizeClass: string = "w-14 h-14") => {
    if (!user) return null;
    if (user.avatarUrl) return <img src={user.avatarUrl} className={`${sizeClass} rounded-full border-2 border-indigo-100 shadow-sm mr-4 object-cover`} alt="" />;
    return <div className={`${sizeClass} rounded-full border-2 border-indigo-100 shadow-sm mr-4 flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-xl uppercase`}>{user.name.charAt(0)}</div>;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Skill Discovery</h1>
            <p className="text-slate-500 text-sm">Find peers who know what you want to learn.</p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
            <button 
              onClick={() => setIsAISearch(false)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!isAISearch ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Classic
            </button>
            <button 
              onClick={() => setIsAISearch(true)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center ${isAISearch ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="mr-1.5">✨</span> AI Search
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder={isAISearch ? "E.g. I want someone to help me fix my code bugs..." : "Search by name, branch, or skill..."}
              className="w-full pl-6 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {aiLoading && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>}
          </div>
          {!isAISearch && (
            <select 
              className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-600"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
            >
              <option value="All">All Skills</option>
              {skills.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map(mentor => (
          <div key={mentor.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {renderAvatar(mentor)}
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{mentor.name}</h3>
                  <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">{mentor.branch} • Year {mentor.year}</p>
                </div>
              </div>
              <div className="flex items-center text-sm font-black text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                ★ {mentor.ratingAverage.toFixed(1)}
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6 line-clamp-2 leading-relaxed italic">"{mentor.bio}"</p>

            <div className="mb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Availability</p>
              <div className="flex flex-wrap gap-2">
                {(mentor.availability || 'Flexible').split(',').map((slot, sIdx) => (
                  <span key={sIdx} className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-100 flex items-center shadow-sm">
                    <span className="mr-1.5 opacity-50">🕒</span>{slot.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6 flex-grow">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Mastery</p>
              <div className="flex flex-wrap gap-2">
                {mentor.skills.filter(s => s.type === 'CAN_TEACH').map((skill, idx) => (
                  <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-indigo-100">
                    {skill.name} • {skill.level}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 mt-auto">
              {mentor.skills.filter(s => s.type === 'CAN_TEACH').map((skill, idx) => (
                 <button 
                   key={idx}
                   disabled={currentUser.totalPoints < 10}
                   onClick={() => openRequestModal(mentor, skill)}
                   className={`w-full py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-between px-6 ${
                     currentUser.totalPoints >= 10 
                     ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100' 
                     : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                   }`}
                 >
                   <span>Request {skill.name}</span>
                   <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px]">10 pts</span>
                 </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {requestModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-2xl font-black text-slate-900">Configure Session</h2>
              <button onClick={() => setRequestModal({ show: false })} className="text-slate-400 hover:text-slate-600 p-2 text-xl">✕</button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-center bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                {renderAvatar(requestModal.mentor, "w-16 h-16")}
                <div>
                  <p className="text-lg font-bold text-slate-900">{requestModal.mentor?.name}</p>
                  <p className="text-sm text-indigo-700 font-bold uppercase tracking-tight">Mentoring in {requestModal.skill?.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Length</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none" value={requestDuration} onChange={(e) => setRequestDuration(Number(e.target.value))}>
                    <option value={30}>30 mins (5 pts)</option>
                    <option value={60}>1 hour (10 pts)</option>
                    <option value={90}>1.5 hours (15 pts)</option>
                    <option value={120}>2 hours (20 pts)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mode</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none" value={requestMode} onChange={(e) => setRequestMode(e.target.value as SessionMode)}>
                    <option value="Online">Online Video</option>
                    <option value="Offline">In-Person</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Goals & Agenda</label>
                  <button 
                    onClick={generateAIAgenda}
                    disabled={isGeneratingAgenda}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 disabled:opacity-50"
                  >
                    {isGeneratingAgenda ? '✨ Thinking...' : '✨ Use Gemini Agenda'}
                  </button>
                </div>
                <textarea 
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[150px] font-medium leading-relaxed"
                  placeholder="What specific topics should we focus on?"
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                />
              </div>

              <button 
                onClick={() => {
                  if (requestModal.mentor && requestModal.skill) {
                    onRequestSession(requestModal.mentor.id, requestModal.skill, requestDuration, requestMode, requestNote);
                    setRequestModal({ show: false });
                  }
                }}
                className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
              >
                Send Proposal ({Math.ceil((requestDuration / 60) * 10)} pts)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
