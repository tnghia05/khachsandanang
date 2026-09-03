import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchResultsPage from './pages/SearchResultsPage';
import HotelDetailPage from './pages/HotelDetailPage';
import RoomDetailPage from './pages/RoomDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import MyBookingsPage from './pages/MyBookingsPage';
import PaymentReturnHandler from './pages/PaymentReturnHandler';
import PaymentFailedPage from './pages/PaymentFailedPage';

// Admin PMS Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminReceptionPage from './pages/admin/AdminReceptionPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminHotelsPage from './pages/admin/AdminHotelsPage';
import AdminRoomsPage from './pages/admin/AdminRoomsPage';
import AdminVouchersPage from './pages/admin/AdminVouchersPage';

import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Customer Website Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/hotels/:id" element={<HotelDetailPage />} />
          <Route path="/rooms/:id" element={<RoomDetailPage />} />
          <Route path="/booking-success/:bookingCode" element={<BookingSuccessPage />} />
          <Route path="/payment/vnpay-return" element={<PaymentReturnHandler />} />
          <Route path="/payment/momo-return" element={<PaymentReturnHandler />} />
          <Route path="/payment-failed" element={<PaymentFailedPage />} />

          {/* Customer Authenticated Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout/:bookingId" element={<CheckoutPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
          </Route>
        </Route>

        {/* Admin & Host PMS Portal Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'host']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/reception" element={<AdminReceptionPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/hotels" element={<AdminHotelsPage />} />
            <Route path="/admin/rooms" element={<AdminRoomsPage />} />
            <Route path="/admin/vouchers" element={<AdminVouchersPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
