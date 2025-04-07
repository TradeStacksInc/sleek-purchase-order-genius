
import React from 'react';
import { BrowserRouter, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import AppRoutes from './components/AppRoutes';
import { Toaster } from './components/ui/toaster';
import AIChatWidget from './components/AIChatWidget';
import AutoSave from './components/AutoSave';
import SupabaseSync from './components/SupabaseSync';
import AIChatProvider from './context/AIChatContext';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AIChatProvider>
          <Layout>
            <AppRoutes />
          </Layout>
          <AIChatWidget />
          <AutoSave />
          <SupabaseSync />
          <Toaster />
        </AIChatProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
