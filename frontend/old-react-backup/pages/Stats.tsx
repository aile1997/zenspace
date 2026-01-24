import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DailyStat } from '../types';

const Stats: React.FC = () => {
  const navigate = useNavigate();

  // Mock Data
  const weeklyStats: DailyStat[] = [
    { day: 'Mon', hours: 2.5, date: '10/21' },
    { day: 'Tue', hours: 4.8, date: '10/22' },
    { day: 'Wed', hours: 3.5, date: '10/23' },
    { day: 'Thu', hours: 6.2, date: '10/24' },
    { day: 'Fri', hours: 4.0, date: '10/25' },
    { day: 'Sat', hours: 7.5, date: '10/26' },
    { day: 'Sun', hours: 5.2, date: '10/27' },
  ];

  const totalHours = weeklyStats.reduce((acc, curr) => acc + curr.hours, 0);

  // SVG Chart Generators
  const generateSmoothPath = (points: {x: number, y: number}[]) => {
    if (points.length === 0) return '';
    const first = points[0];
    let path = `M ${first.x},${first.y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        const controlPointX = (current.x + next.x) / 2;
        path += ` C ${controlPointX},${current.y} ${controlPointX},${next.y} ${next.x},${next.y}`;
    }
    return path;
  };

  const width = 300;
  const height = 120;
  const maxVal = 8;
  const points = weeklyStats.map((stat, i) => ({
      x: (i / (weeklyStats.length - 1)) * width,
      y: height - (stat.hours / maxVal) * height
  }));

  const linePath = generateSmoothPath(points);
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="pt-14 pb-4 px-6 bg-white/80 backdrop-blur sticky top-0 z-20 flex justify-between items-center border-b border-black/5">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
           <span className="material-symbols-outlined text-gray-500 text-[18px]">arrow_back</span>
        </button>
        <h1 className="font-serif text-lg font-medium text-primary tracking-tight">专注分析</h1>
        <div className="w-8"></div>
      </header>

      <div className="flex-1 px-6 pb-24 overflow-y-auto hide-scrollbar pt-6">
        
        {/* Hero Metric */}
        <section className="flex flex-col items-center mb-8">
           <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Conic Gradient for Distribution */}
              <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 0deg, #1a1a1a 0%, #1a1a1a 62%, #e5e5e5 62%, #e5e5e5 85%, #d4d4d4 85%, #d4d4d4 100%)' }}></div>
              <div className="absolute inset-4 bg-gray-50 rounded-full flex flex-col items-center justify-center shadow-inner">
                 <span className="text-xs text-secondary uppercase tracking-widest mb-1">Total Focus</span>
                 <div className="flex items-baseline gap-1">
                   <span className="font-display text-5xl font-bold text-primary">{totalHours}</span>
                   <span className="text-lg text-secondary font-medium">h</span>
                 </div>
              </div>
           </div>
           
           <div className="flex gap-6 mt-6">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-primary"></div>
               <span className="text-xs text-secondary">Deep Work (62%)</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-gray-300"></div>
               <span className="text-xs text-secondary">Light Work (23%)</span>
             </div>
           </div>
        </section>

        {/* Trend Chart */}
        <section className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5 mb-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-medium text-primary text-sm">本周趋势</h3>
             <span className="text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">+12.5% Growth</span>
          </div>
          
          <div className="relative h-40 w-full">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
              <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#gradient)" />
              <path d={linePath} fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke="#1a1a1a" strokeWidth="2" />
              ))}
            </svg>
            
            {/* X Axis Labels */}
            <div className="flex justify-between mt-4">
              {weeklyStats.map(s => (
                <span key={s.day} className="text-[10px] text-gray-400 font-medium w-8 text-center">{s.day}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Insights Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[24px] border border-black/5 shadow-sm">
             <div className="text-[10px] text-secondary tracking-wide uppercase mb-2">Peak Time</div>
             <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">wb_sunny</span>
                <span className="font-display text-lg font-bold text-primary">09:00</span>
             </div>
             <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">Most productive in the morning.</p>
          </div>
          <div className="bg-white p-5 rounded-[24px] border border-black/5 shadow-sm">
             <div className="text-[10px] text-secondary tracking-wide uppercase mb-2">Zone Preference</div>
             <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-500">location_on</span>
                <span className="font-serif text-lg font-medium text-primary">2F Silent</span>
             </div>
             <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">You love quiet places.</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Stats;