// js/ui.js
(function () {
  "use strict";

  if (window.UI && window.UI._unifiedToast) return;

  const TOAST_ID = "site-single-toast";
  const DEFAULT_TIMEOUT = 3500;

  function createToastEl() {
    let el = document.getElementById(TOAST_ID);
    if (el) return el;
    el = document.createElement("div");
    el.id = TOAST_ID;
    el.style.position = "fixed";
    el.style.top = "16px";
    el.style.right = "16px";
    el.style.zIndex = "99999";
    el.style.minWidth = "220px";
    el.style.maxWidth = "340px";
    el.style.fontFamily = "sans-serif";
    document.body.appendChild(el);
    return el;
  }

  let currentTimer = null;

  function renderToast(message, opts = {}) {
    const root = createToastEl();
    // replace content
    root.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "site-toast " + (opts.type || "info");
    wrapper.style.background =
      opts.background ||
      (opts.type === "success"
        ? "#2d9a4a"
        : opts.type === "error"
        ? "#d9534f"
        : "#333");
    wrapper.style.color = "#fff";
    wrapper.style.padding = "10px 14px";
    wrapper.style.borderRadius = "6px";
    wrapper.style.boxShadow = "0 6px 18px rgba(0,0,0,0.12)";
    wrapper.style.marginBottom = "8px";
    wrapper.textContent = message;
    root.appendChild(wrapper);
    // clear existing timer
    if (currentTimer) {
      clearTimeout(currentTimer);
      currentTimer = null;
    }
    const t = opts.timeout != null ? Number(opts.timeout) : DEFAULT_TIMEOUT;
    if (t > 0) currentTimer = setTimeout(() => (root.innerHTML = ""), t);
  }

  const UI = {
    _unifiedToast: true,
    // backwards-compatible: UI.toast(type, message)
    toast(typeOrMsg, maybeMsg) {
      if (typeof maybeMsg === "string") {
        renderToast(maybeMsg, { type: String(typeOrMsg) });
      } else {
        renderToast(String(typeOrMsg), { type: "info" });
      }
    },
    // more modern: UI.showToast(message, {type, timeout})
    showToast(message, opts = {}) {
      renderToast(String(message || ""), opts);
    },
  };

  window.UI = Object.assign(window.UI || {}, UI);

  /* =========================
     CART COUNTER UI
  ========================= */
  function updateCartCount() {
    const el = document.getElementById("cart-count");
    if (!el || !window.Cart) return;
    el.textContent = Cart.getCount();
  }

  // cart o‘zgarganda avtomatik yangilansin
  window.addEventListener("cart:updated", updateCartCount);

  // sahifa yuklanganda
  window.addEventListener("load", updateCartCount);

  /* =========================
     GLOBAL ADD TO CART (EVENT DELEGATION)
  ========================= */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-to-cart");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    if (!id) return;

    const product = window.DataStore?.getById(id);
    if (!product) {
      UI.showToast("Mahsulot topilmadi ❌", { type: "error" });
      return;
    }

    if (!product.inStock) {
      UI.showToast("Mahsulot sotuvda yo‘q ❌", { type: "error" });
      return;
    }

    Cart.addToCart(product.id, 1);
    UI.showToast("Savatchaga qo‘shildi ✅", { type: "success" });
  });

  /* =========================
     EXPOSE UI
  ========================= */
  const UIExpose = (function () {
    function updateCartCount(count) {
      const el = document.querySelector("#cart-count");
      if (el) el.textContent = Number(count || 0);
    }

    return {
      updateCartCount,
    };
  })();

  window.UI = Object.assign(window.UI || {}, UIExpose);

  // listen to cart updates
  window.addEventListener("cart:updated", function (e) {
    const cart = e && e.detail && e.detail.cart ? e.detail.cart : [];
    const count = cart.reduce((s, it) => s + Number(it.qty || 0), 0);
    UI.updateCartCount(count);
  });

  // initialize on DOM ready
  document.addEventListener("DOMContentLoaded", function () {
    // initial count from Cart if available
    try {
      const initial = window.Cart ? window.Cart.getCount() : 0;
      UI.updateCartCount(initial);
    } catch (e) {
      /* ignore */
    }
    // adjust profile link based on auth
    UI.adjustProfileLink();
  });
})();
