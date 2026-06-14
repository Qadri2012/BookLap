// NEW: controllers/adminInviteController.js
const crypto = require("crypto");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const AdminInvite = require("../models/adminInvite");
const User = require("../models/user");

// NEW: cek apakah user adalah super admin
async function getRequestingUser(req) {
  if (!req.user?.id) return null;
  return User.findByPk(req.user.id);
}

function isSuperAdmin(user) {
  const status = String(user?.status || "active").toLowerCase();
  return (
    user &&
    status === "active" &&
    user.role === "admin" &&
    user.level_akses === "superadmin"
  );
}

// NEW: generate kode undangan yang unik
function generateInviteCode() {
  const year = new Date().getFullYear();
  const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `BL-ADM-${year}-${rand.slice(0, 4)}`;
}

async function ensureUniqueCode(transaction) {
  for (let i = 0; i < 10; i += 1) {
    const code = generateInviteCode();
    const exists = await AdminInvite.findOne({
      where: { code },
      transaction,
    });

    if (!exists) return code;
  }

  throw new Error("Gagal membuat kode undangan unik");
}

function toPlainInvite(invite) {
  return invite?.get ? invite.get({ plain: true }) : invite;
}

async function enrichInvites(invites) {
  const plainInvites = invites.map(toPlainInvite);

  const ids = [
    ...new Set(
      plainInvites
        .flatMap((row) => [row.created_by, row.used_by])
        .filter(Boolean)
        .map(String)
    ),
  ];

  const users = ids.length
    ? await User.findAll({
        where: { id: ids },
        attributes: ["id", "nama", "email"],
      })
    : [];

  const userMap = new Map(users.map((u) => [String(u.id), u.get({ plain: true })]));

  return plainInvites.map((row) => ({
    ...row,
    created_by_name: row.created_by ? userMap.get(String(row.created_by))?.nama || null : null,
    created_by_email: row.created_by ? userMap.get(String(row.created_by))?.email || null : null,
    used_by_name: row.used_by ? userMap.get(String(row.used_by))?.nama || null : null,
    used_by_email: row.used_by ? userMap.get(String(row.used_by))?.email || null : null,
  }));
}

// NEW: buat kode undangan baru
exports.createInvite = async (req, res) => {
  try {
    const actor = await getRequestingUser(req);
    if (!isSuperAdmin(actor)) {
      return res.status(403).json({
        message: "Hanya super admin yang bisa membuat kode undangan",
        msg: "Hanya super admin yang bisa membuat kode undangan",
      });
    }

    const countRaw = Number.parseInt(req.body.count ?? 1, 10);
    const expiresInDaysRaw = Number.parseInt(req.body.expiresInDays ?? 30, 10);

    const count = Number.isFinite(countRaw) ? Math.min(Math.max(countRaw, 1), 20) : 1;
    const expiresInDays = Number.isFinite(expiresInDaysRaw)
      ? Math.min(Math.max(expiresInDaysRaw, 1), 365)
      : 30;

    const createdInvites = [];

    await sequelize.transaction(async (transaction) => {
      for (let i = 0; i < count; i += 1) {
        const code = await ensureUniqueCode(transaction);

        const invite = await AdminInvite.create(
          {
            code,
            role_target: "admin",
            created_by: actor.id,
            expires_at: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
            status: "active",
          },
          { transaction }
        );

        createdInvites.push(invite);
      }
    });

    return res.status(201).json({
      message: `${createdInvites.length} kode undangan berhasil dibuat`,
      msg: `${createdInvites.length} kode undangan berhasil dibuat`,
      invites: await enrichInvites(createdInvites),
    });
  } catch (err) {
    console.error("CREATE INVITE ERROR:", err);
    return res.status(500).json({
      message: "Gagal membuat kode undangan",
      msg: "Gagal membuat kode undangan",
      error: err.message,
    });
  }
};

// NEW: daftar semua kode undangan
exports.listInvites = async (req, res) => {
  try {
    const actor = await getRequestingUser(req);
    if (!isSuperAdmin(actor)) {
      return res.status(403).json({
        message: "Hanya super admin yang bisa melihat daftar kode undangan",
        msg: "Hanya super admin yang bisa melihat daftar kode undangan",
      });
    }

    const invites = await AdminInvite.findAll({
      order: [["created_at", "DESC"]],
    });

    return res.json({
      message: "Daftar kode undangan berhasil diambil",
      msg: "Daftar kode undangan berhasil diambil",
      invites: await enrichInvites(invites),
    });
  } catch (err) {
    console.error("LIST INVITES ERROR:", err);
    return res.status(500).json({
      message: "Gagal mengambil daftar kode undangan",
      msg: "Gagal mengambil daftar kode undangan",
      error: err.message,
    });
  }
};

