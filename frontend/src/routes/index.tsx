import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Customer Pages
import { HomePage } from '../pages/customer/HomePage';
import { MenuPage } from '../pages/customer/MenuPage';
import { SubscriptionPage } from '../pages/customer/SubscriptionPage';
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { OrdersPage } from '../pages/customer/OrdersPage';
import { MySubscriptionsPage } from '../pages/customer/MySubscriptionsPage';
import { ProfilePage } from '../pages/customer/ProfilePage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { AdminLoginPage } from '../pages/auth/AdminLoginPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminFoods } from '../pages/admin/AdminFoods';
import { AdminMenus } from '../pages/admin/AdminMenus';
import { AdminMealTimings } from '../pages/admin/AdminMealTimings';
import { AdminOrders } from '../pages/admin/AdminOrders';
import { AdminSubscriptions } from '../pages/admin/AdminSubscriptions';
import { AdminCustomers } from '../pages/admin/AdminCustomers';
import { AdminDelivery } from '../pages/admin/AdminDelivery';
import { AdminReports } from '../pages/admin/AdminReports';
import { AdminWhatsApp } from '../pages/admin/AdminWhatsApp';
import { AdminSettings } from '../pages/admin/AdminSettings';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Customer Facing Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/subscriptions" element={<SubscriptionPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/my-subscriptions" element={<MySubscriptionsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Portal Protected Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="foods" element={<AdminFoods />} />
        <Route path="menus" element={<AdminMenus />} />
        <Route path="timings" element={<AdminMealTimings />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="delivery" element={<AdminDelivery />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="whatsapp" element={<AdminWhatsApp />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
