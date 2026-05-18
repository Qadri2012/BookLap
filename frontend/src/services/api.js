const BASE_URL = "http://localhost:5000/api";

// ── Helper parse JSON aman ────────────────────────────────────────────────────
function parseJSON(val, fallback) {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try { return JSON.parse(val); }
  catch { return fallback; }
}

// ── Helper parse satu lapangan dari backend ───────────────────────────────────
function parseLapangan(d) {
  return {
    ...d,
    foto:             parseJSON(d.foto, []),
    fasilitas:        parseJSON(d.fasilitas, []),
    hari_operasional: parseJSON(d.hari_operasional, null),
    rating:           d.rating  ?? 0,
    reviews:          d.reviews ?? 0,
  };
}

// ── Token helper ──────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("token");
}

// ── LAPANGAN ──────────────────────────────────────────────────────────────────

export const getLapangan = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url   = `${BASE_URL}/lapangan${query ? `?${query}` : ""}`;
  const res   = await fetch(url);
  const data  = await res.json();
  return Array.isArray(data) ? data.map(parseLapangan) : [];
};

export const getLapanganById = async (id) => {
  const res  = await fetch(`${BASE_URL}/lapangan/${id}`);
  const data = await res.json();
  return parseLapangan(data);
};

// ── REVIEW ────────────────────────────────────────────────────────────────────

export const getReviews = async (lapanganId) => {
  const res  = await fetch(`${BASE_URL}/review/${lapanganId}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

export const createReview = async (payload) => {
  const res = await fetch(`${BASE_URL}/review`, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
};

// ── AUTH ──────────────────────────────────────────────────────────────────────

export const login = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, password }),
  });
  return res.json();
};

export const register = async (username, email, password) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ username, email, password }),
  });
  return res.json();
};

// ── BOOKING ───────────────────────────────────────────────────────────────────

export const getMyBookings = async () => {
  const res = await fetch(`${BASE_URL}/booking`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const createBooking = async (payload) => {
  const res = await fetch(`${BASE_URL}/booking`, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const cancelBooking = async (id) => {
  const res = await fetch(`${BASE_URL}/booking/${id}/cancel`, {
    method:  "PATCH",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};