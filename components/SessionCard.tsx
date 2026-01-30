
import React from 'react';
import { Session, User, SessionStatus } from '../types';

interface SessionCardProps {
  session: Session;
  otherUser: User | undefined;
  isMentor: boolean;
  onUpdateStatus: (id: string, status: SessionStatus) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, otherUser, isMentor, onUpdateStatus }) => {
  const getStatusColor = (status: SessionStatus) => {
    switch(status) {
      case 'REQUESTED': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'CANCELLED': return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formattedDate = new Date(session.scheduledAt).toLocaleString();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getStatusColor(session.status)} uppercase tracking-wider`}>
            {session.status}
          </span>
          <h3 className="text-lg font-bold mt-2 text-slate-800">{session.skillName}</h3>
          <p className="text-sm text-slate-500 mt-1">
            {isMentor ? 'Teaching ' : 'Learning from '} 
            <span className="font-semibold text-indigo-600">{otherUser?.name || 'Unknown'}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-900">{session.points} Points</p>
          <p className="text-xs text-slate-400">{session.durationMinutes} mins</p>
        </div>
      </div>

      <div className="flex items-center text-sm text-slate-600 mb-4 bg-slate-50 p-2 rounded-lg">
        <span className="mr-2">📅</span>
        <span>{formattedDate}</span>
        <span className="mx-2">•</span>
        <span className="font-medium">{session.mode}</span>
      </div>

      {session.note && (
        <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Session Note</p>
          <p className="text-xs text-slate-600 italic">"{session.note}"</p>
        </div>
      )}

      <div className="flex space-x-2">
        {session.status === 'REQUESTED' && isMentor && (
          <>
            <button 
              onClick={() => onUpdateStatus(session.id, 'CONFIRMED')}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
            >
              Accept
            </button>
            <button 
              onClick={() => onUpdateStatus(session.id, 'CANCELLED')}
              className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50"
            >
              Decline
            </button>
          </>
        )}
        {session.status === 'CONFIRMED' && (
          <button 
            onClick={() => onUpdateStatus(session.id, 'COMPLETED')}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700"
          >
            Mark as Completed
          </button>
        )}
        {session.status === 'REQUESTED' && !isMentor && (
          <button 
            onClick={() => onUpdateStatus(session.id, 'CANCELLED')}
            className="w-full border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50"
          >
            Cancel Request
          </button>
        )}
      </div>
    </div>
  );
};

export default SessionCard;
