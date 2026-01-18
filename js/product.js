export const products = [
  {
    id: 1,
    name: "Robot changyutgich",
    price: 349,
    image: "robot.jpg",
    inStock: true,
  },
  {
    id: 2,
    name: "Mikroto‘lqinli pech",
    price: 189,
    image: "micro.jpg",
    inStock: true,
  },
];

// Product detail page logic
(function () {
  "use strict";

  function q(sel) {
    return document.querySelector(sel);
  }
  function qa(sel) {
    return Array.from(document.querySelectorAll(sel));
  }

  function getSlugFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("slug");
  }

  function renderProduct(product) {
    if (!product) {
      // show fallback
      const title = document.querySelector(".product-title");
      if (title) title.textContent = "Mahsulot topilmadi";
      return;
    }
    const titleEl = document.querySelector(".product-title");
    const imgEl = document.querySelector(".product-image img");
    const priceEl = document.querySelector(".product-price");
    const addBtn = document.querySelector(".add-to-cart");

    if (titleEl) titleEl.textContent = product.title;
    if (imgEl) imgEl.src = product.image || "";
    if (priceEl)
      priceEl.textContent = "$" + (Number(product.price) || 0).toFixed(2);

    // stock indicator
    let stockEl = document.querySelector(".product-stock-indicator");
    if (!stockEl && priceEl) {
      stockEl = document.createElement("div");
      stockEl.className = "product-stock-indicator";
      stockEl.style.marginTop = "8px";
      stockEl.style.fontWeight = "600";
      priceEl.insertAdjacentElement("afterend", stockEl);
    }
    if (stockEl) {
      if (Number(product.stock) > 0) {
        stockEl.textContent = "Omborda: " + Number(product.stock) + " ta";
        stockEl.style.color = "#15803d";
      } else {
        stockEl.textContent = "Ommaviy: Mahsulot tugadi";
        stockEl.style.color = "#dc2626";
      }
    }

    // badges
    let badgesWrapper = document.querySelector(".product-badges");
    if (!badgesWrapper) {
      badgesWrapper = document.createElement("div");
      badgesWrapper.className = "product-badges";
      if (titleEl) titleEl.insertAdjacentElement("afterend", badgesWrapper);
    }
    badgesWrapper.innerHTML = "";
    (product.badges || []).forEach((b) => {
      const span = document.createElement("span");
      span.className = "badge-" + b;
      span.textContent = b.toUpperCase();
      span.style.marginRight = "8px";
      span.style.padding = "4px 8px";
      span.style.borderRadius = "4px";
      span.style.background = "#ff6a00";
      span.style.color = "#fff";
      badgesWrapper.appendChild(span);
    });

    // wire add-to-cart
    if (addBtn) {
      addBtn.setAttribute("data-id", product.id);
      addBtn.disabled = Number(product.stock) <= 0;
      addBtn.addEventListener("click", function () {
        if (Number(product.stock) <= 0) {
          window.UI &&
            window.UI.toast &&
            window.UI.toast("error", "Mahsulot omborda mavjud emas");
          return;
        }
        window.Cart && window.Cart.addToCart(product.id, 1);
      });
    }

    // recently viewed
    try {
      const key = "recentlyViewed";
      const raw = localStorage.getItem(key);
      let arr = raw ? JSON.parse(raw) : [];
      arr = Array.isArray(arr) ? arr : [];
      // prepend slug, unique
      arr = [product.slug].concat(arr.filter((s) => s !== product.slug));
      // limit 10
      arr = arr.slice(0, 10);
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) {
      /* ignore */
    }
  }

  function attachInteractions() {
    const qtyVal = q("#pd-qty-value");
    let qty = Number(qtyVal.textContent || 1);

    q("#pd-qty-increase").addEventListener("click", () => {
      qty = Math.min(99, qty + 1);
      qtyVal.textContent = qty;
    });

    q("#pd-qty-decrease").addEventListener("click", () => {
      qty = Math.max(1, qty - 1);
      qtyVal.textContent = qty;
    });

    q("#pd-add-to-cart").addEventListener("click", (e) => {
      const id = Number(e.currentTarget.dataset.productId);
      const qv = Number(q("#pd-qty-value").textContent || 1);
      window.Cart.addToCart(id, qv);
      window.UI && window.UI.toast("Mahsulot savatchaga qo‘shildi", "success");
    });

    // wishlist placeholder (store minimal wishlist)
    q("#pd-wishlist").addEventListener("click", () => {
      const pid = Number(q("#pd-add-to-cart").dataset.productId);
      let wl = JSON.parse(localStorage.getItem("wishlist") || "[]");
      if (!wl.includes(pid)) wl.push(pid);
      else wl = wl.filter((i) => i !== pid);
      localStorage.setItem("wishlist", JSON.stringify(wl));
      window.UI && window.UI.toast("Wishlist yangilandi", "info");
    });
  }

  function pushRecentlyViewed(product) {
    if (!product) return;
    const KEY = "recentlyViewed";
    let arr = JSON.parse(localStorage.getItem(KEY) || "[]");
    arr = arr.filter((id) => id !== product.id);
    arr.unshift(product.id);
    if (arr.length > 10) arr.length = 10;
    localStorage.setItem(KEY, JSON.stringify(arr));
  }

  // init
  window.addEventListener("DOMContentLoaded", () => {
    const slug = getSlugFromUrl();
    const product =
      window.DataStore && window.DataStore.getBySlug
        ? window.DataStore.getBySlug(slug)
        : null;
    renderProduct(product);
    attachInteractions();
    pushRecentlyViewed(product);
  });
})();

