// controllers/pemesananController.js
const Pemesanan = require("../models/pemesanan");
const sequelize = require("../config/database");

const generateKodePemesanan = () => {
  const now = new Date();
  const tanggal = now
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BLP-${tanggal}-${random}`;
};

const getAllPemesanan = async (req, res) => {
  try {
    const data = await Pemesanan.findAll({
      order: [["id", "DESC"]],
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("GET pemesanan error:", error);
    return res.status(500).json({
      message: "Gagal mengambil data pemesanan",
    });
  }
};

const getPemesananById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Pemesanan.findByPk(id);

    if (!data) {
      return res.status(404).json({
        message: "Pemesanan tidak ditemukan",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("GET pemesanan by id error:", error);
    return res.status(500).json({
      message: "Gagal mengambil detail pemesanan",
    });
  }
};

const getPemesananByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const data = await Pemesanan.findAll({
      where: { user_id: userId },
      order: [["id", "DESC"]],
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("GET pemesanan by user error:", error);
    return res.status(500).json({
      message: "Gagal mengambil data pemesanan user",
    });
  }
};

const createPemesanan = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      kode_pemesanan,
      user_id,
      lapangan_id,
      metode_pembayaran_id,
      nama_pemesan,
      email,
      no_whatsapp,
      subtotal_sewa = 0,
      subtotal_layanan = 0,
      biaya_admin = 0,
      total_bayar = 0,
      total_durasi_menit = 0,
      status_pemesanan = "menunggu_pembayaran",
      status_kedatangan = null,
      confirmed_arrival_at = null,
      dibatalkan_at = null,
      alasan_batal = null,
      catatan = null,
    } = req.body;

    if (!user_id || !lapangan_id || !metode_pembayaran_id || !nama_pemesan || !email || !no_whatsapp) {
      await transaction.rollback();
      return res.status(400).json({
        message: "user_id, lapangan_id, metode_pembayaran_id, nama_pemesan, email, dan no_whatsapp wajib diisi",
      });
    }

    const data = await Pemesanan.create(
      {
        kode_pemesanan: kode_pemesanan || generateKodePemesanan(),
        user_id,
        lapangan_id,
        metode_pembayaran_id,
        nama_pemesan,
        email,
        no_whatsapp,
        subtotal_sewa,
        subtotal_layanan,
        biaya_admin,
        total_bayar,
        total_durasi_menit,
        status_pemesanan,
        status_kedatangan,
        confirmed_arrival_at,
        dibatalkan_at,
        alasan_batal,
        catatan,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      message: "Pemesanan berhasil dibuat",
      data,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("CREATE pemesanan error:", error);

    return res.status(500).json({
      message: "Gagal membuat pemesanan",
    });
  }
};

const updatePemesanan = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Pemesanan.findByPk(id);
    if (!data) {
      return res.status(404).json({
        message: "Pemesanan tidak ditemukan",
      });
    }

    await data.update({
      ...req.body,
    });

    return res.status(200).json({
      message: "Pemesanan berhasil diperbarui",
      data,
    });
  } catch (error) {
    console.error("UPDATE pemesanan error:", error);
    return res.status(500).json({
      message: "Gagal memperbarui pemesanan",
    });
  }
};

const updateStatusPemesanan = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_pemesanan, alasan_batal = null, dibatalkan_at = null } = req.body;

    const data = await Pemesanan.findByPk(id);
    if (!data) {
      return res.status(404).json({
        message: "Pemesanan tidak ditemukan",
      });
    }

    await data.update({
      status_pemesanan,
      alasan_batal,
      dibatalkan_at,
    });

    return res.status(200).json({
      message: "Status pemesanan berhasil diperbarui",
      data,
    });
  } catch (error) {
    console.error("UPDATE status pemesanan error:", error);
    return res.status(500).json({
      message: "Gagal memperbarui status pemesanan",
    });
  }
};

const deletePemesanan = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Pemesanan.findByPk(id);
    if (!data) {
      return res.status(404).json({
        message: "Pemesanan tidak ditemukan",
      });
    }

    await data.destroy();

    return res.status(200).json({
      message: "Pemesanan berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE pemesanan error:", error);
    return res.status(500).json({
      message: "Gagal menghapus pemesanan",
    });
  }
};

module.exports = {
  getAllPemesanan,
  getPemesananById,
  getPemesananByUser,
  createPemesanan,
  updatePemesanan,
  updateStatusPemesanan,
  deletePemesanan,
};