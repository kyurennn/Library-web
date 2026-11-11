import { fetchJson } from "./client";

/*
 * Daftar "endpoint" data aplikasi. Setiap fungsi menerima AbortSignal
 * agar request bisa dibatalkan saat halaman ditutup.
 *
 * Sumber data saat ini: Mock API berupa file JSON di public/data/.
 */
export const getBooks = (signal) => fetchJson("books.json", { signal });
export const getLibrary = (signal) => fetchJson("library.json", { signal });
export const getEvents = (signal) => fetchJson("events.json", { signal });
export const getRooms = (signal) => fetchJson("rooms.json", { signal });
export const getStaffDashboard = (signal) => fetchJson("staff-dashboard.json", { signal });
export const getReservations = (signal) => fetchJson("reservations.json", { signal });
export const getAdminDashboard = (signal) => fetchJson("admin-dashboard.json", { signal });
export const getStaff = async (signal) => {
  try {
    return await fetchJson("staff.json", { signal });
  } catch (err) {
    const adminData = await fetchJson("admin-dashboard.json", { signal });
    if (adminData && adminData.staff) return adminData.staff;
    throw err;
  }
};
