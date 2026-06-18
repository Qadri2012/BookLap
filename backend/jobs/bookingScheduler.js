// jobs/bookingScheduler.js

const cron = require("node-cron");
const User = require("../models/user");
const Pemesanan = require("../models/pemesanan");
const DetailPemesanan = require("../models/detailPemesanan");
const Jadwal = require("../models/jadwal");

cron.schedule("* * * * *", async () => {
  try {
    console.log(
    "[CRON] cek status otomatis"
    );

    const now = new Date();

// =====================================================
// AUTO UNBLOCK USER
// =====================================================

const blockedUsers =
  await User.findAll({
    where: {
      akun_diblokir: true,
    },
  });

for (const user of blockedUsers) {

  if (
    user.blocked_until &&
    now >=
      new Date(
        user.blocked_until
      )
  ) {

    console.log(
      `[AUTO UNBLOCK] ${user.id}`
    );

    await user.update({
      akun_diblokir: false,
      blocked_until: null,
      jumlah_no_show: 0,
    });
  }
}

    // =====================================================
    // TAHAP 6
    // EXPIRED OTOMATIS
    // =====================================================

    const expiredOrders =
      await Pemesanan.findAll({
        where: {
          status_pemesanan:
            "menunggu_pembayaran",
        },
      });

    for (const order of expiredOrders) {
      if (
        order.payment_expires_at &&
        new Date(order.payment_expires_at) <=
          now
      ) {
        console.log(
          `[EXPIRED] Pesanan ${order.id}`
        );

        await order.update({
          status_pemesanan: "expired",
        });

        const detailSlots =
          await DetailPemesanan.findAll({
            where: {
              pemesanan_id: order.id,
            },
          });

        for (const slot of detailSlots) {
          await Jadwal.update(
            {
              status: "tersedia",
            },
            {
              where: {
                lapangan_id:
                  order.lapangan_id,
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
      }
    }

// =====================================================
// TAHAP 6B
// CASH TIDAK HADIR -> EXPIRED
// =====================================================

const waitingArrivalOrders =
  await Pemesanan.findAll({
    where: {
      status_pemesanan:
        "menunggu_kedatangan",
      payment_channel:
        "cash",
    },
  });

for (const order of waitingArrivalOrders) {

  const detailSlots =
    await DetailPemesanan.findAll({
      where: {
        pemesanan_id: order.id,
      },
      order: [
        ["tanggal", "ASC"],
        ["jam_mulai", "ASC"],
      ],
    });

  if (
    !detailSlots ||
    detailSlots.length === 0
  ) {
    continue;
  }

  const slotPertama =
    detailSlots[0];

  const waktuMulai = new Date(
    `${slotPertama.tanggal}T${slotPertama.jam_mulai}`
  );

  if (now >= waktuMulai) {

    console.log(
      `[CASH EXPIRED] Pesanan ${order.id}`
    );

    await order.update({
      status_pemesanan: "expired",
      riwayat_status: "expired",
      alasan_batal:
        "Tidak hadir sampai waktu bermain",
    });
    const user =
  await User.findByPk(
    order.user_id
  );

if (user) {

  const totalNoShow =
    (user.jumlah_no_show || 0) + 1;

  const updateData = {
    jumlah_no_show:
      totalNoShow,
  };

  if (totalNoShow === 1) {

    updateData.peringatan_no_show =
      "Peringatan 1/3 - Anda tidak hadir pada pemesanan cash.";

  }

  if (totalNoShow === 2) {

    updateData.peringatan_no_show =
      "Peringatan 2/3 - Jika tidak hadir lagi akun akan diblokir 30 hari.";

  }

  if (totalNoShow >= 3) {

    updateData.peringatan_no_show =
      "Akun diblokir 30 hari karena 3 kali tidak hadir.";

  }

  if (totalNoShow >= 3) {
    updateData.akun_diblokir =
      true;

    updateData.blocked_until =
      new Date(
        Date.now() +
        30 *
          24 *
          60 *
          60 *
          1000
      );
  }

  await user.update(
    updateData
  );
}
    for (const slot of detailSlots) {

      await Jadwal.update(
        {
          status: "tersedia",
        },
        {
          where: {
            lapangan_id:
              order.lapangan_id,

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
}
// =====================================================
// TAHAP BARU
// SUDAH BAYAR -> SEDANG DIMAINKAN
// =====================================================

const paidOrders =
  await Pemesanan.findAll({
    where: {
      status_pemesanan:
        "sudah_bayar",
    },
  });

for (const order of paidOrders) {

  const detailSlots =
    await DetailPemesanan.findAll({
      where: {
        pemesanan_id: order.id,
      },
      order: [
        ["tanggal", "ASC"],
        ["jam_mulai", "ASC"],
      ],
    });

  if (
    !detailSlots ||
    detailSlots.length === 0
  ) {
    continue;
  }

  const slotPertama =
    detailSlots[0];

  const waktuMulai =
    new Date(
      `${slotPertama.tanggal} ${slotPertama.jam_mulai}`
    );

  if (now >= waktuMulai) {

    await order.update({
      status_pemesanan:
        "sedang_dimainkan",
    });

    for (const slot of detailSlots) {

      await Jadwal.update(
        {
          status:
            "sedang_dimainkan",
        },
        {
          where: {
            lapangan_id:
              order.lapangan_id,

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

    console.log(
      `[MULAI MAIN] Pesanan ${order.id}`
    );
  }
}
    // =====================================================
    // TAHAP 5
    // SELESAI OTOMATIS
    // =====================================================

    const playingOrders =
    await Pemesanan.findAll({
        where: {
        status_pemesanan:
            "sedang_dimainkan",
        },
    });

    for (const order of playingOrders) {
      const detailSlots =
        await DetailPemesanan.findAll({
          where: {
            pemesanan_id: order.id,
          },
        });

      let semuaSlotSelesai = true;

      for (const slot of detailSlots) {
        const waktuSelesai =
          new Date(
            `${slot.tanggal} ${slot.jam_selesai}`
          );

        if (now < waktuSelesai) {
          semuaSlotSelesai = false;
          break;
        }
      }

      if (semuaSlotSelesai) {
        console.log(
          `[SELESAI] Pesanan ${order.id}`
        );

        await order.update({
        status_pemesanan: "selesai",
        riwayat_status:
          order.payment_channel === "cash"
            ? "cash_berhasil"
            : "transfer_berhasil",
      });
      if (
        order.payment_channel ===
        "cash"
      ) {

        const user =
          await User.findByPk(
            order.user_id
          );

        if (user) {
          await user.update({
            jumlah_no_show: 0,
            peringatan_no_show: null,
          });
        }
      }

        for (const slot of detailSlots) {
          await Jadwal.update(
            {
              status: "tersedia",
            },
            {
              where: {
                lapangan_id:
                  order.lapangan_id,
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
      }
    }
    // =====================================================
// TAHAP 7C
// SLOT DIBATALKAN -> 5 MENIT -> TERSEDIA
// =====================================================

const cancelledOrders =
  await Pemesanan.findAll({
    where: {
      status_pemesanan:
        "dibatalkan",
    },
  });

for (const order of cancelledOrders) {
  if (!order.dibatalkan_at) {
    continue;
  }

  const selisihMenit =
    (now -
      new Date(order.dibatalkan_at)) /
    (1000 * 60);

  if (selisihMenit >= 5) {
    const detailSlots =
      await DetailPemesanan.findAll({
        where: {
          pemesanan_id: order.id,
        },
      });

    for (const slot of detailSlots) {
      await Jadwal.update(
        {
          status: "tersedia",
        },
        {
          where: {
            lapangan_id:
              order.lapangan_id,
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
  }
}
    

  } catch (err) {
    console.error(
      "[CRON ERROR]",
      err.message
    );
  }
});