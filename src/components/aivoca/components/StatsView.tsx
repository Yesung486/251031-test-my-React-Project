// 파일 위치: components/aivoca/components/StatsView.tsx

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { UserStats, Word } from '../types'; // 주소를 우리 프로젝트에 맞게 수정!
import { getFeedbackAnalysis } from '../services/geminiService'; // 주소를 우리 프로젝트에 맞게 수정!
import { Brain, TrendingUp } from 'lucide-react';

// ... (이 아래는 네가 준 코드와 99% 똑같아. 주소만 고쳤어!)
interface StatsViewProps { userStats: UserStats; words: Word[]; }

const StatsView: React.FC<StatsViewProps> = ({ userStats, words }) => {
  const [aiFeedback, setAiFeedback] = useState<string>("AI가 학습 데이터를 분석 중입니다...");

  useEffect(() => {
    getFeedbackAnalysis(words).then(setAiFeedback);
  }, [words]);

  const masteryData = [
    { name: '초급 (0-30%)', count: words.filter(w => w.masteryLevel <= 30).length },
    { name: '중급 (31-70%)', count: words.filter(w => w.masteryLevel > 30 && w.masteryLevel <= 70).length },
    { name: '완료 (71-100%)', count: words.filter(w => w.masteryLevel > 70).length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2"><TrendingUp className="text-purple-400" />학습 분석 리포트</h2>
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-6 rounded-xl border border-indigo-700 shadow-lg"><div className="flex items-start gap-4"><div className="p-3 bg-indigo-800 rounded-full"><Brain className="w-8 h-8 text-cyan-300 animate-pulse" /></div><div><h3 className="text-lg font-semibold text-cyan-300 mb-2">AI 코치 피드백</h3><p className="text-indigo-100 leading-relaxed text-sm md:text-base">{aiFeedback}</p></div></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700"><h3 className="text-lg font-medium text-slate-300 mb-4">단어 숙련도 분포</h3><div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={masteryData}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="name" stroke="#94a3b8" fontSize={12} /><YAxis stroke="#94a3b8" fontSize={12} /><Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }} cursor={{ fill: '#334155', opacity: 0.4 }}/><Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col justify-center items-center text-center"><h3 className="text-lg font-medium text-slate-300 mb-6">총 학습 성과</h3><div className="grid grid-cols-2 gap-8 w-full"><div><p className="text-sm text-slate-400">총 학습 시간</p><p className="text-3xl font-bold text-white mt-2">2.5 <span className="text-sm font-normal text-slate-500">시간</span></p></div><div><p className="text-sm text-slate-400">평균 정답률</p><p className="text-3xl font-bold text-green-400 mt-2">{userStats.quizAccuracy}%</p></div><div><p className="text-sm text-slate-400">연속 학습</p><p className="text-3xl font-bold text-orange-400 mt-2">{userStats.streak} <span className="text-sm font-normal text-slate-500">일</span></p></div><div><p className="text-sm text-slate-400">학습 단어</p><p className="text-3xl font-bold text-purple-400 mt-2">{userStats.totalWordsLearned}</p></div></div></div>
      </div>
    </div>
  );
};

export default StatsView;