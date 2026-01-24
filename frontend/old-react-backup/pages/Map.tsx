import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Map: React.FC = () => {
  const navigate = useNavigate();
  const [activeFloor, setActiveFloor] = useState<'1F' | '2F' | '3F'>('2F');

  // Heatmap intensity helper
  const HeatHalo = ({ level, className }: { level: 'low' | 'med' | 'high'; className?: string }) => {
    const colors = {
      low: 'from-green-400/20 via-green-400/5 to-transparent',
      med: 'from-yellow-400/30 via-yellow-400/10 to-transparent',
      high: 'from-red-500/30 via-red-500/10 to-transparent'
    };
    return (
      <div className={`absolute pointer-events-none inset-0 bg-gradient-radial ${colors[level]} blur-xl ${className}`} />
    );
  };

  const renderMapContent = () => {
    switch (activeFloor) {
      case '1F':
        return (
          <div className="relative w-full h-full p-8 animate-fade-in flex flex-col justify-center">
            {/* 1F Layout: Open Space - High Heat */}
            <div className="w-full aspect-[4/5] border border-white/60 rounded-[40px] relative bg-white/40 backdrop-blur-md overflow-hidden shadow-glass group">
              <HeatHalo level="high" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full" />
              
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-orange-50/80 to-transparent border-b border-white/20 flex items-center justify-center pt-4">
                 <span className="text-orange-800/60 font-serif tracking-[0.2em] text-[10px] uppercase font-bold">Coffee Bar</span>
              </div>
              
              <div 
                onClick={() => navigate('/booking/seats/z2')}
                className="absolute top-32 bottom-8 left-6 right-6 bg-white/80 border border-white rounded-[32px] shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] transition-all duration-500"
              >
                 <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-orange-400 text-3xl">local_cafe</span>
                 </div>
                 <span className="font-serif text-xl text-primary font-medium">综合阅览区</span>
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 rounded-full border border-red-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">High Traffic</span>
                 </div>
              </div>
            </div>
          </div>
        );
      case '2F':
        return (
          <div className="relative w-full h-full p-6 animate-fade-in flex flex-col justify-center">
             {/* 2F Layout: Silent Zones - Mixed Heat */}
             <div className="w-full aspect-[3/4] border border-white/60 rounded-[48px] relative bg-white/40 backdrop-blur-md grid grid-cols-2 gap-4 p-4 shadow-glass">
                
                {/* Main Zone - Medium Heat */}
                <div 
                  onClick={() => navigate('/booking/seats/z1')}
                  className="col-span-2 row-span-2 bg-gradient-to-br from-indigo-50/80 to-white/60 border border-white rounded-[36px] flex flex-col items-center justify-center gap-3 cursor-pointer relative overflow-hidden group transition-all hover:shadow-lg"
                >
                    <HeatHalo level="med" className="-bottom-10 right-0 w-3/4 h-3/4" />
                    <span className="material-symbols-outlined text-indigo-900/20 text-6xl absolute top-4 right-4 rotate-12">volume_off</span>
                    
                    <div className="z-10 flex flex-col items-center">
                      <span className="font-serif text-2xl text-primary font-medium">静音研讨区</span>
                      <span className="text-[10px] text-indigo-400 tracking-widest uppercase mt-1">Silent Zone</span>
                    </div>

                    <div className="z-10 mt-2 flex items-center gap-1.5">
                       <span className="text-xs font-mono font-medium text-primary">45%</span>
                       <div className="w-12 h-1 bg-indigo-100 rounded-full overflow-hidden">
                          <div className="w-[45%] h-full bg-indigo-500 rounded-full"></div>
                       </div>
                    </div>
                </div>

                {/* Sub Zones - Low Heat */}
                <div className="bg-white/60 border border-white rounded-[24px] flex flex-col items-center justify-center gap-1 relative overflow-hidden">
                   <HeatHalo level="low" className="w-full h-full opacity-50" />
                   <span className="text-xs font-medium text-secondary">Area A</span>
                   <span className="text-[10px] text-green-600 bg-green-50 px-1.5 rounded">Avail</span>
                </div>
                <div className="bg-white/60 border border-white rounded-[24px] flex flex-col items-center justify-center gap-1">
                   <span className="text-xs font-medium text-secondary">Area B</span>
                   <span className="text-[10px] text-gray-400">Locked</span>
                </div>
             </div>
          </div>
        );
      case '3F':
        return (
          <div className="relative w-full h-full p-6 animate-fade-in flex flex-col justify-center">
             {/* 3F Layout: Co-working - Low Heat */}
             <div className="w-full aspect-[3/4] border border-white/60 rounded-[48px] relative bg-white/40 backdrop-blur-md flex flex-col p-6 gap-6 shadow-glass">
                <div 
                  onClick={() => navigate('/booking/seats/z3')}
                  className="flex-1 bg-gradient-to-br from-white to-gray-50 border border-white rounded-[36px] shadow-sm flex flex-col items-center justify-center gap-4 cursor-pointer relative overflow-hidden"
                >
                   <HeatHalo level="low" className="bottom-0 w-full h-1/2" />
                   <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center rotate-3">
                      <span className="material-symbols-outlined text-gray-500 text-2xl">groups</span>
                   </div>
                   <div className="text-center">
                      <div className="font-serif text-xl text-primary font-medium">协作办公台</div>
                      <div className="text-[10px] text-secondary mt-1">Co-working Space</div>
                   </div>
                </div>
                <div className="h-28 flex gap-4">
                   <div className="flex-1 bg-white/60 border border-white rounded-[24px] flex flex-col items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-gray-300">meeting_room</span>
                      <span className="text-[9px] text-gray-400 uppercase tracking-wide">Room A</span>
                   </div>
                   <div className="flex-1 bg-white/60 border border-white rounded-[24px] flex flex-col items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-gray-300">meeting_room</span>
                      <span className="text-[9px] text-gray-400 uppercase tracking-wide">Room B</span>
                   </div>
                </div>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] min-h-screen overflow-hidden">
      {/* Header */}
      <header className="pt-14 pb-4 px-6 absolute top-0 w-full z-20 flex justify-between items-center pointer-events-none">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-sm flex items-center justify-center hover:bg-white transition-colors pointer-events-auto border border-white">
           <span className="material-symbols-outlined text-primary text-[20px]">arrow_back</span>
        </button>
        <h1 className="font-serif text-lg font-medium text-primary tracking-tight bg-white/80 backdrop-blur px-4 py-1.5 rounded-full shadow-sm border border-white">空间热力分布</h1>
        <div className="w-10"></div>
      </header>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {/* Grid Background */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
        
        {renderMapContent()}

        {/* Floor Switcher - Floating Right */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
          {['3F', '2F', '1F'].map((floor) => (
            <button
              key={floor}
              onClick={() => setActiveFloor(floor as any)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-serif transition-all duration-300 border backdrop-blur-sm ${
                activeFloor === floor 
                  ? 'bg-primary text-white shadow-xl scale-110 border-transparent' 
                  : 'bg-white/80 text-secondary border-white hover:bg-white shadow-sm'
              }`}
            >
              {floor}
            </button>
          ))}
        </div>

        {/* Legend - Floating Bottom */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl rounded-full px-6 py-3 flex gap-8 shadow-2xl border border-white/50 z-20">
           <div className="flex items-center gap-2">
             <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
             <span className="text-[10px] font-medium text-secondary uppercase tracking-wider">Comfort</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
             <span className="text-[10px] font-medium text-secondary uppercase tracking-wider">Moderate</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
             <span className="text-[10px] font-medium text-secondary uppercase tracking-wider">Busy</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Map;