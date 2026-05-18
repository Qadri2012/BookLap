import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// ── HOOK REVEAL ──────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ── DATA ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "5+",   label: "Lapangan Tersedia" },
  { value: "500+", label: "Pengguna Aktif" },
  { value: "98%",  label: "Kepuasan Pelanggan" },
  { value: "2024", label: "Tahun Berdiri" },
];

const TEAM = [
  {
    name: "Muhammad Nurul Qadri",
    role: "CEO & Founder",
    photo: "/qadri.png",
    history:
      "Andi adalah pendiri BookLap yang memulai platform ini dari kebutuhan booking lapangan yang lebih praktis dan cepat.",
  },
  {
    name: "Delpina Dwi Amanda",
    role: "Head of Product",
    photo: "/delpina.png",
    history:
      "Sari berfokus pada pengalaman pengguna dan memastikan tampilan BookLap mudah dipakai oleh semua orang.",
  },
  {
    name: "Muhammad Iqbal",
    role: "Lead Developer",
    photo: "/iqbal.png",
    history:
      "Rizky membangun sistem inti BookLap, mulai dari tampilan, interaksi, sampai logika scroll di halaman ini.",
  },
];

const VALUES = [
  { icon: "⚡", title: "Inovatif",    desc: "Kami terus berinovasi untuk memberikan pengalaman booking lapangan yang terbaik." },
  { icon: "🤝", title: "Terpercaya",  desc: "Setiap transaksi dijamin aman dan transparan tanpa biaya tersembunyi." },
  { icon: "🎯", title: "Fokus",       desc: "Fokus pada satu tujuan: membuat olahraga lebih mudah diakses semua orang." },
  { icon: "💚", title: "Komunitas",   desc: "Membangun ekosistem olahraga yang sehat dan aktif di seluruh Indonesia." },
];


// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function TentangKami() {
  const navigate = useNavigate();
  const px = "px-6 sm:px-10 lg:px-20 xl:px-28";

  const [activeIndex, setActiveIndex] = useState(0);
  const teamRef = useRef(null);
  const wheelLockRef = useRef(false);

  const topRef = useRef(null);
    useEffect(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);

  useEffect(() => {
    const el = teamRef.current;
    if (!el) return;

    const onWheel = (e) => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top <= 0 && rect.bottom >= window.innerHeight;

      if (!inView) return;

      const goingDown = e.deltaY > 0;
      const goingUp = e.deltaY < 0;

      if (goingDown && activeIndex < TEAM.length - 1) {
        e.preventDefault();
        if (wheelLockRef.current) return;
        wheelLockRef.current = true;
        setActiveIndex((prev) => Math.min(prev + 1, TEAM.length - 1));
        setTimeout(() => {
          wheelLockRef.current = false;
        }, 500);
      }

      if (goingUp && activeIndex > 0) {
        e.preventDefault();
        if (wheelLockRef.current) return;
        wheelLockRef.current = true;
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        setTimeout(() => {
          wheelLockRef.current = false;
        }, 500);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [activeIndex]);

  const [heroRef, heroVisible]   = useReveal();
  const [statsRef, statsVisible] = useReveal();
  const [valRef, valVisible]     = useReveal();

  const [ctaRef, ctaVisible]     = useReveal();

  return (
    
    <div className="w-full bg-[#f4f6f3] antialiased" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div ref={topRef} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
        @keyframes slideRight { from { opacity:0; transform:translateX(-32px); } to { opacity:1; transform:translateX(0); } }
      `}</style>



      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section
  ref={heroRef}
  style={{
    background: "linear-gradient(135deg, #0a2e14 0%, #143d1e 40%, #1a5c2a 100%)",
    minHeight: "110vh",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-start",
    paddingTop: 40,
    paddingBottom: "60px",
  }}
>
        {/* Dekorasi lingkaran */}
        <div style={{ position:"absolute", top:-120, right:-120, width:500, height:500, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-80, left:-80, width:320, height:320, borderRadius:"50%", background:"rgba(74,222,128,0.06)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"30%", right:"8%", width:200, height:200, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.08)", pointerEvents:"none" }} />

        <div className={`relative z-10 w-full ${px}`}>
          {/* Breadcrumb */}
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:40 }}>
            <span onClick={() => navigate("/")} style={{ cursor:"pointer", color:"rgba(255,255,255,0.7)", fontWeight:500 }}>Beranda</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            <span style={{ color:"#4ade80" }}>Tentang Kami</span>
          </div>

          <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 60,
    alignItems: "center",
    marginTop: "-20px",
  }}
>
            {/* Kiri: Teks */}
            <div
            style={{
                animation: heroVisible ? "slideRight 0.8s ease both" : "none",
                paddingLeft: "40px",
            }}
            >
              {/* <p style={{ fontSize:12, fontWeight:700, color:"#4ade80", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:16 }}>
                Tentang BookLap
              </p> */}
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(52px, 5vw, 82px)",
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1.1,
                marginBottom: 24,
              }}>
                Kami adalah<br />
                <span style={{ color:"#4ade80" }}>BookLap</span>
              </h1>
              <p
  style={{
    fontSize: 20,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 1.95,
    maxWidth: 620,
    marginBottom: 42,
  }}
>
                BookLap merupakan platform digital yang memudahkan pengguna dalam mencari dan memesan lapangan futsal maupun mini soccer secara cepat, praktis, dan efisien. Melalui BookLap, pengguna dapat melihat informasi lapangan, mengecek jadwal ketersediaan, serta melakukan reservasi tanpa perlu datang langsung ke lokasi. Dengan tampilan yang modern dan sistem yang mudah digunakan, BookLap hadir untuk memberikan pengalaman booking lapangan olahraga yang lebih nyaman, transparan, dan terpercaya bagi seluruh pecinta olahraga.
              </p>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                <button
                  onClick={() => navigate("/kontak")}
                  style={{
                    background: "#16a34a",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: 12,
                    padding: "14px 32px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  Hubungi Kami
                </button>
              </div>
            </div>

            {/* Kanan: Gambar Modern */}
<div
  style={{
    animation: heroVisible ? "scaleIn 0.9s 0.2s ease both" : "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  <div
  style={{
    width: "min(620px, 100%)",
    height: "520px",
    borderTopLeftRadius: "140px",
    borderBottomRightRadius: "140px",
    overflow: "hidden",
    position: "relative",
    background: "#ffffff",
    boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
    border: "8px solid #ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
  }}
>
    <img
      src="/logo2.png"
      alt="Modern Building"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        }}
    />

    {/* Overlay */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(to top, rgba(0,0,0,0.18), rgba(0,0,0,0.02))",
      }}
    />
  </div>
</div>
          </div>
        </div>
      </section>

      

      
{/* ══ VISI MISI ══════════════════════════════════════════════════════════════ */}
<section
  style={{
    background: "linear-gradient(135deg, #0a2e14 0%, #143d1e 40%, #1a5c2a 100%)",
    padding: "110px 0",
    position: "relative",
    overflow: "hidden",
  }}
>
  <div
    style={{
      position: "absolute",
      top: "-140px",
      left: "-120px",
      width: "380px",
      height: "380px",
      borderRadius: "50%",
      background: "rgba(255,255,255,0.03)",
      pointerEvents: "none",
    }}
  />
  <div
    style={{
      position: "absolute",
      bottom: "-160px",
      right: "-140px",
      width: "460px",
      height: "460px",
      borderRadius: "50%",
      background: "rgba(74,222,128,0.04)",
      pointerEvents: "none",
    }}
  />

  <div className={px}>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "40px",
        alignItems: "stretch",
      }}
    >
      {/* VISI */}
      <div
        style={{
          width: "100%",
          borderTopLeftRadius: "140px",
          borderBottomRightRadius: "140px",
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 30px 80px rgba(0,0,0,0.18)",
          border: "8px solid #fff",
          minHeight: "520px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "54px 44px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            background: "#fff",
          }}
        >
          <h2
            style={{
              fontSize: "42px",
              fontWeight: 900,
              color: "#0f172a",
              marginBottom: "28px",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            VISI
          </h2>
          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.9",
              color: "#334155",
              maxWidth: "420px",
            }}
          >
            Menjadi platform reservasi lapangan olahraga terpercaya yang
            memberikan kemudahan akses, kenyamanan, dan pengalaman booking terbaik
            bagi seluruh pecinta futsal dan mini soccer.
          </p>
        </div>
      </div>

      {/* MISI */}
      <div
        style={{
          width: "100%",
          borderTopLeftRadius: "140px",
          borderBottomRightRadius: "140px",
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 30px 80px rgba(0,0,0,0.18)",
          border: "8px solid #fff",
          minHeight: "520px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "54px 44px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            background: "#fff",
          }}
        >
          <h2
            style={{
              fontSize: "42px",
              fontWeight: 900,
              color: "#0f172a",
              marginBottom: "28px",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            MISI
          </h2>
          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.9",
              color: "#334155",
              maxWidth: "420px",
            }}
          >
            Memberikan layanan booking lapangan yang cepat, praktis, dan
            transparan, serta membantu pengguna menemukan lapangan terbaik dengan
            sistem digital yang modern dan mudah digunakan.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>



 {/* ══ TIM — SPLIT STICKY SCROLL ══ */}
<section
  ref={teamRef}
  id="team-section"
  style={{
    position: "relative",
    height: "120vh",
    background: "#fff",
  }}
>
  <div
    style={{
      position: "sticky",
      top: 0,
      height: "100vh",
      overflow: "hidden",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "linear-gradient(135deg, #0a2e14 0%, #143d1e 100%)",
    }}
  >
    {/* KIRI - BERGANTI SESUAI MEMBER */}
    <div style={{ position: "relative", height: "100%" }}>
      {TEAM.map((member, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 64px",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            opacity: activeIndex === i ? 1 : 0,
            transform:
              activeIndex === i
                ? "translateY(0)"
                : "translateY(28px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
            pointerEvents: activeIndex === i ? "auto" : "none",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#4ade80",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Tim Kami
          </p>

          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px, 3.5vw, 52px)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.15,
              marginBottom: 24,
            }}
          >
            Orang-orang
            <br />
            di balik
            <br />
            <span style={{ color: "#4ade80" }}>BookLap</span>
          </h2>

          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.8,
              maxWidth: 340,
              marginBottom: 40,
            }}
          >
            {member.history}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TEAM.map((t, idx) => (
              <div
                key={idx}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#4ade80",
                    opacity: activeIndex === idx ? 1 : 0.4,
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color:
                      activeIndex === idx
                        ? "#fff"
                        : "rgba(255,255,255,0.4)",
                    fontWeight: activeIndex === idx ? 700 : 500,
                  }}
                >
                  {t.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

  {/* KANAN - BERGANTI SESUAI MEMBER */}
<div style={{ position: "relative", height: "100%" }}>
  {TEAM.map(({ name, role, photo, history }, i) => (
    <div
      key={i}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 64px",
        opacity: activeIndex === i ? 1 : 0,
        transform: activeIndex === i ? "translateY(0)" : "translateY(-28px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        pointerEvents: activeIndex === i ? "auto" : "none",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 450,
          borderRadius: 34,
          overflow: "hidden",
          background: "#16a34a",
          boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: 350,
            background: "#f5f5f5",
            overflow: "hidden",
          }}
        >
          <img
            src={photo}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        <div
          style={{
            padding: "28px 30px 34px",
            background: "#16a34a",
          }}
        >
          <h3
            style={{
              color: "#fff",
              fontSize: 34,
              fontWeight: 800,
              marginBottom: 10,
              lineHeight: 1.1,
            }}
          >
            {name}
          </h3>

          <p
            style={{
              color: "rgba(255,255,255,0.88)",
              fontSize: 16,
              lineHeight: 1.7,
            }}
          >
            {role}
          </p>
        </div>
      </div>
    </div>
  ))}
</div>
  </div>
</section>

      {/* ══ CTA ══════════════════════════════════════════════════════════════ */}
      <section
  ref={ctaRef}
  style={{
  background: "#fff",
  padding: "24px 0 80px",
  marginTop: "0",
  textAlign: "center",
}}
>
        <div className={px} style={{ animation: ctaVisible ? "fadeUp 0.7s ease both" : "none" }}>
          <p style={{ fontSize:12, fontWeight:700, color:"#16a34a", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>
            Bergabung Sekarang
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(28px, 3.5vw, 48px)",
            fontWeight: 900,
            color: "#111827",
            marginBottom: 16,
            lineHeight: 1.2,
          }}>
            Siap mulai pertandinganmu?
          </h2>
          <p style={{ fontSize:15, color:"#6b7280", maxWidth:480, margin:"0 auto 36px", lineHeight:1.8 }}>
            Temukan lapangan futsal dan mini soccer terbaik di Parepare. Booking mudah, harga transparan, tanpa ribet.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button
              onClick={() => navigate("/lapangan")}
              style={{
                background: "#186d22",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "16px 40px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: "0 4px 20px rgba(22,163,74,0.35)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              Cari Lapangan Sekarang 
            </button>
            <button
              onClick={() => navigate("/#hero")}
              style={{
                background: "transparent",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: 12,
                padding: "16px 40px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER MINI ════════════════════════════════════════════════════════ */}
      <footer style={{ background:"#111827", padding:"32px 0", textAlign:"center" }}>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)" }}>
          © 2024 BookLap · Tim Nyawit ITH · Parepare, Sulawesi Selatan
        </p>
      </footer>
    </div>
  );
}
