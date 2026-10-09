import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getPortalToken, getPortalUser, isUserInRole } from '../services/authStorage';

const ProtectedRoute = ({ allowedRoles, portal }) => {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  const effectivePortal =
    portal || (path.startsWith('/manufacturer') ? 'manufacturer' : 'admin');

  const token = getPortalToken(effectivePortal) || localStorage.getItem('token') || sessionStorage.getItem('token');
  const user = getPortalUser(effectivePortal) || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

  if (!token) {
    const loginTarget = effectivePortal === 'manufacturer' ? '/login/manufacturer' : '/login/admin';
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user?.role || '').toUpperCase();
    const isAuthorized = allowedRoles.some(r => r.toUpperCase() === userRole);
    
    if (!isAuthorized) {
      if (userRole === 'MANUFACTURER') {
        return <Navigate to="/manufacturer/orders" replace />;
      }
      return <Navigate to="/login/admin" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
