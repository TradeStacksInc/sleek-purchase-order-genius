
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import AppRoutes from './components/AppRoutes';
import { Toaster } from './components/ui/toaster';
import AutoSave from './components/AutoSave';
import SupabaseSync from './components/SupabaseSync';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout>
          <AppRoutes />
        </Layout>
        <AutoSave />
        <SupabaseSync />
        <Toaster />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
