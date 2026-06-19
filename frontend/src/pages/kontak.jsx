import { useState, useRef, useEffect } from "react";
import gambar3 from "../assets/gambar3.png";
const contacts = [
  {
    id: 1,
    initials: "AD",
    name: "Admin Support",
    preview: "Baik, kami siapkan lapa...",
    unread: 2,
    online: true,
    color: "#4a7c59",
  },
  {
    id: 2,
    initials: "CS",
    name: "CS Booking",
    preview: "Terima kasih sudah menghub...",
    unread: 0,
    online: false,
    color: "#4a6080",
  },
  {
    id: 3,
    initials: "OP",
    name: "Operator Lapangan",
    preview: "Jadwal sudah dikonfirmasi",
    unread: 0,
    online: false,
    color: "#7a5c3a",
  },
];

const initialMessages = [
  {
    id: 1,
    sender: "admin",
    text: "Halo! Ada yang bisa kami bantu untuk pemesanan lapangan hari ini?",
    time: "09:14",
    type: "text",
  },
  {
    id: 2,
    sender: "user",
    text: "Halo admin, saya mau tanya soal ketersediaan lapangan futsal untuk Sabtu malam jam 20.00",
    time: "09:15",
    type: "text",
  },
  {
    id: 3,
    sender: "admin",
    text: "Baik! Untuk Sabtu malam jam 20.00–21.30 masih tersedia ya. Ini foto kondisi lapangannya:",
    time: "09:16",
    type: "text",
  },
  {
    id: 4,
    sender: "admin",
    text: "",
    time: "09:16",
    type: "image",
    imageLabel: "Foto lapangan dikirim",
  },
  {
    id: 5,
    sender: "user",
    text: "Oke bagus! Langsung saya booking sekarang ya",
    time: "09:18",
    type: "text",
  },
];

function Avatar({ initials, color, size = 40, online = false }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.35,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: 0.5,
          userSelect: "none",
        }}
      >
        {initials}
      </div>
      {online && (
        <span
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#4ade80",
            border: "2px solid #1e2228",
          }}
        />
      )}
    </div>
  );
}

function QuickAttachment({ label, icon }) {
  return (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 20,
        border: "1.5px solid #3a3f47",
        background: "transparent",
        color: "#c8d0db",
        fontSize: 13,
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#5a8f69";
        e.currentTarget.style.background = "#2a3a2e";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#3a3f47";
        e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>
      {label}
    </button>
  );
}

export default function Kontak() {
  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const messagesEndRef = useRef(null);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: trimmed, time, type: "text" },
    ]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "admin",
          text: "Baik, kami siapkan lapangan untuk Anda segera!",
          time,
          type: "text",
        },
      ]);
      setIsTyping(false);
    }, 1800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const today = "Hari ini, 19 Jun 2026";

  return (
  <>
    {/* HERO */}
    <section
      style={{
        height: "720px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <img
    src={gambar3}
    alt="Kontak BookLap"
    style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
    }}
    />

      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.4))",
        }}
      />

      {/* Content */}
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
        <h1
          style={{
            color: "#fff",
            fontSize: "82px",
            lineHeight: "1.05",
            fontWeight: 800,
            marginBottom: "30px",
          }}
        >
          Hubungi{" "}
          <span
            style={{
              color: "#4ade80",
            }}
          >
            Tim
          </span>
          <br />
          BookLap
        </h1>

        <p
          style={{
            color: "#d1d5db",
            fontSize: "28px",
            lineHeight: "1.8",
            maxWidth: "650px",
          }}
        >
          Tim kami siap membantu pemesanan lapangan,
          konfirmasi jadwal, pembayaran, maupun pertanyaan
          lainnya dengan respon cepat dan profesional.
        </p>
      </div>
      {/* Gambar Orang */}
<img
  src="/poin.png"
  alt="Customer Service"
  style={{
    position: "absolute",
    right: "-8px",
    bottom: "0",
    height: "650px",
    zIndex: 2,
    objectFit: "contain",
  }}
