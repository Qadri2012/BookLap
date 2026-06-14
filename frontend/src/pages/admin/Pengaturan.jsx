import { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import {
  Camera,
  Upload,
  Eye,
  Trash2,
} from "lucide-react";

export default function Pengaturan() {
  const [profile, setProfile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const uploadInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get(
    "/admin/profile"
    );

      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // BUKA KAMERA
  // =========================

  const openCamera = async () => {
    try {
      const mediaStream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
        });

      setStream(mediaStream);
      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error(err);

      alert("Kamera tidak dapat diakses");
    }
  };

  // =========================
  // TUTUP KAMERA
  // =========================

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) =>
        track.stop()
      );
    }

    setCameraOpen(false);
  };

  // =========================
  // AMBIL FOTO DARI KAMERA
  // =========================

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File(
          [blob],
          "profile.jpg",
          {
            type: "image/jpeg",
          }
        );

        setSelectedFile(file);

setPreviewUrl(
  URL.createObjectURL(file)
);

setTimeout(async () => {
  try {
    const formData = new FormData();

    formData.append(
      "photo",
      file
    );

    const res = await api.post(
      "/admin/profile/photo",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    alert(
      res.data.message ||
      "Upload berhasil"
    );

    await loadProfile();

    setSelectedFile(null);
    setPreviewUrl(null);

  } catch (err) {
    console.error(err);

    alert(
      err.response?.data?.message ||
      "Upload gagal"
    );
  }
}, 300);

console.log("FILE CAMERA:", file);
      },
      "image/jpeg",
      0.9
    );

    closeCamera();
  };

  // =========================
  // PILIH FOTO DARI KOMPUTER
  // =========================

  const handleUploadSelect = async (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  setSelectedFile(file);

  setPreviewUrl(
    URL.createObjectURL(file)
  );

  try {
    const formData = new FormData();

    formData.append("photo", file);

    const res = await api.post(
      "/admin/profile/photo",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    alert(
      res.data.message ||
      "Upload berhasil"
    );

    await loadProfile();

    setSelectedFile(null);
    setPreviewUrl(null);

  } catch (err) {
    console.error(err);

    alert(
      err.response?.data?.message ||
      "Upload gagal"
    );
  }
};

  // =========================
// UPLOAD FOTO KE SERVER
// =========================

const uploadPhoto = async () => {
  try {
    if (!selectedFile) {
      return alert("Pilih foto terlebih dahulu");
    }

    const formData = new FormData();

    formData.append(
      "photo",
      selectedFile
    );

    const res = await api.post(
      "/admin/profile/photo",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    alert(
      res.data.message ||
      "Upload berhasil"
    );

    // refresh data profile
    await loadProfile();

    // hapus preview sementara
    setSelectedFile(null);
    setPreviewUrl(null);

  } catch (err) {
    console.error(err);

    alert(
      err.response?.data?.message ||
      "Upload gagal"
    );
  }
};

const deletePhoto = async () => {
  try {
    if (
      !window.confirm(
        "Hapus foto profil?"
      )
    ) {
      return;
    }

    const res = await api.delete(
      "/admin/profile/photo"
    );

    alert(res.data.message);

    setPreviewUrl(null);

    await loadProfile();
  } catch (err) {
    console.error(err);

    alert(
      err.response?.data?.message ||
      "Gagal menghapus foto"
    );
  }
};
  return (
    <>
      <div className="space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Pengaturan Profil
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            Kelola foto profil akun admin.
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 max-w-xl">

          <h2 className="text-lg font-semibold text-slate-800 mb-6">
            Foto Profil
          </h2>

          {/* FOTO */}
          <div className="flex justify-center mb-6">
            <div className="w-40 h-40 rounded-3xl overflow-hidden border-2 border-slate-200 bg-slate-100">

              {previewUrl ? (
                <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                />
                ) : profile?.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt="Foto Profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  Belum Ada Foto
                </div>
              )}

            </div>
          </div>

          {/* INPUT UPLOAD */}
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUploadSelect}
          />

          {/* BUTTON */}
          <div className="grid gap-3">

            {/* AMBIL FOTO */}
            <button
              onClick={openCamera}
              className="
                flex items-center justify-center gap-2
                bg-green-600
                hover:bg-green-700
                text-white
                rounded-xl
                py-3
                transition
              "
            >
              <Camera size={18} />
              Ambil Foto
            </button>

            {/* UPLOAD FOTO */}
            <button
              onClick={() =>
                uploadInputRef.current?.click()
              }
              className="
                flex items-center justify-center gap-2
                bg-blue-600
                hover:bg-blue-700
                text-white
                rounded-xl
                py-3
                transition
              "
            >
              <Upload size={18} />
              Upload Foto
            </button>

        

            {/* LIHAT FOTO */}
            <button
              className="
                flex items-center justify-center gap-2
                bg-slate-600
                hover:bg-slate-700
                text-white
                rounded-xl
                py-3
                transition
              "
            >
              <Eye size={18} />
              Lihat Foto
            </button>

            {/* HAPUS FOTO */}
            <button
              onClick={deletePhoto}
              className="
                flex items-center justify-center gap-2
                bg-red-600
                hover:bg-red-700
                text-white
                rounded-xl
                py-3
                transition
              "
            >
              <Trash2 size={18} />
              Hapus Foto
            </button>
          </div>
        </div>
      </div>

      {/* MODAL KAMERA */}
      {cameraOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-5">

          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl">

            <h3 className="text-xl font-semibold mb-4">
              Ambil Foto Profil
            </h3>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-2xl border"
            />

            <canvas
              ref={canvasRef}
              className="hidden"
            />

            <div className="flex gap-3 mt-5">

              <button
                onClick={capturePhoto}
                className="
                  flex-1
                  bg-green-600
                  hover:bg-green-700
                  text-white
                  py-3
                  rounded-xl
                "
              >
                Ambil Foto
              </button>

              <button
                onClick={closeCamera}
                className="
                  flex-1
                  bg-red-600
                  hover:bg-red-700
                  text-white
                  py-3
                  rounded-xl
                "
              >
                Batal
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}