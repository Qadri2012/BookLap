// Footer

import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();

  const hideFooter =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register");

  if (hideFooter) return null;

  const px = "px-6 sm:px-10 lg:px-20 xl:px-28";

  const legalLinks = [
    { to: "/syarat-ketentuan", label: "Syarat & Ketentuan" },
    { to: "/kebijakan-privasi", label: "Kebijakan Privasi" },
    { to: "/bantuan",           label: "Bantuan" },
    { to: "/tentangkami",       label: "Tentang Kami" },
  ];

  const socialLinks = [
    {
      label: "Instagram",
      href: "#",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      label: "TikTok",
      href: "#",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/>
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      href: "https://wa.me/6285231011084",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: "#",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer
  className="w-full overflow-hidden"
  style={{
    position: "relative",
    zIndex: 20,
    background: "linear-gradient(135deg, #145220 0%, #1e6b2e 50%, #145220 100%)",
    borderTop: "1px solid rgba(74,222,128,0.15)",
  }}
>
  {/* GLOW DEKORASI */}
  <div style={{
    position: "absolute", top: -100, right: -100,
    width: 400, height: 400,
    background: "radial-gradient(circle, rgba(24,109,34,0.5) 0%, rgba(22,163,74,0.15) 40%, transparent 70%)",
    pointerEvents: "none",
  }} />
  <div style={{
    position: "absolute", bottom: -100, left: -100,
    width: 350, height: 350,
    background: "radial-gradient(circle, rgba(74,222,128,0.3) 0%, rgba(22,163,74,0.1) 40%, transparent 70%)",
    pointerEvents: "none",
  }} />
  {/* GLOW TENGAH — tambahan supaya lebih kaya */}
  <div style={{
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600, height: 300,
    background: "radial-gradient(ellipse, rgba(22,163,74,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  }} />

      <div className={`relative z-10 w-full ${px} pt-14 pb-8`}>

        {/* ── TOP GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* BRAND — lebar 2 kolom */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div style={{
                width: 48, height: 48,
                background: "linear-gradient(135deg, #16a34a, #4ade80)",
                borderRadius: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
                boxShadow: "0 4px 20px rgba(22,163,74,0.35)",
              }}>
                ⚽
              </div>
              <div>
                <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 24, letterSpacing: "-0.02em", lineHeight: 1 }}>
                  <div className="mb-2 text-[32px] font-extrabold tracking-tight">
            <span>Book</span>
            <span className="text-[#186d22]">Lap</span>
          </div>
                </h3>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 }}>
                  Booking lapangan jadi lebih mudah
                </p>
              </div>
            </div>

            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, lineHeight: 1.8, maxWidth: 340, marginBottom: 20 }}>
              Platform terpercaya untuk menemukan dan memesan lapangan futsal & mini soccer terbaik — proses cepat, aman, dan transparan.
            </p>

            {/* Kontak */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "📍", text: "Parepare, Sulawesi Selatan" },
                { icon: "📞", text: "085231011084" },
                { icon: "✉️", text: "timnyawituxth@gmail.com" },
                { icon: "🕐", text: "Senin – Minggu, 08.00 – 22.00 WITA" },
              ].map(({ icon, text }) => (
                <p key={text} style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{icon}</span> {text}
                </p>
              ))}
            </div>

            {/* Sosial Media */}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {socialLinks.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  style={{
                    width: 40, height: 40,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.5)",
                    transition: "all 0.2s",
                    cursor: "pointer",
                    textDecoration: "none",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(22,163,74,0.2)";
                    e.currentTarget.style.borderColor = "rgba(74,222,128,0.4)";
                    e.currentTarget.style.color = "#4ade80";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* LEGAL */}
          <div>
            <h5 style={{
              color: "#fff", fontSize: 12, fontWeight: 700,
              letterSpacing: "0.15em", textTransform: "uppercase",
              marginBottom: 20,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ width: 16, height: 2, background: "#16a34a", borderRadius: 2, display: "inline-block" }} />
              Legal
            </h5>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {legalLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 13.5,
                    textDecoration: "none",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = "#4ade80";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <span style={{ color: "#16a34a", fontSize: 10 }}>▶</span>
                  {label}
                </Link>
              ))}
            </div>

            
          </div>
        </div>

        {/* ── BOTTOM ── */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 20,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
            © 2024 BookLap · Tim Nyawit ITH · Parepare, Sulawesi Selatan
          </p>
          <p style={{ color: "rgba(74,222,128,0.6)", fontSize: 12 }}>
            Made with ❤ in Parepare
          </p>
        </div>

      </div>
    </footer>
  );
}
