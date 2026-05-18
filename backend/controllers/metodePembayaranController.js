// controllers/metodePembayaranController.js
const MetodePembayaran = require("../models/metodePembayaran");

const getAllMetodePembayaran = async (req, res) => {
  try {
    const data = await MetodePembayaran.findAll({
      where: { status_aktif: true },
      order: [
        ["urutan_tampil", "ASC"],
        ["id", "ASC"],
      ],
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("GET metode pembayaran error:", error);
    return res.status(500).json({
      message: "Gagal mengambil data metode pembayaran",
    });
  }
};

const getAllMetodePembayaranAdmin = async (req, res) => {
  try {
    const data = await MetodePembayaran.findAll({
      order: [
        ["urutan_tampil", "ASC"],
        ["id", "ASC"],
      ],
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("GET admin metode pembayaran error:", error);
    return res.status(500).json({
      message: "Gagal mengambil seluruh data metode pembayaran",
    });
  }
};

const getMetodePembayaranById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await MetodePembayaran.findByPk(id);

    if (!data) {
      return res.status(404).json({
        message: "Metode pembayaran tidak ditemukan",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("GET metode pembayaran by id error:", error);
    return res.status(500).json({
      message: "Gagal mengambil data metode pembayaran",
    });
  }
};

const createMetodePembayaran = async (req, res) => {
  try {
    const { kode, nama_metode, urutan_tampil, status_aktif } = req.body;

    if (!kode || !nama_metode) {
      return res.status(400).json({
        message: "Kode dan nama metode wajib diisi",
      });
    }

    const existing = await MetodePembayaran.findOne({ where: { kode } });
    if (existing) {
      return res.status(400).json({
        message: "Kode metode pembayaran sudah digunakan",
      });
    }

    const data = await MetodePembayaran.create({
      kode: String(kode).toLowerCase(),
      nama_metode,
      urutan_tampil: urutan_tampil ?? 1,
      status_aktif: status_aktif ?? true,
    });

    return res.status(201).json({
      message: "Metode pembayaran berhasil dibuat",
      data,
    });
  } catch (error) {
    console.error("CREATE metode pembayaran error:", error);
    return res.status(500).json({
      message: "Gagal membuat metode pembayaran",
    });
  }
};

const updateMetodePembayaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { kode, nama_metode, urutan_tampil, status_aktif } = req.body;

    const data = await MetodePembayaran.findByPk(id);
    if (!data) {
      return res.status(404).json({
        message: "Metode pembayaran tidak ditemukan",
      });
    }

    if (kode && kode !== data.kode) {
      const duplicate = await MetodePembayaran.findOne({ where: { kode } });
      if (duplicate) {
        return res.status(400).json({
          message: "Kode metode pembayaran sudah digunakan",
        });
      }
    }

    await data.update({
      kode: kode ? String(kode).toLowerCase() : data.kode,
      nama_metode: nama_metode ?? data.nama_metode,
      urutan_tampil: urutan_tampil ?? data.urutan_tampil,
      status_aktif: status_aktif ?? data.status_aktif,
    });

    return res.status(200).json({
      message: "Metode pembayaran berhasil diperbarui",
      data,
    });
  } catch (error) {
    console.error("UPDATE metode pembayaran error:", error);
    return res.status(500).json({
      message: "Gagal memperbarui metode pembayaran",
    });
  }
};

const deleteMetodePembayaran = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await MetodePembayaran.findByPk(id);
    if (!data) {
      return res.status(404).json({
        message: "Metode pembayaran tidak ditemukan",
      });
    }

    await data.destroy();

    return res.status(200).json({
      message: "Metode pembayaran berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE metode pembayaran error:", error);
    return res.status(500).json({
      message: "Gagal menghapus metode pembayaran",
    });
  }
};

module.exports = {
  getAllMetodePembayaran,
  getAllMetodePembayaranAdmin,
  getMetodePembayaranById,
  createMetodePembayaran,
  updateMetodePembayaran,
  deleteMetodePembayaran,
};