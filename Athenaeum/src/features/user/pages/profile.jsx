import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./profile.module.css";

import MF from "../../../assets/profile/MF.jpg";

const USER = {
  name: "Kane Fukukitaru",
  email: "kane@email.com",
  memberId: "LIB-2026-0142",
  role: "Anggota",
  badge: "MEMBER READER",
  joinedAt: "12 Agustus 2026",
  avatar: MF,
};

const MIN_PASSWORD = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({ label, children }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

function Notice({ status }) {
  if (!status) return null;
  return (
    <p
      role="status"
      className={`${styles.notice} ${status.type === "error" ? styles.noticeError : styles.noticeOk}`}
    >
      {status.text}
    </p>
  );
}

export default function Profile() {
  const navigate = useNavigate();

  const [saved, setSaved] = useState({ name: USER.name, email: USER.email });
  const [name, setName] = useState(USER.name);
  const [email, setEmail] = useState(USER.email);
  const [profileStatus, setProfileStatus] = useState(null);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [repeatPw, setRepeatPw] = useState("");
  const [passwordStatus, setPasswordStatus] = useState(null);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setProfileStatus({ type: "error", text: "Nama lengkap tidak boleh kosong." });
      return;
    }
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setProfileStatus({ type: "error", text: "Format email tidak valid." });
      return;
    }

    setSaved({ name: cleanName, email: cleanEmail });
    setName(cleanName);
    setEmail(cleanEmail);
    setProfileStatus({ type: "ok", text: "Perubahan berhasil disimpan." });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (!currentPw || !newPw || !repeatPw) {
      setPasswordStatus({ type: "error", text: "Semua kolom kata sandi wajib diisi." });
      return;
    }
    if (newPw.length < MIN_PASSWORD) {
      setPasswordStatus({ type: "error", text: `Kata sandi baru minimal ${MIN_PASSWORD} karakter.` });
      return;
    }
    if (newPw !== repeatPw) {
      setPasswordStatus({ type: "error", text: "Ulangi kata sandi baru tidak sama." });
      return;
    }
    if (newPw === currentPw) {
      setPasswordStatus({ type: "error", text: "Kata sandi baru harus berbeda dari yang lama." });
      return;
    }

    setCurrentPw("");
    setNewPw("");
    setRepeatPw("");
    setPasswordStatus({ type: "ok", text: "Kata sandi berhasil diubah." });
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Profil Saya</h1>
        <p className={styles.sub}>Kelola data akun dan keamanan akun Anda.</p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.profileCard}>
          <img className={styles.avatar} src={USER.avatar} alt={`Foto ${saved.name}`} />
          <h2 className={styles.profileName}>{saved.name}</h2>
          <span className={styles.badge}>{USER.badge}</span>

          <dl className={styles.infoList}>
            <div className={styles.infoItem}>
              <dt>ID ANGGOTA</dt>
              <dd>{USER.memberId}</dd>
            </div>
            <div className={styles.infoItem}>
              <dt>EMAIL</dt>
              <dd>{saved.email}</dd>
            </div>
            <div className={styles.infoItem}>
              <dt>BERGABUNG</dt>
              <dd>{USER.joinedAt}</dd>
            </div>
          </dl>

          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            Keluar
          </button>
        </aside>

        {}
        <div className={styles.forms}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Data Diri</h2>
            <p className={styles.panelSub}>Perbarui nama dan email yang terdaftar.</p>

            <form onSubmit={handleProfileSubmit} noValidate>
              <div className={styles.grid2}>
                <Field label="NAMA LENGKAP">
                  <input
                    className={styles.control}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </Field>
                <Field label="EMAIL">
                  <input
                    className={styles.control}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </Field>
                <Field label="ID ANGGOTA">
                  <input className={styles.control} type="text" value={USER.memberId} disabled readOnly />
                </Field>
                <Field label="PERAN">
                  <input className={styles.control} type="text" value={USER.role} disabled readOnly />
                </Field>
              </div>

              <Notice status={profileStatus} />

              <button type="submit" className={styles.primaryBtn}>
                Simpan Perubahan
              </button>
            </form>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Ubah Kata Sandi</h2>
            <p className={styles.panelSub}>Gunakan minimal {MIN_PASSWORD} karakter.</p>

            <form onSubmit={handlePasswordSubmit} noValidate>
              <div className={styles.grid2}>
                <div className={styles.span2}>
                  <Field label="KATA SANDI SAAT INI">
                    <input
                      className={styles.control}
                      type="password"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      autoComplete="current-password"
                    />
                  </Field>
                </div>
                <Field label="KATA SANDI BARU">
                  <input
                    className={styles.control}
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    autoComplete="new-password"
                  />
                </Field>
                <Field label="ULANGI KATA SANDI BARU">
                  <input
                    className={styles.control}
                    type="password"
                    value={repeatPw}
                    onChange={(e) => setRepeatPw(e.target.value)}
                    autoComplete="new-password"
                  />
                </Field>
              </div>

              <Notice status={passwordStatus} />

              <button type="submit" className={styles.primaryBtn}>
                Ubah Kata Sandi
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}