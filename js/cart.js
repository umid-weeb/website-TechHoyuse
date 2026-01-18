(function () {
  "use strict";

  if (window.Cart && window.Cart._isUnified) return;

  const STORAGE_KEY = "cart";

  function readCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return Array.isArray(JSON.parse(raw || "[]"))
        ? JSON.parse(raw || "[]")
        : [];
    } catch (e) {
      return [];
    }
  }

  function writeCart(arr, action, extra = {}) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    const detail = Object.assign({}, extra, {
      action: action,
      count: arr.reduce((s, i) => s + (i.qty || 0), 0),
    });
    window.dispatchEvent(new CustomEvent("cart:updated", { detail }));
  }

  function findIndex(arr, id) {
    return arr.findIndex((i) => Number(i.id) === Number(id));
  }

  const Cart = {
    _isUnified: true,
    init() {
      if (!localStorage.getItem(STORAGE_KEY))
        localStorage.setItem(STORAGE_KEY, "[]");
    },
    getRaw() {
      return readCart();
    },
    getCount() {
      return readCart().reduce((s, i) => s + (i.qty || 0), 0);
    },
    addToCart(id, qty = 1) {
      id = Number(id);
      if (Number.isNaN(id)) return;
      const arr = readCart();
      const idx = findIndex(arr, id);
      if (idx >= 0) {
        arr[idx].qty = (arr[idx].qty || 0) + Number(qty || 1);
      } else {
        arr.push({ id: id, qty: Number(qty || 1) });
      }
      writeCart(arr, "add", { id });
    },
    removeFromCart(id) {
      id = Number(id);
      const arr = readCart();
      const idx = findIndex(arr, id);
      if (idx >= 0) {
        arr.splice(idx, 1);
        writeCart(arr, "remove", { id });
      }
    },
    updateQty(id, qty) {
      id = Number(id);
      qty = Number(qty);
      if (Number.isNaN(id) || Number.isNaN(qty)) return;
      const arr = readCart();
      const idx = findIndex(arr, id);
      if (idx >= 0) {
        if (qty <= 0) {
          arr.splice(idx, 1);
          writeCart(arr, "remove", { id });
        } else {
          arr[idx].qty = qty;
          writeCart(arr, "update", { id });
        }
      }
    },
    clear() {
      writeCart([], "clear");
    },
    getCartDetails() {
      const items = readCart();
      if (!window.DataStore || typeof window.DataStore.getById !== "function")
        return [];
      return items
        .map((it) => {
          const p = DataStore.getById(Number(it.id));
          if (!p) return null;
          const qty = Number(it.qty || 0);
          const price = Number(p.price || 0);
          return {
            id: p.id,
            name: p.name,
            price: price,
            qty: qty,
            subtotal: price * qty,
            image: (p.images && p.images[0]) || "",
            slug: p.slug,
          };
        })
        .filter(Boolean);
    },
  };

  window.Cart = Cart;

  document.addEventListener("DOMContentLoaded", function () {
    window.Cart.init();
  });
})();
