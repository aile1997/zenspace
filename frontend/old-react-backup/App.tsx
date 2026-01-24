import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Booking from './pages/Booking';
import SeatSelection from './pages/SeatSelection';
import Stats from './pages/Stats';
import MyAppointments from './pages/MyAppointments';
import Rewards from './pages/Rewards';
import Achievements from './pages/Achievements';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Map from './pages/Map';
import Login from './pages/Login';
import { AppRoute } from './types';
import { useApp } from './context/AppContext';

// Guard Component
const ProtectedRoute = ({ children }: React.PropsWithChildren<{}>) => {
  const { state } = useApp();
  const location = useLocation();

  if (!state.user.isAuthenticated) {
    return <Navigate to={AppRoute.LOGIN} replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Standalone Route without Layout (No Bottom Nav) */}
        <Route path={AppRoute.LOGIN} element={<Login />} />

        {/* Protected Routes inside Layout */}
        <Route path="*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path={AppRoute.HOME} element={<Home />} />
                <Route path={AppRoute.PROFILE} element={<Profile />} />
                
                {/* Booking Flow */}
                <Route path={AppRoute.BOOKING} element={<Booking />} />
                <Route path={AppRoute.SEAT_SELECTION} element={<SeatSelection />} />

                {/* User Data & Management */}
                <Route path={AppRoute.STATS} element={<Stats />} />
                <Route path={AppRoute.MY_APPOINTMENTS} element={<MyAppointments />} />

                {/* Gamification */}
                <Route path={AppRoute.REWARDS} element={<Rewards />} />
                <Route path={AppRoute.ACHIEVEMENTS} element={<Achievements />} />

                {/* Config & Communication */}
                <Route path={AppRoute.SETTINGS} element={<Settings />} />
                <Route path={AppRoute.NOTIFICATIONS} element={<Notifications />} />
                <Route path={AppRoute.MAP} element={<Map />} />
                
                {/* Default Redirect */}
                <Route path="*" element={<Navigate to={AppRoute.HOME} replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;