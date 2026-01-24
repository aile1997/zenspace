import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RewardItem } from '../types';
import { useApp } from '../context/AppContext';

const Rewards: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const userPoints = state.user.points;

  const rewards: RewardItem[] = [
    {
      id: 'r1',
      title: '手冲咖啡体验券',
      description: '甄选瑰夏豆，现磨现冲',
      points: 500,
      category: 'food',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6RPAH2LO62Xy4yBusGHH4ER71zocYJV9sJhGzOvlw0-r4pEp3fFu1rZ9Ij7az35xeLYMWqzCMWAX4dK4-kzYtg1E6F2g9NrYdj_N_PpKsvI8s2G0PuWg0GtkCRRL0k9SVxlMhMmDdrshxBZPQkCod8f6kKKhQrj5l5ZpK1rL7Ax_zBVf0vi5szIlWSW2j9ARmkGvbfQvrg3L2YcfYlKFn2sd7QHQJLIxrKPDB88O4IKFMN6972S_s0diZKbxyhdSmGtsB9TQA4pRC'
    },
    {
      id: 'r2',
      title: '定制金属书签',
      description: '静谧阅读时光伴侣',
      points: 300,
      category: 'merch',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwh0fChKT5iCOKNK3imA3XqqXDL5LrQGt0sl12EWraOL-wiVG7jDcEZt9zUiERE6X-aDGNGSvGJyO5oqkz_0f3HeR5KsCKQikCNieL28ljc2DL9XrD48evjSpHzAIX8dyLoOxmHPShSB8GPMf-YLymbV17SdkMYikCJGULoNw9UW_AhcFSRHM8qsUstEerMPWT_xIpLDUnrQ59hS0TdiMycmmp9PjRaw_R_cedVgKUKzcjMnyyvbwLyWuEX6lZBIY9KFXdJwmzXFFP'
    },
    {
      id: 'r3',
      title: '专注时刻兑换券',
      description: 'VIP 研修室 1 小时',
      points: 100,
      category: 'service',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjxJgGmU-iDdvXbXRaGr9jGXwO5IOh4Czo2hU5vZgFMmWqqbW08fIoeLePRwF6HlYNgQC1FcPRlxl3bB46aWGD88-jO-M_m5cx1Eyoylp8xO4RFhWwQv5RjbE7AH0oRKyuONYJ4pCprBhflKLLTcL986GwCJKsSVNi8i7UxYP51ZigFmaeHP8Kqw-d4E5_SaY0xcrzldTWhcNxWLy2Vc0gGBhag6D6KurNixRgAUa28kFdHJ73Wgak3S5xQgjrN35Tdn5Ez6GyB3If'
    },
    {
      id: 'r4',
      title: 'MOJI 笔记本',
      description: 'A5 点阵，书写流畅',
      points: 800,
      category: 'merch',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2pPVrk9uttou5aGw_G6QYUDt_s5Fa_IqIpkheucJ5olWjCKIoMxfmgbfc1Ah5rzf57zzr4SzAZsbSaDvytxLusYo5TtqEErXlk4zIqqtXW9G38yvoZDdfPfj3xHysPiGAmHJ-eYhpD_xCvoiHFqcw0aJRVZ5U047SjmFOnoZcW6KjWenqAbMCbWqfge2OPWCRN74HUly_WZ7Pt9G-ryKXcL9PPc_yX2LrXgGntjkzwVmH2-lmvxO1Q5_wbcRchchesOfRICU89FyT'
    }
  ];

  const handleRedeem = (item: RewardItem) => {
    if (window.confirm(`确定消耗 ${item.points} 积分兑换“${item.title}”吗？`)) {
      dispatch({ type: 'DEDUCT_POINTS', payload: item.points });
      dispatch({ 
        type: 'SHOW_TOAST', 
        payload: { message: `兑换成功！${item.title} 已放入卡包`, type: 'success' } 
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white min-h-screen">
      {/* Header - White Minimalist */}
      <header className="pt-14 pb-8 px-6 flex flex-col items-center justify-center text-center relative">
         <div className="absolute top-14 right-6">
            <button className="w-9 h-9 rounded-full border border-gray-100 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
               <span className="material-symbols-outlined text-gray-500 text-[18px]">history</span>
            </button>
         </div>
         <div className="absolute top-14 left-6">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full border border-gray-100 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
               <span className="material-symbols-outlined text-gray-500 text-[18px]">arrow_back</span>
            </button>
         </div>
         
         <div className="mt-8 flex flex-col items-center gap-2">
            <span className="text-[10px] tracking-[0.2em] text-accent uppercase font-medium">Current Balance</span>
            <div className="flex items-baseline gap-1">
               <h1 className="font-serif text-[42px] font-medium text-primary tracking-tight leading-tight">{userPoints.toLocaleString()}</h1>
               <span className="text-sm text-secondary font-serif pb-1">积分</span>
            </div>
            <div className="h-[1px] w-8 bg-gray-200 mt-4"></div>
         </div>
      </header>

      <main className="flex-1 px-6 flex flex-col gap-10 pb-32 overflow-y-auto hide-scrollbar">
        {/* Redeem Section */}
        <section className="flex flex-col gap-5">
           <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-primary tracking-tight">积分兑换</h2>
              <span className="text-[11px] text-accent tracking-wider cursor-pointer hover:text-primary transition-colors">查看全部</span>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              {rewards.map((item) => (
                <div 
                   key={item.id} 
                   onClick={() => handleRedeem(item)}
                   className="group relative flex flex-col rounded-xl border border-gray-100 bg-white overflow-hidden transition-all duration-500 hover:shadow-lg cursor-pointer hover:-translate-y-1"
                >
                   <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover high-key-img transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-medium text-primary border border-gray-100 shadow-sm">
                          {item.points} 积分
                      </div>
                   </div>
                   <div className="p-3 flex flex-col gap-1">
                      <h3 className="text-sm font-medium text-primary tracking-tight group-hover:text-black transition-colors">{item.title}</h3>
                      <p className="text-[10px] text-secondary/70 line-clamp-1">{item.description}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Earn Section */}
        <section className="flex flex-col gap-5">
           <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-primary tracking-tight">赚取积分</h2>
           </div>
           
           <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50/50 transition-colors shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
                       <span className="material-symbols-outlined text-[20px] icon-light">check_circle</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                       <h3 className="text-sm font-medium text-primary">每日签到</h3>
                       <p className="text-[10px] text-secondary/60">连续签到奖励翻倍</p>
                    </div>
                 </div>
                 <button className="px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-medium tracking-wide hover:bg-black transition-colors shadow-md">
                     +10 积分
                 </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50/50 transition-colors shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
                       <span className="material-symbols-outlined text-[20px] icon-light">hourglass_top</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                       <h3 className="text-sm font-medium text-primary">完成 4h 专注</h3>
                       <p className="text-[10px] text-secondary/60">不间断学习挑战</p>
                    </div>
                 </div>
                 <button className="px-4 py-1.5 rounded-full border border-gray-200 text-primary text-[10px] font-medium tracking-wide hover:border-primary hover:bg-gray-50 transition-colors">
                     去完成
                 </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50/50 transition-colors shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
                       <span className="material-symbols-outlined text-[20px] icon-light">edit_note</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                       <h3 className="text-sm font-medium text-primary">分享自习心得</h3>
                       <p className="text-[10px] text-secondary/60">发布至社区广场</p>
                    </div>
                 </div>
                 <button className="px-4 py-1.5 rounded-full border border-gray-200 text-primary text-[10px] font-medium tracking-wide hover:border-primary hover:bg-gray-50 transition-colors">
                     去完成
                 </button>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
};

export default Rewards;