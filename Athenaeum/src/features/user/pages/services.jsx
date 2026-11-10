import { useState, useEffect } from "react";
import styles from "./services.module.css";
import { useFetch } from "../../../hooks/useFetch";
import DataState from "../../../components/DataState";
import { getRooms } from "../../../api/library";

/* ---------- ICONS & DECORATIONS ---------- */
const LocationIcon = () => (
  <svg className={styles.metaIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 7.2c0 7.3-8 11.8-8 11.8z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const UserIcon = () => (
  <svg className={styles.metaIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
  </svg>
);

const UsersIcon = () => (
  <svg className={styles.metaIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ContourDeco = () => (
  <svg className={styles.bannerDecoSvg} viewBox="0 0 240 240" fill="none">
    <circle cx="210" cy="30" r="75" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
    <circle cx="210" cy="30" r="120" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
    <circle cx="210" cy="30" r="165" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
  </svg>
);

/* ---------- UI MAPPING ---------- */
// Data ruangan/reservasi/ketentuan diambil dari public/data/rooms.json lewat fetch()
const STATUS_BADGE = {
  "Menunggu persetujuan": styles.badgePending,
  "Disetujui": styles.badgeApproved,
  "Ditolak": styles.badgeRejected,
};

function ServicesContent({ data }) {
  const { timeSlots, rooms, reservations, terms } = data;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedSlots, setSelectedSlots] = useState({});

  // Sesi tersedia = semua slot dikurangi slot yang sudah dipesan di tiap ruangan
  const availableSessions = rooms.reduce(
    (sum, room) => sum + timeSlots.filter((t) => t !== room.bookedSlot).length,
    0
  );

  const handleSelectSlot = (roomId, time) => {
    setSelectedSlots((prev) => ({
      ...prev,
      [roomId]: prev[roomId] === time ? null : time,
    }));
  };

  return (
    <div className={styles.container}>
      {/* Header & Stats */}
      <section className={styles.headerSection}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Services & Facilities</h1>
          <p className={styles.subtitle}>
            Ajukan reservasi ruangan pribadi untuk 1 orang atau ruangan meeting untuk 5 orang atau lebih.
            Setiap pengajuan ditinjau dan disetujui admin sebelum sesi dimulai.
          </p>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.statCol}>
            <span className={styles.statLabel}>JENIS RUANGAN</span>
            <span className={styles.statValue}>{rooms.length} Jenis</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statCol}>
            <span className={styles.statLabel}>SESI TERSEDIA HARI INI</span>
            <span className={styles.statValue}>{availableSessions} Sesi</span>
          </div>
        </div>
      </section>

      {/* Sub-bar */}
      <div className={styles.filterBar}>
        <span className={styles.filterText}>Menampilkan ruangan yang tersedia:</span>
        <button type="button" className={styles.moreBtn}>
          Lihat Lainnya
        </button>
      </div>

      {/* Room Cards Grid */}
      <section className={styles.cardsGrid}>
        {rooms.map((room) => {
          const activeSlot = selectedSlots[room.id];

          return (
            <div key={room.id} className={styles.card}>
              <div className={`${styles.banner} ${styles[room.bannerClass]}`}>
                <ContourDeco />
                <div className={styles.bannerContent}>
                  <h2 className={styles.bannerTitle}>{room.bannerTitle}</h2>
                  <p className={styles.bannerSub}>{room.bannerSub}</p>
                </div>
              </div>

              <div className={styles.cardBody}>
                <span className={styles.categoryTag}>{room.category}</span>
                <h3 className={styles.roomTitle}>{room.title}</h3>

                <div className={styles.metaList}>
                  <div className={styles.metaRow}>
                    <LocationIcon />
                    <span>{room.location}</span>
                  </div>
                  <div className={styles.metaRow}>
                    {room.isGroup ? <UsersIcon /> : <UserIcon />}
                    <span>{room.capacity}</span>
                  </div>
                </div>

                <div className={styles.chipList}>
                  {room.facilities.map((fac) => (
                    <span key={fac} className={styles.chip}>
                      {fac}
                    </span>
                  ))}
                </div>

                <div className={styles.sessionSection}>
                  <div className={styles.sessionLabel}>PILIH SESI JADWAL:</div>
                  <div className={styles.slotGrid}>
                    {timeSlots.map((time) => {
                      const isBooked = time === room.bookedSlot;
                      const isSelected = activeSlot === time;

                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={isBooked}
                          onClick={() => handleSelectSlot(room.id, time)}
                          className={`${styles.slotBtn} ${isSelected ? styles.slotBtnSelected : ""} ${
                            isBooked ? styles.slotBtnBooked : ""
                          }`}
                          title={isBooked ? "Sesi sudah dipesan" : `Pilih sesi ${time}`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button type="button" className={styles.submitBtn}>
                  Ajukan Reservasi
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Bottom Section */}
      <section className={styles.bottomGrid}>
        <div className={styles.infoCard}>
          <h2 className={styles.infoCardTitle}>Reservasi Saya</h2>
          <div className={styles.reservationList}>
            {reservations.map((res) => (
              <div key={res.id} className={styles.reservationItem}>
                <div className={styles.resLeft}>
                  <div className={styles.resRoomName}>{res.room}</div>
                  <div className={styles.resSchedule}>{res.schedule}</div>
                </div>
                <span className={`${styles.badge} ${STATUS_BADGE[res.status]}`}>{res.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.infoCard}>
          <h2 className={styles.infoCardTitle}>Ketentuan Reservasi</h2>
          <div className={styles.rulesList}>
            {terms.map((term) => (
              <div key={term.title} className={styles.ruleItem}>
                <h3 className={styles.ruleHeading}>{term.title}</h3>
                <p className={styles.ruleDesc}>{term.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Services() {
  // Data diambil lewat fetch() dari public/data/rooms.json
  const { data, loading, error, reload } = useFetch(getRooms);

  if (loading || error) {
    return (
      <div className={styles.container}>
        <DataState loading={loading} error={error} onRetry={reload} label="Memuat data layanan..." />
      </div>
    );
  }

  return <ServicesContent data={data} />;
}
