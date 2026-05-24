import http from "k6/http";
import { check, sleep } from "k6";

// ✅ NEW: Stress test configuration
export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "30s", target: 100 },
    { duration: "30s", target: 150 },
    { duration: "30s", target: 200 },
  ],
};

export default function () {
  // ✅ NEW: Endpoint diperbaiki ke v1
  const res = http.get("http://localhost:5000/api/v1/lapangan");

  // ✅ NEW: Validasi response berhasil
  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(1);
}