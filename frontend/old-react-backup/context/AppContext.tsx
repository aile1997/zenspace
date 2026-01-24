import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Appointment, User, NotificationItem } from '../types';

interface AppState {
  user: User;
  appointments: Appointment[];
  notifications: NotificationItem[];
  toast: { message: string; type: 'success' | 'error' | 'info'; visible: boolean } | null;
}

type Action =
  | { type: 'LOGIN'; payload: { mobile: string } }
  | { type: 'LOGOUT' }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'CANCEL_APPOINTMENT'; payload: string } // id
  | { type: 'DEDUCT_POINTS'; payload: number }
  | { type: 'SHOW_TOAST'; payload: { message: string; type: 'success' | 'error' | 'info' } }
  | { type: 'HIDE_TOAST' };

// Initial State with some mock data
const initialState: AppState = {
  user: {
    name: '虚室生白',
    level: 'Lv.5 劲竹',
    points: 1250,
    avatar: 'face_3',
    isAuthenticated: false,
  },
  appointments: [
    {
      id: 'apt-002',
      zoneName: '1F 综合阅览区',
      seatLabel: 'B12',
      date: '2023-10-25',
      startTime: '09:00',
      endTime: '11:00',
      status: 'completed',
    }
  ],
  notifications: [],
  toast: null,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: { ...state.user, isAuthenticated: true },
      };
    case 'LOGOUT':
      return {
        ...state,
        user: { ...state.user, isAuthenticated: false },
      };
    case 'ADD_APPOINTMENT':
      return {
        ...state,
        appointments: [action.payload, ...state.appointments],
      };
    case 'CANCEL_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(apt => 
          apt.id === action.payload ? { ...apt, status: 'cancelled' } : apt
        ),
      };
    case 'DEDUCT_POINTS':
      return {
        ...state,
        user: { ...state.user, points: state.user.points - action.payload },
      };
    case 'SHOW_TOAST':
      return { ...state, toast: { ...action.payload, visible: true } };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
};

export const AppProvider = ({ children }: React.PropsWithChildren<{}>) => {
  // Load from localStorage if available
  const savedState = localStorage.getItem('zenSpaceState');
  const initial = savedState ? JSON.parse(savedState) : initialState;

  const [state, dispatch] = useReducer(appReducer, initial);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('zenSpaceState', JSON.stringify(state));
  }, [state]);

  // Toast Auto-hide logic
  useEffect(() => {
    if (state.toast?.visible) {
      const timer = setTimeout(() => {
        dispatch({ type: 'HIDE_TOAST' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.toast]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
      
      {/* Global Toast Component */}
      {state.toast && state.toast.visible && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
          <div className="bg-primary text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md bg-opacity-90">
             <span className={`material-symbols-outlined text-[20px] ${
               state.toast.type === 'success' ? 'text-green-400' : 
               state.toast.type === 'error' ? 'text-red-400' : 'text-blue-400'
             }`}>
               {state.toast.type === 'success' ? 'check_circle' : state.toast.type === 'error' ? 'error' : 'info'}
             </span>
             <span className="text-sm font-medium tracking-wide">{state.toast.message}</span>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};