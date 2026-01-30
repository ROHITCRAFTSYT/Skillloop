
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Onboarding from './pages/Onboarding';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import SessionCard from './components/SessionCard';
import { User, AppState, Session, Skill, SessionStatus, SessionMode, UserSkill } from './types';
import { getDb, saveDb, updateCurrentUser, addSession, authenticateUser, hashPassword } from './services/db';
import { CAMPUS_DOMAIN, INITIAL_POINTS } from './constants';
import { getMatchingMentors } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(getDb());
  const [currentPage, setCurrentPage] = useState<string>(getDb().currentUser ? 'dashboard' : 'login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Sync with DB
  useEffect(() => {
    saveDb(appState);
  }, [appState]);

  const refreshMatchSuggestions = useCallback(async (user: User, allUsers: User[]) => {
    try {
      const suggestions = await getMatchingMentors(user, allUsers);
      setAppState(prev => ({ ...prev, matchSuggestions: suggestions }));
    } catch (err) {
      console.error("Failed to refresh AI suggestions", err);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      const user = await authenticateUser(email, password);
      
      if (user) {
        if (user.isBanned) {
          setAuthError('Your account has been deactivated.');
        } else {
          setAppState(prev => ({ ...prev, currentUser: user }));
          setCurrentPage('dashboard');
          // Start background refresh of matches
          refreshMatchSuggestions(user, appState.users);
        }
      } else {
        setAuthError('Invalid email or password.');
      }
    } catch (err) {
      setAuthError('An error occurred during login.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email.endsWith(CAMPUS_DOMAIN)) {
      setAuthError(`Only ${CAMPUS_DOMAIN} emails are permitted.`);
      setIsAuthenticating(false);
      return;
    }

    if (appState.users.some(u => u.email === email)) {
      setAuthError('Email already registered.');
      setIsAuthenticating(false);
      return;
    }

    try {
      const passwordHash = await hashPassword(password);
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        passwordHash,
        branch: '',
        year: 1,
        bio: '',
        avatarUrl: `https://picsum.photos/seed/${name}/200`,
        totalPoints: INITIAL_POINTS,
        ratingAverage: 0,
        ratingCount: 0,
        role: 'STUDENT',
        skills: [],
        createdAt: new Date().toISOString()
      };

      setAppState(prev => ({
        ...prev,
        users: [...prev.users, newUser],
        currentUser: newUser
      }));
      setCurrentPage('onboarding');
    } catch (err) {
      setAuthError('Failed to create account.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleOnboardingComplete = (updatedSkills: UserSkill[], branch: string, year: number, bio: string, availability: string) => {
    if (!appState.currentUser) return;
    const updatedUser: User = {
      ...appState.currentUser,
      skills: updatedSkills,
      branch,
      year,
      bio,
      availability
    };
    updateCurrentUser(updatedUser);
    
    const newUsersList = appState.users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setAppState(prev => ({
      ...prev,
      currentUser: updatedUser,
      users: newUsersList
    }));
    
    setCurrentPage('dashboard');
    // Important: Refresh suggestions now that we have skills and availability
    refreshMatchSuggestions(updatedUser, newUsersList);
  };

  const handleRequestSession = (mentorId: string, skill: UserSkill, duration: number, mode: SessionMode, note: string) => {
    if (!appState.currentUser) return;
    
    const pointsNeeded = Math.ceil((duration / 60) * 10);
    if (appState.currentUser.totalPoints < pointsNeeded) {
      alert("Insufficient points!");
      return;
    }

    const newSession: Session = {
      id: Math.random().toString(36).substr(2, 9),
      mentorId,
      learnerId: appState.currentUser.id,
      skillId: skill.skillId,
      skillName: `${skill.name} (${skill.level})`,
      status: 'REQUESTED',
      mode,
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      durationMinutes: duration,
      points: pointsNeeded,
      note,
      createdAt: new Date().toISOString()
    };

    addSession(newSession);
    setAppState(prev => ({ ...prev, sessions: [...prev.sessions, newSession] }));
    setCurrentPage('sessions');
  };

  const handleUpdateSessionStatus = (sessionId: string, status: SessionStatus) => {
    const session = appState.sessions.find(s => s.id === sessionId);
    if (!session) return;

    const updatedSession = { ...session, status };
    
    if (status === 'COMPLETED') {
      const mentor = appState.users.find(u => u.id === session.mentorId);
      const learner = appState.users.find(u => u.id === session.learnerId);
      
      if (mentor && learner) {
        const updatedMentor = { ...mentor, totalPoints: mentor.totalPoints + session.points };
        const updatedLearner = { ...learner, totalPoints: learner.totalPoints - session.points };
        
        setAppState(prev => ({
          ...prev,
          users: prev.users.map(u => {
            if (u.id === mentor.id) return updatedMentor;
            if (u.id === learner.id) return updatedLearner;
            return u;
          }),
          sessions: prev.sessions.map(s => s.id === sessionId ? updatedSession : s)
        }));

        if (appState.currentUser?.id === mentor.id) updateCurrentUser(updatedMentor);
        if (appState.currentUser?.id === learner.id) updateCurrentUser(updatedLearner);
        
        return;
      }
    }

    setAppState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === sessionId ? updatedSession : s)
    }));
  };

  const handleToggleUserBan = (userId: string) => {
    setAppState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, isBanned: !u.isBanned } : u)
    }));
  };

  const renderPage = () => {
    if (currentPage === 'login') {
      return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl border border-slate-200 shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-indigo-100">SL</div>
            <h1 className="text-3xl font-extrabold text-slate-900">SkillLoop</h1>
            <p className="text-slate-500 mt-2">Campus-only knowledge exchange</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">College Email</label>
              <input name="email" type="email" required placeholder="name@krce.ac.in" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Password</label>
              <input name="password" type="password" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            {authError && <p className="text-red-500 text-xs font-bold text-center">{authError}</p>}
            <button 
              type="submit" 
              disabled={isAuthenticating}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isAuthenticating ? 'Authenticating...' : 'Log In'}
            </button>
          </form>
          <div className="mt-8 text-center text-sm">
            <span className="text-slate-400">New here?</span>
            <button onClick={() => setCurrentPage('signup')} className="ml-1 text-indigo-600 font-bold hover:underline">Create an account</button>
          </div>
        </div>
      );
    }

    if (currentPage === 'signup') {
       return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl border border-slate-200 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900">Join the Loop</h1>
            <p className="text-slate-500 mt-2">Start trading skills with your peers.</p>
          </div>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
              <input name="name" type="text" required placeholder="John Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">College Email (@krce.ac.in)</label>
              <input name="email" type="email" required placeholder="yourname@krce.ac.in" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Password</label>
              <input name="password" type="password" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            {authError && <p className="text-red-500 text-xs font-bold text-center">{authError}</p>}
            <button 
              type="submit" 
              disabled={isAuthenticating}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isAuthenticating ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <div className="mt-8 text-center text-sm">
            <button onClick={() => setCurrentPage('login')} className="text-indigo-600 font-bold hover:underline">Already have an account? Log in</button>
          </div>
        </div>
      );
    }

    if (!appState.currentUser) return null;

    switch (currentPage) {
      case 'onboarding':
        return <Onboarding user={appState.currentUser} skills={appState.skills} onComplete={handleOnboardingComplete} />;
      case 'dashboard':
        return <Dashboard 
          user={appState.currentUser} 
          users={appState.users} 
          sessions={appState.sessions} 
          matchSuggestions={appState.matchSuggestions}
          onNavigate={setCurrentPage} 
          onUpdateSessionStatus={handleUpdateSessionStatus}
        />;
      case 'explore':
        return <Explore currentUser={appState.currentUser} users={appState.users} skills={appState.skills} onRequestSession={handleRequestSession} />;
      case 'sessions':
        return (
          <div className="space-y-8">
            <h1 className="text-3xl font-extrabold text-slate-900">My Skill Sessions</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appState.sessions.filter(s => s.mentorId === appState.currentUser?.id || s.learnerId === appState.currentUser?.id).length > 0 ? (
                appState.sessions.filter(s => s.mentorId === appState.currentUser?.id || s.learnerId === appState.currentUser?.id).map(s => (
                  <SessionCard 
                    key={s.id} 
                    session={s} 
                    isMentor={s.mentorId === appState.currentUser?.id} 
                    otherUser={appState.users.find(u => u.id === (s.mentorId === appState.currentUser?.id ? s.learnerId : s.mentorId))}
                    onUpdateStatus={handleUpdateSessionStatus}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white border border-dashed rounded-3xl border-slate-200">
                   <p className="text-slate-400">No sessions scheduled yet.</p>
                   <button onClick={() => setCurrentPage('explore')} className="mt-4 text-indigo-600 font-bold underline">Explore Skills</button>
                </div>
              )}
            </div>
          </div>
        );
      case 'profile':
        return <Profile user={appState.currentUser} users={appState.users} reviews={appState.reviews} />;
      case 'admin-dashboard':
        return <AdminDashboard users={appState.users} sessions={appState.sessions} skills={appState.skills} onToggleUserBan={handleToggleUserBan} />;
      default:
        return <div>Page coming soon...</div>;
    }
  };

  return (
    <Layout 
      user={appState.currentUser} 
      onLogout={() => { updateCurrentUser(null); setAppState(prev => ({ ...prev, currentUser: null, matchSuggestions: [] })); setCurrentPage('login'); }}
      onNavigate={setCurrentPage}
      currentPage={currentPage}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;
