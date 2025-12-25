const table = document.getElementById("productTable");
const form = document.getElementById("productForm");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

let allProducts = [];
let editId = null;

/* LOAD */
async function loadProducts() {
  const res = await fetch("/api/products");
  allProducts = await res.json();

  renderTable(allProducts);
  populateCategories(allProducts);
  updateStats(allProducts);
}

loadProducts();

/* ADD / UPDATE */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  let url = "/add-product";
  let method = "POST";

  if (editId !== null) {
    url = `/update-product/${editId}`;
    method = "PUT";
  }

  await fetch(url, { method, body: data });

  form.reset();
  editId = null;
  loadProducts();
});

/* TABLE */
function renderTable(products) {
  table.innerHTML = "";

  if (products.length === 0) {
    table.innerHTML = `<tr><td colspan="4">No products found</td></tr>`;
    return;
  }

  products.forEach(p => {
    table.innerHTML += `
      <tr>
        <td>${p.image ? `<img src="/uploads/${p.image}">` : ""}</td>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>
          <button class="edit" onclick="editProduct(${p.id})">Edit</button>
          <button class="delete" onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* FILTER */
searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);

function applyFilters() {
  const search = searchInput.value.toLowerCase();
  const cat = categoryFilter.value;

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(search) &&
    (!cat || p.category === cat)
  );

  renderTable(filtered);
  updateStats(filtered);
}

/* CATEGORY LIST */
function populateCategories(products) {
  const cats = [...new Set(products.map(p => p.category))];

  categoryFilter.innerHTML =
    `<option value="">All Categories</option>` +
    cats.map(c => `<option value="${c}">${c}</option>`).join("");
}

/* EDIT */
function editProduct(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;

  form.name.value = p.name;
  form.category.value = p.category;
  form.composition.value = p.composition || "";
  form.form.value = p.form || "";
  form.packing.value = p.packing || "";
  form.description.value = p.description || "";

  editId = id;
}

/* DELETE */
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  await fetch(`/delete-product/${id}`, { method: "DELETE" });
  loadProducts();
}

/* STATS */
function updateStats(products) {
  document.getElementById("totalProducts").innerText = products.length;
  document.getElementById("totalCategories").innerText =
    new Set(products.map(p => p.category)).size;
}
