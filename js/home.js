window.addEventListener("scroll", function () {
  const header = document.querySelector(".site-header");
  const footer = document.querySelector(".main-footer");
  const sidebar = document.querySelector(".sidebar");

  // Footer koordinatasini aniqlash
  const footerRect = footer.getBoundingClientRect();

  // Agar footer tepaga yaqinlashsa (ekranda ko'rinsa)
  if (footerRect.top < window.innerHeight) {
    // Header va Sidebar footer ostida qolishi uchun z-indexni pasaytiramiz
    // Yoki footer baland z-index bilan ularni yopadi
    header.style.transform = `translateY(-${
      window.innerHeight - footerRect.top
    }px)`;
    header.style.transition = "transform 0.1s ease-out";
  } else {
    header.style.transform = "translateY(0)";
  }
});
function searchProducts(query) {
  return PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );
}
document.getElementById("search").addEventListener("input", function () {
  const query = this.value;
  const results = searchProducts(query);
  displayProducts(results);
});
function displayProducts(products) {
  const productsContainer = document.getElementById("productsContainer");
  productsContainer.innerHTML = ""; // Clear previous results
  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>Category: ${product.category}</p>
      <p>Price: $${product.price}</p>
      <p>Rating: ${"⭐".repeat(product.rating)}</p>
    `;
    productsContainer.appendChild(productCard);
  });
}
// Initial display of all products
displayProducts(PRODUCTS);
// Compare this snippet from auth/script.js:
//   }
// });  function filterProducts({ category, minPrice, maxPrice }) {
return PRODUCTS.filter((p) => {
  return (
    (!category || p.category === category) &&
    (!minPrice || p.price >= minPrice) &&
    (!maxPrice || p.price <= maxPrice)
  );
});
document.getElementById("filterForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const category = document.getElementById("category").value;
  const minPrice = parseFloat(document.getElementById("minPrice").value);
  const maxPrice = parseFloat(document.getElementById("maxPrice").value);
  const filters = {
    category: category !== "all" ? category : null,
    minPrice: isNaN(minPrice) ? null : minPrice,
    maxPrice: isNaN(maxPrice) ? null : maxPrice,
  };
  const results = filterProducts(filters);
  displayProducts(results);
});

// Utility function to get the cart from localStorage
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

// Utility function to save the cart to localStorage
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Update the cart count displayed in the header
function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  const counter = document.getElementById("cart-count");
  if (counter) counter.textContent = total;
}

// Ensure PRODUCTS array is defined and accessible
if (typeof PRODUCTS === "undefined") {
  console.error("PRODUCTS array is not defined. Please ensure it is loaded.");
}

// Add a product to the cart
function addToCart(productId) {
  let cart = getCart();

  const product = PRODUCTS.find((p) => p.id === productId); // Find product details
  if (!product) {
    console.error(`Product with ID ${productId} not found in PRODUCTS array.`);
    return;
  }

  const item = cart.find((p) => p.id === productId);
  if (item) {
    item.qty += 1; // Increment quantity if product already exists in the cart
  } else {
    cart.push({ ...product, qty: 1 }); // Add product to the cart
  }

  saveCart(cart);
  updateCartCount();
  alert("Mahsulot savatchaga qo‘shildi!");
}

// Event listener for "Add to Cart" buttons
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("add-to-cart")) {
    const productId = Number(e.target.dataset.id);
    if (isNaN(productId)) {
      console.error("Invalid product ID:", e.target.dataset.id);
      return;
    }
    addToCart(productId);
  }
});

// Event listener for "Buy" buttons
document.querySelectorAll(".buy-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const productId = parseInt(btn.dataset.id); // Get product ID from data attribute
    addToCart(productId);
    alert("Mahsulot savatchaga qo‘shildi!");
  });
});

// Initialize cart count on page load
updateCartCount();
// FOOTER & PAGINATION PLACEHOLDER
document
  .querySelectorAll(".footer-links a, .tag, .page-btn, .social-btn")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      console.log("Clicked:", btn.innerText || btn.className);
    });
  });

// Utility function
function getFromLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

// Utility function to get the logged-in user from localStorage
function getLoggedInUser() {
  return JSON.parse(localStorage.getItem("loggedInUser"));
}

// Redirect to profile or login page based on login status
document.querySelector('[data-action="profile"]').onclick = function (e) {
  e.preventDefault();
  const user = getLoggedInUser();
  location.href = user ? "profile.html" : "auth/index.html";
};

// ================= CART HELPERS =================
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ================= ADD TO CART =================
document.addEventListener("click", (e) => {
  const btn = e.target.closest && e.target.closest(".add-to-cart");
  if (btn) {
    e.preventDefault();
    const id = btn.dataset.id;
    if (!id) return;
    window.Cart.add(Number(id), 1);
    return;
  }

  // click on product card to open detail (if element has data-slug)
  const card = e.target.closest && e.target.closest("[data-slug]");
  if (card && e.target.tagName.toLowerCase() !== "button") {
    const slug = card.dataset.slug;
    if (slug) {
      window.location.href = `product-detail.html?slug=${encodeURIComponent(
        slug
      )}`;
    }
  }
});

// optional: wire quick nav for images with anchors already present
document.querySelectorAll('a[href^="product-detail.html"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    // allow existing slug query to work, otherwise prevent and navigate using dataset if present
    if (!href.includes("slug=") && a.dataset.slug) {
      e.preventDefault();
      window.location.href = `product-detail.html?slug=${encodeURIComponent(
        a.dataset.slug
      )}`;
    }
  });
});

function updateCartCount() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

  const counter = document.getElementById("cart-count");
  if (counter) {
    counter.textContent = totalQty;
  }
}

// sahifa yuklanganda ham ishlasin
updateCartCount();

// Home / index page wiring: add-to-cart delegation and product link behavior
(function () {
  "use strict";

  // ...existing code...

  function ensureButtonDataIds() {
    const buttons = document.querySelectorAll(".add-to-cart");
    buttons.forEach((btn) => {
      if (!btn.hasAttribute("data-id")) {
        // try data-slug
        const slug =
          btn.getAttribute("data-slug") || btn.getAttribute("data-slug");
        if (slug && window.DataStore && window.DataStore.getBySlug) {
          const p = window.DataStore.getBySlug(slug);
          if (p) btn.setAttribute("data-id", p.id);
        }
      }
    });
  }

  // delegate clicks
  document.addEventListener("click", function (e) {
    const btn = e.target.closest && e.target.closest(".add-to-cart");
    if (!btn) return;
    e.preventDefault();
    const id = btn.getAttribute("data-id");
    if (!id) {
      // try slug fallback
      const slug = btn.getAttribute("data-slug");
      if (slug && window.DataStore && window.DataStore.getBySlug) {
        const p = window.DataStore.getBySlug(slug);
        if (p) {
          window.Cart.addToCart(p.id, 1);
          return;
        }
      }
      return;
    }
    // check stock
    const product =
      window.DataStore && window.DataStore.getById
        ? window.DataStore.getById(Number(id))
        : null;
    if (product && Number(product.stock) <= 0) {
      window.UI &&
        window.UI.toast &&
        window.UI.toast("error", "Mahsulot omborda mavjud emas");
      return;
    }
    window.Cart && window.Cart.addToCart(Number(id), 1);
  });

  // ensure product image/title links already point to detail pages in markup;
  // nothing to change, but ensure buttons that lack data-id are assigned
  document.addEventListener("DOMContentLoaded", function () {
    ensureButtonDataIds();
  });

  // ...existing code...
  document.addEventListener("DOMContentLoaded", function () {
    if (!window.DataStore) return;
    DataStore._seed();

    // rely on main.js rendering if present; if not, simple fallback
    const container = document.getElementById("featured-products");
    if (!container) return;
    const products = DataStore.getAll().slice(0, 8);
    container.innerHTML = "";
    products.forEach((p) => {
      const el = document.createElement("div");
      el.className = "product-card";
      el.innerHTML = `
        <a href="product-detail.html?slug=${p.slug}"><img src="${p.images[0]}" alt="${p.name}"></a>
        <h4>${p.name}</h4>
        <div class="price">${p.price}</div>
        <button class="add-to-cart" data-id="${p.id}">Savatchaga qo‘shish</button>
      `;
      container.appendChild(el);
    });
  });
})();

(function () {
  // ...existing code...
  // Simple initializer if other home-specific logic is needed later
  function initHome() {
    if (!window.DataStore) return;
    if (typeof DataStore._seed === "function") DataStore._seed();
    // UI rendering of homepage is handled in main.js (keeps HTML visual but uses DataStore)
  }
  document.addEventListener("DOMContentLoaded", initHome);
  // ...existing code...
})();

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const featuredEl = document.getElementById("featured-products");
    if (!featuredEl) return;
    const products = window.DataStore
      ? window.DataStore.getAll().slice(0, 4)
      : [];
    featuredEl.innerHTML = products
      .map(
        (p) => `
			<div class="product-card" data-id="${p.id}">
				<a href="product-detail.html?slug=${encodeURIComponent(p.slug)}">
					<img src="${p.image || "assets/images/product1.jpg"}" alt="${p.name}">
				</a>
				<h4>${p.name}</h4>
				<div class="price">$${Number(p.price || 0).toFixed(2)}</div>
				<button class="add-to-cart" data-id="${p.id}">Savatchaga qo‘shish</button>
			</div>
		`
      )
      .join("");
  });
})();
