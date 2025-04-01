
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CreatePO from "./pages/CreatePO";
import PODetail from "./pages/PODetail";
import Orders from "./pages/Orders";
import ActivityLog from "./pages/ActivityLog";
import AssignDriver from "./pages/AssignDriver";
import GPSTracking from "./pages/GPSTracking";
import DeliveryLog from "./pages/DeliveryLog";
import NotFound from "./pages/NotFound";
import AIChatProvider from "./context/AIChatContext";
import AIChatWidget from "./components/AIChatWidget";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AIChatProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="create" element={<CreatePO />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="orders/:id" element={<PODetail />} />
                  <Route path="assign-driver" element={<AssignDriver />} />
                  <Route path="gps-tracking" element={<GPSTracking />} />
                  <Route path="delivery-log" element={<DeliveryLog />} />
                  <Route path="logs" element={<ActivityLog />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
              <AIChatWidget />
            </BrowserRouter>
          </TooltipProvider>
        </AIChatProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
