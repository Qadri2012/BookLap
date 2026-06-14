const {
  getMetodePembayaranById,
  getAllMetodePembayaran,
  createMetodePembayaran,
  updateMetodePembayaran,
  deleteMetodePembayaran,
  getAllMetodePembayaranAdmin,
} = require("../controllers/metodePembayaranController");

const MetodePembayaran = require("../models/metodePembayaran");

jest.mock("../models/metodePembayaran");

describe("GET Metode Pembayaran By ID", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: {
        id: 1,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("harus mengembalikan data metode pembayaran", async () => {
    // Arrange
    const mockData = {
      id: 1,
      kode: "bca",
      nama_metode: "Transfer BCA",
    };

    MetodePembayaran.findByPk.mockResolvedValue(mockData);

    // Act
    await getMetodePembayaranById(req, res);

    // Assert
    expect(MetodePembayaran.findByPk).toHaveBeenCalledWith(1);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  test("harus mengembalikan 404 jika metode pembayaran tidak ditemukan", async () => {
    // Arrange
    MetodePembayaran.findByPk.mockResolvedValue(null);

    // Act
    await getMetodePembayaranById(req, res);

    // Assert
    expect(MetodePembayaran.findByPk).toHaveBeenCalledWith(1);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      message: "Metode pembayaran tidak ditemukan",
    });
  });

  test("harus mengembalikan 500 jika terjadi error", async () => {
    // Arrange
    MetodePembayaran.findByPk.mockRejectedValue(
      new Error("Database Error")
    );

    // Act
    await getMetodePembayaranById(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Gagal mengambil data metode pembayaran",
    });
  });
});

describe("GET All Metode Pembayaran", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("harus mengembalikan seluruh metode pembayaran aktif", async () => {
    // Arrange
    const mockData = [
      {
        id: 1,
        kode: "bca",
        nama_metode: "Transfer BCA",
      },
      {
        id: 2,
        kode: "bri",
        nama_metode: "Transfer BRI",
      },
    ];

    MetodePembayaran.findAll.mockResolvedValue(mockData);

    // Act
    await getAllMetodePembayaran(req, res);

    // Assert
    expect(MetodePembayaran.findAll).toHaveBeenCalledWith({
      where: {
        status_aktif: true,
      },
      order: [
        ["urutan_tampil", "ASC"],
        ["id", "ASC"],
      ],
    });

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  test("harus mengembalikan 500 jika terjadi error saat mengambil semua data", async () => {
    // Arrange
    MetodePembayaran.findAll.mockRejectedValue(
      new Error("Database Error")
    );

    // Act
    await getAllMetodePembayaran(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Gagal mengambil data metode pembayaran",
    });
  });
  
});

