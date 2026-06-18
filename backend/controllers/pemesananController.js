// controllers/pemesananController.js
const Pemesanan = require("../models/pemesanan");
const MetodePembayaran = require("../models/metodePembayaran");
const MetodeTransfer = require("../models/metodeTransfer");
const sequelize = require("../config/database");
const { Op } = require("sequelize");
const DetailPemesanan = require("../models/detailPemesanan");
const User = require("../models/user");
const Jadwal = require("../models/jadwal");
const Lapangan = require("../models/Lapangan");
const DetailLayananPemesanan = require("../models/detailLayananPemesanan");
const LayananTambahan = require("../models/layananTambahanModel");
const {
  Review
} = require("../models");
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

const getAllPemesanan = async (
  req,
  res
) => {
  try {

    const data =
      await Pemesanan.findAll({
        include: [
          {
            model:
              DetailPemesanan,
            as:
              "detail_pemesanan",
          },

          {
            model: Lapangan,
            as: "lapangan",
          },

          {
            model:
              DetailLayananPemesanan,
            as:
              "detail_layanan",

            include: [
              {
                model:
                  LayananTambahan,
                as: "layanan",
              },
            ],
          },
        ],

        order: [
          ["id", "DESC"],
        ],
      });

    return res
      .status(200)
      .json(data);

  } catch (error) {

    console.error(
      "GET ALL PEMESANAN ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Gagal mengambil data pemesanan",
    });
  }
};

const getPemesananById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Pemesanan.findByPk(id, {
      include: [
        {
          model: DetailPemesanan,
          as: "detail_pemesanan",
        },
        {
          model: Lapangan,
          as: "lapangan",
        },

        // ===== NEW CODE : DETAIL LAYANAN =====
        {
          model: DetailLayananPemesanan,
          as: "detail_layanan",
          include: [
            {
              model: LayananTambahan,
              as: "layanan",
              attributes: [
                "id",
                "nama_layanan",
              ],
            },
          ],
        },
        // ===== END NEW CODE =====
      ],
    });

    if (!data) {
      return res.status(404).json({
        message: "Pemesanan tidak ditemukan",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(
      "GET pemesanan by id error:",
      error
    );

    return res.status(500).json({
      message:
        "Gagal mengambil detail pemesanan",
    });
  }
};

const getPemesananByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const pemesananList = await Pemesanan.findAll({
      where: {
        user_id: userId,

        status_pemesanan: {
          [Op.notIn]: [
            "selesai",
            "dibatalkan",
            "expired",
          ],
        },
      },
      order: [["id", "DESC"]],
    });

    const data = await Promise.all(
      pemesananList.map(async (item) => {
        const detail = await DetailPemesanan.findAll({
          where: {
            pemesanan_id: item.id,
          },
          order: [["tanggal", "ASC"]],
        });

        const layanan =
          await DetailLayananPemesanan.findAll({
            where: {
              pemesanan_id: item.id,
            },

            include: [
              {
                model: LayananTambahan,
                as: "layanan",

                attributes: [
                  "id",
                  "nama_layanan",
                ],
              },
            ],
          });

        const lapangan = await Lapangan.findByPk(item.lapangan_id);

        return {
          ...item.toJSON(),
          detail_pemesanan: detail,
          detail_layanan: layanan,
          lapangan,
        };
      })
    );

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

    const riwayatList = await Pemesanan.findAll({
      where: {
        user_id: userId,
        status_pemesanan: {
          [Op.in]: [
            "selesai",
            "dibatalkan",
            "expired",
          ],
        },
      },
      order: [["id", "DESC"]],
    });

    const data = await Promise.all(
      riwayatList.map(async (item) => {
        const detail =
          await DetailPemesanan.findAll({
            where: {
              pemesanan_id: item.id,
            },
            order: [
              ["tanggal", "ASC"],
            ],
          });

        const layanan =
          await DetailLayananPemesanan.findAll({
            where: {
              pemesanan_id: item.id,
            },

            include: [
              {
                model:
                  LayananTambahan,
                as: "layanan",

                attributes: [
                  "id",
                  "nama_layanan",
                ],
              },
            ],
          });

        const lapangan =
          await Lapangan.findByPk(
          item.lapangan_id
          );

          console.log(
            "CEK REVIEW PEMESANAN:",
            item.id
          );

          const review =
            await Review.findOne({
              where: {
                pemesananId: item.id,
              },
            });

          console.log(
            "HASIL REVIEW:",
            review
          );

        return {
          ...item.toJSON(),

          detail_pemesanan: detail,

          detail_layanan: layanan,

          lapangan,

          review,
        };
      })
    );

    return res.status(200).json(
      data
    );

  } catch (error) {

    console.error(
      "GET riwayat by user error:",
      error
    );

    return res.status(500).json({
      message:
        "Gagal mengambil data riwayat",
    });
  }
};

