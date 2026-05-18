const LayananTambahan = require("../models/layananTambahanModel");

exports.getAllLayananTambahan = async (req, res) => {
  try {
    const data = await LayananTambahan.findAll({
      where: { status_aktif: true },
      order: [["id", "ASC"]],
    });

    res.json(data);
  } catch (error) {
    console.error("Gagal ambil layanan tambahan:", error);
    res.status(500).json({ message: "Gagal ambil layanan tambahan" });
  }
};

exports.getLayananTambahanById = async (req, res) => {
  try {
    const data = await LayananTambahan.findByPk(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(data);
  } catch (error) {
    console.error("Gagal ambil detail layanan tambahan:", error);
    res.status(500).json({ message: "Gagal ambil detail layanan tambahan" });
  }
};

exports.createLayananTambahan = async (req, res) => {
  try {
    const { nama_layanan, deskripsi, harga_satuan, status_aktif } = req.body;

    if (!nama_layanan) {
      return res.status(400).json({ message: "Nama layanan wajib diisi" });
    }

    const data = await LayananTambahan.create({
      nama_layanan,
      deskripsi,
      harga_satuan: harga_satuan || 0,
      status_aktif: status_aktif ?? true,
    });

    res.status(201).json({
      message: "Layanan tambahan berhasil ditambahkan",
      data,
    });
  } catch (error) {
    console.error("Gagal tambah layanan tambahan:", error);
    res.status(500).json({ message: "Gagal tambah layanan tambahan" });
  }
};

exports.updateLayananTambahan = async (req, res) => {
  try {
    const { id } = req.params;

    const [updated] = await LayananTambahan.update(req.body, {
      where: { id },
    });

    if (updated === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const data = await LayananTambahan.findByPk(id);

    res.json({
      message: "Layanan tambahan berhasil diperbarui",
      data,
    });
  } catch (error) {
    console.error("Gagal update layanan tambahan:", error);
    res.status(500).json({ message: "Gagal update layanan tambahan" });
  }
};

exports.deleteLayananTambahan = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await LayananTambahan.destroy({
      where: { id },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({ message: "Layanan tambahan berhasil dihapus" });
  } catch (error) {
    console.error("Gagal hapus layanan tambahan:", error);
    res.status(500).json({ message: "Gagal hapus layanan tambahan" });
  }
};