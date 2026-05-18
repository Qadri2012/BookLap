const { Booking, Lapangan } = require("../models");

// GET semua booking milik user yang login
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [{ model: Lapangan, as: "lapangan" }],
      order: [["createdAt", "DESC"]],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// CREATE booking
exports.create = async (req, res) => {
  try {
    const {
      lapanganId, tanggal, jam_mulai,
      jam_selesai, nama_lapangan, total_harga,
    } = req.body;

    if (!lapanganId || !tanggal || !jam_mulai || !jam_selesai)
      return res.status(400).json({ msg: "Data booking tidak lengkap" });

    const booking = await Booking.create({
      userId: req.user.id,
      lapanganId,
      tanggal,
      jam_mulai,
      jam_selesai,
      nama_lapangan,
      total_harga,
    });

    res.status(201).json({ msg: "Booking berhasil", booking });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// CANCEL booking
exports.cancel = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!booking)
      return res.status(404).json({ msg: "Booking tidak ditemukan" });

    if (booking.status === "dibatalkan")
      return res.status(400).json({ msg: "Booking sudah dibatalkan" });

    await booking.update({ status: "dibatalkan" });
    res.json({ msg: "Booking berhasil dibatalkan" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};