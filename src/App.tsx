
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import PODetail from './pages/PODetail';
import CreatePO from './pages/CreatePO';
import AssignDriver from './pages/AssignDriver';
import GPSTracking from './pages/GPSTracking';
import Drivers from './pages/DriversPage';
import TruckManagement from './pages/TruckManagement';
import TankManagement from './pages/TankManagement';
import StaffManagement from './pages/StaffManagement';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import DeliveryLog from './pages/DeliveryLog';
import OffloadLog from './pages/OffloadLog';
import DispenserManagement from './pages/DispenserManagement';
import PriceManagement from './pages/PriceManagement';
import SalesRecording from './pages/SalesRecording';
import FinancialDashboard from './pages/FinancialDashboard';
import ActivityLog from './pages/ActivityLog';
import FraudDetection from './pages/FraudDetection';
import DeliveryAnalytics from './pages/DeliveryAnalytics';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/orders" element={<Layout><Orders /></Layout>} />
      <Route path="/orders/:id" element={<Layout><PODetail /></Layout>} />
      <Route path="/orders/edit/:id" element={<Layout><CreatePO /></Layout>} />
      <Route path="/create" element={<Layout><CreatePO /></Layout>} />
      <Route path="/assign-driver" element={<Layout><AssignDriver /></Layout>} />
      <Route path="/delivery-log" element={<Layout><DeliveryLog /></Layout>} />
      <Route path="/offload-log" element={<Layout><OffloadLog /></Layout>} />
      <Route path="/gps-tracking" element={<Layout><GPSTracking /></Layout>} />
      <Route path="/drivers" element={<Layout><Drivers /></Layout>} />
      <Route path="/manage-trucks" element={<Layout><TruckManagement /></Layout>} />
      <Route path="/tank-management" element={<Layout><TankManagement /></Layout>} />
      <Route path="/dispenser-management" element={<Layout><DispenserManagement /></Layout>} />
      <Route path="/price-management" element={<Layout><PriceManagement /></Layout>} />
      <Route path="/sales-recording" element={<Layout><SalesRecording /></Layout>} />
      <Route path="/financial-dashboard" element={<Layout><FinancialDashboard /></Layout>} />
      <Route path="/staff-management" element={<Layout><StaffManagement /></Layout>} />
      <Route path="/logs" element={<Layout><ActivityLog /></Layout>} />
      <Route path="/fraud-detection" element={<Layout><FraudDetection /></Layout>} />
      <Route path="/delivery-analytics" element={<Layout><DeliveryAnalytics /></Layout>} />
      <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
      <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
    </Routes>
  );
};

export default App;
