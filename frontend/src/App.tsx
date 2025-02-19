import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState } from './redux/store';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { loadUserFromLocalStorage } from './redux/slices/authSlice';
import LoginPage from './pages/LoginPage';
import CoupleRegisterPage from './pages/CoupleRegisterPage';
import CompanyRegisterPage from './pages/CompanyRegisterPage';
import LandingPage from './pages/LandingPage';
import OfferListPage from './pages/OfferListPage';
import ListingDetailPage from './pages/ListingDetailPage';
import VerifyAccount from './pages/VerifyAccount';
import AdminDashboard from './pages/Admin/Dashboard';
import VendorDashboard from './pages/Vendor/Dashboard';
import CoupleDashboard from './pages/Couple/Dashboard';

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { user, token } = useSelector((state: RootState) => state.auth);

  if (!token) {
    // Przekierowanie do logowania, jeśli użytkownik nie jest zalogowany
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user?.userType)) {
    // Przekierowanie na stronę główną, jeśli użytkownik nie ma odpowiedniej roli
    return <Navigate to="/" />;
  }

  return children;
};

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(loadUserFromLocalStorage()); // Załaduj użytkownika z `localStorage` przy starcie
  }, [dispatch]);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <LoginPage />} // Przekierowanie na stronę główną, jeśli użytkownik jest już zalogowany
          />
          <Route path="/register-couple" element={<CoupleRegisterPage />} />
          <Route path="/register-company" element={<CompanyRegisterPage />} />
          <Route path="/list" element={<OfferListPage />} />
          <Route path="/listing/:id" element={<ListingDetailPage />} />
          <Route path="/verify" element={<VerifyAccount />} />

          {/* Chronione trasy dla różnych ról */}
          <Route
            path="/admin/dashboard/*"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/vendor/dashboard"
            element={
              <PrivateRoute allowedRoles={['vendor']}>
                <VendorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/couple/dashboard/*"
            element={
              <PrivateRoute allowedRoles={['couple']}>
                <CoupleDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
