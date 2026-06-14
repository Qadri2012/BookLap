// models/associations.js

const AdminMaster = require("./adminMaster");
const AdminInvite = require("./adminInvite");

const Pemesanan = require("./pemesanan");
const DetailLayananPemesanan = require("./detailLayananPemesanan");
const LayananTambahan = require("./layananTambahanModel");

// =========================
// ADMIN
// =========================

AdminMaster.hasMany(AdminInvite, {
  foreignKey: "admin_master_id",
  as: "invites",
});

AdminInvite.belongsTo(AdminMaster, {
  foreignKey: "admin_master_id",
  as: "adminMaster",
});

// =========================
// PEMESANAN ↔ DETAIL LAYANAN
// =========================

Pemesanan.hasMany(DetailLayananPemesanan, {
  foreignKey: "pemesanan_id",
  as: "detail_layanan",
});

DetailLayananPemesanan.belongsTo(Pemesanan, {
  foreignKey: "pemesanan_id",
  as: "pemesanan",
});

// =========================
// LAYANAN ↔ DETAIL LAYANAN
// =========================

LayananTambahan.hasMany(
  DetailLayananPemesanan,
  {
    foreignKey: "layanan_id",
    as: "detail_layanan_items",
  }
);

DetailLayananPemesanan.belongsTo(
  LayananTambahan,
  {
    foreignKey: "layanan_id",
    as: "layanan",
  }
);

module.exports = {
  AdminMaster,
  AdminInvite,
  Pemesanan,
  DetailLayananPemesanan,
  LayananTambahan,
};