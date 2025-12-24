const table = document.getElementById("productTable");
const form = document.getElementById("productForm");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

let allProducts = [];
let editIndex = null;

loadProducts();

/* ADD / UPDATE */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  let url = "/add-product";
  let method = "POST";

  if (editIndex !== null) {
    url = `/update-product/${editIndex}`;
    method = "PUT";
  }

  await fetch(url, { method, body: data });

  form.reset();
  editIndex = null;
  loadProducts();
});

/* LOAD PRODUCTS */
async function loadProducts() {
  const res = await fetch("/api/products");
  allProducts = await res.json();

  populateCategories(allProducts);
  applyFilters();
}

/* FILTER LOGIC */
searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);

function applyFilters() {
  const search = searchInput.value.toLowerCase();
  const category = categoryFilter.value;

  const filtered = allProducts.filter(p => {
    const nameMatch = p.name.toLowerCase().includes(search);
    const categoryMatch = !category || p.category === category;
    return nameMatch && categoryMatch;
  });

  renderTable(filtered);
  updateStats(filtered);
}

/* RENDER TABLE */
function renderTable(products) {
  table.innerHTML = "";

  products.forEach((p, i) => {
    table.innerHTML += `
      <tr>
        <td>${p.image ? `<img src="/uploads/${p.image}">` : ""}</td>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>
          <button class="action-btn edit" onclick="editProduct(${i})">Edit</button>
          <button class="action-btn delete" onclick="deleteProduct(${i})">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* STATS */
function updateStats(products) {
  document.getElementById("totalProducts").innerText = products.length;
  document.getElementById("totalCategories").innerText =
    new Set(products.map(p => p.category)).size;
}

/* CATEGORY DROPDOWN */
function populateCategories(products) {
  const categories = [...new Set(products.map(p => p.category))];
  categoryFilter.innerHTML =
    `<option value="">All Categories</option>` +
    categories.map(c => `<option value="${c}">${c}</option>`).join("");
}

/* EDIT */
function editProduct(index) {
  const p = allProducts[index];

  form.name.value = p.name;
  form.category.value = p.category;
  form.composition.value = p.composition || "";
  form.form.value = p.form || "";
  form.packing.value = p.packing || "";
  form.description.value = p.description || "";

  editIndex = index;
}

/* DELETE */
async function deleteProduct(index) {
  if (!confirm("Delete this product?")) return;

  await fetch(`/delete-product/${index}`, { method: "DELETE" });
  loadProducts();
}
