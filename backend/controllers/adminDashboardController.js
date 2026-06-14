// NEW: src/backend/controllers/adminDashboardController.js
const User = require("../models/user");
const Lapangan = require("../models/lapangan");
const Pemesanan = require("../models/pemesanan");
const Review = require("../models/review");

function toPlain(row) {
  return row?.get ? row.get({ plain: true }) : row;
}

function toPlainRows(rows = []) {
  return rows.map(toPlain);
}

function parseAnyDate(row) {
  const keys = [
    "tanggal",
    "tanggal_booking",
    "booking_date",
    "created_at",
    "createdAt",
    "date",
    "tanggal_pesan",
  ];

  for (const key of keys) {
    const raw = row?.[key];
    if (!raw) continue;

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

function sameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getAmountFromRow(row) {
  const keys = [
    "total_harga",
    "total_bayar",
    "total",
    "nominal",
    "amount",
    "harga",
  ];

  for (const key of keys) {
    const n = Number(row?.[key]);
    if (Number.isFinite(n)) return n;
  }

  return 0;
}

function getLapanganName(row) {
  return (
    row?.nama_lapangan ||
    row?.lapangan_nama ||
    row?.nama ||
    row?.lapangan ||
    row?.lapangan_id ||
    "Tidak diketahui"
  );
}

exports.getDashboardSummary = async (req, res) => {
  try {
    const [
      bookingsRaw,
      lapanganRaw,
      usersRaw,
      reviewsRaw,
    ] = await Promise.all([
      Pemesanan.findAll(),
      Lapangan.findAll(),
      User.findAll(),
      Review.findAll(),
    ]);

    const bookings = toPlainRows(bookingsRaw);
    const lapangan = toPlainRows(lapanganRaw);
    const users = toPlainRows(usersRaw);
    const reviews = toPlainRows(reviewsRaw);

    const now = new Date();

    // ====================================
    // STATISTIK
    // ====================================

    const bookingHariIni = bookings.filter((row) =>
      sameDay(parseAnyDate(row), now)
    ).length;

    const bookingBulanIni = bookings.filter((row) => {
      const d = parseAnyDate(row);

      return (
        d &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }).length;

    const pendapatanHariIni = bookings
      .filter((row) => sameDay(parseAnyDate(row), now))
      .reduce(
        (sum, row) => sum + getAmountFromRow(row),
        0
      );

    const pendapatanBulanIni = bookings
      .filter((row) => {
        const d = parseAnyDate(row);

        return (
          d &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce(
        (sum, row) => sum + getAmountFromRow(row),
        0
      );

    const totalUser = users.filter(
      (u) => u.role === "user"
    ).length;

    const adminAktif = users.filter(
      (u) =>
        u.role === "admin" &&
        u.status === "active"
    ).length;

    const totalLapangan = lapangan.length;

    // ====================================
    // BOOKING TERBARU
    // ====================================

    const recentBookings = [...bookings]
      .sort((a, b) => {
        const ta = parseAnyDate(a)?.getTime() || 0;
        const tb = parseAnyDate(b)?.getTime() || 0;

        return tb - ta;
      })
      .slice(0, 5);

    // ====================================
    // USER TERBARU
    // ====================================

    const recentUsers = users
      .filter((u) => u.role === "user")
      .sort((a, b) => {
        return (
          new Date(b.created_at) -
          new Date(a.created_at)
        );
      })
      .slice(0, 5);

    // ====================================
    // REVIEW TERBARU
    // ====================================

    const recentReviews = reviews
      .sort((a, b) => {
        return (
          new Date(b.createdAt) -
          new Date(a.createdAt)
        );
      })
      .slice(0, 5);

    // =========================
    // GRAFIK BOOKING 30 HARI
    // =========================

    const bookingChart = [];

    for (let i = 29; i >= 0; i--) {
      const day = new Date();

      day.setDate(day.getDate() - i);

      const total = bookings.filter((row) =>
        sameDay(parseAnyDate(row), day)
      ).length;

      bookingChart.push({
        tanggal: day.toISOString().split("T")[0],
        total,
      });
    }

    // =========================
    // GRAFIK PENDAPATAN
    // =========================

    const revenueChart = [];

    for (let month = 0; month < 12; month++) {
      const total = bookings
        .filter((row) => {
          const d = parseAnyDate(row);

          return (
            d &&
            d.getMonth() === month &&
            d.getFullYear() === now.getFullYear()
          );
        })
        .reduce(
          (sum, row) => sum + getAmountFromRow(row),
          0
        );

      revenueChart.push({
        bulan: new Date(
          now.getFullYear(),
          month
        ).toLocaleString("id-ID", {
          month: "short",
        }),
        total,
      });
    }
    
    return res.json({
      message:
        "Ringkasan dashboard admin berhasil diambil",

      summary: {
        totalUser,
        totalLapangan,
        totalBooking: bookings.length,
        bookingHariIni,
        bookingBulanIni,
        pendapatanHariIni,
        pendapatanBulanIni,
        adminAktif,
      },

      recentBookings: recentBookings.map((row) => ({
        ...row,
        lapanganName: getLapanganName(row),
      })),

      recentUsers,

      recentReviews,

      bookingChart,

      revenueChart,
    });
  } catch (err) {
    console.error(
      "ADMIN DASHBOARD ERROR:",
      err
    );

    return res.status(500).json({
      message:
        "Gagal mengambil dashboard admin",
      error: err.message,
    });
  }
};

exports.listLapangan = async (req, res) => {
  try {
    const rows = await Lapangan.findAll();
    return res.json({
      message: "Data lapangan berhasil diambil",
      msg: "Data lapangan berhasil diambil",
      data: toPlainRows(rows),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal mengambil data lapangan",
      msg: "Gagal mengambil data lapangan",
      error: err.message,
    });
  }
};

exports.listBooking = async (req, res) => {
  try {
    const rows = await Pemesanan.findAll();
    return res.json({
      message: "Data booking berhasil diambil",
      msg: "Data booking berhasil diambil",
      data: toPlainRows(rows).map((row) => ({
        ...row,
        lapanganName: getLapanganName(row),
      })),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal mengambil data booking",
      msg: "Gagal mengambil data booking",
      error: err.message,
    });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const rows = await User.findAll();
    return res.json({
      message: "Data user berhasil diambil",
      msg: "Data user berhasil diambil",
      data: toPlainRows(rows).filter(
        (u) => String(u.role || "user").toLowerCase() === "user"
      ),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal mengambil data user",
      msg: "Gagal mengambil data user",
      error: err.message,
    });
  }
};

exports.getLaporanSummary = async (req, res) => {
  try {
    const bookingsRaw = await Pemesanan.findAll();
    const bookings = toPlainRows(bookingsRaw);

    const byDay = new Map();
    const byLapangan = new Map();

    for (const row of bookings) {
      const date = parseAnyDate(row);
      if (date) {
        const day = date.toLocaleDateString("id-ID", { weekday: "long" });
        byDay.set(day, (byDay.get(day) || 0) + 1);
      }

      const lapanganName = getLapanganName(row);
      byLapangan.set(lapanganName, (byLapangan.get(lapanganName) || 0) + 1);
    }

    const mostBookedDay = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0];
    const mostPopularLapangan = [...byLapangan.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0];

    return res.json({
      message: "Ringkasan laporan berhasil diambil",
      msg: "Ringkasan laporan berhasil diambil",
      summary: {
        totalBooking: bookings.length,
        bookingTerbanyakPerHari: mostBookedDay
          ? { hari: mostBookedDay[0], jumlah: mostBookedDay[1] }
          : null,
        lapanganPalingPopuler: mostPopularLapangan
          ? { nama: mostPopularLapangan[0], jumlah: mostPopularLapangan[1] }
          : null,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal mengambil laporan admin",
      msg: "Gagal mengambil laporan admin",
      error: err.message,
    });
  }
};