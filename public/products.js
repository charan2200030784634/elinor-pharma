fetch("/products")
  .then(res => res.json())
  .then(products => {
    const container = document.getElementById("productList");

    if (products.length === 0) {
      container.innerHTML = "<p>No products available.</p>";
      return;
    }

    products.forEach(p => {
      container.innerHTML += `
        <div class="card">
          ${p.image ? `<img src="/uploads/${p.image}">` : ""}
          <h3>${p.name}</h3>
          <p><b>Category:</b> ${p.category}</p>
          <p><b>Composition:</b> ${p.composition}</p>
          <p><b>Form:</b> ${p.form}</p>
          <p><b>Packing:</b> ${p.packing}</p>
        </div>
      `;
    });
  });
