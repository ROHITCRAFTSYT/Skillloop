
import React, { useState } from 'react';
import { User, Skill, SkillLevel, UserSkill } from '../types';

interface OnboardingProps {
  user: User;
  skills: Skill[];
  onComplete: (updatedSkills: UserSkill[], branch: string, year: number, bio: string, availability: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ user, skills, onComplete }) => {
  const [step, setStep] = useState(1);
  const [teachSkills, setTeachSkills] = useState<UserSkill[]>([]);
  const [learnSkills, setLearnSkills] = useState<UserSkill[]>([]);
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState(1);
  const [bio, setBio] = useState('');
  const [availability, setAvailability] = useState('');

  const toggleSkill = (skill: Skill, list: UserSkill[], setList: React.Dispatch<React.SetStateAction<UserSkill[]>>, type: 'CAN_TEACH' | 'WANT_TO_LEARN') => {
    const exists = list.find(s => s.skillId === skill.id);
    if (exists) {
      setList(list.filter(s => s.skillId !== skill.id));
    } else {
      setList([...list, { skillId: skill.id, name: skill.name, type, level: 'Beginner' }]);
    }
  };

  const handleLevelChange = (skillId: string, level: SkillLevel, setList: React.Dispatch<React.SetStateAction<UserSkill[]>>) => {
    setList(prev => prev.map(s => s.skillId === skillId ? { ...s, level } : s));
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const finish = () => {
    onComplete([...teachSkills, ...learnSkills], branch, year, bio, availability);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl mt-10">
      <div className="flex mb-8 justify-between items-center">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
              step === i ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 
              step > i ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-slate-300'
            }`}>
              {step > i ? '✓' : i}
            </div>
            <span className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${step === i ? 'text-indigo-600' : 'text-slate-300'}`}>
              {i === 1 ? 'Teach' : i === 2 ? 'Learn' : 'Profile'}
            </span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-slate-900">What can you teach?</h2>
            <p className="text-slate-500">Select skills you are confident in sharing with others.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {skills.map(s => {
              const selected = teachSkills.find(ts => ts.skillId === s.id);
              return (
                <div key={s.id} className={`p-4 border-2 rounded-xl transition-all cursor-pointer ${
                  selected ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'
                }`} onClick={() => toggleSkill(s, teachSkills, setTeachSkills, 'CAN_TEACH')}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm">{s.name}</span>
                    <input type="checkbox" checked={!!selected} readOnly className="rounded text-indigo-600" />
                  </div>
                  {selected && (
                    <select 
                      className="w-full mt-1 text-xs border border-indigo-200 rounded p-1 bg-white outline-none"
                      onClick={(e) => e.stopPropagation()}
                      value={selected.level}
                      onChange={(e) => handleLevelChange(s.id, e.target.value as SkillLevel, setTeachSkills)}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={nextStep} disabled={teachSkills.length === 0} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 disabled:opacity-50">Next Step</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-slate-900">What do you want to learn?</h2>
            <p className="text-slate-500">Pick some skills you want to master.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {skills.map(s => {
              const selected = learnSkills.find(ts => ts.skillId === s.id);
              const alreadyTeaching = teachSkills.find(ts => ts.skillId === s.id);
              if (alreadyTeaching) return null;
              return (
                <div key={s.id} className={`p-4 border-2 rounded-xl transition-all cursor-pointer ${
                  selected ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'
                }`} onClick={() => toggleSkill(s, learnSkills, setLearnSkills, 'WANT_TO_LEARN')}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm">{s.name}</span>
                    <input type="checkbox" checked={!!selected} readOnly className="rounded text-indigo-600" />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4">
            <button onClick={prevStep} className="flex-1 border border-slate-200 py-4 rounded-2xl font-bold">Back</button>
            <button onClick={nextStep} disabled={learnSkills.length === 0} className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 disabled:opacity-50">Next Step</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-slate-900">Tell us about yourself</h2>
            <p className="text-slate-500">Complete your profile to find better matches.</p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Branch</label>
                <input 
                  type="text" 
                  placeholder="e.g. CSE" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Year</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">General Availability</label>
              <input 
                type="text" 
                placeholder="e.g. Weekdays after 5 PM, Weekends anytime" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Short Bio</label>
              <textarea 
                rows={3} 
                placeholder="Share a bit about your experience..." 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={prevStep} className="flex-1 border border-slate-200 py-4 rounded-2xl font-bold">Back</button>
            <button onClick={finish} disabled={!branch || !bio} className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 disabled:opacity-50">Complete Onboarding</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
