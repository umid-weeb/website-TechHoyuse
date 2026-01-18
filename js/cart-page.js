/**
 * CART-PAGE.JS - Cart Page Logic
 */
(function() {
  "use strict";

  if (!location.pathname.includes("cart.html")) return;

  function renderCart() {
    const tableEl = document.getElementById("cart-table");
    const emptyEl = document.getElementById("cart-empty");
    const summaryEl = document.querySelector(".cart-summary");
    const actionsEl = document.querySelector(".cart-actions");

    if (!tableEl) return;

    const items = Store.getCartDetails();

    if (!items.length) {
      tableEl.innerHTML = "";
      if (emptyEl) {
        emptyEl.innerHTML = `
          <div style="text-align:center;padding:60px 20px;">
            <i class="fa-solid fa-cart-shopping" style="font-size:64px;color:#ddd;margin-bottom:20px;"></i>
            <h2 style="margin-bottom:10px;">Savatingiz bo'sh</h2>
            <p style="color:#666;margin-bottom:25px;">Mahsulotlarni qo'shish uchun do'konimizni ko'ring</p>
            <a href="products.html" class="btn btn-primary" style="display:inline-block;padding:14px 30px;background:#ff6a00;color:#fff;text-decoration:none;border-radius:8px;">
              <i class="fa-solid fa-shopping-bag"></i> Xarid qilish
            </a>
          </div>
        `;
      }
      if (summaryEl) summaryEl.style.display = "none";
      if (actionsEl) actionsEl.style.display = "none";
      updateTotals();
      return;
    }

    if (emptyEl) emptyEl.innerHTML = "";
    if (summaryEl) summaryEl.style.display = "";
    if (actionsEl) actionsEl.style.display = "";

    // Header
    tableEl.innerHTML = `
      <div class="cart-header" style="display:grid;grid-template-columns:3fr 1fr 1fr 1fr 80px;gap:15px;padding:15px 0;border-bottom:2px solid #eee;font-weight:600;color:#374151;">
        <span>Mahsulot</span>
        <span style="text-align:center;">Narx</span>
        <span style="text-align:center;">Miqdor</span>
        <span style="text-align:center;">Jami</span>
        <span></span>
      </div>
      ${items.map(item => `
        <div class="cart-row" data-id="${item.id}" style="display:grid;grid-template-columns:3fr 1fr 1fr 1fr 80px;gap:15px;padding:20px 0;border-bottom:1px solid #eee;align-items:center;">
          <div class="cart-product" style="display:flex;align-items:center;gap:15px;">
            <a href="product-detail.html?slug=${item.slug}">
              <img src="${item.image}" alt="${item.name}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;">
            </a>
            <div>
              <a href="product-detail.html?slug=${item.slug}" style="color:#111;text-decoration:none;font-weight:500;">${item.name}</a>
              ${item.stock < 5 ? `<small style="display:block;color:#f59e0b;margin-top:4px;">Faqat ${item.stock} dona qoldi</small>` : ""}
            </div>
          </div>
          <div style="text-align:center;font-weight:600;">${UI.formatPrice(item.price)}</div>
          <div class="cart-qty" style="display:flex;align-items:center;justify-content:center;gap:5px;">
            <button class="qty-btn qty-decrease" data-id="${item.id}" style="width:32px;height:32px;border:1px solid #ddd;background:#f5f5f5;border-radius:6px;cursor:pointer;">−</button>
            <input type="number" class="qty-input" data-id="${item.id}" value="${item.qty}" min="1" max="${item.stock}" style="width:50px;height:32px;text-align:center;border:1px solid #ddd;border-radius:6px;">
            <button class="qty-btn qty-increase" data-id="${item.id}" style="width:32px;height:32px;border:1px solid #ddd;background:#f5f5f5;border-radius:6px;cursor:pointer;">+</button>
          </div>
          <div style="text-align:center;font-weight:700;color:#ff6a00;">${UI.formatPrice(item.subtotal)}</div>
          <div style="text-align:center;">
            <button class="remove-item" data-id="${item.id}" style="background:#fee2e2;color:#dc2626;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;" title="O'chirish">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `).join("")}
    `;

    updateTotals();
  }

  function updateTotals() {
    const subtotal = Store.getCartSubtotal();
    const shipping = Store.getShippingFee();
    const total = Store.getCartTotal();

    const subtotalEl = document.getElementById("cart-subtotal");
    const shippingEl = document.getElementById("cart-shipping");
    const totalEl = document.getElementById("cart-total");
    const grandEl = document.getElementById("cart-grand-total");

    if (subtotalEl) subtotalEl.textContent = UI.formatPrice(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? "Bepul" : UI.formatPrice(shipping);
    if (totalEl) totalEl.textContent = UI.formatPrice(total);
    if (grandEl) grandEl.textContent = UI.formatPrice(total);

    // Shipping note
    const noteEl = document.getElementById("shipping-note");
    if (noteEl) {
      if (subtotal < 299 && subtotal > 0) {
        const remaining = 299 - subtotal;
        noteEl.innerHTML = `<span style="color:#f59e0b;"><i class="fa-solid fa-info-circle"></i> Yana ${UI.formatPrice(remaining)} xarid qiling va bepul yetkazib berishga ega bo'ling!</span>`;
      } else if (subtotal >= 299) {
        noteEl.innerHTML = `<span style="color:#22c55e;"><i class="fa-solid fa-check-circle"></i> Bepul yetkazib berish!</span>`;
      } else {
        noteEl.innerHTML = "";
      }
    }
  }

  function init() {
    renderCart();

    // Event delegation for cart controls
    document.body.addEventListener("click", (e) => {
      const inc = e.target.closest(".qty-increase");
      const dec = e.target.closest(".qty-decrease");
      const rem = e.target.closest(".remove-item");

      if (inc) {
        e.preventDefault();
        Store.incrementCartItem(inc.dataset.id);
      } else if (dec) {
        e.preventDefault();
        Store.decrementCartItem(dec.dataset.id);
      } else if (rem) {
        e.preventDefault();
        Store.removeFromCart(rem.dataset.id);
        UI.toast("info", "Mahsulot o'chirildi");
      }
    });

    // Qty input change
    document.body.addEventListener("change", (e) => {
      const inp = e.target.closest(".qty-input");
      if (!inp) return;
      const val = Math.max(1, parseInt(inp.value) || 1);
      inp.value = val;
      Store.updateCartQty(inp.dataset.id, val);
    });

    // Clear cart button
    document.getElementById("clear-cart")?.addEventListener("click", () => {
      if (confirm("Savatchani tozalashni xohlaysizmi?")) {
        Store.clearCart();
        UI.toast("info", "Savatcha tozalandi");
      }
    });

    // Listen for cart updates
    window.addEventListener("cart:updated", renderCart);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
