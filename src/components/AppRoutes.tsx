
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Analytics from "../pages/Analytics";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
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
          <Route path="analytics" element={<Analytics />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
