import { useState } from "react";
import gambar3 from "../assets/gambar3.png";
import ChatWidget from "../components/ChatWidget";

const faqList = [
  {
    q: "Bagaimana cara melakukan booking lapangan?",
    a: "Pilih lapangan yang tersedia, tentukan tanggal dan jam, lalu selesaikan pembayaran. Konfirmasi dikirim otomatis via WhatsApp.",
  },
  {
    q: "Apakah bisa membatalkan atau reschedule booking?",
    a: "Pembatalan bisa dilakukan maksimal 2 jam sebelum jadwal. Reschedule tersedia tanpa biaya tambahan jika slot baru masih kosong.",
  },
  {
    q: "Metode pembayaran apa saja yang diterima?",
    a: "Kami menerima transfer bank, QRIS, GoPay, OVO, Dana, serta pembayaran tunai langsung di lapangan.",
  },
  {
    q: "Bagaimana jika lapangan tiba-tiba tidak tersedia?",
    a: "Kami akan menghubungi Anda dan menawarkan slot alternatif atau refund penuh dalam 1×24 jam.",
  },
  {
    q: "Apakah tersedia fasilitas parkir dan toilet?",
    a: "Seluruh lapangan yang terdaftar di BookLap telah terverifikasi memiliki fasilitas parkir, toilet, dan ruang ganti.",
  },
];