/>
    </section>

    {/* CHAT SECTION */}
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#181c22",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        color: "#e2e8f0",
        overflow: "hidden",
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: 320,
          minWidth: 260,
          maxWidth: 340,
          background: "#1e2228",
          borderRight: "1px solid #2a2f38",
          display: "flex",
          flexDirection: "column",
        }}
      >
        
        {/* Header */}
        <div style={{ padding: "24px 20px 12px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: "#f1f5f9",
              letterSpacing: -0.3,
            }}
          >
            Pesan
          </h2>
        </div>

        {/* Search */}
        <div style={{ padding: "0 16px 12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#252b34",
              border: "1.5px solid #2e343d",
              borderRadius: 10,
              padding: "8px 14px",
            }}
          >
            <span style={{ color: "#6b7280", fontSize: 15 }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kontak..."
              style={{
                background: "none",
                border: "none",
                outline: "none",
                color: "#c8d0db",
                fontSize: 14,
                flex: 1,
              }}
            />
          </div>
        </div>

        {/* Contact list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredContacts.map((c) => {
            const active = selectedContact.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedContact(c)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 13,
                  width: "100%",
                  padding: "13px 18px",
                  background: active ? "#1a3a26" : "transparent",
                  border: "none",
                  borderLeft: active
                    ? "3px solid #4ade80"
                    : "3px solid transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "#232930";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <Avatar
                  initials={c.initials}
                  color={c.color}
                  online={c.online}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: active ? "#f1f5f9" : "#cbd5e1",
                      }}
                    >
                      {c.name}
                    </span>
                    {c.unread > 0 && (
                      <span
                        style={{
                          background: "#4ade80",
                          color: "#0f1a14",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "1px 8px",
                          minWidth: 20,
                          textAlign: "center",
                        }}
                      >
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "#64748b",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      marginTop: 2,
                    }}
                  >
                    {c.preview}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* WhatsApp footer */}
        <div
          style={{
            borderTop: "1px solid #2a2f38",
            padding: "16px",
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>
            Hubungi via WhatsApp
          </p>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 14px",
              background: "#1a2e1e",
              border: "1.5px solid #2d4a34",
              borderRadius: 10,
              color: "#4ade80",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#1f3824")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#1a2e1e")
            }
          >
            <span style={{ fontSize: 20 }}>📱</span>
            <div>
              <div>+62 812-3456-7890</div>
              <div
                style={{ fontSize: 11, color: "#6b9e78", fontWeight: 400 }}
              >
                Klik untuk mulai chat
              </div>
            </div>
          </a>
        </div>
      </aside>

      {/* ── Chat area ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#181c22",
          minWidth: 0,
        }}
      >
        {/* Topbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 24px",
            borderBottom: "1px solid #2a2f38",
            background: "#1e2228",
            gap: 14,
          }}
        >
          <Avatar
            initials={selectedContact.initials}
            color={selectedContact.color}
            size={42}
            online={selectedContact.online}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}
            >
              {selectedContact.name}
            </div>
            {selectedContact.online && (
              <div style={{ fontSize: 12, color: "#4ade80", marginTop: 1 }}>
                Online sekarang
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              style={{
                padding: "8px 12px",
                background: "#252b34",
                border: "1.5px solid #3a3f47",
                borderRadius: 8,
                color: "#c8d0db",
                fontSize: 16,
                cursor: "pointer",
              }}
              title="Info"
            >
              ☰
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 18px",
                background: "#1a3a26",
                border: "1.5px solid #2d5c38",
                borderRadius: 8,
                color: "#4ade80",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#1f4a2e")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#1a3a26")
              }
            >
              <span>📞</span> Telepon via WA
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* Date divider */}
          <div
            style={{
              textAlign: "center",
              margin: "8px 0 18px",
              position: "relative",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#4b5563",
                background: "#181c22",
                padding: "0 12px",
                position: "relative",
                zIndex: 1,
              }}
            >
              {today}
            </span>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                height: 1,
                background: "#2a2f38",
                zIndex: 0,
              }}
            />
          </div>

          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: isUser ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                {!isUser && (
                  <Avatar
                    initials={selectedContact.initials}
                    color={selectedContact.color}
                    size={32}
                  />
                )}
                <div
                  style={{
                    maxWidth: "58%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-end" : "flex-start",
                    gap: 4,
                  }}
                >
                  {msg.type === "text" && (
                    <div
                      style={{
                        padding: "11px 16px",
                        borderRadius: isUser
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                        background: isUser ? "#2e6b3e" : "#252b34",
                        color: isUser ? "#e8f5e9" : "#cbd5e1",
                        fontSize: 14,
                        lineHeight: 1.55,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                      }}
                    >
                      {msg.text}
                    </div>
                  )}
                  {msg.type === "image" && (
                    <div
                      style={{
                        width: 220,
                        height: 150,
                        background: "#252b34",
                        border: "1.5px solid #2e343d",
                        borderRadius: 12,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        color: "#6b7280",
                        fontSize: 13,
                      }}
                    >
                      <span style={{ fontSize: 32 }}>🖼️</span>
                      <span>{msg.imageLabel}</span>
                    </div>
                  )}
                  <span style={{ fontSize: 11, color: "#4b5563" }}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <Avatar
                initials={selectedContact.initials}
                color={selectedContact.color}
                size={32}
              />
              <div
                style={{
                  padding: "11px 18px",
                  borderRadius: "16px 16px 16px 4px",
                  background: "#252b34",
                  display: "flex",
                  gap: 5,
                  alignItems: "center",
                }}
              >
                {[0, 0.2, 0.4].map((delay, i) => (
                  <span
                    key={i}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#6b7280",
                      display: "inline-block",
                      animation: `bounce 1s ${delay}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick attachments */}
        <div
          style={{
            padding: "10px 24px 0",
            display: "flex",
            gap: 8,
            alignItems: "center",
            borderTop: "1px solid #2a2f38",
          }}
        >
          <span style={{ fontSize: 12, color: "#64748b", marginRight: 4 }}>
            Lampiran cepat:
          </span>
          <QuickAttachment label="Kirim foto" icon="📷" />
          <QuickAttachment label="Dokumen" icon="📄" />
          <QuickAttachment label="Lokasi" icon="📍" />
        </div>

        {/* Input bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 20px 18px",
          }}
        >
          <button
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              background: "#252b34",
              border: "1.5px solid #2e343d",
              color: "#6b7280",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            title="Emoji"
          >
            😊
          </button>
          <button
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              background: "#252b34",
              border: "1.5px solid #2e343d",
              color: "#6b7280",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            title="Lampiran"
          >
            📎
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan..."
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 10,
              background: "#252b34",
              border: "1.5px solid #2e343d",
              color: "#e2e8f0",
              fontSize: 14,
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#4a7c59")}
            onBlur={(e) => (e.target.style.borderColor = "#2e343d")}
          />

          <button
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              background: "#252b34",
              border: "1.5px solid #2e343d",
              color: "#6b7280",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            title="Rekam suara"
          >
            🎤
          </button>

          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              background: input.trim() ? "#2e6b3e" : "#252b34",
              border: `1.5px solid ${input.trim() ? "#3d8a52" : "#2e343d"}`,
              color: input.trim() ? "#4ade80" : "#6b7280",
              fontSize: 18,
              cursor: input.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.15s, border-color 0.15s",
            }}
            title="Kirim"
          >
            ➤
          </button>
        </div>
      </main>

      {/* Bounce animation for typing */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
</>
);
}