(function () {
  function qs(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }
  function renderProduct(product) {
    const container = document.getElementById("product-detail");
    if (!container) return;
    // Minimal safe rendering (do not trust HTML for price etc.)
    container.innerHTML = `
			<h1>${product.name}</h1>
			<img src="${product.image || "assets/images/hero.jpg"}" alt="${product.name}">
			<p>${product.description || ""}</p>
			<p class="price">$${Number(product.price || 0).toFixed(2)}</p>
			<button class="add-to-cart" data-id="${product.id}">Savatchaga qo‘shish</button>
		`;
  }
  function saveRecentlyViewed(slug) {
    try {
      const key = "techhouse_recently";
      const raw = localStorage.getItem(key);
      let arr = raw ? JSON.parse(raw) : [];
      arr = arr.filter((s) => s !== slug);
      arr.unshift(slug);
      if (arr.length > 10) arr = arr.slice(0, 10);
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) {
      /* ignore */
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const slug = qs("slug");
    if (!slug) return;
    const product = window.DataStore ? window.DataStore.getBySlug(slug) : null;
    if (!product) {
      ui.showToast("Mahsulot topilmadi", { type: "error" });
      return;
    }
    renderProduct(product);
    saveRecentlyViewed(slug);
  });
})();

(function () {
  function getQueryParam(name) {
    const s = new URLSearchParams(window.location.search);
    return s.get(name);
  }

  function initProductPage() {
    const slug = getQueryParam("slug");
    if (!slug) return;
    if (!window.DataStore || typeof DataStore.getBySlug !== "function") return;
    const product = DataStore.getBySlug(slug);
    if (!product) {
      window.UI &&
        window.UI.toast &&
        window.UI.toast("error", "Mahsulot topilmadi");
      return;
    }

    // render product area - use only product fields (do not rely on HTML text)
    const titleEl = document.querySelector(".product-title");
    const priceEl = document.querySelector(".product-price");
    const imgEl = document.querySelector(".product-image img");
    const addBtn = document.querySelector(".add-to-cart[data-id]");

    if (titleEl) titleEl.textContent = product.name;
    if (priceEl) priceEl.textContent = `$${product.price}`;
    if (imgEl && product.images && product.images.length)
      imgEl.src = product.images[0];

    // ensure add button uses product.id from DataStore
    if (addBtn) addBtn.setAttribute("data-id", String(product.id));
    // attach click (delegated sitewide will handle actual add-to-cart)

    // record recently viewed (store slugs)
    try {
      const key = "recentlyViewed";
      const raw = localStorage.getItem(key) || "[]";
      const arr = JSON.parse(raw);
      const list = Array.isArray(arr) ? arr : [];
      // keep unique, most recent first
      const filtered = [product.slug]
        .concat(list.filter((s) => s !== product.slug))
        .slice(0, 20);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (e) {}
  }

  document.addEventListener("DOMContentLoaded", initProductPage);
})();

// Render function as required
function renderProduct(product) {
  const titleEl = document.querySelector(".product-title");
  const priceEl = document.querySelector(".product-price");
  const imgEl = document.querySelector(".product-image img");
  const addBtn = document.querySelector(".add-to-cart");

  if (titleEl) titleEl.textContent = product.name || "";
  if (priceEl)
    priceEl.textContent =
      "$" + (product.price != null ? product.price : "0.00");
  if (imgEl) {
    imgEl.src =
      product.images && product.images.length
        ? product.images[0]
        : "assets/images/placeholder.png";
    imgEl.alt = product.name || "Product image";
  }

  if (addBtn) {
    // set data-id attribute
    addBtn.dataset.id = product.id;

    // replace node to ensure no duplicate listeners
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);

    newBtn.addEventListener("click", function () {
      // Use existing Cart API
      if (typeof Cart !== "undefined" && typeof Cart.addToCart === "function") {
        Cart.addToCart(product.id);
      }
      // update cart count display
      updateCartCount();
    });
  }
}

// update cart count in header (if element exists)
function updateCartCount() {
  const countEl = document.getElementById("cart-count");
  if (!countEl) return;

  const count =
    typeof Cart !== "undefined" && typeof Cart.getCount === "function"
      ? Cart.getCount()
      : 0;

  countEl.textContent = count;
}
