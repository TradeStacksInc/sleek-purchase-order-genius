
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "./context/AppContext";
import AIChatProvider from "./context/AIChatContext";
import AppRoutes from "./components/AppRoutes";
import AutoSave from "./components/AutoSave";
import DataPersistenceMonitor from "./components/DataPersistenceMonitor";
import { useEffect } from "react";
import { setupStorageSync } from "./utils/storageSync";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      retry: 1,
    },
  },
});

const App = () => {
  // Initialize storage sync on app load, but with the fixed version that doesn't auto-refresh
  useEffect(() => {
    setupStorageSync();
    console.info('Storage sync initialized without page refresh functionality');
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <AIChatProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
            <AutoSave />
            <DataPersistenceMonitor />
          </AIChatProvider>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