const getRiwayatAdmin =
  async (req, res) => {
    try {
      const data =
        await Pemesanan.findAll({
          where: {
            status_pemesanan: {
              [Op.in]: [
                "selesai",
                "dibatalkan",
                "expired",
              ],
            },
          },

          include: [
            {
              model:
                DetailPemesanan,
              as:
                "detail_pemesanan",
            },

            {
              model: Lapangan,
              as: "lapangan",
            },
          ],

          order: [
            ["id", "DESC"],
          ],
        });

      return res
        .status(200)
        .json(data);

    } catch (error) {

      console.error(error);

      return res
        .status(500)
        .json({
          message:
            "Gagal mengambil riwayat admin",
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
      selectedServiceDetails = [],
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
    // =====================================================
// CEK USER DIBLOKIR
// =====================================================

const user = await User.findByPk(user_id);

if (!user) {
  await transaction.rollback();

  return res.status(404).json({
    message: "User tidak ditemukan",
  });
}

// ========================================
// AUTO UNBLOCK
// ========================================

if (
  user.akun_diblokir &&
  user.blocked_until &&
  new Date() >= new Date(user.blocked_until)
) {
  await user.update({
    akun_diblokir: false,
    blocked_until: null,
    jumlah_no_show: 0,
  });
}

// ========================================
// END AUTO UNBLOCK
// ========================================

if (
  user.akun_diblokir &&
  user.blocked_until &&
  new Date() < new Date(user.blocked_until)
) {
  await transaction.rollback();

  return res.status(403).json({
    message:
      "Akun Anda diblokir sementara karena 3 kali tidak hadir pada pemesanan cash",
  });
}
// =====================================================
// END CEK USER DIBLOKIR
// =====================================================

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
let paymentExpiresAt = null;

if (isTransfer) {
  // NEW CODE TIMER FIX
  paymentExpiresAt = new Date(
  Date.now() + 60 * 60 * 1000
);

console.log(
  "PAYMENT EXPIRES AT =",
  paymentExpiresAt.toISOString()
);
  
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

// =====================================================
// NEW CODE TAHAP 9
// CEK DOUBLE BOOKING
// =====================================================

for (const slot of selectedSlots) {

  const jadwalAktif =
    await Jadwal.findOne({
      where: {
        lapangan_id,
        court_no: Number(
          slot.court_no ||
          slot.nomor_lapangan
        ),
        tanggal: slot.tanggal,
        jam_mulai: slot.jam_mulai,
        jam_selesai: slot.jam_selesai,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

  if (!jadwalAktif) {
    await transaction.rollback();

    return res.status(404).json({
      message:
        "Slot jadwal tidak ditemukan",
    });
  }

  if (
    jadwalAktif.status !==
    "tersedia"
  ) {
    await transaction.rollback();

    return res.status(400).json({
      message:
        `Slot ${slot.jam_mulai}-${slot.jam_selesai} sudah tidak tersedia`,
    });
  }
}

// =====================================================
// END NEW CODE
// =====================================================

    const subtotalSewaNum = Number(subtotal_sewa || 0);
    const subtotalLayananNum = Number(subtotal_layanan || 0);
    const totalBayarFinal =
      subtotalSewaNum + subtotalLayananNum + biayaAdminFinal;
    
    console.log("========== BACKEND ==========");
console.log(
  "total_durasi_menit =",
  total_durasi_menit
);

console.log(
  "selectedSlots.length =",
  selectedSlots.length
);

console.log(selectedSlots);
console.log("=============================");
    const data = await Pemesanan.create(
    {
      kode_pemesanan: isCash ? kodePemesananBaru : null,
      va_number: paymentChannel === "bank" ? vaNumber : null,
      payment_reference:
        paymentChannel === "ewallet" || paymentChannel === "minimarket"
          ? paymentReference
          : null,
      payment_expires_at: paymentExpiresAt,
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
    // ===== NEW CODE =====
    if (
      Array.isArray(selectedServiceDetails) &&
      selectedServiceDetails.length > 0
    ) {
      const layananRows =
        selectedServiceDetails.map(
          (item) => ({
            pemesanan_id: data.id,
            layanan_id: item.id,
            qty: Number(item.qty || 1),
            harga_satuan: Number(
              item.harga_satuan || 0
            ),
            subtotal: Number(
              item.subtotal || 0
            ),
          })
        );

      await DetailLayananPemesanan.bulkCreate(
        layananRows,
        { transaction }
      );
    }

for (const slot of selectedSlots) {
  await Jadwal.update(
  {
    status: "booking",
  },
    {
      where: {
        lapangan_id,
        court_no: Number(
          slot.court_no || slot.nomor_lapangan
        ),
        tanggal: slot.tanggal,
        jam_mulai: slot.jam_mulai,
        jam_selesai: slot.jam_selesai,
      },
      transaction,
    }
  );
}

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
    // ===== NEW CODE TAHAP 8A =====
    if (
      status_pemesanan ===
      "sedang_dimainkan"
    ) {

      const detailSlots =
        await DetailPemesanan.findAll({
          where: {
            pemesanan_id: data.id,
          },
        });

      for (const slot of detailSlots) {

       await Jadwal.update(
        {
          status: "sedang_dimainkan",
        },
              {
            where: {
              lapangan_id:
                data.lapangan_id,
              court_no:
                slot.nomor_lapangan,
              tanggal:
                slot.tanggal,
              jam_mulai:
                slot.jam_mulai,
              jam_selesai:
                slot.jam_selesai,
            },
          }
        );

      }
    }
    // ===== END NEW CODE =====

    return res.status(200).json({
      message: "Status pemesanan berhasil diperbarui",
      data,
    });
  } catch (error) {

  console.error(
    "UPDATE STATUS ERROR:",
    error
  );

  console.error(
    "ERROR MESSAGE =",
    error.message
  );

  return res.status(500).json({
    message:
      "Gagal memperbarui status pemesanan",
    error: error.message,
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
    // ===== NEW CODE TAHAP 3.1 =====
    const detailSlots =
      await DetailPemesanan.findAll({
        where: {
          pemesanan_id: data.id,
        },
      });

    for (const slot of detailSlots) {
      await Jadwal.update(
        {
          status: "tersedia",
        },
        {
          where: {
            lapangan_id: data.lapangan_id,
            court_no:
              slot.nomor_lapangan,
            tanggal: slot.tanggal,
            jam_mulai:
              slot.jam_mulai,
            jam_selesai:
              slot.jam_selesai,
          },
        }
      );
    }

    // ===== END NEW CODE =====

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
const setujuiPembatalan = async (
    req,
    res
  ) => {
    try {
      const { id } = req.params;

      const {
        alasan_batal = null,
      } = req.body || {};

      const data =
        await Pemesanan.findByPk(id);

      if (!data) {
        return res.status(404).json({
          message:
            "Pemesanan tidak ditemukan",
        });
      }

    await data.update({
      status_pemesanan: "dibatalkan",

      riwayat_status:
        RIWAYAT_STATUS.BATAL,

      alasan_batal:
        alasan_batal ||
        data.alasan_batal,

      dibatalkan_at:
        new Date(),
    });

    // ===== NEW CODE TAHAP 7C =====

    const detailSlots =
      await DetailPemesanan.findAll({
        where: {
          pemesanan_id: data.id,
        },
      });

    for (const slot of detailSlots) {
      await Jadwal.update(
        {
          status: "dibatalkan",
        },
        {
          where: {
            lapangan_id: data.lapangan_id,
            court_no:
              slot.nomor_lapangan,
            tanggal: slot.tanggal,
            jam_mulai:
              slot.jam_mulai,
            jam_selesai:
              slot.jam_selesai,
          },
        }
      );
    }

    // ===== END NEW CODE =====

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

// ===== NEW CODE TAHAP 7B =====
const ajukanPembatalan = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const data =
      await Pemesanan.findByPk(id);

    if (!data) {
      return res.status(404).json({
        message:
          "Pemesanan tidak ditemukan",
      });
    }

    if (
      data.status_pemesanan ===
      "dibatalkan"
    ) {
      return res.status(400).json({
        message:
          "Pesanan sudah dibatalkan",
      });
    }

    if (
      data.status_pemesanan ===
      "selesai"
    ) {
      return res.status(400).json({
        message:
          "Pesanan sudah selesai",
      });
    }
    // ===== NEW CODE TAHAP 7D =====

if (data.payment_channel === "cash") {

  const detailSlot =
    await DetailPemesanan.findOne({
      where: {
        pemesanan_id: data.id,
      },
      order: [
        ["tanggal", "ASC"],
        ["jam_mulai", "ASC"],
      ],
    });

  if (detailSlot) {

    const waktuMain =
      new Date(
        `${detailSlot.tanggal} ${detailSlot.jam_mulai}`
      );

    const batasPembatalan =
      new Date(
        waktuMain.getTime() -
        60 * 60 * 1000
      );

    const sekarang = new Date();

    if (sekarang >= batasPembatalan) {
      return res.status(400).json({
        message:
          "Pesanan cash tidak dapat dibatalkan kurang dari 1 jam sebelum waktu bermain",
      });
    }
  }
}

// ===== END NEW CODE =====
if (
  data.payment_channel ===
  "cash"
) {

  const firstSlot =
    data.detail_pemesanan?.[0];

  if (firstSlot) {

    const playTime =
      new Date(
        `${firstSlot.tanggal}T${String(
          firstSlot.jam_mulai
        ).slice(0, 5)}:00+08:00`
      );

    const timerStart =
      new Date(
        playTime.getTime() -
        60 * 60 * 1000
      );

    if (
      Date.now() >=
      timerStart.getTime()
    ) {

      return res
        .status(400)
        .json({
          success: false,
          message:
            "Pembatalan cash hanya dapat dilakukan sebelum 1 jam waktu bermain",
        });

    }
  }
}
    await data.update({
      status_pemesanan:
        "menunggu_persetujuan_pembatalan",

      alasan_batal:
        req.body.alasan_batal || null,
    });

    return res.status(200).json({
      message:
        "Permintaan pembatalan berhasil dikirim",
      data,
    });
  } catch (error) {
    console.error(
      "AJUKAN PEMBATALAN ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Gagal mengajukan pembatalan",
    });
  }
};
// ===== END NEW CODE =====

// =====================================================
// NEW CODE TAHAP 10B
// KONFIRMASI PEMBAYARAN
// =====================================================

const konfirmasiPembayaran = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const data =
      await Pemesanan.findByPk(id);

    if (!data) {
      return res.status(404).json({
        message:
          "Pemesanan tidak ditemukan",
      });
    }

    if (
      ![
        "menunggu_pembayaran",
        "menunggu_kedatangan",
      ].includes(
        data.status_pemesanan
      )
    ) {
      return res.status(400).json({
        message:
          "Status pesanan tidak dapat dikonfirmasi",
      });
    }

    await data.update({
      status_pemesanan:
        "sudah_bayar",
    });

    return res.status(200).json({
      message:
        "Pembayaran berhasil dikonfirmasi",
      data,
    });
  } catch (error) {
    console.error(
      "KONFIRMASI PEMBAYARAN ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Gagal mengkonfirmasi pembayaran",
    });
  }
};

// =====================================================
// END NEW CODE
// =====================================================
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
  getRiwayatAdmin,
  createPemesanan,
  updatePemesanan,
  updateStatusPemesanan,
  selesaiPemesanan,
  setujuiPembatalan,
  deletePemesanan,
  ajukanPembatalan,
  konfirmasiPembayaran,
};