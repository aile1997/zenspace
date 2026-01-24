import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Achievement } from '../types';

const Achievements: React.FC = () => {
  const navigate = useNavigate();

  const achievements: Achievement[] = [
    {
      id: 'a1',
      title: '初次见面',
      description: '完成第一次自习室预约并签到',
      icon: 'waving_hand',
      status: 'unlocked',
      dateUnlocked: '2023.10.01'
    },
    {
      id: 'a2',
      title: '专注大师',
      description: '单次专注时长超过 4 小时',
      icon: 'hourglass_top',
      status: 'unlocked',
      dateUnlocked: '2023.10.15'
    },
    {
      id: 'a3',
      title: '早起鸟',
      description: '连续 5 天在早上 8 点前签到',
      icon: 'wb_twilight',
      status: 'locked'
    },
    {
      id: 'a4',
      title: '深夜书房',
      description: '在晚上 10 点后完成一次签退',
      icon: 'dark_mode',
      status: 'locked'
    },
    {
      id: 'a5',
      title: '社交达人',
      description: '在协作区累计学习超过 10 小时',
      icon: 'groups',
      status: 'unlocked',
      dateUnlocked: '2023.10.20'
    },
    {
      id: 'a6',
      title: '全勤奖',
      description: '单月累计签到天数达到 20 天',
      icon: 'calendar_month',
      status: 'locked'
    }
  ];

  const unlockedCount = achievements.filter(a => a.status === 'unlocked').length;
  const totalCount = achievements.length;
  const progress = (unlockedCount / totalCount) * 100;

  return (
    <div className="flex flex-col h-full bg-gray-50/50 min-h-screen">
      {/* Header */}
      <header className="pt-14 pb-4 px-6 bg-white/80 backdrop-blur sticky top-0 z-20 flex flex-col gap-6 border-b border-black/5">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-white transition-colors">
            <span className="material-symbols-outlined text-gray-500 text-[18px]">arrow_back</span>
          </button>
          <h1 className="font-serif text-lg font-medium text-primary tracking-tight">勋章墙</h1>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-colors">
             <span className="material-symbols-outlined text-primary text-[20px]">share</span>
          </button>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-2 pb-2">
           <div className="flex justify-between items-end">
              <span className="text-[11px] text-secondary tracking-wide uppercase">Collection Progress</span>
              <span className="font-mono text-sm font-medium text-primary">{unlockedCount} / {totalCount}</span>
           </div>
           <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full bg-primary transition-all duration-1000 ease-out rounded-full" style={{ width: `${progress}%` }}></div>
           </div>
        </div>
      </header>

      {/* Grid */}
      <div className="p-6 grid grid-cols-3 gap-y-8 gap-x-4 pb-24 overflow-y-auto">
        {achievements.map((item) => (
          <div key={item.id} className="flex flex-col items-center text-center gap-3 group">
            <div className={`
              relative w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all duration-500
              ${item.status === 'unlocked' 
                ? 'bg-white border-yellow-50 shadow-elevation-1 group-hover:-translate-y-1' 
                : 'bg-gray-100 border-gray-200 opacity-60 grayscale'}
            `}>
              {/* Shine effect for unlocked */}
              {item.status === 'unlocked' && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-100/20 to-transparent pointer-events-none"></div>
              )}
              
              <span className={`material-symbols-outlined text-[32px] ${item.status === 'unlocked' ? 'text-yellow-500 icon-filled' : 'text-gray-400'}`}>
                {item.icon}
              </span>

              {/* Status Badge */}
              {item.status === 'unlocked' && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white w-5 h-5 rounded-full flex items-center justify-center">
                   <span className="material-symbols-outlined text-white text-[12px]">check</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-0.5">
               <h3 className={`font-serif text-xs font-bold ${item.status === 'unlocked' ? 'text-primary' : 'text-gray-400'}`}>
                 {item.title}
               </h3>
               {item.status === 'unlocked' && (
                 <span className="text-[9px] text-secondary/60 font-mono">{item.dateUnlocked}</span>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;