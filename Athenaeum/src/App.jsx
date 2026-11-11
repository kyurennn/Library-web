// src/App.jsx
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";
import RequireRole from "./features/auth/RequireRole";
import Login from "./features/auth/pages/login";
import UserLayout from "./layouts/UserLayout";
import StaffLayout from "./layouts/StaffLayout";
import Homepage from "./features/user/pages/homepage";
import Catalog from "./features/user/pages/catalog";
import BookDetail from "./features/user/pages/book-detail";
import Profile from "./features/user/pages/profile";
import Services from "./features/user/pages/services";
import StaffDashboard from "./features/staff/pages/dashboard";
import Reservations from "./features/staff/pages/reservations";
import AdminLayout from "./layouts/AdminLayout";
import BookManager from "./features/admin/pages/book-manager";
import EditBook from "./features/admin/pages/edit-book";
import AdminHome from "./features/admin/pages/admin-home";
import StaffManagement from "./features/admin/staff/StaffManagement";
import RoomReservation from "./features/admin/pages/room-reservation";


// Placeholder sementara untuk halaman yang belum dibuat
const ComingSoon = ({ title }) => (
  <div style={{ color: "#94a3b8" }}>
    <h1 style={{ margin: "0 0 8px", color: "#f1f5f9" }}>{title}</h1>
    <p>Halaman ini belum dibuat.</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* USER (member) */}
          <Route element={<RequireRole role="user" />}>
            <Route element={<UserLayout />}>
              <Route path="/" element={<Homepage />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/catalog/:id" element={<BookDetail />} />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route path="/book/:id" element={<BookDetail />} />
              <Route path="/services" element={<Services />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* STAFF */}
          <Route element={<RequireRole role="staff" />}>
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="reservations" element={<Reservations />} />
              <Route path="loans" element={<ComingSoon title="Pinjaman Buku" />} />
            </Route>
          </Route>

          {/* ADMIN */}
          <Route element={<RequireRole role="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<BookManager />} />
              <Route path="books" element={<BookManager />} />
              <Route path="books/edit/:id" element={<EditBook />} />
              <Route path="edit-book/:id" element={<EditBook />} />
              <Route path="dashboard" element={<AdminHome />} />
              <Route path="reservations" element={<RoomReservation />} />
              <Route path="staff" element={<StaffManagement />} />
              <Route path="staff-management" element={<StaffManagement />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
