
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "../pages/Dashboard";
import CreatePO from "../pages/CreatePO";
import PODetail from "../pages/PODetail";
import Orders from "../pages/Orders";
import ActivityLog from "../pages/ActivityLog";
import AssignDriver from "../pages/AssignDriver";
import GPSTracking from "../pages/GPSTracking";
import DeliveryLog from "../pages/DeliveryLog";
import DeliveryTracking from "../pages/DeliveryTracking";
import OffloadLog from "../pages/OffloadLog";
import NotFound from "../pages/NotFound";
import TruckManagement from "../pages/TruckManagement";
import FinancialDashboard from "../pages/FinancialDashboard"; 
import DeliveryAnalytics from "../pages/DeliveryAnalytics"; 
import TankManagement from "../pages/TankManagement";
import DispenserManagement from "../pages/DispenserManagement";
import PriceManagement from "../pages/PriceManagement";
import StaffManagement from "../pages/StaffManagement";
import SalesRecording from "../pages/SalesRecording";
import FraudDetection from "../pages/FraudDetection";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Outlet /></Layout>}>
          <Route index element={<Dashboard />} />
          <Route path="create" element={<CreatePO />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<PODetail />} />
          <Route path="assign-driver" element={<AssignDriver />} />
          <Route path="delivery-tracking" element={<DeliveryTracking />} />
          <Route path="gps-tracking" element={<GPSTracking />} />
          <Route path="delivery-log" element={<DeliveryLog />} />
          <Route path="offload-log" element={<OffloadLog />} />
          <Route path="logs" element={<ActivityLog />} />
          <Route path="manage-trucks" element={<TruckManagement />} />
          <Route path="financial-dashboard" element={<FinancialDashboard />} />
          <Route path="delivery-analytics" element={<DeliveryAnalytics />} />
          <Route path="tank-management" element={<TankManagement />} />
          <Route path="dispenser-management" element={<DispenserManagement />} />
          <Route path="price-management" element={<PriceManagement />} />
          <Route path="staff-management" element={<StaffManagement />} />
          <Route path="sales-recording" element={<SalesRecording />} />
          <Route path="fraud-detection" element={<FraudDetection />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
