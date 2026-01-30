
import { User, Session, Review, Skill, AppState } from '../types';
import { MOCK_USERS, INITIAL_SKILLS } from '../constants';

const DB_KEY = 'skillloop_db';

/**
 * Hash a password using SHA-256 (Web Crypto API)
 */
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const getDb = (): AppState => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    const initialState: AppState = {
      currentUser: null,
      users: MOCK_USERS,
      sessions: [],
      skills: INITIAL_SKILLS,
      reviews: [],
      matchSuggestions: []
    };
    saveDb(initialState);
    return initialState;
  }
  const parsed = JSON.parse(data);
  // Ensure matchSuggestions exists for backwards compatibility during dev
  if (!parsed.matchSuggestions) parsed.matchSuggestions = [];
  return parsed;
};

export const saveDb = (state: AppState) => {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
};

export const updateCurrentUser = (user: User | null) => {
  const db = getDb();
  db.currentUser = user;
  saveDb(db);
};

export const addSession = (session: Session) => {
  const db = getDb();
  db.sessions.push(session);
  saveDb(db);
};

export const updateSession = (session: Session) => {
  const db = getDb();
  db.sessions = db.sessions.map(s => s.id === session.id ? session : s);
  saveDb(db);
};

// Auth helper
export const authenticateUser = async (email: string, passwordPlain: string): Promise<User | null> => {
  const db = getDb();
  const user = db.users.find(u => u.email === email);
  if (!user) return null;
  
  const hash = await hashPassword(passwordPlain);
  if (user.passwordHash === hash) {
    return user;
  }
  return null;
};
