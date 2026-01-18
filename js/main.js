(function () {
  "use strict";
  if (window.__techhouse_initialized) return;
  window.__techhouse_initialized = true;

  function isCheckoutPage() {
    return /checkout\.html/i.test(window.location.pathname);
  }
  function validatePhone(phone) {
    return /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(phone);
  }

  document.addEventListener("DOMContentLoaded", function () {
    // ensure data seeded and cart initialized once
    if (window.DataStore && typeof DataStore._seed === "function")
      DataStore._seed();
    if (window.Cart && typeof Cart.init === "function") Cart.init();

    // init UI count from cart
    if (window.UI && typeof UI.showToast === "function") {
      const cnt = window.Cart ? window.Cart.getCount() : 0;
      const el = document.getElementById("cart-count");
      if (el) el.textContent = String(cnt || 0);
    }

    // profile links
    const profileLinks = document.querySelectorAll(
      '[data-action="profile"], a[data-action="profile"]'
    );
    const currentUser = localStorage.getItem("currentUser");
    profileLinks.forEach((a) =>
      a.setAttribute("href", currentUser ? "profile.html" : "auth/login.html")
    );

    // cross-tab storage fallback and profile link update
    window.addEventListener("storage", (e) => {
      if (e.key === "cart") {
        try {
          const arr = JSON.parse(e.newValue || "[]");
          const c = arr.reduce((s, i) => s + (i.qty || 0), 0);
          const el = document.querySelector("#cart-count");
          if (el) el.textContent = c;
        } catch (err) {}
      }
      if (e.key === "currentUser") {
        const profileLinks = document.querySelectorAll(
          '[data-action="profile"]'
        );
        const currentUser = localStorage.getItem("currentUser");
        profileLinks.forEach((a) =>
          a.setAttribute(
            "href",
            currentUser ? "profile.html" : "auth/login.html"
          )
        );
      }
    });

    // Render homepage product blocks (visual HTML kept but data comes from DataStore)
    const featuredEl = document.getElementById("featured-products");
    if (
      featuredEl &&
      window.DataStore &&
      typeof DataStore.getAll === "function"
    ) {
      const products = DataStore.getAll();
      function renderProducts(list, container) {
        if (!container) return;
        container.innerHTML = "";
        list.forEach((product) => {
          const div = document.createElement("div");
          div.className = "product-card";
          div.innerHTML = `
            ${product.discount ? `<span class="sale-badge">SALE</span>` : ""}
            <a href="product-detail.html?slug=${product.slug}">
              <img src="${product.images[0] || ""}" alt="${product.name}">
            </a>
            <h4>${product.name}</h4>
            <div class="rating">${"★".repeat(
              Math.round(product.rating || 0)
            )}</div>
            <div class="price">
              <span class="new">$${product.price}</span>
              ${
                product.oldPrice
                  ? `<span class="old">$${product.oldPrice}</span>`
                  : ""
              }
            </div>
            <button class="add-to-cart" data-id="${
              product.id
            }">Savatchaga qo‘shish</button>
          `;
          container.appendChild(div);
        });
      }
      renderProducts(products.slice(0, 4), featuredEl);
      const topRated = document.getElementById("top-rated-products");
      if (topRated)
        renderProducts(
          products.filter((p) => p.rating >= 4.7).slice(0, 4),
          topRated
        );
      const bestSelling = document.getElementById("best-selling-products");
      if (bestSelling) renderProducts(products.slice(4, 8), bestSelling);
      const latest = document.getElementById("latest-products");
      if (latest) renderProducts(products.slice(8, 12), latest);
    }

    // Checkout page: add single place-order button and validate
    if (isCheckoutPage()) {
      const cards = document.querySelectorAll(".checkout-card");
      const placeBtn = document.createElement("button");
      placeBtn.textContent = "Buyurtmani joylashtirish";
      placeBtn.className = "btn-place-order btn-orange";
      placeBtn.style.marginTop = "16px";
      if (cards && cards.length) cards[cards.length - 1].appendChild(placeBtn);
      else {
        const main = document.querySelector("main");
        if (main) main.appendChild(placeBtn);
      }

      placeBtn.addEventListener("click", function () {
        const name =
          (document.querySelector('.checkout-card input[type="text"]') || {})
            .value || "";
        const phone =
          (document.querySelector('input[type="tel"]') || {}).value || "";
        const addressEl =
          document.querySelector(".checkout-card .field select") ||
          document.querySelectorAll(
            '.checkout-card .field input[type="text"]'
          )[1] ||
          {};
        const address = addressEl.value || "";

        if (!name.trim()) {
          UI.toast("error", "Ism kiritilishi shart");
          return;
        }
        if (!validatePhone(phone)) {
          UI.toast(
            "error",
            "Telefon raqam formatini +998 XX XXX XX XX tarzida kiriting"
          );
          return;
        }
        if (!address.trim()) {
          UI.toast("error", "Manzil kiritilishi shart");
          return;
        }

        Cart.clear();
        UI.toast("success", "Buyurtma qabul qilindi. Rahmat!");
        setTimeout(() => (window.location.href = "index.html"), 1200);
      });
    }

    // CART PAGE RENDERING
    function renderCartPage() {
      const cartTable = document.getElementById("cart-table");
      const cartEmptyEl = document.getElementById("cart-empty");
      const cartTotalEl = document.getElementById("cart-total");
      if (!cartTable && !cartEmptyEl) return;

      const details =
        window.Cart && typeof Cart.getCartDetails === "function"
          ? Cart.getCartDetails()
          : [];
      if (!details.length) {
        if (cartTable) cartTable.innerHTML = "";
        if (cartEmptyEl)
          cartEmptyEl.innerHTML = `<p>Hali hech narsa tanlamadingiz</p><a class="btn" href="products.html">Mahsulotlar</a>`;
        if (cartTotalEl) cartTotalEl.textContent = "0";
        return;
      }

      if (cartTable) {
        cartTable.innerHTML = "";
        details.forEach((item) => {
          const tr = document.createElement("div");
          tr.className = "cart-row";
          tr.innerHTML = `
            <div class="col name"><img src="${item.image}" alt="${item.name}" style="width:60px;height:60px;object-fit:cover;margin-right:8px;"> ${item.name}</div>
            <div class="col price">${item.price}</div>
            <div class="col qty">
              <button class="qty-decrease" data-id="${item.id}">-</button>
              <input class="qty-input" data-id="${item.id}" value="${item.qty}" />
              <button class="qty-increase" data-id="${item.id}">+</button>
            </div>
            <div class="col subtotal">${item.subtotal}</div>
            <div class="col remove"><button class="remove-item" data-id="${item.id}">❌</button></div>
          `;
          cartTable.appendChild(tr);
        });
      }

      const total = details.reduce((s, it) => s + (it.subtotal || 0), 0);
      if (cartTotalEl) cartTotalEl.textContent = total;
    }

    // initial render
    renderCartPage();

    // SINGLE cart:updated listener -> update count, maybe show toast, re-render cart
    window.addEventListener("cart:updated", function (e) {
      try {
        const d = e.detail || {};
        const count = d.count || (window.Cart ? window.Cart.getCount() : 0);
        const el = document.getElementById("cart-count");
        if (el) el.textContent = String(count || 0);

        // show toast once per action (Cart already describes action)
        if (d.action === "add") {
          UI.toast("success", "Mahsulot savatchaga qo‘shildi");
        } else if (d.action === "remove") {
          UI.toast("info", "Mahsulot savatchadan o‘chirildi");
        } else if (d.action === "update") {
          UI.toast("info", "Savat yangilandi");
        } else if (d.action === "clear") {
          UI.toast("info", "Savat tozalandi");
        }

        // re-render cart page if present
        renderCartPage();
      } catch (err) {
        // swallow errors to avoid duplicate console noise
      }
    });

    // DELEGATED add-to-cart: only read data-id and use DataStore to validate
    document.body.addEventListener("click", function (ev) {
      const btn = ev.target.closest && ev.target.closest(".add-to-cart");
      if (!btn) return;
      ev.preventDefault();
      const idAttr = btn.getAttribute("data-id");
      if (!idAttr) {
        UI.toast("error", "Mahsulot topilmadi");
        return;
      }
      const id = Number(idAttr);
      if (!window.DataStore || typeof DataStore.getById !== "function") {
        UI.toast("error", "Mahsulot topilmadi");
        return;
      }
      const product = DataStore.getById(id);
      if (!product) {
        UI.toast("error", "Mahsulot topilmadi");
        return;
      }
      // Only use product.id (not HTML)
      Cart.addToCart(product.id, 1);
    });

    // Cart page controls (delegated)
    document.body.addEventListener("click", function (ev) {
      const inc = ev.target.closest && ev.target.closest(".qty-increase");
      const dec = ev.target.closest && ev.target.closest(".qty-decrease");
      const rem = ev.target.closest && ev.target.closest(".remove-item");
      if (inc) {
        const id = Number(inc.getAttribute("data-id"));
        if (!Number.isNaN(id)) {
          const details = Cart.getCartDetails().find((d) => d.id === id);
          const newQty = details ? (details.qty || 0) + 1 : 1;
          Cart.updateQty(id, newQty);
        }
      } else if (dec) {
        const id = Number(dec.getAttribute("data-id"));
        if (!Number.isNaN(id)) {
          const details = Cart.getCartDetails().find((d) => d.id === id);
          const newQty = details ? (details.qty || 0) - 1 : 0;
          if (newQty <= 0) Cart.removeFromCart(id);
          else Cart.updateQty(id, newQty);
        }
      } else if (rem) {
        const id = Number(rem.getAttribute("data-id"));
        if (!Number.isNaN(id)) Cart.removeFromCart(id);
      }
    });

    // qty input change handler
    document.body.addEventListener("change", function (ev) {
      const inp = ev.target.closest && ev.target.closest(".qty-input");
      if (!inp) return;
      const id = Number(inp.getAttribute("data-id"));
      if (Number.isNaN(id)) return;
      const val = Math.max(1, parseInt(inp.value) || 1);
      inp.value = val;
      Cart.updateQty(id, val);
    });
  });
})();
document.addEventListener("DOMContentLoaded", () => {
  const profileLink = document.getElementById("nav-profile");
  const cartCount = document.getElementById("cart-count");

  // 👤 PROFILE LINK
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (profileLink) {
    profileLink.href = user ? "profile.html" : "auth/login.html";
    profileLink.innerHTML = `<i class="fa-solid fa-user"></i>`;
  }

  // 🛒 CART COUNT
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cartCount) {
    cartCount.textContent = cart.reduce((s, i) => s + i.qty, 0);
  }
});
