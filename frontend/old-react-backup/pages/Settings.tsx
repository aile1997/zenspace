import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [zenMode, setZenMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <div 
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full flex items-center transition-colors duration-300 cursor-pointer px-0.5 ${checked ? 'bg-primary' : 'bg-gray-200'}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50/50 min-h-screen">
      {/* Header */}
      <header className="pt-14 pb-4 px-6 bg-white/80 backdrop-blur sticky top-0 z-20 border-b border-black/5">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-white transition-colors">
             <span className="material-symbols-outlined text-gray-500 text-[18px]">arrow_back</span>
           </button>
           <h1 className="font-serif text-lg font-medium text-primary tracking-tight">偏好设置</h1>
        </div>
      </header>

      <div className="p-6 flex flex-col gap-8 pb-24">
        
        {/* Section: Zen Mode */}
        <section>
          <h2 className="text-[10px] text-secondary uppercase tracking-widest mb-3 pl-1">专注体验</h2>
          <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <span className="material-symbols-outlined text-[18px]">self_improvement</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-primary">Zen Mode</span>
                  <span className="text-[10px] text-secondary">入座后自动屏蔽非必要通知</span>
                </div>
              </div>
              <Toggle checked={zenMode} onChange={setZenMode} />
            </div>
          </div>
        </section>

        {/* Section: General */}
        <section>
          <h2 className="text-[10px] text-secondary uppercase tracking-widest mb-3 pl-1">通用</h2>
          <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-gray-50">
               <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">notifications</span>
                  <span className="text-sm font-medium text-primary">推送通知</span>
               </div>
               <Toggle checked={notifications} onChange={setNotifications} />
            </div>
            <div className="p-4 flex items-center justify-between border-b border-gray-50 cursor-pointer hover:bg-gray-50/50 transition-colors">
               <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">language</span>
                  <span className="text-sm font-medium text-primary">多语言</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-xs text-secondary">简体中文</span>
                 <span className="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</span>
               </div>
            </div>
             <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors">
               <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">dark_mode</span>
                  <span className="text-sm font-medium text-primary">深色模式</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-xs text-secondary">跟随系统</span>
                 <span className="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</span>
               </div>
            </div>
          </div>
        </section>

        {/* Section: Privacy & Support */}
        <section>
          <h2 className="text-[10px] text-secondary uppercase tracking-widest mb-3 pl-1">支持</h2>
          <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-gray-50 cursor-pointer hover:bg-gray-50/50 transition-colors">
               <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">description</span>
                  <span className="text-sm font-medium text-primary">用户协议</span>
               </div>
               <span className="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</span>
            </div>
            <div className="p-4 flex items-center justify-between border-b border-gray-50 cursor-pointer hover:bg-gray-50/50 transition-colors">
               <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">lock</span>
                  <span className="text-sm font-medium text-primary">隐私政策</span>
               </div>
               <span className="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</span>
            </div>
             <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors">
               <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">delete_outline</span>
                  <span className="text-sm font-medium text-red-500">注销账户</span>
               </div>
               <span className="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</span>
            </div>
          </div>
        </section>

        <div className="text-center mt-4">
           <p className="font-serif text-lg text-primary/20">ZenSpace</p>
           <p className="text-[9px] text-gray-300 mt-1">Version 2.4.0 (Build 2039)</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;