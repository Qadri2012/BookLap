// ✅ NEW: src/services/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
});
const refreshApi = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
});

// ─────────────────────────────────────────────────────────────
// TOKEN HELPER
// ─────────────────────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("redirectAfterAuth");
}



// ─────────────────────────────────────────────────────────────
// UNAUTHORIZED HANDLER
// Dipakai dari AuthContext supaya logout sinkron
// ─────────────────────────────────────────────────────────────
let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}


// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// ✅ NEW: auto refresh token dari HttpOnly Cookie
// ─────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const requestUrl = originalRequest.url || "";

    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/logout") ||
      requestUrl.includes("/auth/verify");

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshRes = await refreshAuth();
        const newAccessToken = refreshRes.accessToken || refreshRes.token;

        if (newAccessToken) {
          setToken(newAccessToken);

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        removeToken();

        if (typeof unauthorizedHandler === "function") {
          unauthorizedHandler(refreshError);
        } else {
          window.location.href = "/login/user?expired=true";
        }

        return Promise.reject(refreshError);
      }
    }

    if (status === 403) {
      if (typeof unauthorizedHandler === "function") {
        unauthorizedHandler(error);
      }
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────
// PARSE JSON
// ─────────────────────────────────────────────────────────────
function parseJSON(val, fallback) {
  if (!val) return fallback;
  if (typeof val === "object") return val;

  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// ─────────────────────────────────────────────────────────────
// PARSE LAPANGAN
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// LAPANGAN
// ─────────────────────────────────────────────────────────────
export const getLapangan = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`/lapangan${query ? `?${query}` : ""}`);
  return Array.isArray(res.data) ? res.data.map(parseLapangan) : [];
};

export const getLapanganById = async (id) => {
  const res = await api.get(`/lapangan/${id}`);
  return parseLapangan(res.data);
};

// ─────────────────────────────────────────────────────────────
// REVIEW
// ─────────────────────────────────────────────────────────────
export const getReviews = async (lapanganId) => {
  const res = await api.get(`/review/${lapanganId}`);
  return Array.isArray(res.data) ? res.data : [];
};

export const createReview = async (payload) => {
  const res = await api.post("/review", payload);
  return res.data;
};


// Frontend mengirim data lewat Axios
export const login = async (payload) => {
  const res = await api.post("/auth/login", payload);
  return res.data;
};


export const register = async (payload) => {
  const res = await api.post("/auth/register", payload);
  return res.data;
};

export const verifyAuth = async () => {
  const res = await api.get("/auth/verify");
  return res.data;
};

export const refreshAuth = async () => {
  // ✅ NEW: refresh token dibaca dari HttpOnly cookie di backend
  const res = await refreshApi.post("/auth/refresh");
  return res.data;
};

export const logoutAuth = async () => {
  // ✅ NEW: backend menghapus / mem-blacklist refresh token dari cookie
  const res = await refreshApi.post("/auth/logout");
  removeToken();
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// BOOKING
// ─────────────────────────────────────────────────────────────
export const getMyBookings = async () => {
  const res = await api.get("/booking");
  return res.data;
};

export const createBooking = async (payload) => {
  const res = await api.post("/booking", payload);
  return res.data;
};

export const cancelBooking = async (id) => {
  const res = await api.patch(`/booking/${id}/cancel`);
  return res.data;
};

export default api;