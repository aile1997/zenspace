import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Appointment } from '../types';
import { useApp } from '../context/AppContext';

const MyAppointments: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [selectedTicket, setSelectedTicket] = useState<Appointment | null>(null);

  const appointments = state.appointments;

  const filteredAppointments = appointments.filter(apt => {
    if (activeTab === 'upcoming') return apt.status === 'upcoming' || apt.status === 'active';
    return apt.status === 'completed' || apt.status === 'cancelled';
  });

  const handleCancel = (id: string) => {
    if(window.confirm('确定要取消此预约吗？')) {
      dispatch({ type: 'CANCEL_APPOINTMENT', payload: id });
      dispatch({ type: 'SHOW_TOAST', payload: { message: '预约已取消', type: 'info' } });
    }
  };

  // Weather Widget
  const WeatherWidget = () => (
    <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-2xl border border-blue-100 flex items-center justify-between shadow-sm mb-6">
       <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-orange-400">partly_cloudy_day</span>
          <div className="flex flex-col">
             <span className="text-xs font-medium text-primary">今天, Tokyo</span>
             <span className="text-[10px] text-secondary">24°C • 适宜出行</span>
          </div>
       </div>
       <span className="text-[10px] text-blue-500 bg-blue-100/50 px-2 py-1 rounded-md">Good for Walk</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="pt-14 pb-4 px-6 bg-white/80 backdrop-blur sticky top-0 z-20 shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-white transition-colors">
                <span className="material-symbols-outlined text-gray-500 text-[18px]">arrow_back</span>
                </button>
                <h1 className="font-serif text-2xl font-medium text-primary tracking-tight">我的行程</h1>
            </div>
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
               <span className="material-symbols-outlined text-primary">calendar_today</span>
            </button>
        </div>

        {/* Tabs - Pill Shape */}
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === 'upcoming' ? 'text-primary' : 'text-gray-400'}`}
          >
            即将开始
            {activeTab === 'upcoming' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === 'history' ? 'text-primary' : 'text-gray-400'}`}
          >
            历史记录
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></div>}
          </button>
        </div>
      </header>

      {/* List */}
      <div className="p-6 flex flex-col gap-4 pb-24">
        {activeTab === 'upcoming' && <WeatherWidget />}

        {filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
             <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-gray-300">confirmation_number</span>
             </div>
             <p className="text-xs text-secondary tracking-widest uppercase">No Appointments</p>
          </div>
        ) : (
          filteredAppointments.map(apt => (
            <div 
                key={apt.id} 
                className="group relative flex flex-col bg-white rounded-[24px] shadow-sm border border-black/5 overflow-hidden transition-all duration-300 hover:shadow-lg active:scale-[0.99]"
            >
              {/* Ticket Top - Status Color */}
              <div className={`h-2 w-full ${
                apt.status === 'upcoming' ? 'bg-[#1a1a1a]' : 
                apt.status === 'completed' ? 'bg-gray-300' : 'bg-red-300'
              }`}></div>
              
              <div className="p-6 pb-0 flex flex-col gap-4">
                 <div className="flex justify-between items-start">
                    <div>
                        <span className="text-[10px] text-secondary tracking-wide uppercase block mb-1">Zone Area</span>
                        <h3 className="font-serif text-xl font-medium text-primary">{apt.zoneName}</h3>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-secondary tracking-wide uppercase block mb-1">Seat No.</span>
                        <span className="font-display text-2xl font-bold text-primary">{apt.seatLabel}</span>
                    </div>
                 </div>
                 
                 <div className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex-1">
                        <span className="text-[10px] text-gray-400 block">Date</span>
                        <span className="text-xs font-medium text-primary">{apt.date}</span>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="flex-1">
                        <span className="text-[10px] text-gray-400 block">Time</span>
                        <span className="text-xs font-medium text-primary">{apt.startTime} - {apt.endTime}</span>
                    </div>
                 </div>
              </div>

              {/* Realistic Tear Line */}
              <div className="relative h-8 w-full my-2 flex items-center">
                  <div className="absolute left-[-10px] w-5 h-5 bg-gray-50 rounded-full shadow-inner border-r border-black/5"></div>
                  <div className="w-full border-b-2 border-dashed border-gray-200 mx-6"></div>
                  <div className="absolute right-[-10px] w-5 h-5 bg-gray-50 rounded-full shadow-inner border-l border-black/5"></div>
              </div>

              {/* Ticket Bottom Actions */}
              <div className="px-6 pb-6 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${apt.status === 'upcoming' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-xs font-medium text-secondary">
                        {apt.status === 'upcoming' ? 'Ready to check-in' : apt.status === 'completed' ? 'Completed' : 'Cancelled'}
                    </span>
                 </div>

                 {apt.status === 'upcoming' && (
                   <div className="flex gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCancel(apt.id); }}
                        className="text-[11px] text-red-500 font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => setSelectedTicket(apt)}
                        className="bg-primary text-white text-[11px] font-bold uppercase tracking-wider px-5 py-2 rounded-xl shadow-lg shadow-black/20 hover:scale-105 transition-transform flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[14px]">qr_code</span>
                        Ticket
                      </button>
                   </div>
                 )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Full Screen Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#1a1a1a]/90 backdrop-blur-md animate-fade-in" onClick={() => setSelectedTicket(null)}>
           <div 
             className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl animate-scale-up"
             onClick={e => e.stopPropagation()}
           >
              <div className="bg-primary p-8 text-center text-white relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:16px_16px]"></div>
                 <h3 className="font-serif text-2xl font-medium relative z-10">{selectedTicket.zoneName}</h3>
                 <p className="text-white/60 text-sm mt-2 font-mono relative z-10">{selectedTicket.date} • {selectedTicket.startTime}</p>
              </div>
              <div className="p-8 flex flex-col items-center gap-6">
                 <div className="w-64 h-64 border-2 border-black rounded-3xl p-2">
                    <div className="w-full h-full bg-black flex items-center justify-center text-white/20">
                       {/* Abstract QR Placeholder */}
                       <span className="material-symbols-outlined text-8xl">qr_code_2</span>
                    </div>
                 </div>
                 <p className="text-xs text-secondary text-center max-w-[200px]">
                   Scan this code at the entrance kiosk to access your seat.
                 </p>
                 <button onClick={() => setSelectedTicket(null)} className="text-primary text-sm font-bold underline">Close Ticket</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;