// NEW: cek kode undangan valid atau tidak
exports.verifyInviteCode = async (req, res) => {
  try {
    const code = String(req.body.code || req.query.code || "").trim().toUpperCase();

    if (!code) {
      return res.status(400).json({
        message: "Kode undangan wajib diisi",
        msg: "Kode undangan wajib diisi",
      });
    }

    const invite = await AdminInvite.findOne({
      where: { code },
    });

    if (!invite) {
      return res.status(400).json({
        message: "Kode undangan tidak valid",
        msg: "Kode undangan tidak valid",
      });
    }

    const now = Date.now();
    const invitePlain = toPlainInvite(invite);

    if (invitePlain.status !== "active") {
      return res.status(400).json({
        message: "Kode undangan sudah tidak aktif",
        msg: "Kode undangan sudah tidak aktif",
      });
    }

    if (invitePlain.expires_at && new Date(invitePlain.expires_at).getTime() < now) {
      await invite.update({ status: "expired" });

      return res.status(400).json({
        message: "Kode undangan sudah kedaluwarsa",
        msg: "Kode undangan sudah kedaluwarsa",
      });
    }

    return res.json({
      message: "Kode undangan valid",
      msg: "Kode undangan valid",
      invite: invitePlain,
    });
  } catch (err) {
    console.error("VERIFY INVITE ERROR:", err);
    return res.status(500).json({
      message: "Gagal memverifikasi kode undangan",
      msg: "Gagal memverifikasi kode undangan",
      error: err.message,
    });
  }
};

// NEW: cabut kode undangan
exports.revokeInvite = async (req, res) => {
  try {
    const actor = await getRequestingUser(req);
    if (!isSuperAdmin(actor)) {
      return res.status(403).json({
        message: "Hanya super admin yang bisa mencabut kode undangan",
        msg: "Hanya super admin yang bisa mencabut kode undangan",
      });
    }

    const { id } = req.params;

    const invite = await AdminInvite.findByPk(id);
    if (!invite) {
      return res.status(404).json({
        message: "Kode undangan tidak ditemukan",
        msg: "Kode undangan tidak ditemukan",
      });
    }

    await invite.update({
      status: "revoked",
    });

    return res.json({
      message: "Kode undangan berhasil dicabut",
      msg: "Kode undangan berhasil dicabut",
      invite: toPlainInvite(invite),
    });
  } catch (err) {
    console.error("REVOKE INVITE ERROR:", err);
    return res.status(500).json({
      message: "Gagal mencabut kode undangan",
      msg: "Gagal mencabut kode undangan",
      error: err.message,
    });
  }
};

// NEW: hapus kode undangan
exports.deleteInvite = async (req, res) => {
  try {
    const actor = await getRequestingUser(req);
    if (!isSuperAdmin(actor)) {
      return res.status(403).json({
        message: "Hanya super admin yang bisa menghapus kode undangan",
        msg: "Hanya super admin yang bisa menghapus kode undangan",
      });
    }

    const { id } = req.params;

    const invite = await AdminInvite.findByPk(id);
    if (!invite) {
      return res.status(404).json({
        message: "Kode undangan tidak ditemukan",
        msg: "Kode undangan tidak ditemukan",
      });
    }

    await invite.destroy();

    return res.json({
      message: "Kode undangan berhasil dihapus",
      msg: "Kode undangan berhasil dihapus",
    });
  } catch (err) {
    console.error("DELETE INVITE ERROR:", err);
    return res.status(500).json({
      message: "Gagal menghapus kode undangan",
      msg: "Gagal menghapus kode undangan",
      error: err.message,
    });
  }
};

// NEW: tandai invite sudah dipakai saat register admin
exports.consumeInvite = async ({ code, usedByUserId, transaction = null }) => {
  const inviteCode = String(code || "").trim().toUpperCase();
  if (!inviteCode) {
    throw new Error("Kode undangan wajib diisi");
  }

  const invite = await AdminInvite.findOne({
    where: { code: inviteCode },
    transaction,
  });

  if (!invite) {
    throw new Error("Kode undangan tidak valid");
  }

  const invitePlain = toPlainInvite(invite);

  if (invitePlain.status !== "active") {
    throw new Error("Kode undangan sudah tidak aktif");
  }

  if (invitePlain.expires_at && new Date(invitePlain.expires_at).getTime() < Date.now()) {
    await invite.update({ status: "expired" }, { transaction });
    throw new Error("Kode undangan sudah kedaluwarsa");
  }

  await invite.update(
    {
      used_by: usedByUserId,
      used_at: new Date(),
      status: "used",
    },
    { transaction }
  );

  return invite;
};