// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLayout from "./layouts/UserLayout";
import Homepage from "./features/user/pages/homepage";

// Placeholder sementara untuk halaman yang belum dibuat
const ComingSoon = ({ title }) => (
  <main style={{ padding: "48px clamp(16px, 3vw, 40px)", color: "#94a3b8" }}>
    <h1 style={{ color: "#f1f5f9", margin: 0 }}>{title}</h1>
    <p>Halaman ini belum dibuat.</p>
  </main>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/catalog" element={<ComingSoon title="Catalog" />} />
          <Route path="/services" element={<ComingSoon title="Services & Facilities" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}