export default function Kontak() {
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ nama: "", email: "", pesan: "" });
  const [sent, setSent] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ nama: "", email: "", pesan: "" });
  };

  return (
    <>
      {/* ── HERO ── */}
      <section style={{ height: "620px", position: "relative", overflow: "hidden" }}>
        <img
          src={gambar3}
          alt="Kontak BookLap"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, rgba(0,0,0,0.88), rgba(0,0,0,0.35))",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "90px",
            transform: "translateY(-50%)",
            zIndex: 2,
            maxWidth: "700px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              background: "rgba(74,222,128,0.12)",
              border: "1px solid rgba(74,222,128,0.35)",
              color: "#4ade80",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              padding: "6px 18px",
              borderRadius: "100px",
              marginBottom: "24px",
            }}
          >
            Layanan Pelanggan
          </span>
          <h1
            style={{
              color: "#fff",
              fontSize: "68px",
              lineHeight: 1.05,
              fontWeight: 800,
              marginBottom: "28px",
              margin: "0 0 28px",
            }}
          >
            Hubungi{" "}
            <span style={{ color: "#4ade80" }}>Tim</span>
            <br />
            BookLap
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "20px", lineHeight: 1.8, maxWidth: "560px", margin: 0 }}>
            Tim kami siap membantu pemesanan lapangan, konfirmasi jadwal,
            pembayaran, maupun pertanyaan lainnya dengan respons cepat dan profesional.
          </p>
        </div>
        <img
          src="/poin.png"
          alt="Customer Service"
          style={{
            position: "absolute",
            right: "-5px",
            bottom: 0,
            height: "650px",
            zIndex: 2,
            objectFit: "contain",
          }}
        />
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "80px 100px", background: "#0f172a" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "25px" }}>
          {[
            { value: "500+",    label: "Lapangan Terdaftar" },
            { value: "10.000+", label: "Pemesanan Berhasil" },
            { value: "24/7",    label: "Dukungan Pelanggan" },
            { value: "98%",     label: "Kepuasan Pengguna" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: "#111827",
                padding: "40px",
                borderRadius: "20px",
                textAlign: "center",
                border: "1px solid #1f2937",
              }}
            >
              <h2 style={{ color: "#4ade80", fontSize: "42px", fontWeight: 800, margin: "0 0 10px" }}>
                {item.value}
              </h2>
              <p style={{ color: "#6b7280", fontSize: "15px", margin: 0 }}>{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── INFORMASI KONTAK ── */}
      <section style={{ padding: "100px", background: "#111827" }}>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <span style={badgeStyle}>Kontak Kami</span>
        </div>
        <h2 style={sectionTitle}>Informasi Kontak</h2>
        <p style={sectionSubtitle}>Pilih cara yang paling nyaman untuk menghubungi kami</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "28px", marginTop: "56px" }}>
          {[
            {
              icon: "📱",
              title: "WhatsApp",
              value: "+62 812-3456-7890",
              sub: "Respons dalam 5 menit",
              color: "#25D366",
              action: () => window.open("https://wa.me/6281234567890", "_blank"),
              cta: "Mulai Chat",
            },
            {
              icon: "📧",
              title: "Email",
              value: "support@booklap.com",
              sub: "Respons dalam 1×24 jam",
              color: "#4ade80",
              action: () => window.open("mailto:support@booklap.com"),
              cta: "Kirim Email",
            },
            {
              icon: "📍",
              title: "Alamat",
              value: "Kota Parepare",
              sub: "Sulawesi Selatan",
              color: "#f59e0b",
              action: () => window.open("https://maps.google.com/?q=Parepare,Sulawesi+Selatan"),
              cta: "Lihat Peta",
            },
          ].map((c, i) => (
            <div
              key={i}
              style={{
                background: "#1f2937",
                padding: "40px",
                borderRadius: "20px",
                border: "1px solid #374151",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                transition: "transform 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = c.color + "55";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#374151";
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "16px",
                  background: c.color + "18",
                  border: `1px solid ${c.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                }}
              >
                {c.icon}
              </div>
              <div>
                <p style={{ color: "#6b7280", fontSize: "12px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 4px" }}>
                  {c.title}
                </p>
                <p style={{ color: "#f9fafb", fontSize: "18px", fontWeight: 700, margin: "0 0 4px" }}>{c.value}</p>
                <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>{c.sub}</p>
              </div>
              <button
                onClick={c.action}
                style={{
                  marginTop: "auto",
                  padding: "12px 20px",
                  borderRadius: "10px",
                  border: `1px solid ${c.color}40`,
                  background: c.color + "15",
                  color: c.color,
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = c.color + "28")}
                onMouseLeave={(e) => (e.currentTarget.style.background = c.color + "15")}
              >
                {c.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── JAM OPERASIONAL ── */}
      <section style={{ padding: "100px", background: "#0f172a" }}>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <span style={badgeStyle}>Jadwal</span>
        </div>
        <h2 style={sectionTitle}>Jam Operasional</h2>
        <p style={sectionSubtitle}>Kami selalu siap melayani di jam-jam berikut</p>

        <div
          style={{
            maxWidth: "800px",
            margin: "56px auto 0",
            background: "#111827",
            borderRadius: "24px",
            padding: "48px 56px",
            border: "1px solid #1f2937",
          }}
        >
          {[
            { hari: "Senin – Jumat", jam: "08.00 – 22.00", aktif: true },
            { hari: "Sabtu – Minggu", jam: "08.00 – 23.00", aktif: true },
            { hari: "Hari Libur Nasional", jam: "10.00 – 20.00", aktif: false },
          ].map((row, i, arr) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "22px 0",
                borderBottom: i < arr.length - 1 ? "1px solid #1f2937" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: row.aktif ? "#4ade80" : "#6b7280",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: "#d1d5db", fontSize: "16px" }}>{row.hari}</span>
              </div>
              <span
                style={{
                  color: row.aktif ? "#4ade80" : "#6b7280",
                  fontWeight: 700,
                  fontSize: "16px",
                  background: row.aktif ? "rgba(74,222,128,0.08)" : "rgba(107,114,128,0.1)",
                  padding: "6px 16px",
                  borderRadius: "100px",
                  border: `1px solid ${row.aktif ? "rgba(74,222,128,0.2)" : "rgba(107,114,128,0.2)"}`,
                }}
              >
                {row.jam}
              </span>
            </div>
          ))}

          <div
            style={{
              marginTop: "32px",
              padding: "18px 24px",
              background: "rgba(74,222,128,0.06)",
              border: "1px solid rgba(74,222,128,0.15)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "20px" }}>⚡</span>
            <p style={{ color: "#86efac", fontSize: "14px", margin: 0 }}>
              Respons WhatsApp tersedia <strong>24/7</strong> — bahkan di luar jam operasional.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "100px", background: "#111827" }}>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <span style={badgeStyle}>FAQ</span>
        </div>
        <h2 style={sectionTitle}>Pertanyaan Umum</h2>
        <p style={sectionSubtitle}>Temukan jawaban cepat sebelum menghubungi kami</p>

        <div style={{ maxWidth: "860px", margin: "56px auto 0", display: "flex", flexDirection: "column", gap: "12px" }}>
          {faqList.map((item, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                style={{
                  background: "#1f2937",
                  borderRadius: "16px",
                  border: `1px solid ${isOpen ? "rgba(74,222,128,0.3)" : "#374151"}`,
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    padding: "24px 28px",
                    background: "none",
                    border: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: "16px",
                  }}
                >
                  <span style={{ color: "#f9fafb", fontSize: "16px", fontWeight: 600 }}>{item.q}</span>
                  <span
                    style={{
                      color: "#4ade80",
                      fontSize: "20px",
                      flexShrink: 0,
                      transition: "transform 0.2s",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      display: "inline-block",
                    }}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: "0 28px 24px" }}>
                    <p style={{ color: "#9ca3af", fontSize: "15px", lineHeight: 1.75, margin: 0 }}>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FORM ── */}
      <section style={{ padding: "100px", background: "#0f172a" }}>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <span style={badgeStyle}>Pesan</span>
        </div>
        <h2 style={sectionTitle}>Kirim Pesan</h2>
        <p style={sectionSubtitle}>Ada pertanyaan spesifik? Tulis langsung ke tim kami</p>

        <form
          onSubmit={handleSend}
          style={{
            maxWidth: "800px",
            margin: "56px auto 0",
            background: "#111827",
            padding: "56px",
            borderRadius: "24px",
            border: "1px solid #1f2937",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Nama Lengkap</label>
              <input
                required
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Masukkan nama Anda"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#4ade80")}
                onBlur={(e) => (e.target.style.borderColor = "#374151")}
              />
            </div>
            <div>
              <label style={labelStyle}>Alamat Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nama@email.com"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#4ade80")}
                onBlur={(e) => (e.target.style.borderColor = "#374151")}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Pesan</label>
            <textarea
              required
              rows={6}
              value={form.pesan}
              onChange={(e) => setForm({ ...form, pesan: e.target.value })}
              placeholder="Tulis pertanyaan atau kebutuhan Anda di sini..."
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.borderColor = "#4ade80")}
              onBlur={(e) => (e.target.style.borderColor = "#374151")}
            />
          </div>

          <button
            type="submit"
            style={{
              background: sent ? "#166534" : "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "#fff",
              border: "none",
              padding: "18px 36px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              alignSelf: "flex-start",
              transition: "opacity 0.2s, background 0.3s",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {sent ? "✅ Pesan Terkirim!" : "Kirim Pesan →"}
          </button>
        </form>
      </section>

      {/* ── LOKASI ── */}
      <section style={{ padding: "100px 100px 0", background: "#111827" }}>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <span style={badgeStyle}>Lokasi</span>
        </div>
        <h2 style={sectionTitle}>Lokasi Kami</h2>
        <p style={{ ...sectionSubtitle, marginBottom: "56px" }}>Kunjungi kami langsung di Kota Parepare, Sulawesi Selatan</p>

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            borderRadius: "24px",
            overflow: "hidden",
            border: "1px solid #1f2937",
          }}
        >
          <iframe
            title="BookLap Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63271.41386935236!2d119.59431!3d-4.0135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbef9c3dfxxxxxx%3A0x0!2sParepare%2C+Sulawesi+Selatan!5e0!3m2!1sid!2sid!4v1234567890"
            width="100%"
            height="500"
            style={{ border: 0, display: "block" }}
            loading="lazy"
            allowFullScreen
          />
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section
        style={{
          padding: "100px",
          background: "#111827",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "64px",
            background: "linear-gradient(135deg, #0f2f1a, #0f2238)",
            borderRadius: "28px",
            border: "1px solid rgba(74,222,128,0.2)",
          }}
        >
          <h2 style={{ color: "#fff", fontSize: "36px", fontWeight: 800, margin: "0 0 16px" }}>
            Siap Booking Lapangan?
          </h2>
          <p style={{ color: "#6b7280", fontSize: "16px", margin: "0 0 36px" }}>
            Jangan tunda lagi — lapangan favorit Anda mungkin sudah dipesan orang lain.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <a
              href="/booking"
              style={{
                padding: "16px 32px",
                background: "#22c55e",
                color: "#fff",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "15px",
              }}
            >
              Booking Sekarang →
            </a>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "16px 32px",
                background: "transparent",
                color: "#4ade80",
                border: "1px solid rgba(74,222,128,0.3)",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "15px",
              }}
            >
              💬 Chat WhatsApp
            </a>
          </div>
        </div>
      </section>

      <ChatWidget />
    </>
  );
}

/* ── Shared styles ── */
const badgeStyle = {
  display: "inline-block",
  background: "rgba(74,222,128,0.10)",
  border: "1px solid rgba(74,222,128,0.25)",
  color: "#4ade80",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "2px",
  textTransform: "uppercase",
  padding: "5px 16px",
  borderRadius: "100px",
};

const sectionTitle = {
  textAlign: "center",
  fontSize: "42px",
  color: "#fff",
  fontWeight: 800,
  margin: "12px 0 0",
  letterSpacing: "-0.5px",
};

const sectionSubtitle = {
  textAlign: "center",
  color: "#6b7280",
  fontSize: "16px",
  margin: "14px 0 0",
};

const labelStyle = {
  display: "block",
  color: "#9ca3af",
  fontSize: "13px",
  fontWeight: 600,
  marginBottom: "8px",
  letterSpacing: "0.5px",
};

const inputStyle = {
  width: "100%",
  padding: "14px 18px",
  borderRadius: "12px",
  background: "#1f2937",
  border: "1.5px solid #374151",
  color: "#f9fafb",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};
