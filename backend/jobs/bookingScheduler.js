// jobs/bookingScheduler.js

const cron = require("node-cron");

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