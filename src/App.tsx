
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
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<PODetail />} />
        <Route path="orders/edit/:id" element={<CreatePO />} />
        <Route path="create" element={<CreatePO />} />
        <Route path="assign-driver/:id" element={<AssignDriverPage />} />
        <Route path="gps-tracking/:id" element={<GPSTrackingPage />} />
        <Route path="drivers" element={<DriversPage />} />
        <Route path="trucks" element={<TrucksPage />} />
        <Route path="tanks" element={<TanksPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
