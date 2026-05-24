import http from "k6/http";
import { check, sleep } from "k6";

// ✅ NEW: Load test configuration
export const options = {
  vus: 50,
  duration: "1m",
};

export default function () {
  // ✅ NEW: Endpoint sudah diperbaiki ke versi v1
  const res = http.get("http://localhost:5000/api/v1/lapangan");

  // ✅ NEW: Validasi status response
  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(1);
}