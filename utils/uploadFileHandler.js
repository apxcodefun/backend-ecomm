import multer from "multer";
import path from "path";
import { isValidUrl } from "./index.js"; // Fungsi untuk validasi URL jika perlu

const FILE_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValidFormat = FILE_TYPE[file.mimetype];
    let uploadError = new Error("Invalid image type");

    if (isValidFormat) {
      uploadError = null;
    }

    cb(uploadError, "public/uploads");
  },
  filename: (req, file, cb) => {
    const uniqueFile = `${file.fieldname}-${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueFile);
  },
});

export const upload = multer({ storage: storage });

// Tambahkan handler untuk menerima file atau URL gambar
export const handleImageUpload = async (req, res, next) => {
  const { image } = req.body; // Ambil image dari body (bisa file atau URL)

  if (image && isValidUrl(image)) {
    // Jika image berupa URL, langsung simpan URL
    req.imageUrl = image; // Simpan URL gambar di req untuk digunakan nanti
    return next();
  }

  // Jika image berupa file, lakukan upload menggunakan multer
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    // Setelah file berhasil di-upload, simpan URL file
    req.imageUrl = `/uploads/${req.file.filename}`;
    return next();
  });
};
