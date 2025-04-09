
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import OrdersPage from './pages/OrdersPage';
import PODetail from './pages/PODetail';
import CreatePO from './pages/CreatePO';
import AssignDriverPage from './pages/AssignDriverPage';
import GPSTrackingPage from './pages/GPSTrackingPage';
import DriversPage from './pages/DriversPage';
import TrucksPage from './pages/TrucksPage';
import TanksPage from './pages/TanksPage';
import StaffPage from './pages/StaffPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/orders" element={<Layout><OrdersPage /></Layout>} />
      <Route path="/orders/:id" element={<Layout><PODetail /></Layout>} />
      <Route path="/orders/edit/:id" element={<Layout><CreatePO /></Layout>} />
      <Route path="/create" element={<Layout><CreatePO /></Layout>} />
      <Route path="/assign-driver/:id" element={<Layout><AssignDriverPage /></Layout>} />
      <Route path="/gps-tracking/:id" element={<Layout><GPSTrackingPage /></Layout>} />
      <Route path="/drivers" element={<Layout><DriversPage /></Layout>} />
      <Route path="/trucks" element={<Layout><TrucksPage /></Layout>} />
      <Route path="/tanks" element={<Layout><TanksPage /></Layout>} />
      <Route path="/staff" element={<Layout><StaffPage /></Layout>} />
      <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
      <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
    </Routes>
  );
};

export default App;
