const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ===== FILE PATHS =====
const ADMIN_FILE = path.join(__dirname, "admin.json");
const PRODUCTS_FILE = path.join(__dirname, "products.json");

// ===== CREATE FILES IF NOT EXISTS =====
if (!fs.existsSync(ADMIN_FILE)) {
  fs.writeFileSync(
    ADMIN_FILE,
    JSON.stringify({ username: "admin", password: "admin123" }, null, 2)
  );
}

if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, "[]");
}

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ===== IMAGE UPLOAD (MULTER) =====
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ===== LOGIN =====
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const admin = JSON.parse(fs.readFileSync(ADMIN_FILE));

  if (username === admin.username && password === admin.password) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// ===== PRODUCTS API =====
app.get("/api/products", (req, res) => {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));
  res.json(products);
});

app.post("/add-product", upload.single("image"), (req, res) => {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));

  products.push({
    name: req.body.name,
    category: req.body.category,
    composition: req.body.composition,
    form: req.body.form,
    packing: req.body.packing,
    description: req.body.description || "",
    image: req.file ? req.file.filename : ""
  });

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  res.json({ success: true });
});

app.delete("/delete-product/:i", (req, res) => {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));
  products.splice(req.params.i, 1);
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  res.json({ success: true });
});

// ===== HOME ROUTE =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ===== START SERVER (DEPLOY SAFE) =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
