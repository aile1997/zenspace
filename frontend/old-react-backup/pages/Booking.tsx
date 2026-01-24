import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zone } from '../types';

const Booking: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<number>(0);
  
  // Mock Date Generation
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      day: d.getDate(),
      week: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
      full: d,
    };
  });

  const zones: Zone[] = [
    {
      id: 'z1',
      name: '静音研讨区',
      floor: '2F',
      occupancy: 45,
      capacity: 40,
      available: 22,
      tags: ['绝对安静', '独立电源'],
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'z2',
      name: '综合阅览区',
      floor: '1F',
      occupancy: 82,
      capacity: 120,
      available: 21,
      tags: ['自然光', '开放式'],
      image: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'z3',
      name: '协作办公台',
      floor: '3F',
      occupancy: 12,
      capacity: 30,
      available: 26,
      tags: ['可交谈', '白板'],
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] min-h-screen">
      {/* Header */}
      <header className="pt-16 pb-8 px-8 bg-white/80 backdrop-blur-xl sticky top-0 z-20 border-b border-black/5">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-3xl text-primary font-light tracking-tight">预约座位</h1>
            <p className="text-[10px] text-secondary tracking-[0.2em] uppercase font-bold">Select Date & Zone</p>
          </div>
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:scale-105 transition-transform active:scale-90">
             <span className="material-symbols-outlined text-gray-500 text-[20px]">close</span>
          </button>
        </div>

        {/* Date Picker - Tactile Buttons */}
        <div className="flex justify-between items-center gap-3 overflow-x-auto hide-scrollbar pb-2 mask-linear-fade">
          {dates.map((date, index) => (
            <button
              key={index}
              onClick={() => setSelectedDate(index)}
              className={`flex flex-col items-center justify-center min-w-[56px] h-[76px] rounded-[22px] transition-all duration-300 active:scale-95 ${
                selectedDate === index
                  ? 'bg-primary text-white shadow-[0_8px_20px_rgba(26,26,26,0.25)] translate-y-[-2px]'
                  : 'bg-white text-secondary hover:bg-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-transparent'
              }`}
            >
              <span className={`text-[10px] font-medium tracking-wide mb-1 uppercase ${selectedDate === index ? 'opacity-80' : 'opacity-40'}`}>{date.week}</span>
              <span className={`text-2xl font-display font-bold ${selectedDate === index ? 'text-white' : 'text-primary'}`}>
                {date.day}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Zones List */}
      <div className="p-6 flex flex-col gap-8 pb-32 overflow-y-auto">
        {zones.map((zone) => (
          <div
            key={zone.id}
            onClick={() => navigate(`/booking/seats/${zone.id}`)}
            className="group relative bg-white rounded-[32px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] cursor-pointer transition-all duration-500 transform active:scale-[0.98]"
          >
            {/* Status Tag */}
            <div className="absolute top-5 right-5 z-10 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-primary shadow-lg ring-1 ring-white/50 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${zone.occupancy > 80 ? 'bg-red-500' : zone.occupancy > 50 ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></span>
              {zone.floor}
            </div>
            
            <div className="h-44 w-full overflow-hidden relative">
               <img src={zone.image} alt={zone.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 high-key-img" />
               <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent"></div>
            </div>

            <div className="px-8 pb-8 pt-0 flex justify-between items-end relative -mt-4">
              <div className="flex flex-col gap-3">
                <h3 className="font-serif text-2xl font-medium text-primary bg-white/50 backdrop-blur-sm rounded-lg px-2 -ml-2">{zone.name}</h3>
                <div className="flex gap-2">
                  {zone.tags.map(tag => (
                    <span key={tag} className="text-[10px] text-secondary/70 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg tracking-wide font-medium">{tag}</span>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                 <div className="text-[9px] text-secondary font-bold uppercase tracking-widest">
                   Available <span className="font-display font-bold text-xl text-primary ml-1">{zone.available}</span>
                 </div>
                 <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden p-[2px]">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${zone.occupancy > 80 ? 'bg-primary' : 'bg-primary/60'}`} 
                      style={{ width: `${zone.occupancy}%` }}
                    ></div>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Booking;