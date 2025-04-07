
// Add the SupabaseSync component to the App
import React from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import AppRoutes from './components/AppRoutes';
import { Toaster } from './components/ui/toaster';
import AIChatWidget from './components/AIChatWidget';
import AutoSave from './components/AutoSave';
import SupabaseSync from './components/SupabaseSync';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Layout>
        <AppRoutes />
      </Layout>
      <AIChatWidget />
      <AutoSave />
      <SupabaseSync />
      <Toaster />
    </AppProvider>
  );
}

export default App;
