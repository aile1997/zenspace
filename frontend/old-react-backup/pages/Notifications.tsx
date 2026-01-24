import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationItem } from '../types';

const Notifications: React.FC = () => {
  const navigate = useNavigate();

  const notifications: NotificationItem[] = [
    {
      id: 'n1',
      type: 'booking',
      title: '预约即将开始',
      message: '您预约的 [2F 静音研讨区 A5] 将在 15 分钟后开始，请准时入座。',
      time: '13:45',
      isRead: false,
    },
    {
      id: 'n2',
      type: 'achievement',
      title: '解锁新勋章',
      message: '恭喜！您已达成“社交达人”成就，点击查看详情。',
      time: '10:30',
      isRead: false,
    },
    {
      id: 'n3',
      type: 'system',
      title: '系统维护通知',
      message: '为了提供更好的服务，我们将于明日凌晨 02:00 进行系统升级。',
      time: '昨天',
      isRead: true,
    },
    {
      id: 'n4',
      type: 'promotion',
      title: '限时积分双倍',
      message: '本周末预约任意时段，即可享受积分双倍奖励！',
      time: '昨天',
      isRead: true,
    }
  ];

  const getIcon = (type: string) => {
    switch(type) {
      case 'booking': return 'event_seat';
      case 'achievement': return 'military_tech';
      case 'promotion': return 'local_offer';
      default: return 'info';
    }
  };

  const getColor = (type: string) => {
    switch(type) {
      case 'booking': return 'bg-blue-50 text-blue-600';
      case 'achievement': return 'bg-yellow-50 text-yellow-600';
      case 'promotion': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 min-h-screen">
      {/* Header */}
      <header className="pt-14 pb-4 px-6 bg-white/80 backdrop-blur sticky top-0 z-20 border-b border-black/5 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-white transition-colors">
             <span className="material-symbols-outlined text-gray-500 text-[18px]">arrow_back</span>
           </button>
           <h1 className="font-serif text-lg font-medium text-primary tracking-tight">消息中心</h1>
        </div>
        <button className="text-[11px] text-primary font-medium px-3 py-1 rounded-full bg-white border border-black/5 shadow-sm active:bg-gray-50">
          全部已读
        </button>
      </header>

      {/* List */}
      <div className="p-4 flex flex-col gap-3 pb-24 overflow-y-auto">
        {notifications.map((item) => (
          <div key={item.id} className={`p-4 rounded-2xl border border-black/5 flex gap-4 transition-colors ${item.isRead ? 'bg-gray-50/50' : 'bg-white shadow-sm'}`}>
            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${getColor(item.type)}`}>
               <span className="material-symbols-outlined text-[20px]">{getIcon(item.type)}</span>
            </div>
            
            <div className="flex-1 flex flex-col gap-1">
               <div className="flex justify-between items-start">
                 <h3 className={`text-sm font-medium ${item.isRead ? 'text-secondary' : 'text-primary'}`}>
                   {item.title}
                 </h3>
                 <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{item.time}</span>
               </div>
               <p className="text-xs text-secondary/80 leading-relaxed line-clamp-2">
                 {item.message}
               </p>
            </div>
            
            {!item.isRead && (
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
            )}
          </div>
        ))}

        <div className="text-center mt-6 mb-4">
           <span className="text-[10px] text-gray-300">仅显示最近 30 天的消息</span>
        </div>
      </div>
    </div>
  );
};

export default Notifications;