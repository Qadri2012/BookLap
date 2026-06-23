import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import notificationSound from "../../assets/notification.mp3";

/* ─── HELPERS ──────────────────────────────────────────────── */
function getInitials(name) {

  const safeName =
    typeof name === "string"
      ? name
      : "User";

  return safeName
    .trim()
    .split(" ")
    .slice(0, 2)
    .map(
      (w) =>
        w[0]?.toUpperCase() || ""
    )
    .join("");
}

const AVATAR_PALETTE = [
  { bg: "#1e3a28", color: "#4ade80" },
  { bg: "#1e2f3a", color: "#60a5fa" },
  { bg: "#2e1e3a", color: "#c084fc" },
  { bg: "#3a2a1e", color: "#fb923c" },
  { bg: "#2e1e1e", color: "#f87171" },
];

function avatarColor(name) {

  const safeName =
    typeof name === "string"
      ? name
      : "";

  return AVATAR_PALETTE[
    (
      safeName.charCodeAt(0) || 0
    ) % AVATAR_PALETTE.length
  ];
}

function Avatar({ name = "?", size = 38 }) {
  const { bg, color } = avatarColor(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: 0.5,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {getInitials(name)}
    </div>
  );
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isToday) return "Hari ini";
  return d.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/* ─── MAIN ─────────────────────────────────────────────────── */
