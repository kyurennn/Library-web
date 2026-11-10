import MF from "../../assets/profile/MF.jpg";
import WA from "../../assets/profile/WA.jpg";
import AT from "../../assets/profile/AT.png";

/*
 * DATA AKUN SEMENTARA (mock).
 * Kredensial di sisi klien hanya untuk prototipe/demo: siapa pun bisa
 * melihatnya lewat bundle JS. Ganti dengan autentikasi ke backend
 * (token/cookie httpOnly) sebelum dipakai sungguhan.
 */
const ACCOUNTS = [
  {
    username: "Kane Fukukitaru",
    password: "user123",
    role: "user",
    name: "Kane Fukukitaru",
    avatar: MF,
  },
  {
    username: "Agnes Tachyon",
    password: "admin123",
    role: "admin",
    name: "Agnes Tachyon",
    avatar: AT,
  },
  {
    username: "wisadel",
    password: "staff123",
    role: "staff",
    name: "Wiś'adel",
    avatar: WA,
  },
];

export const ROLES = ["user", "staff", "admin"];

export const ROLE_HOME = {
  user: "/",
  staff: "/staff",
  admin: "/admin",
};

export const ROLE_LABEL = {
  user: "Member",
  staff: "Staff",
  admin: "Admin",
};

// Data yang boleh disimpan/ditampilkan (tanpa password)
function toPublic(account) {
  return {
    username: account.username,
    name: account.name,
    role: account.role,
    avatar: account.avatar,
  };
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function findUser(username) {
  const account = ACCOUNTS.find((a) => normalize(a.username) === normalize(username));
  return account ? toPublic(account) : null;
}

export function authenticate(username, password, role) {
  const account = ACCOUNTS.find((a) => normalize(a.username) === normalize(username));

  if (!account || account.password !== password) {
    return { ok: false, error: "Username atau kata sandi salah." };
  }
  if (account.role !== role) {
    return {
      ok: false,
      error: `Akun ini bukan akun ${ROLE_LABEL[role]}. Pilih peran yang sesuai.`,
    };
  }
  return { ok: true, user: toPublic(account) };
}
