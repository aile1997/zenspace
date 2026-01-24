import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { useApp } from '../context/AppContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { user } = state;

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate(AppRoute.LOGIN);
  };

  return (
    <>
      <header className="pt-12 px-6 flex justify-end items-center">
        <button 
          onClick={() => navigate(AppRoute.NOTIFICATIONS)}
          className="relative w-10 h-10 rounded-full border border-black/5 bg-white/50 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
        >
          <span className="material-symbols-outlined text-primary">notifications_none</span>
          <div className="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-red-500 border border-white"></div>
        </button>
      </header>

      <main className="flex-1 px-6 flex flex-col gap-10 pt-4">
        {/* User Info */}
        <section className="flex flex-col items-center justify-center gap-4">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full overflow-hidden border-[0.5px] border-black/10 p-1 bg-white shadow-elevation-1">
              <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center overflow-hidden">
                <span className="material-symbols-outlined text-[48px] text-gray-300 icon-light">{user.avatar}</span>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 bg-primary text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
              <span className="material-symbols-outlined text-[14px]">edit</span>
            </div>
          </div>
          <div className="text-center flex flex-col gap-2 items-center">
            <h1 className="font-serif text-2xl font-medium text-primary tracking-tight">{user.name}</h1>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/60 backdrop-blur border border-black/5 rounded-full shadow-sm">
              <span className="material-symbols-outlined text-[14px] text-green-700 icon-filled">spa</span>
              <span className="text-[11px] font-serif tracking-widest text-secondary font-medium">{user.level}</span>
            </div>
          </div>
        </section>

        {/* Function Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => navigate(AppRoute.MY_APPOINTMENTS)}
            className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white/80 border border-black/5 shadow-sm hover:shadow-elevation-1 transition-all duration-300 cursor-pointer aspect-[1.1/1]"
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <span className="material-symbols-outlined icon-light text-[22px]">calendar_month</span>
            </div>
            <span className="font-serif text-[13px] tracking-widest text-primary font-medium">我的预约</span>
          </div>

          <div 
             onClick={() => navigate(AppRoute.STATS)}
            className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white/80 border border-black/5 shadow-sm hover:shadow-elevation-1 transition-all duration-300 cursor-pointer aspect-[1.1/1]"
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <span className="material-symbols-outlined icon-light text-[22px]">auto_graph</span>
            </div>
            <span className="font-serif text-[13px] tracking-widest text-primary font-medium">学习周报</span>
          </div>

          <div 
            onClick={() => navigate(AppRoute.ACHIEVEMENTS)}
            className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white/80 border border-black/5 shadow-sm hover:shadow-elevation-1 transition-all duration-300 cursor-pointer aspect-[1.1/1]"
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <span className="material-symbols-outlined icon-light text-[22px]">workspace_premium</span>
            </div>
            <span className="font-serif text-[13px] tracking-widest text-primary font-medium">勋章墙</span>
          </div>

          <div 
            onClick={() => navigate(AppRoute.SETTINGS)}
            className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white/80 border border-black/5 shadow-sm hover:shadow-elevation-1 transition-all duration-300 cursor-pointer aspect-[1.1/1]"
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <span className="material-symbols-outlined icon-light text-[22px]">tune</span>
            </div>
            <span className="font-serif text-[13px] tracking-widest text-primary font-medium">偏好设置</span>
          </div>
        </section>

        {/* System Menu */}
        <section className="flex flex-col">
          <h3 className="text-xs font-medium text-accent tracking-[0.1em] uppercase mb-3 pl-1">系统设置</h3>
          <div className="bg-white/60 backdrop-blur border border-black/5 rounded-2xl overflow-hidden shadow-glass">
            <div className="flex items-center justify-between p-4 border-b border-black/5 cursor-pointer group hover:bg-white/80 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">shield</span>
                <span className="text-[13px] font-medium text-primary tracking-wide">账户与安全</span>
              </div>
              <span className="material-symbols-outlined text-gray-300 text-[18px] group-hover:text-primary transition-colors">chevron_right</span>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-black/5 cursor-pointer group hover:bg-white/80 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">help_center</span>
                <span className="text-[13px] font-medium text-primary tracking-wide">帮助与反馈</span>
              </div>
              <span className="material-symbols-outlined text-gray-300 text-[18px] group-hover:text-primary transition-colors">chevron_right</span>
            </div>
            <div className="flex items-center justify-between p-4 cursor-pointer group hover:bg-white/80 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
                <span className="text-[13px] font-medium text-primary tracking-wide">关于我们</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-accent">v2.4.0</span>
                <span className="material-symbols-outlined text-gray-300 text-[18px] group-hover:text-primary transition-colors">chevron_right</span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="mt-6 w-full py-3 text-[13px] text-red-800/70 hover:text-red-800 font-medium tracking-wide bg-red-50/50 hover:bg-red-50 rounded-xl transition-colors border border-red-100/50"
          >
            退出登录
          </button>
        </section>
      </main>
    </>
  );
};

export default Profile;