export default function AdminChat() {
  const [messages,     setMessages]     = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [reply,        setReply]        = useState("");
  const [sending,      setSending]      = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const audioRef       = useRef(null);
      const setAdminOnline = async () => {
      await supabase
        .from("admin_status")
        .update({
          is_online: true,
          last_seen: new Date().toISOString(),
        })
        .eq("id", 1);
    };

const setAdminOffline = async () => {
  await supabase
    .from("admin_status")
    .update({
      is_online: false,
      last_seen: new Date().toISOString(),
    })
    .eq("id", 1);
};

  /* Derive rooms from messages */
  const rooms = Object.values(
    messages.reduce((acc, msg) => {
      if (
        !acc[msg.chat_room] ||
        new Date(msg.created_at) > new Date(acc[msg.chat_room].created_at)
      ) {
        acc[msg.chat_room] = {
          chat_room: msg.chat_room,
          user_name:
            msg.user_name || "User",
          last_message:
            msg.message,
          created_at:
            msg.created_at,
          unread: 0,
        };
      }
      if (msg.sender === "user") {
        acc[msg.chat_room].unread = (acc[msg.chat_room].unread || 0) + 1;
      }
      return acc;
    }, {})
  ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const roomMessages = messages.filter(
    (m) => m.chat_room === selectedRoom
  );

  /* Load + realtime */
useEffect(() => {
  loadMessages();

  setAdminOnline();

  const channel = supabase
    .channel("admin-chat")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chats",
      },
      (payload) => {
        if (payload.new.sender === "user") {
          audioRef.current?.play().catch(() => {});
        }

        loadMessages();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomMessages]);

  useEffect(() => {
    if (selectedRoom) inputRef.current?.focus();
  }, [selectedRoom]);
  useEffect(() => {
    const handleUnload = () => {
      setAdminOffline();
    };

    window.addEventListener(
      "beforeunload",
      handleUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleUnload
      );

      setAdminOffline();
    };
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      supabase
        .from("admin_status")
        .update({
          is_online: true,
          last_seen: new Date().toISOString(),
        })
        .eq("id", 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    const { data } = await supabase
      .from("chats")
      .select("*")
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedRoom || sending) return;
    setSending(true);
    await supabase.from("chats").insert([
      {
        user_id:   selectedRoom,
        user_name: "Admin BookLap",
        chat_room: selectedRoom,
        sender:    "admin",
        message:   reply.trim(),
      },
    ]);
    setReply("");
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  const selectedUserName =
    rooms.find((r) => r.chat_room === selectedRoom)?.user_name || "Customer";

  /* ── RENDER ─────────────────────────────────────────────── */
  return (
    <>
      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .ac-root *, .ac-root *::before, .ac-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .ac-root { font-family: 'Inter', system-ui, sans-serif; }
        .ac-root ::-webkit-scrollbar { width: 4px; }
        .ac-root ::-webkit-scrollbar-thumb { background: #2e3540; border-radius: 99px; }
        .ac-room-item { transition: background .15s; }
        .ac-room-item:hover { background: #1a1f28 !important; }
        .ac-send-btn { transition: background .15s, opacity .15s; }
        .ac-send-btn:disabled { opacity: .4; cursor: not-allowed; }
        .ac-send-btn:not(:disabled):hover { background: #15803d !important; }
        @keyframes ac-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ac-pulse { 0%,100% { opacity:.7; } 50% { opacity:1; } }
      `}</style>

      <audio ref={audioRef} src={notificationSound} preload="auto" />

      <div
        className="ac-root"
        style={{
          display: "flex",
          height: "85vh",
          background: "#10141a",
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid #1e2530",
          boxShadow: "0 24px 60px rgba(0,0,0,.5)",
        }}
      >
        {/* ── SIDEBAR ─────────────────────────────────────── */}
        <aside
          style={{
            width: 300,
            flexShrink: 0,
            background: "#141820",
            borderRight: "1px solid #1e2530",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header sidebar */}
          <div
            style={{
              padding: "20px 18px 14px",
              borderBottom: "1px solid #1e2530",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "#4ade80",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: 3,
                  }}
                >
                  Admin Panel
                </p>
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#f1f5f9",
                    letterSpacing: -0.3,
                  }}
                >
                  Inbox
                </h2>
              </div>
              <div
                style={{
                  background: "#1a2e1e",
                  border: "1px solid #2d4a34",
                  borderRadius: 99,
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#4ade80",
                }}
              >
                {rooms.length}
              </div>
            </div>
          </div>

          {/* Room list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {rooms.length === 0 ? (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  color: "#374151",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
                <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6 }}>
                  Belum ada pesan masuk
                </p>
              </div>
            ) : (
              rooms.map((room) => {
                const active = selectedRoom === room.chat_room;
                const { color } = avatarColor(room.user_name);
                return (
                  <div
                    key={room.chat_room}
                    className="ac-room-item"
                    onClick={() => setSelectedRoom(room.chat_room)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "13px 18px",
                      cursor: "pointer",
                      borderLeft: active
                        ? `3px solid ${color}`
                        : "3px solid transparent",
                      background: active ? "#1a1f28" : "transparent",
                      borderBottom: "1px solid #1a1f28",
                    }}
                  >
                    <Avatar
                      name={
                        room.user_name ||
                        "User"
                      }
                      size={40}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 3,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13.5,
                            fontWeight: active ? 700 : 600,
                            color: active ? "#f1f5f9" : "#94a3b8",
                          }}
                        >
                          {room.user_name || "User"}
                        </span>
                        <span
                          style={{ fontSize: 10.5, color: "#4b5563" }}
                        >
                          {formatTime(room.created_at)}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 6,
                        }}
                      >
<p
  style={{
    fontSize: 12,
    color: "#4b5563",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    flex: 1,
  }}
>
  {room.last_message?.includes("supabase.co/storage")
    ? "📷 Gambar"
    : room.last_message}
</p>
                        {room.unread > 0 && (
                          <span
                            style={{
                              background: "#16a34a",
                              color: "#fff",
                              borderRadius: 99,
                              minWidth: 20,
                              height: 20,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: "0 5px",
                              flexShrink: 0,
                            }}
                          >
                            {room.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar footer */}
          <div
            style={{
              padding: "12px 18px",
              borderTop: "1px solid #1e2530",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#4ade80",
                animation: "ac-pulse 2s infinite",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, color: "#4b5563" }}>
              Admin BookLap — online
            </span>
          </div>
        </aside>

        {/* ── CHAT AREA ───────────────────────────────────── */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            background: "#10141a",
          }}
        >
          {!selectedRoom ? (
            /* Empty state */
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                color: "#374151",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "#1a1f28",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                }}
              >
                💬
              </div>
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#64748b",
                    marginBottom: 4,
                  }}
                >
                  Pilih percakapan
                </p>
                <p style={{ fontSize: 13, color: "#374151" }}>
                  Klik nama customer di sidebar untuk mulai membalas
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 22px",
                  borderBottom: "1px solid #1e2530",
                  background: "#141820",
                  flexShrink: 0,
                }}
              >
                <Avatar
                  name={
                    selectedUserName ||
                    "User"
                  }
                  size={42}
                />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#f1f5f9",
                      marginBottom: 2,
                    }}
                  >
                    {selectedUserName}
                  </p>
                  <p style={{ fontSize: 12, color: "#4ade80" }}>
                    ● Sedang aktif
                  </p>
                </div>
                <div
                  style={{
                    background: "#1a1f28",
                    border: "1px solid #2a2f3a",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748b",
                  }}
                >
                  {roomMessages.length} pesan
                </div>
              </div>

              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {roomMessages.map((msg, i) => {
                  const isAdmin = msg.sender === "admin";
                  const showDateLabel =
                    i === 0 ||
                    formatDateLabel(msg.created_at) !==
                      formatDateLabel(roomMessages[i - 1]?.created_at);

                  return (
                    <div
                      key={msg.id}
                      style={{ animation: "ac-fade-up .25s ease both" }}
                    >
                      {/* Date divider */}
                      {showDateLabel && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            margin: "14px 0 10px",
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              height: 1,
                              background: "#1e2530",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              color: "#374151",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatDateLabel(msg.created_at)}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: 1,
                              background: "#1e2530",
                            }}
                          />
                        </div>
                      )}

                      {/* Bubble row */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: isAdmin ? "row-reverse" : "row",
                          alignItems: "flex-end",
                          gap: 9,
                          marginBottom: 8,
                        }}
                      >
                        {/* Avatar — hanya untuk user */}
                        {!isAdmin && (
                          <Avatar
                            name={
                              msg.user_name ||
                              "User"
                            }
                            size={30}
                          />
                        )}

                        <div
                          style={{
                            maxWidth: "60%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: isAdmin ? "flex-end" : "flex-start",
                            gap: 4,
                          }}
                        >
                          {/* Sender label */}
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: isAdmin ? "#4ade80" : "#60a5fa",
                              paddingLeft: isAdmin ? 0 : 2,
                              paddingRight: isAdmin ? 2 : 0,
                            }}
                          >
                            {isAdmin ? "Admin BookLap" : msg.user_name}
                          </span>

                          {/* Bubble */}
<div
  style={{
    padding: "11px 15px",
    borderRadius: isAdmin
      ? "16px 4px 16px 16px"
      : "4px 16px 16px 16px",
    background: isAdmin ? "#1a3a26" : "#1a1f28",
    border: isAdmin
      ? "1px solid #2d4a34"
      : "1px solid #2a2f3a",
    color: isAdmin ? "#d1fae5" : "#cbd5e1",
    fontSize: 13.5,
    lineHeight: 1.6,
    wordBreak: "break-word",
  }}
>
  {msg.message_type === "image" ? (
    <img
      src={msg.message}
      alt="chat-image"
      style={{
        maxWidth: "300px",
        maxHeight: "300px",
        borderRadius: "12px",
        display: "block",
      }}
    />
  ) : (
    msg.message
  )}
</div>

                          {/* Timestamp */}
                          <span
                            style={{ fontSize: 10.5, color: "#374151" }}
                          >
                            {formatTime(msg.created_at)}
                            {isAdmin && (
                              <span style={{ color: "#4ade80", marginLeft: 4 }}>
                                ✓✓
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div
                style={{
                  padding: "12px 20px 16px",
                  borderTop: "1px solid #1e2530",
                  background: "#141820",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#1a1f28",
                    border: "1px solid #2a2f3a",
                    borderRadius: 14,
                    padding: "4px 4px 4px 16px",
                    transition: "border-color .2s",
                  }}
                  onFocus={() => {}}
                >
                  <input
                    ref={inputRef}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tulis balasan... (Enter untuk kirim)"
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#e2e8f0",
                      fontSize: 14,
                      lineHeight: 1.5,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  />
                  <button
                    className="ac-send-btn"
                    onClick={sendReply}
                    disabled={!reply.trim() || sending}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "9px 16px",
                      background: "#16a34a",
                      border: "none",
                      borderRadius: 10,
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      flexShrink: 0,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {sending ? (
                      "Mengirim..."
                    ) : (
                      <>
                        Kirim
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: "#374151",
                    marginTop: 7,
                    textAlign: "right",
                  }}
                >
                  Enter untuk kirim · Shift+Enter untuk baris baru
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
