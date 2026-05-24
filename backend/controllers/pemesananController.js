// controllers/pemesananController.js
const Pemesanan = require("../models/pemesanan");
const MetodePembayaran = require("../models/metodePembayaran");
const MetodeTransfer = require("../models/metodeTransfer");
const sequelize = require("../config/database");
const { Op } = require("sequelize");
const DetailPemesanan = require("../models/detailPemesanan");

const generateKodePemesanan = () => {
  const now = new Date();
  const tanggal = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BLP-${tanggal}-${random}`;
};

const BANK_PREFIX = {
  bni: "009",
  bri: "002",
  mandiri: "008",
  bsi: "451",
};
const RIWAYAT_STATUS = {
  TRANSFER: "transfer_berhasil",
  CASH: "cash_berhasil",
  BATAL: "pembatalan",
};

const getRiwayatStatusByChannel = (channel = "") => {
  const value = String(channel).toLowerCase();

  if (value === "cash") return RIWAYAT_STATUS.CASH;
  if (["bank", "ewallet", "minimarket"].includes(value)) {
    return RIWAYAT_STATUS.TRANSFER;
  }

  return null;
};

const normalizePhone = (value = "") =>
  String(value).replace(/\D/g, "");

const generateVaNumber = (bankCode, noWhatsapp) => {
  const prefix = BANK_PREFIX[String(bankCode).toLowerCase()];
  const waDigits = normalizePhone(noWhatsapp);

  if (!prefix) return null;
  if (!waDigits) return null;

  return `${prefix}${waDigits}`;
};

const resolveMetodePembayaran = async (value, transaction) => {
  if (value === null || value === undefined || value === "") return null;

  const raw = String(value).trim();
  const numeric = Number(raw);

  if (!Number.isNaN(numeric) && raw !== "") {
    const byId = await MetodePembayaran.findByPk(numeric, { transaction });
    if (byId) return byId;
  }

  const byKode = await MetodePembayaran.findOne({
    where: { kode: raw.toLowerCase() },
    transaction,
  });

  return byKode;
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
      where: {
        user_id: userId,
        riwayat_status: null,
      },
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
const getRiwayatByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const data = await Pemesanan.findAll({
      where: {
        user_id: userId,
        riwayat_status: {
          [Op.in]: [
            RIWAYAT_STATUS.TRANSFER,
            RIWAYAT_STATUS.CASH,
            RIWAYAT_STATUS.BATAL,
          ],
        },
      },
      order: [["id", "DESC"]],
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("GET riwayat by user error:", error);
    return res.status(500).json({
      message: "Gagal mengambil data riwayat",
    });
  }
};

const createPemesanan = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      user_id,
      lapangan_id,
      metode_pembayaran_id,
      selected_transfer_method,
      selectedTransferMethod,
      nama_pemesan,
      email,
      no_whatsapp,
      nama_lapangan,
      selectedSlots = [],
      subtotal_sewa = 0,
      subtotal_layanan = 0,
      total_durasi_menit = 0,
      status_kedatangan = null,
      confirmed_arrival_at = null,
      dibatalkan_at = null,
      alasan_batal = null,
      catatan = null,
    } = req.body;

    if (
      !user_id ||
      !lapangan_id ||
      !metode_pembayaran_id ||
      !nama_pemesan ||
      !email ||
      !no_whatsapp
    ) {
      await transaction.rollback();
      return res.status(400).json({
        message:
          "user_id, lapangan_id, metode_pembayaran_id, nama_pemesan, email, dan no_whatsapp wajib diisi",
      });
    }

    if (!Array.isArray(selectedSlots) || selectedSlots.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: "selectedSlots wajib diisi minimal 1 slot",
      });
    }

    const metodePembayaran = await resolveMetodePembayaran(
      metode_pembayaran_id,
      transaction
    );

    if (!metodePembayaran) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Metode pembayaran tidak ditemukan",
      });
    }

    const kodePembayaran = String(metodePembayaran.kode).toLowerCase();
    const isTransfer = kodePembayaran === "transfer";
    const isCash = kodePembayaran === "cash";

let kodePemesananBaru = null;
let vaNumber = null;
let paymentReference = null;
let paymentChannel = null;
let biayaAdminFinal = 0;

if (isTransfer) {
  const transferCode = String(
    selected_transfer_method || selectedTransferMethod || ""
  )
    .trim()
    .toLowerCase();

  if (!transferCode) {
    await transaction.rollback();
    return res.status(400).json({
      message: "Metode transfer wajib dipilih",
    });
  }

  const metodeTransfer = await MetodeTransfer.findOne({
    where: {
      kode: transferCode,
      metode_pembayaran_id: metodePembayaran.id,
      status_aktif: true,
    },
    transaction,
  });

  if (!metodeTransfer) {
    await transaction.rollback();
    return res.status(404).json({
      message: "Metode transfer tidak ditemukan",
    });
  }

  const kategoriTransfer = String(metodeTransfer.kategori || "").toLowerCase();
  biayaAdminFinal = Number(metodeTransfer.biaya_admin || 0);

  if (kategoriTransfer === "bank") {
    vaNumber = generateVaNumber(metodeTransfer.kode, no_whatsapp);

    if (!vaNumber) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Nomor Virtual Account gagal dibuat",
      });
    }

    paymentChannel = "bank";
  } else if (kategoriTransfer === "ewallet") {
    paymentReference = `EWL-${generateKodePemesanan()}`;
    paymentChannel = "ewallet";
  } else if (kategoriTransfer === "minimarket") {
    paymentReference = `IND-${generateKodePemesanan()}`;
    paymentChannel = "minimarket";
  } else {
    await transaction.rollback();
    return res.status(400).json({
      message: "Kategori metode transfer tidak valid",
    });
  }
}

if (isCash) {
  kodePemesananBaru = generateKodePemesanan();
  biayaAdminFinal = 0;
  vaNumber = null;
  paymentReference = null;
  paymentChannel = "cash";
}

    const subtotalSewaNum = Number(subtotal_sewa || 0);
    const subtotalLayananNum = Number(subtotal_layanan || 0);
    const totalBayarFinal =
      subtotalSewaNum + subtotalLayananNum + biayaAdminFinal;

    const data = await Pemesanan.create(
    {
      kode_pemesanan: isCash ? kodePemesananBaru : null,
      va_number: paymentChannel === "bank" ? vaNumber : null,
      payment_reference:
        paymentChannel === "ewallet" || paymentChannel === "minimarket"
          ? paymentReference
          : null,
      payment_channel: paymentChannel,
      riwayat_status: null,
    user_id,
    lapangan_id,
    metode_pembayaran_id: metodePembayaran.id,
    nama_pemesan,
    email,
    no_whatsapp,
    subtotal_sewa: subtotalSewaNum,
    subtotal_layanan: subtotalLayananNum,
    biaya_admin: biayaAdminFinal,
    total_bayar: totalBayarFinal,
    total_durasi_menit,
    status_pemesanan: isCash
      ? "menunggu_kedatangan"
      : "menunggu_pembayaran",
    status_kedatangan,
    confirmed_arrival_at,
    dibatalkan_at,
    alasan_batal,
    catatan,
  },
  { transaction }
    );

    const detailRows = selectedSlots.map((slot) => ({
      pemesanan_id: data.id,
      nama_lapangan: nama_lapangan || "Lapangan",
      nomor_lapangan: Number(slot.court_no || slot.nomor_lapangan || 0),
      tanggal: slot.tanggal,
      jam_mulai: slot.jam_mulai,
      jam_selesai: slot.jam_selesai,
      durasi_jam: Number(slot.durasi_jam || 1),
      harga: Number(slot.harga || 0),
    }));

    await DetailPemesanan.bulkCreate(detailRows, { transaction });

    await transaction.commit();

    return res.status(201).json({
      message: "Pemesanan berhasil dibuat",
      data,
      payment_reference: paymentReference,
      payment_channel: paymentChannel,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("CREATE pemesanan error:", error);

    return res.status(500).json({
      message: "Gagal membuat pemesanan",
      error: error.message,
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
const selesaiPemesanan = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Pemesanan.findByPk(id);
    if (!data) {
      return res.status(404).json({
        message: "Pemesanan tidak ditemukan",
      });
    }

    const riwayatStatus = getRiwayatStatusByChannel(data.payment_channel);

    if (!riwayatStatus) {
      return res.status(400).json({
        message: "Payment channel tidak valid untuk diselesaikan",
      });
    }

    await data.update({
      status_pemesanan: "selesai",
      riwayat_status: riwayatStatus,
    });

    return res.status(200).json({
      message: "Pemesanan berhasil diselesaikan",
      data,
    });
  } catch (error) {
    console.error("SELESAI pemesanan error:", error);
    return res.status(500).json({
      message: "Gagal menyelesaikan pemesanan",
    });
  }
};
const setujuiPembatalan = async (req, res) => {
  try {
    const { id } = req.params;
    const { alasan_batal = null } = req.body;

    const data = await Pemesanan.findByPk(id);
    if (!data) {
      return res.status(404).json({
        message: "Pemesanan tidak ditemukan",
      });
    }

    await data.update({
      status_pemesanan: "dibatalkan",
      riwayat_status: RIWAYAT_STATUS.BATAL,
      alasan_batal: alasan_batal || data.alasan_batal,
      dibatalkan_at: new Date(),
    });

    return res.status(200).json({
      message: "Pembatalan berhasil disetujui",
      data,
    });
  } catch (error) {
    console.error("SETUJUI pembatalan error:", error);
    return res.status(500).json({
      message: "Gagal menyetujui pembatalan",
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
  getRiwayatByUser,
  createPemesanan,
  updatePemesanan,
  updateStatusPemesanan,
  selesaiPemesanan,
  setujuiPembatalan,
  deletePemesanan,
};