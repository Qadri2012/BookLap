const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper parse JSON aman
function parseJSON(val, fallback) {
  if (val === null || val === undefined || val === "") return fallback;
  if (typeof val === "object") return val;

  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// Helper parse lapangan dari backend
function parseLapangan(d) {
  return {
    ...d,
    foto: parseJSON(d.foto, []),
    fasilitas: parseJSON(d.fasilitas, []),
    hari_operasional: parseJSON(d.hari_operasional, null),
    rating: d.rating ?? 0,
    reviews: d.reviews ?? 0,
  };
}

// Token helper
function getToken() {
  return localStorage.getItem("token");
}

// Helper request umum
async function request(url, options = {}) {
  const res = await fetch(url, options);

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.message || "Request gagal");
  }

  return data;
}

// LAPANGAN
export const getLapangan = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/lapangan${query ? `?${query}` : ""}`;
  const data = await request(url);
  return Array.isArray(data) ? data.map(parseLapangan) : [];
};

export const getLapanganById = async (id) => {
  const data = await request(`${BASE_URL}/lapangan/${id}`);
  return parseLapangan(data);
};

// REVIEW
export const getReviews = async (lapanganId) => {
  const data = await request(`${BASE_URL}/review/${lapanganId}`);
  return Array.isArray(data) ? data : [];
};

export const createReview = async (payload) => {
  return request(`${BASE_URL}/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });
};

// AUTH
export const login = async (email, password) => {
  return request(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
};

// Sesuaikan ini dengan backend kamu
export const register = async (nama, no_hp, email, password) => {
  return request(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama, no_hp, email, password }),
  });
};

// BOOKING
export const getMyBookings = async () => {
  return request(`${BASE_URL}/booking`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

export const createBooking = async (payload) => {
  return request(`${BASE_URL}/booking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });
};

export const cancelBooking = async (id) => {
  return request(`${BASE_URL}/booking/${id}/cancel`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};