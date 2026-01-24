export enum AppRoute {
  LOGIN = '/login',
  HOME = '/',
  BOOKING = '/booking',
  SEAT_SELECTION = '/booking/seats/:zoneId',
  PROFILE = '/profile',
  STATS = '/stats',
  REWARDS = '/rewards',
  MAP = '/map',
  ACHIEVEMENTS = '/achievements',
  SETTINGS = '/settings',
  MY_APPOINTMENTS = '/my-appointments',
  NOTIFICATIONS = '/notifications'
}

export interface NavItem {
  label: string;
  icon: string;
  route: AppRoute;
}

export interface Zone {
  id: string;
  name: string;
  floor: string;
  occupancy: number; // 0-100
  capacity: number;
  available: number;
  tags: string[];
  image: string;
}

export interface Seat {
  id: string;
  label: string;
  type: 'window' | 'standard' | 'booth';
  status: 'available' | 'occupied' | 'maintenance';
  x: number; // grid column
  y: number; // grid row
}

export type AppointmentStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  zoneName: string;
  seatLabel: string;
  date: string; // ISO date string or formatted string
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  qrCode?: string;
}

export interface DailyStat {
  day: string; // Mon, Tue...
  hours: number;
  date: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  points: number;
  image: string;
  category: 'food' | 'service' | 'merch';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'locked' | 'unlocked';
  dateUnlocked?: string;
}

export interface NotificationItem {
  id: string;
  type: 'system' | 'booking' | 'achievement' | 'promotion';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export interface User {
  name: string;
  level: string;
  points: number;
  avatar: string;
  isAuthenticated: boolean;
}