describe("CREATE Metode Pembayaran", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });
  test("harus berhasil membuat metode pembayaran baru", async () => {
  // Arrange
  req.body = {
    kode: "bca",
    nama_metode: "Transfer BCA",
  };

  const createdData = {
    id: 1,
    kode: "bca",
    nama_metode: "Transfer BCA",
  };

  MetodePembayaran.findOne.mockResolvedValue(null);

  MetodePembayaran.create.mockResolvedValue(createdData);

  // Act
  await createMetodePembayaran(req, res);

  // Assert
  expect(MetodePembayaran.findOne).toHaveBeenCalled();

  expect(MetodePembayaran.create).toHaveBeenCalled();

  expect(res.status).toHaveBeenCalledWith(201);

  expect(res.json).toHaveBeenCalledWith({
    message: "Metode pembayaran berhasil dibuat",
    data: createdData,
  });
});
test("harus gagal jika kode kosong", async () => {
  // Arrange
  req.body = {
    nama_metode: "Transfer BCA",
  };

  // Act
  await createMetodePembayaran(req, res);

  // Assert
  expect(res.status).toHaveBeenCalledWith(400);

  expect(res.json).toHaveBeenCalledWith({
    message: "Kode dan nama metode wajib diisi",
  });
});
test("harus gagal jika nama metode kosong", async () => {
  // Arrange
  req.body = {
    kode: "bca",
  };

  // Act
  await createMetodePembayaran(req, res);

  // Assert
  expect(res.status).toHaveBeenCalledWith(400);

  expect(res.json).toHaveBeenCalledWith({
    message: "Kode dan nama metode wajib diisi",
  });
});
test("harus gagal jika kode sudah digunakan", async () => {
  // Arrange
  req.body = {
    kode: "bca",
    nama_metode: "Transfer BCA",
  };

  MetodePembayaran.findOne.mockResolvedValue({
    id: 1,
    kode: "bca",
  });

  // Act
  await createMetodePembayaran(req, res);

  // Assert
  expect(res.status).toHaveBeenCalledWith(400);

  expect(res.json).toHaveBeenCalledWith({
    message: "Kode metode pembayaran sudah digunakan",
  });
});
test("harus mengembalikan 500 jika terjadi error saat create", async () => {
  // Arrange
  req.body = {
    kode: "bca",
    nama_metode: "Transfer BCA",
  };

  MetodePembayaran.findOne.mockRejectedValue(
    new Error("Database Error")
  );

  // Act
  await createMetodePembayaran(req, res);

  // Assert
  expect(res.status).toHaveBeenCalledWith(500);

  expect(res.json).toHaveBeenCalledWith({
    message: "Gagal membuat metode pembayaran",
  });
});
describe("GET All Metode Pembayaran Admin", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("harus mengembalikan seluruh metode pembayaran untuk admin", async () => {
    const mockData = [
      {
        id: 1,
        kode: "bca",
      },
      {
        id: 2,
        kode: "bri",
      },
    ];

    MetodePembayaran.findAll.mockResolvedValue(mockData);

    await getAllMetodePembayaranAdmin(req, res);

    expect(MetodePembayaran.findAll).toHaveBeenCalledWith({
      order: [
        ["urutan_tampil", "ASC"],
        ["id", "ASC"],
      ],
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  test("harus mengembalikan 500 jika terjadi error saat admin mengambil data", async () => {
    MetodePembayaran.findAll.mockRejectedValue(
      new Error("Database Error")
    );

    await getAllMetodePembayaranAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Gagal mengambil seluruh data metode pembayaran",
    });
  });
});
describe("UPDATE Metode Pembayaran", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: {
        id: 1,
      },
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("harus berhasil memperbarui metode pembayaran", async () => {
    req.body = {
      kode: "bri",
      nama_metode: "Transfer BRI",
    };

    const updateMock = jest.fn();

    const existingData = {
      id: 1,
      kode: "bca",
      nama_metode: "Transfer BCA",
      update: updateMock,
    };

    MetodePembayaran.findByPk.mockResolvedValue(existingData);

    MetodePembayaran.findOne.mockResolvedValue(null);

    await updateMetodePembayaran(req, res);

    expect(updateMock).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      message: "Metode pembayaran berhasil diperbarui",
      data: existingData,
    });
  });

  test("harus mengembalikan 404 jika data tidak ditemukan", async () => {
    MetodePembayaran.findByPk.mockResolvedValue(null);

    await updateMetodePembayaran(req, res);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      message: "Metode pembayaran tidak ditemukan",
    });
  });

  test("harus gagal jika kode sudah digunakan", async () => {
    req.body = {
      kode: "bri",
    };

    const existingData = {
      id: 1,
      kode: "bca",
      update: jest.fn(),
    };

    MetodePembayaran.findByPk.mockResolvedValue(existingData);

    MetodePembayaran.findOne.mockResolvedValue({
      id: 2,
      kode: "bri",
    });

    await updateMetodePembayaran(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "Kode metode pembayaran sudah digunakan",
    });
  });

  test("harus mengembalikan 500 jika terjadi error saat update", async () => {
    MetodePembayaran.findByPk.mockRejectedValue(
      new Error("Database Error")
    );

    await updateMetodePembayaran(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Gagal memperbarui metode pembayaran",
    });
  });
});
describe("DELETE Metode Pembayaran", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: {
        id: 1,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("harus berhasil menghapus metode pembayaran", async () => {
    const destroyMock = jest.fn();

    const existingData = {
      id: 1,
      destroy: destroyMock,
    };

    MetodePembayaran.findByPk.mockResolvedValue(existingData);

    await deleteMetodePembayaran(req, res);

    expect(destroyMock).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      message: "Metode pembayaran berhasil dihapus",
    });
  });

  test("harus mengembalikan 404 jika data yang akan dihapus tidak ditemukan", async () => {
    MetodePembayaran.findByPk.mockResolvedValue(null);

    await deleteMetodePembayaran(req, res);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      message: "Metode pembayaran tidak ditemukan",
    });
  });

  test("harus mengembalikan 500 jika terjadi error saat delete", async () => {
    MetodePembayaran.findByPk.mockRejectedValue(
      new Error("Database Error")
    );

    await deleteMetodePembayaran(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Gagal menghapus metode pembayaran",
    });
  });
});
});