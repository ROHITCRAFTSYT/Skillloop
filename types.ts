
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type SkillType = 'CAN_TEACH' | 'WANT_TO_LEARN';
export type SessionStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type SessionMode = 'Online' | 'Offline';

export interface UserSkill {
  skillId: string;
  name: string;
  type: SkillType;
  level: SkillLevel;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  branch: string;
  year: number;
  bio: string;
  availability?: string;
  avatarUrl: string;
  totalPoints: number;
  ratingAverage: number;
  ratingCount: number;
  skills: UserSkill[];
  role: 'STUDENT' | 'ADMIN';
  createdAt: string;
  isBanned?: boolean;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Session {
  id: string;
  mentorId: string;
  learnerId: string;
  skillId: string;
  skillName: string;
  status: SessionStatus;
  mode: SessionMode;
  scheduledAt: string;
  durationMinutes: number;
  points: number;
  note?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  sessionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface MatchSuggestion {
  learnerId: string;
  mentorId: string;
  skillId: string;
  skillName: string;
  score: number;
  reason?: string;
  compatibilityTag?: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  sessions: Session[];
  skills: Skill[];
  reviews: Review[];
  matchSuggestions: MatchSuggestion[];
}
