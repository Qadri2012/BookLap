// controllers/metodeTransferController.js
const MetodeTransfer = require("../models/metodeTransfer");

const getAllMetodeTransfer = async (req, res) => {
  try {
    const where = { status_aktif: true };

    if (req.query.metode_pembayaran_id) {
      where.metode_pembayaran_id = req.query.metode_pembayaran_id;
    }

    const data = await MetodeTransfer.findAll({
      where,
      order: [
        ["urutan_tampil", "ASC"],
        ["id", "ASC"],
      ],
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("GET metode transfer error:", error);
    return res.status(500).json({
      message: "Gagal mengambil data metode transfer",
    });
  }
};

const getAllMetodeTransferAdmin = async (req, res) => {
  try {
    const data = await MetodeTransfer.findAll({
      order: [
        ["urutan_tampil", "ASC"],
        ["id", "ASC"],
      ],
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("GET admin metode transfer error:", error);
    return res.status(500).json({
      message: "Gagal mengambil seluruh data metode transfer",
    });
  }
};

const getMetodeTransferById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await MetodeTransfer.findByPk(id);

    if (!data) {
      return res.status(404).json({
        message: "Metode transfer tidak ditemukan",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("GET metode transfer by id error:", error);
    return res.status(500).json({
      message: "Gagal mengambil detail metode transfer",
    });
  }
};

const createMetodeTransfer = async (req, res) => {
  try {
    const {
      metode_pembayaran_id,
      kode,
      nama_metode,
      biaya_admin,
      logo,
      urutan_tampil,
      status_aktif,
    } = req.body;

    if (!metode_pembayaran_id || !kode || !nama_metode) {
      return res.status(400).json({
        message: "metode_pembayaran_id, kode, dan nama_metode wajib diisi",
      });
    }

    const existing = await MetodeTransfer.findOne({ where: { kode } });
    if (existing) {
      return res.status(400).json({
        message: "Kode metode transfer sudah digunakan",
      });
    }

    const data = await MetodeTransfer.create({
      metode_pembayaran_id,
      kode: String(kode).toLowerCase(),
      nama_metode,
      biaya_admin: biaya_admin ?? 0,
      logo: logo ?? null,
      urutan_tampil: urutan_tampil ?? 1,
      status_aktif: status_aktif ?? true,
    });

    return res.status(201).json({
      message: "Metode transfer berhasil dibuat",
      data,
    });
  } catch (error) {
    console.error("CREATE metode transfer error:", error);
    return res.status(500).json({
      message: "Gagal membuat metode transfer",
    });
  }
};

const updateMetodeTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      metode_pembayaran_id,
      kode,
      nama_metode,
      biaya_admin,
      logo,
      urutan_tampil,
      status_aktif,
    } = req.body;

    const data = await MetodeTransfer.findByPk(id);
    if (!data) {
      return res.status(404).json({
        message: "Metode transfer tidak ditemukan",
      });
    }

    if (kode && kode !== data.kode) {
      const duplicate = await MetodeTransfer.findOne({ where: { kode } });
      if (duplicate) {
        return res.status(400).json({
          message: "Kode metode transfer sudah digunakan",
        });
      }
    }

    await data.update({
      metode_pembayaran_id: metode_pembayaran_id ?? data.metode_pembayaran_id,
      kode: kode ? String(kode).toLowerCase() : data.kode,
      nama_metode: nama_metode ?? data.nama_metode,
      biaya_admin: biaya_admin ?? data.biaya_admin,
      logo: logo ?? data.logo,
      urutan_tampil: urutan_tampil ?? data.urutan_tampil,
      status_aktif: status_aktif ?? data.status_aktif,
    });

    return res.status(200).json({
      message: "Metode transfer berhasil diperbarui",
      data,
    });
  } catch (error) {
    console.error("UPDATE metode transfer error:", error);
    return res.status(500).json({
      message: "Gagal memperbarui metode transfer",
    });
  }
};

const deleteMetodeTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await MetodeTransfer.findByPk(id);
    if (!data) {
      return res.status(404).json({
        message: "Metode transfer tidak ditemukan",
      });
    }

    await data.destroy();

    return res.status(200).json({
      message: "Metode transfer berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE metode transfer error:", error);
    return res.status(500).json({
      message: "Gagal menghapus metode transfer",
    });
  }
};

module.exports = {
  getAllMetodeTransfer,
  getAllMetodeTransferAdmin,
  getMetodeTransferById,
  createMetodeTransfer,
  updateMetodeTransfer,
  deleteMetodeTransfer,
};