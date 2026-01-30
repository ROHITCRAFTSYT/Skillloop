
import { Skill, User } from './types';

export const CAMPUS_DOMAIN = '@krce.ac.in';
export const POINTS_PER_HOUR = 10;
export const INITIAL_POINTS = 10;

// Default SHA-256 hash for "password123"
const DEFAULT_HASH = 'ef92b778ba7158595a403135e3a8e344e73065d35aa759f3a8474ac2a0014e7c';

export const INITIAL_SKILLS: Skill[] = [
  { id: 's1', name: 'C Programming' },
  { id: 's2', name: 'Logo Design' },
  { id: 's3', name: 'Video Editing' },
  { id: 's4', name: 'Python' },
  { id: 's5', name: 'UI/UX Design' },
  { id: 's6', name: 'Public Speaking' },
  { id: 's7', name: 'React Development' },
  { id: 's8', name: 'Financial Literacy' },
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alice Johnson',
    email: 'alice@krce.ac.in',
    passwordHash: DEFAULT_HASH,
    branch: 'CSE',
    year: 3,
    bio: 'Passionate about React and UI design.',
    availability: 'Mon-Wed: 6 PM - 9 PM, Weekends flexible',
    avatarUrl: 'https://picsum.photos/seed/alice/200',
    totalPoints: 50,
    ratingAverage: 4.8,
    ratingCount: 12,
    role: 'STUDENT',
    createdAt: new Date().toISOString(),
    skills: [
      { skillId: 's7', name: 'React Development', type: 'CAN_TEACH', level: 'Advanced' },
      { skillId: 's5', name: 'UI/UX Design', type: 'CAN_TEACH', level: 'Intermediate' },
      { skillId: 's8', name: 'Financial Literacy', type: 'WANT_TO_LEARN', level: 'Beginner' }
    ]
  },
  {
    id: 'u2',
    name: 'Bob Smith',
    email: 'bob@krce.ac.in',
    passwordHash: DEFAULT_HASH,
    branch: 'ECE',
    year: 2,
    bio: 'Avid coder and Python enthusiast.',
    availability: 'Daily after 5 PM',
    avatarUrl: 'https://picsum.photos/seed/bob/200',
    totalPoints: 30,
    ratingAverage: 4.2,
    ratingCount: 8,
    role: 'STUDENT',
    createdAt: new Date().toISOString(),
    skills: [
      { skillId: 's4', name: 'Python', type: 'CAN_TEACH', level: 'Advanced' },
      { skillId: 's1', name: 'C Programming', type: 'CAN_TEACH', level: 'Intermediate' },
      { skillId: 's3', name: 'Video Editing', type: 'WANT_TO_LEARN', level: 'Beginner' }
    ]
  },
  {
    id: 'admin1',
    name: 'SkillLoop Admin',
    email: 'admin@krce.ac.in',
    passwordHash: DEFAULT_HASH,
    branch: 'Administration',
    year: 0,
    bio: 'Platform administrator.',
    availability: 'Office hours only',
    avatarUrl: 'https://picsum.photos/seed/admin/200',
    totalPoints: 9999,
    ratingAverage: 5.0,
    ratingCount: 0,
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
    skills: []
  }
];
