import React from 'react';
import { SpeechAnalysisResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResultsViewProps {
  result: SpeechAnalysisResult;
  onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, onReset }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500/20 border-green-500/30';
    if (score >= 70) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fade-in-up">
      
      {/* Score Header */}
      <div className={`p-8 rounded-2xl border ${getScoreBg(result.score)} flex flex-col md:flex-row items-center justify-between gap-6`}>
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-white mb-2">Fluency Score</h2>
          <p className="text-slate-300">Based on filler word density per minute</p>
        </div>
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
            <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="8" 
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * result.score / 100)}
                strokeLinecap="round"
                className={`${getScoreColor(result.score)} transition-all duration-1000 ease-out`}
            />
          </svg>
          <span className={`absolute text-4xl font-bold ${getScoreColor(result.score)}`}>
            {result.score}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Statistics Card */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            Filler Breakdown
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.fillerWordBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="word" width={80} tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {result.fillerWordBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#818cf8' : '#a78bfa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <span className="text-4xl font-bold text-white">{result.totalFillerWords}</span>
            <span className="text-slate-400 ml-2">total fillers detected</span>
          </div>
        </div>

        {/* Feedback Card */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" x2="20" y1="19" y2="19"></line></svg>
            Coach's Feedback
          </h3>
          <div className="flex-grow">
            <p className="text-slate-300 leading-relaxed italic">
              "{result.feedback}"
            </p>
          </div>
          <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
             <h4 className="text-xs uppercase tracking-wide text-slate-500 font-bold mb-2">Snippet Analyzed</h4>
             <p className="text-sm text-slate-400 line-clamp-3">"...{result.transcriptionSnippet}..."</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={onReset}
          className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-bold shadow-lg hover:bg-slate-50 transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-rotate-180 transition-transform duration-500"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"></path><path d="M3 3v9h9"></path></svg>
          Start New Session
        </button>
      </div>
    </div>
  );
};

export default ResultsView;
