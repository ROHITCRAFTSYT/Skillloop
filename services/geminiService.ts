
import { GoogleGenAI, Type } from "@google/genai";
import { User, MatchSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMatchingMentors = async (learner: User, allUsers: User[]): Promise<MatchSuggestion[]> => {
  if (!process.env.API_KEY) return fallbackMatching(learner, allUsers);

  const mentors = allUsers.filter(u => u.id !== learner.id && !u.isBanned);
  const wantsToLearn = learner.skills.filter(s => s.type === 'WANT_TO_LEARN');

  if (wantsToLearn.length === 0) return [];

  const prompt = `
    Analyze this learner and provide the top 5 mentor matches.
    Learner: ${JSON.stringify({ name: learner.name, branch: learner.branch, year: learner.year, learning: wantsToLearn.map(s => s.name) })}
    Mentors Pool: ${JSON.stringify(mentors.map(m => ({ id: m.id, name: m.name, branch: m.branch, year: m.year, teaching: m.skills.filter(s => s.type === 'CAN_TEACH').map(s => s.name) })))}
    Return top 5 results as JSON array with mentorId, skillName, score, and a short 'compatibilityTag' (e.g. "Senior Guide", "Branch Peer").
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              mentorId: { type: Type.STRING },
              skillId: { type: Type.STRING },
              skillName: { type: Type.STRING },
              score: { type: Type.NUMBER },
              reason: { type: Type.STRING },
              compatibilityTag: { type: Type.STRING }
            },
            required: ["mentorId", "skillName", "score"]
          }
        }
      }
    });
    const suggestions = JSON.parse(response.text || '[]') as MatchSuggestion[];
    return suggestions.map(s => ({ ...s, learnerId: learner.id }));
  } catch (error) {
    return fallbackMatching(learner, allUsers);
  }
};

export const generateGrowthRoadmap = async (user: User): Promise<string> => {
  if (!process.env.API_KEY) return "1. Find a mentor. 2. Schedule session. 3. Practice.";

  const prompt = `
    Generate a 3-step learning roadmap for ${user.name}.
    They want to learn: ${user.skills.filter(s => s.type === 'WANT_TO_LEARN').map(s => s.name).join(', ')}.
    They are currently in ${user.branch}, Year ${user.year}.
    Format: Return 3 concise points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text || "No roadmap generated.";
  } catch {
    return "Complete 3 peer sessions to level up your mastery.";
  }
};

export const getProfilePersona = async (user: User): Promise<{ title: string; desc: string }> => {
  if (!process.env.API_KEY) return { title: "Skill Seeker", desc: "A valued member of KRCE Loop." };

  const prompt = `
    Based on these skills, give this student a cool "Persona" title and 1-sentence description.
    Teaching: ${user.skills.filter(s => s.type === 'CAN_TEACH').map(s => s.name).join(', ')}
    Learning: ${user.skills.filter(s => s.type === 'WANT_TO_LEARN').map(s => s.name).join(', ')}
    Return as JSON: { "title": "...", "desc": "..." }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            desc: { type: Type.STRING }
          },
          required: ["title", "desc"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch {
    return { title: "Knowledge Pioneer", desc: "Passionate about sharing and learning." };
  }
};

export const getCampusPulse = async (sessions: any[]): Promise<string> => {
  if (!process.env.API_KEY || sessions.length === 0) return "Web Dev is trending this week!";

  const prompt = `
    Analyze these campus sessions and give a 1-sentence witty trend report.
    Sessions: ${JSON.stringify(sessions.slice(-10).map(s => s.skillName))}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text || "Peer learning is at an all-time high!";
  } catch {
    return "Technical skills are the top trade this week.";
  }
};

export const semanticMentorSearch = async (query: string, mentors: User[]): Promise<string[]> => {
  if (!process.env.API_KEY || query.length < 3) return mentors.map(m => m.id);
  const prompt = `Rank these mentor IDs by relevance to: "${query}".\nMentors: ${JSON.stringify(mentors.map(m => ({ id: m.id, bio: m.bio, skills: m.skills.map(s => s.name) })))}`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
    });
    return JSON.parse(response.text || '[]');
  } catch { return mentors.map(m => m.id); }
};

export const suggestSessionAgenda = async (mentor: User, skill: string, note: string): Promise<string> => {
  if (!process.env.API_KEY) return "1. Basics 2. Exercise 3. Q&A";
  const prompt = `3-point agenda for ${mentor.name} teaching ${skill}. Note: ${note}`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "Agenda not available.";
  } catch { return "Review fundamentals, Live Demo, Q&A."; }
};

export const getLoopAdvisorAdvice = async (user: User): Promise<string> => {
  if (!process.env.API_KEY) return "Keep sharing your skills!";
  const prompt = `Advice for ${user.name} with ${user.totalPoints} points. Friendly.`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "Trade skills, gain loops!";
  } catch { return "Ready for your next skill swap?"; }
};

const fallbackMatching = (learner: User, allUsers: User[]): MatchSuggestion[] => {
  const suggestions: MatchSuggestion[] = [];
  const wants = learner.skills.filter(s => s.type === 'WANT_TO_LEARN');
  wants.forEach(w => {
    allUsers.forEach(m => {
      if (m.id === learner.id || m.isBanned) return;
      if (m.skills.some(s => s.name === w.name && s.type === 'CAN_TEACH')) {
        suggestions.push({ learnerId: learner.id, mentorId: m.id, skillId: '', skillName: w.name, score: 0.8, reason: "Manual match", compatibilityTag: "Skill Match" });
      }
    });
  });
  return suggestions.slice(0, 5);
};
