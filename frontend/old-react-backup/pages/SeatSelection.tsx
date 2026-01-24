import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Seat, Appointment } from '../types';
import { useApp } from '../context/AppContext';

const SeatSelection: React.FC = () => {
  const navigate = useNavigate();
  const { zoneId } = useParams();
  const { dispatch } = useApp();
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingState, setBookingState] = useState<'idle' | 'processing' | 'success'>('idle');

  // Mock Seat Layout Generation (Grid 6x8)
  const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];
    const rows = 8;
    const cols = 6;
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Create some aisles/empty spaces
        if (x === 2 && y !== 0 && y !== 7) continue; 
        if (x === 3 && y !== 0 && y !== 7) continue;

        const id = `${String.fromCharCode(65 + y)}${x + 1}`;
        const isWindow = x === 0 || x === 5;
        const isOccupied = Math.random() < 0.3; // 30% occupied

        seats.push({
          id,
          label: id,
          type: isWindow ? 'window' : 'standard',
          status: isOccupied ? 'occupied' : 'available',
          x,
          y
        });
      }
    }
    return seats;
  };

  const [seats] = useState<Seat[]>(generateSeats());

  const handleSeatClick = (seatId: string) => {
    setSelectedSeat(seatId === selectedSeat ? null : seatId);
    if (seatId !== selectedSeat) {
       setShowModal(true);
    }
  };

  const handleConfirm = () => {
    if (!selectedSeat) return;

    setBookingState('processing');
    
    setTimeout(() => {
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        zoneName: '2F 静音研讨区', 
        seatLabel: selectedSeat,
        date: new Date().toLocaleDateString(),
        startTime: '14:00',
        endTime: '18:00',
        status: 'upcoming',
        qrCode: 'generated_qr_code'
      };

      dispatch({ type: 'ADD_APPOINTMENT', payload: newAppointment });
      
      setBookingState('success');
      
      dispatch({ 
        type: 'SHOW_TOAST', 
        payload: { message: '预约成功，座席已为您保留', type: 'success' } 
      });

      setTimeout(() => {
        navigate('/my-appointments');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative">
      {/* Header */}
      <header className="pt-16 pb-6 px-6 bg-white/80 backdrop-blur-xl z-20 flex justify-between items-center shadow-sm border-b border-white/50">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-secondary hover:text-primary transition-colors pl-2">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="text-sm font-medium tracking-wide">区域列表</span>
        </button>
        <span className="font-serif text-lg font-medium text-primary">2F 静音研讨区</span>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <span className="material-symbols-outlined text-[20px]">tune</span>
        </button>
      </header>

      {/* Map Container */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8 relative">
        {/* Decorative Floor Grid */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
        
        <div className="relative p-10 bg-white rounded-[60px] shadow-2xl shadow-gray-200/50 border-[6px] border-white ring-1 ring-gray-100" 
             style={{ 
                minWidth: '320px'
             }}>
           
           {/* Windows Indicators with Reflection Effect */}
           <div className="absolute -left-6 top-16 bottom-16 w-5 bg-sky-50/80 border border-white rounded-l-2xl overflow-hidden backdrop-blur-sm shadow-sm">
              <div className="absolute top-0 right-0 w-[1px] h-full bg-white/50"></div>
              <div className="absolute top-[-50%] left-0 w-full h-[200%] bg-gradient-to-b from-transparent via-white/80 to-transparent -rotate-12 opacity-30"></div>
           </div>
           <div className="absolute -right-6 top-16 bottom-16 w-5 bg-sky-50/80 border border-white rounded-r-2xl overflow-hidden backdrop-blur-sm shadow-sm">
               <div className="absolute top-0 left-0 w-[1px] h-full bg-white/50"></div>
               <div className="absolute top-[-50%] left-0 w-full h-[200%] bg-gradient-to-b from-transparent via-white/80 to-transparent -rotate-12 opacity-30"></div>
           </div>

           <div className="grid gap-x-5 gap-y-6" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
              {seats.map((seat) => (
                <button
                  key={seat.id}
                  disabled={seat.status === 'occupied'}
                  onClick={() => handleSeatClick(seat.id)}
                  style={{ gridColumnStart: seat.x + 1, gridRowStart: seat.y + 1 }}
                  className={`
                    relative w-10 h-10 flex flex-col items-center justify-end transition-all duration-300 group
                    ${seat.status === 'occupied' ? 'cursor-not-allowed opacity-40 grayscale' : 'cursor-pointer'}
                    ${seat.id === selectedSeat ? 'z-10 scale-115' : 'z-0 hover:scale-105'}
                  `}
                >
                  {/* Chair Backrest - Realistic Shape */}
                  <div className={`
                    w-[80%] h-3 rounded-t-lg mb-[1px] shadow-sm border border-b-0 transition-colors duration-300 relative z-0 mx-auto
                    ${seat.id === selectedSeat 
                      ? 'bg-primary border-primary' 
                      : seat.status === 'occupied' ? 'bg-gray-200 border-gray-300' : 'bg-white border-gray-300 group-hover:border-primary'}
                  `}></div>
                  
                  {/* Chair Seat - Realistic Shape */}
                  <div className={`
                    w-full h-8 rounded-lg shadow-sm flex items-center justify-center transition-colors duration-300 relative z-10 border
                    ${seat.id === selectedSeat 
                      ? 'bg-primary text-white shadow-xl shadow-primary/30 border-primary translate-y-[-2px]' 
                      : seat.status === 'occupied' ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-gray-50 text-secondary group-hover:bg-white group-hover:text-primary border-gray-200 group-hover:border-primary'}
                  `}>
                    <span className="text-[10px] font-bold font-mono">{seat.label}</span>
                  </div>

                  {/* Floor Shadow */}
                  {seat.id !== selectedSeat && (
                    <div className="absolute -bottom-2.5 w-6 h-1 bg-black/10 rounded-full blur-[3px] transition-all group-hover:w-8 group-hover:blur-[4px] group-hover:bg-primary/20"></div>
                  )}
                </button>
              ))}
           </div>
        </div>
      </div>
      
      {/* Legend - Floating */}
      <div className="absolute bottom-32 left-0 right-0 flex justify-center z-10 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-xl px-8 py-3 rounded-full flex gap-8 shadow-2xl shadow-black/5 border border-white ring-1 ring-black/5">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded bg-white border border-gray-300"></div>
             <span className="text-[10px] text-secondary font-bold tracking-wide">空闲</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded bg-gray-200/70 border border-gray-200"></div>
             <span className="text-[10px] text-gray-400 font-bold tracking-wide">占用</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded bg-primary shadow-lg shadow-primary/30"></div>
             <span className="text-[10px] text-primary font-bold tracking-wide">已选</span>
           </div>
        </div>
      </div>

      {/* Booking Confirmation Modal - Centered */}
      {showModal && selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-secondary/30 backdrop-blur-md transition-opacity duration-300"
             onClick={() => setShowModal(false)}
           ></div>
           
           {/* Modal Content */}
           <div className="relative w-full max-w-[340px] bg-white rounded-[32px] shadow-2xl overflow-hidden animate-scale-up">
              {/* Top Gradient */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50/80 to-transparent pointer-events-none"></div>
              
              <div className="relative p-8 flex flex-col items-center">
                 <h2 className="font-serif text-[22px] font-medium text-primary mb-1 tracking-tight">预约确认</h2>
                 <p className="text-[11px] text-gray-400 tracking-widest uppercase mb-8 font-medium">Booking Confirmation</p>
                 
                 <div className="w-full flex flex-col gap-6 mb-8">
                    {/* Seat Row */}
                    <div className="flex items-center justify-between">
                       <span className="text-[13px] text-gray-400 font-medium tracking-wide">预约座位</span>
                       <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          <span className="font-serif text-[17px] text-primary font-medium tracking-wide">{selectedSeat}</span>
                       </div>
                    </div>
                    <div className="h-px w-full bg-gray-100"></div>
                    
                    {/* Time Row */}
                    <div className="flex items-center justify-between">
                       <span className="text-[13px] text-gray-400 font-medium tracking-wide">预约时段</span>
                       <span className="font-sans text-[15px] text-primary font-medium tracking-tight">14:00 - 18:00</span>
                    </div>
                    <div className="h-px w-full bg-gray-100"></div>
                    
                    {/* Price Row */}
                    <div className="flex items-center justify-between pt-1">
                       <span className="text-[13px] text-gray-400 font-medium tracking-wide">支付金额</span>
                       <span className="font-serif text-2xl text-primary font-medium">¥50.00</span>
                    </div>
                 </div>

                 <button 
                   onClick={handleConfirm}
                   disabled={bookingState !== 'idle'}
                   className="w-full bg-[#333333] hover:bg-black text-white py-4 rounded-2xl font-medium text-[15px] tracking-widest shadow-lg shadow-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                 >
                   {bookingState === 'idle' ? (
                     <>
                        <span>确认支付</span>
                        <span className="material-symbols-outlined text-[16px] opacity-80">arrow_forward</span>
                     </>
                   ) : (
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                   )}
                 </button>
                 
                 <button 
                   onClick={() => setShowModal(false)}
                   className="mt-4 text-[13px] text-gray-400 hover:text-primary transition-colors tracking-wide font-medium"
                 >
                    取消预约
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Success Overlay */}
      {bookingState === 'success' && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
           <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-8 shadow-2xl shadow-green-500/30 animate-scale-up">
              <span className="material-symbols-outlined text-white text-[48px]">check</span>
           </div>
           <h2 className="font-serif text-3xl text-primary font-medium mb-3">预约成功</h2>
           <p className="text-secondary text-sm font-light">Prepare for your flow state.</p>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;