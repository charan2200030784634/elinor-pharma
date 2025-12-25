const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Files
const ADMIN_FILE = path.join(__dirname, "admin.json");
const PRODUCTS_FILE = path.join(__dirname, "products.json");

// Create admin.json if missing
if (!fs.existsSync(ADMIN_FILE)) {
  fs.writeFileSync(
    ADMIN_FILE,
    JSON.stringify({ username: "admin", password: "admin123" }, null, 2)
  );
}

// Create products.json if missing
if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, "[]");
}

// Upload folder
const uploadDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

/* ================= LOGIN ================= */
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const admin = JSON.parse(fs.readFileSync(ADMIN_FILE));

  if (username === admin.username && password === admin.password) {
    return res.json({ success: true });
  }

  res.json({ success: false });
});

/* ================= PRODUCTS ================= */
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

app.delete("/delete-product/:index", (req, res) => {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));
  products.splice(req.params.index, 1);
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  res.json({ success: true });
});

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
