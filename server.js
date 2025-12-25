const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

const ADMIN_FILE = path.join(__dirname, "admin.json");
const PRODUCTS_FILE = path.join(__dirname, "products.json");

/* INIT FILES */
if (!fs.existsSync(ADMIN_FILE)) {
  fs.writeFileSync(
    ADMIN_FILE,
    JSON.stringify({ username: "admin", password: "admin123" }, null, 2)
  );
}

if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, "[]");
}

const uploadDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

/* MULTER */
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

/* LOGIN */
app.post("/login", (req, res) => {
  const admin = JSON.parse(fs.readFileSync(ADMIN_FILE));
  if (
    req.body.username === admin.username &&
    req.body.password === admin.password
  ) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

/* GET PRODUCTS */
app.get("/api/products", (req, res) => {
  res.json(JSON.parse(fs.readFileSync(PRODUCTS_FILE)));
});

/* ADD PRODUCT */
app.post("/add-product", upload.single("image"), (req, res) => {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));

  const newProduct = {
    id: Date.now(), // ✅ UNIQUE ID
    name: req.body.name,
    category: req.body.category,
    composition: req.body.composition || "",
    form: req.body.form || "",
    packing: req.body.packing || "",
    description: req.body.description || "",
    image: req.file ? req.file.filename : ""
  };

  products.push(newProduct);
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));

  res.json({ success: true });
});

/* UPDATE PRODUCT */
app.put("/update-product/:id", upload.single("image"), (req, res) => {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));
  const id = Number(req.params.id);

  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ success: false });

  products[index] = {
    ...products[index],
    name: req.body.name,
    category: req.body.category,
    composition: req.body.composition,
    form: req.body.form,
    packing: req.body.packing,
    description: req.body.description,
    image: req.file ? req.file.filename : products[index].image
  };

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  res.json({ success: true });
});

/* DELETE PRODUCT */
app.delete("/delete-product/:id", (req, res) => {
  const id = Number(req.params.id);
  let products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));

  products = products.filter(p => p.id !== id);

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  res.json({ success: true });
});

/* HOME */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

/* START */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));
