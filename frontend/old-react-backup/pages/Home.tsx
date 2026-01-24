import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <header className="pt-16 pb-8 px-8 flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h2 className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase pl-0.5">ZenSpace</h2>
          <div className="relative group cursor-pointer flex items-center gap-2">
            <h1 className="font-serif text-[32px] font-light text-primary tracking-tight leading-tight">
              丸の内<br /><span className="text-2xl opacity-60">中央馆</span>
            </h1>
            <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors text-[24px] self-start mt-2">
              expand_more
            </span>
          </div>
        </div>
        <button 
          onClick={() => navigate(AppRoute.NOTIFICATIONS)}
          className="relative w-12 h-12 rounded-full border border-white bg-white/40 backdrop-blur-xl shadow-sm flex items-center justify-center hover:bg-white hover:shadow-md hover:scale-105 transition-all duration-300 active:scale-95"
        >
          <span className="material-symbols-outlined text-primary text-[22px]">notifications</span>
          <div className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></div>
        </button>
      </header>

      <div className="px-6 flex flex-col gap-10 animate-fade-in pb-8">
        {/* Live Stats */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-bold text-accent tracking-[0.2em] uppercase">Real-time Traffic</h3>
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/80 border border-gray-100 shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[9px] text-primary font-bold tracking-wider uppercase">Live</span>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-8 flex flex-col gap-8 shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-white">
            {/* Meter 1 */}
            <div className="flex flex-col gap-3 group cursor-pointer">
              <div className="flex justify-between items-end">
                <span className="text-xs text-secondary font-medium tracking-wide group-hover:text-primary transition-colors">1F 综合阅览区</span>
                <span className="font-display text-xl text-primary font-bold leading-none">82<span className="text-[10px] text-gray-400 ml-0.5 font-normal">%</span></span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden p-[2px]">
                <div className="h-full bg-gradient-to-r from-gray-600 via-gray-800 to-black w-[82%] rounded-full shadow-sm transition-all duration-1000 group-hover:w-[85%]"></div>
              </div>
            </div>
            
            {/* Meter 2 */}
            <div className="flex flex-col gap-3 group cursor-pointer">
              <div className="flex justify-between items-end">
                <span className="text-xs text-secondary font-medium tracking-wide group-hover:text-primary transition-colors">2F 静音研讨室</span>
                <span className="font-display text-xl text-primary font-bold leading-none">45<span className="text-[10px] text-gray-400 ml-0.5 font-normal">%</span></span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden p-[2px]">
                <div className="h-full bg-gradient-to-r from-gray-300 to-gray-500 w-[45%] rounded-full transition-all duration-1000 group-hover:w-[48%]"></div>
              </div>
            </div>
            
            {/* Meter 3 */}
            <div className="flex flex-col gap-3 group cursor-pointer">
              <div className="flex justify-between items-end">
                <span className="text-xs text-secondary font-medium tracking-wide group-hover:text-primary transition-colors">3F 开放协作台</span>
                <span className="font-display text-xl text-primary font-bold leading-none">12<span className="text-[10px] text-gray-400 ml-0.5 font-normal">%</span></span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden p-[2px]">
                <div className="h-full bg-gradient-to-r from-gray-200 to-gray-300 w-[12%] rounded-full transition-all duration-1000 group-hover:w-[15%]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="grid grid-cols-2 gap-5">
          <div 
            onClick={() => navigate(AppRoute.BOOKING)}
            className="group relative flex flex-col rounded-[32px] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white"
          >
            <div className="relative w-full aspect-[4/5] overflow-hidden">
              <img 
                alt="Smart Pick" 
                className="w-full h-full object-cover high-key-img transition-transform duration-1000 group-hover:scale-110" 
                src="https://images.unsplash.com/photo-1507537297725-24a1c434c67b?q=80&w=800&auto=format&fit=crop" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col items-start">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20 shadow-lg">
                <span className="material-symbols-outlined text-white text-[20px]">event_seat</span>
              </div>
              <h2 className="font-serif text-2xl font-light text-white tracking-wide leading-tight">智能<br/>选座</h2>
              <div className="h-[1px] w-8 bg-white/40 mt-4 mb-2"></div>
              <p className="text-[9px] text-white/60 font-medium tracking-widest uppercase">Smart Booking</p>
            </div>
          </div>

          <div 
            onClick={() => navigate(AppRoute.REWARDS)}
            className="group relative flex flex-col rounded-[32px] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white"
          >
            <div className="relative w-full aspect-[4/5] overflow-hidden">
              <img 
                alt="Rewards" 
                className="w-full h-full object-cover high-key-img transition-transform duration-1000 group-hover:scale-110" 
                src="https://images.unsplash.com/photo-1616031036329-373b53c65c2b?q=80&w=800&auto=format&fit=crop" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col items-start">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20 shadow-lg">
                <span className="material-symbols-outlined text-white text-[20px]">local_mall</span>
              </div>
              <h2 className="font-serif text-2xl font-light text-white tracking-wide leading-tight">积分<br/>商城</h2>
              <div className="h-[1px] w-8 bg-white/40 mt-4 mb-2"></div>
              <p className="text-[9px] text-white/60 font-medium tracking-widest uppercase">Rewards Club</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;