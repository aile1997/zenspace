import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: '总览', icon: 'grid_view', route: AppRoute.HOME },
    { label: '预约', icon: 'event_seat', route: AppRoute.BOOKING }, 
    { label: '商城', icon: 'local_mall', route: AppRoute.REWARDS },
    { label: '我的', icon: 'person', route: AppRoute.PROFILE },
  ];

  return (
    <div className="min-h-screen relative selection:bg-gray-100 font-sans text-primary bg-[#fcfcfc]">
      {/* Background Pattern - Subtle Noise & Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0 mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="fixed inset-0 pointer-events-none bg-grid-pattern bg-[length:40px_40px] z-0 opacity-40"></div>

      {/* Main Content Container */}
      <div className="relative flex h-full min-h-screen w-full flex-col max-w-[480px] mx-auto overflow-x-hidden bg-white/50 z-10 shadow-2xl shadow-black/5 ring-1 ring-black/5">
        <main className="flex-1 pb-32">
          {children}
        </main>

        {/* Bottom Navigation - Floating Glassmorphism */}
        <nav className="fixed bottom-6 left-0 right-0 w-full max-w-[480px] mx-auto px-6 z-50 pointer-events-none">
          <div className="pointer-events-auto bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-white/60 flex items-center justify-between px-8 py-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => navigate(item.route)}
                  className="group relative flex flex-col items-center justify-center w-12 h-12 outline-none"
                >
                  {/* Active Background Glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-md scale-110"></div>
                  )}

                  <div className={`
                    relative transition-all duration-300 ease-out flex flex-col items-center gap-1
                    ${isActive ? 'translate-y-0 text-primary' : 'text-gray-400 hover:text-primary'}
                  `}>
                    <span className={`material-symbols-outlined text-[26px] transition-all duration-300 ${isActive ? 'icon-filled scale-110' : 'icon-light group-hover:scale-105'}`}>
                      {item.icon}
                    </span>
                    
                    {/* Label - Micro interaction */}
                    <span 
                      className={`text-[9px] font-bold tracking-widest transition-all duration-300 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 hidden'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  
                  {/* Active Dot */}
                  {isActive && (
                     <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Layout;