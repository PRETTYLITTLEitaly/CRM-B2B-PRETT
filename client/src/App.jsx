import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Maps from './pages/Maps';
import Performance from './pages/Performance';
import Payments from './pages/Payments';
import Calendar from './pages/Calendar';
import Users from './pages/Users';
import SearchResults from './pages/SearchResults';

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/maps" element={<Maps />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/team" element={<Users />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
