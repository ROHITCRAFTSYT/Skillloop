
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Review } from '../types';
import { generateGrowthRoadmap, getProfilePersona } from '../services/geminiService';

interface ProfileProps {
  user: User;
  users: User[];
  reviews: Review[];
}

const Profile: React.FC<ProfileProps> = ({ user, users, reviews }) => {
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [roadmap, setRoadmap] = useState<string>('');
  const [persona, setPersona] = useState<{ title: string; desc: string } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAI = async () => {
      setLoadingAI(true);
      const personaData = await getProfilePersona(user);
      setPersona(personaData);
      setLoadingAI(false);
    };
    fetchAI();
  }, [user]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowShareDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenerateRoadmap = async () => {
    setLoadingAI(true);
    const result = await generateGrowthRoadmap(user);
    setRoadmap(result);
    setLoadingAI(false);
  };

  const handleCopyLink = () => {
    const profileLink = `${window.location.origin}/profile/${user.id}`;
    navigator.clipboard.writeText(profileLink).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=Check%20out%20my%20SkillLoop%20profile!%20${encodeURIComponent(window.location.origin + '/profile/' + user.id)}`,
    twitter: `https://twitter.com/intent/tweet?text=Check%20out%20my%20SkillLoop%20profile!&url=${encodeURIComponent(window.location.origin + '/profile/' + user.id)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/profile/' + user.id)}`
  };

  const userReviews = useMemo(() => reviews.filter(r => r.revieweeId === user.id), [reviews, user.id]);
  const filteredReviews = useMemo(() => ratingFilter === 'all' ? userReviews : userReviews.filter(r => r.rating === ratingFilter), [userReviews, ratingFilter]);

  const teachingSkills = useMemo(() => user.skills.filter(s => s.type === 'CAN_TEACH'), [user.skills]);
  const learningSkills = useMemo(() => user.skills.filter(s => s.type === 'WANT_TO_LEARN'), [user.skills]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Profile Header */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 relative">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent opacity-10"></div>
          
          {/* Share Button Container */}
          <div className="absolute top-6 right-8 z-20" ref={dropdownRef}>
            <button 
              onClick={() => setShowShareDropdown(!showShareDropdown)}
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/20 flex items-center shadow-lg"
            >
              <span className="mr-2">🔗</span> Share Profile
            </button>
            
            {showShareDropdown && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-30 animate-in zoom-in-95 duration-200 origin-top-right">
                <div className="p-4 space-y-2">
                  <button 
                    onClick={handleCopyLink}
                    className="w-full flex items-center px-4 py-3 text-sm font-bold text-slate-700 hover:bg-indigo-50 rounded-2xl transition-colors group"
                  >
                    <span className="mr-3 text-lg group-hover:scale-110 transition-transform">{copySuccess ? '✅' : '📋'}</span>
                    {copySuccess ? 'Copied Link!' : 'Copy Link'}
                  </button>
                  <div className="h-px bg-slate-100 mx-4" />
                  <a 
                    href={shareLinks.whatsapp} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center px-4 py-3 text-sm font-bold text-slate-700 hover:bg-emerald-50 rounded-2xl transition-colors group"
                  >
                    <span className="mr-3 text-lg group-hover:scale-110 transition-transform">📱</span>
                    Share on WhatsApp
                  </a>
                  <a 
                    href={shareLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center px-4 py-3 text-sm font-bold text-slate-700 hover:bg-sky-50 rounded-2xl transition-colors group"
                  >
                    <span className="mr-3 text-lg group-hover:scale-110 transition-transform">🐦</span>
                    Share on X / Twitter
                  </a>
                  <a 
                    href={shareLinks.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 rounded-2xl transition-colors group"
                  >
                    <span className="mr-3 text-lg group-hover:scale-110 transition-transform">💼</span>
                    Share on LinkedIn
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-10 pb-10">
          <div className="relative -mt-20 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <img src={user.avatarUrl} className="w-40 h-40 rounded-[2.5rem] border-8 border-white shadow-2xl bg-slate-100 object-cover" alt="" />
              <div className="mb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user.name}</h1>
                  {persona && (
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-indigo-100">
                      {persona.title}
                    </span>
                  )}
                </div>
                <p className="text-indigo-600 font-bold mt-1 text-lg">{user.branch} • Year {user.year}</p>
                {persona && <p className="text-slate-400 text-sm mt-1 max-w-md italic">"{persona.desc}"</p>}
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2">
               <div className="bg-white px-6 py-3 rounded-2xl shadow-xl border border-slate-100 flex items-center mb-2">
                <span className="text-amber-500 text-2xl mr-2">★</span>
                <div>
                  <p className="font-black text-2xl text-slate-900 leading-none">{user.ratingAverage.toFixed(1)}</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{user.ratingCount} Peer Reviews</p>
                </div>
              </div>
              <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border border-indigo-100">
                Loop Verified Student
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Skills Section - High Contrast Differentiation */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mastery Card (Teaching) */}
              <section className="bg-indigo-50/30 p-8 rounded-[2.5rem] border-2 border-indigo-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/40 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl shadow-indigo-200 ring-4 ring-white">👨‍🏫</div>
                    <div>
                      <h3 className="text-2xl font-black text-indigo-900 tracking-tight">Mastery</h3>
                      <p className="text-xs text-indigo-600/60 font-black uppercase tracking-widest">Skills I Can Teach</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {teachingSkills.length > 0 ? teachingSkills.map((s, idx) => (
                      <div key={idx} className="bg-white border border-indigo-100 p-5 rounded-2xl flex items-center justify-between group/skill hover:shadow-md transition-all">
                        <div className="flex flex-col">
                          <span className="font-black text-indigo-900 text-lg">{s.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Verified Instructor</span>
                        </div>
                        <div className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase border ${
                          s.level === 'Advanced' ? 'bg-indigo-600 text-white border-indigo-700' :
                          s.level === 'Intermediate' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                          'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {s.level}
                        </div>
                      </div>
                    )) : (
                      <p className="text-slate-400 italic text-sm text-center py-4">No teaching skills listed yet.</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Growth Card (Learning) */}
              <section className="bg-emerald-50/30 p-8 rounded-[2.5rem] border-2 border-emerald-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/40 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl shadow-emerald-200 ring-4 ring-white">🌱</div>
                    <div>
                      <h3 className="text-2xl font-black text-emerald-900 tracking-tight">Growth</h3>
                      <p className="text-xs text-emerald-600/60 font-black uppercase tracking-widest">Target Skills</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {learningSkills.length > 0 ? learningSkills.map((s, idx) => (
                      <div key={idx} className="bg-white border border-emerald-100 p-5 rounded-2xl flex items-center justify-between group/skill hover:shadow-md transition-all">
                        <div className="flex flex-col">
                          <span className="font-black text-emerald-900 text-lg">{s.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Seeking Mentor</span>
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase border border-emerald-200">
                          Learning
                        </span>
                      </div>
                    )) : (
                      <p className="text-slate-400 italic text-sm text-center py-4">No learning targets added.</p>
                    )}
                  </div>
                </div>
              </section>
           </div>

           {/* AI Roadmap Section */}
           <section className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-600/10 rounded-full blur-[80px]"></div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                  <div>
                    <h3 className="text-3xl font-black tracking-tight flex items-center gap-3">
                      <span className="text-indigo-400">⚡</span> Learning Roadmap
                    </h3>
                    <p className="text-slate-400 text-sm mt-2 font-medium max-w-sm">Strategic AI path to bridge your current mastery with your growth goals.</p>
                  </div>
                  <button 
                    onClick={handleGenerateRoadmap}
                    disabled={loadingAI}
                    className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all disabled:opacity-50 flex items-center shadow-lg active:scale-95"
                  >
                    {loadingAI ? '✨ Analyzing...' : 'Generate AI Path'}
                  </button>
                </div>
                
                {roadmap ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                    {roadmap.split('\n').filter(l => l.trim()).slice(0, 3).map((step, idx) => (
                      <div key={idx} className="bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center font-black text-xl mb-6 shadow-xl shadow-indigo-500/20 ring-4 ring-white/5">
                          {idx + 1}
                        </div>
                        <p className="text-slate-200 font-bold leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/5">
                    <div className="text-4xl mb-4 opacity-20">🎯</div>
                    <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Unlock your custom AI roadmap</p>
                  </div>
                )}
              </div>
           </section>
        </div>

        {/* Sidebar Reviews */}
        <div className="space-y-8">
           <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
              <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <span className="text-amber-500">💬</span> Testimonials
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-8 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                <button onClick={() => setRatingFilter('all')} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${ratingFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>All</button>
                {[5, 4, 3].map(star => (
                  <button key={star} onClick={() => setRatingFilter(star)} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${ratingFilter === star ? 'bg-white text-amber-500 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
                    {star}★
                  </button>
                ))}
              </div>

              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map(review => (
                    <div key={review.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 transition-all hover:border-indigo-200 hover:bg-white hover:shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md">
                            {users.find(u => u.id === review.reviewerId)?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{users.find(u => u.id === review.reviewerId)?.name}</p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5 text-amber-500 text-[10px]">
                           {Array.from({ length: review.rating }).map((_, i) => <span key={i}>★</span>)}
                        </div>
                      </div>
                      <p className="text-slate-600 text-[11px] italic leading-relaxed font-medium">"{review.comment || 'Incredible peer-mentoring session!'}"</p>
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center">
                    <div className="text-3xl mb-4 opacity-10">⭐</div>
                    <p className="text-slate-300 text-xs font-black uppercase tracking-widest">No verified feedback</p>
                  </div>
                )}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
