
(function() {
  "use strict";

  if (!location.pathname.includes("cart.html")) return;

  function renderCart() {
    const tableEl = document.getElementById("cart-table");
    const emptyEl = document.getElementById("cart-empty");
    const summaryEl = document.querySelector(".cart-summary");

    if (!tableEl) return;

    const items = Store.getCartDetails();

    if (!items.length) {
      tableEl.innerHTML = "";
      if (emptyEl) {
        emptyEl.innerHTML = `
          <div class="cart-empty">
            <i class="fa-solid fa-cart-shopping"></i>
            <h2>Savatingiz bo'sh</h2>
            <p>Mahsulotlarni qo'shish uchun do'konimizni ko'ring</p>
            <a href="products.html" class="btn-primary">
              <i class="fa-solid fa-shopping-bag"></i> Xarid qilish
            </a>
          </div>
        `;
      }
      if (summaryEl) summaryEl.style.display = "none";
      updateTotals();
      updateMobileCheckout(true);
      return;
    }

    if (emptyEl) emptyEl.innerHTML = "";
    if (summaryEl) summaryEl.style.display = "";

    tableEl.innerHTML = items.map(item => `
      <div class="cart-row" data-id="${item.id}">
        <div class="cart-product">
          <a href="product-detail.html?slug=${item.slug}">
            <img src="${item.image}" alt="${item.name}">
          </a>
          <div class="cart-product-info">
            <h4><a href="product-detail.html?slug=${item.slug}">${item.name}</a></h4>
            <small>${UI.formatPrice(item.price)}</small>
            ${item.stock < 5 ? `<small class="stock-warning">Faqat ${item.stock} dona qoldi</small>` : ""}
          </div>
        </div>
        <div class="cart-row-bottom">
          <div class="cart-qty">
            <button class="qty-btn qty-decrease" data-id="${item.id}" aria-label="Kamaytirish">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn qty-increase" data-id="${item.id}" aria-label="Oshirish">+</button>
          </div>
          <div class="cart-subtotal">${UI.formatPrice(item.subtotal)}</div>
          <div class="cart-action">
            <button class="wishlist-btn move-to-wishlist" data-id="${item.id}" title="Sevimlilarga">
              <i class="fa-regular fa-heart"></i>
            </button>
            <button class="remove-btn remove-item" data-id="${item.id}" title="O'chirish">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join("");

    updateTotals();
    updateMobileCheckout(false);
  }

  function updateTotals() {
    const subtotal = Store.getCartSubtotal();
    const shipping = Store.getShippingFee();
    const total = Store.getCartTotal();

    const subtotalEl = document.getElementById("cart-subtotal");
    const shippingEl = document.getElementById("cart-shipping");
    const totalEl = document.getElementById("cart-total");
    const mobileTotal = document.getElementById("mobile-cart-total");

    if (subtotalEl) subtotalEl.textContent = UI.formatPrice(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? "Bepul" : UI.formatPrice(shipping);
    if (totalEl) totalEl.textContent = UI.formatPrice(total);
    if (mobileTotal) mobileTotal.textContent = UI.formatPrice(total);

    const noteEl = document.getElementById("shipping-note");
    if (noteEl) {
      if (subtotal < 299 && subtotal > 0) {
        const remaining = 299 - subtotal;
        noteEl.className = "shipping-note warning";
        noteEl.innerHTML = `<i class="fa-solid fa-info-circle"></i> Yana ${UI.formatPrice(remaining)} xarid qiling va bepul yetkazib berishga ega bo'ling!`;
      } else if (subtotal >= 299) {
        noteEl.className = "shipping-note";
        noteEl.innerHTML = `<i class="fa-solid fa-check-circle"></i> Bepul yetkazib berish!`;
      } else {
        noteEl.innerHTML = "";
      }
    }
  }

  function updateMobileCheckout(isEmpty) {
    const mobileBar = document.querySelector(".mobile-checkout-bar");
    const mobileLink = document.getElementById("mobile-checkout-link");
    const checkoutLink = document.getElementById("checkout-link");
    
    if (mobileBar) {
      mobileBar.style.display = isEmpty ? "none" : "";
    }
    if (mobileLink) {
      if (isEmpty) {
        mobileLink.style.pointerEvents = "none";
        mobileLink.style.opacity = "0.5";
      } else {
        mobileLink.style.pointerEvents = "";
        mobileLink.style.opacity = "";
      }
    }
    if (checkoutLink) {
      if (isEmpty) {
        checkoutLink.style.pointerEvents = "none";
        checkoutLink.style.opacity = "0.5";
      } else {
        checkoutLink.style.pointerEvents = "";
        checkoutLink.style.opacity = "";
      }
    }
  }

  function init() {
    renderCart();

    document.body.addEventListener("click", (e) => {
      const inc = e.target.closest(".qty-increase");
      const dec = e.target.closest(".qty-decrease");
      const rem = e.target.closest(".remove-item");
      const wishlist = e.target.closest(".move-to-wishlist");

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
      } else if (wishlist) {
        e.preventDefault();
        const id = wishlist.dataset.id;
        Store.addToWishlist(id);
        Store.removeFromCart(id);
        UI.toast("success", "Sevimlilarga ko'chirildi");
      }
    });

    document.getElementById("clear-cart")?.addEventListener("click", () => {
      if (confirm("Savatchani tozalashni xohlaysizmi?")) {
        Store.clearCart();
        UI.toast("info", "Savatcha tozalandi");
      }
    });

    document.getElementById("mobile-clear-cart")?.addEventListener("click", () => {
      if (confirm("Savatchani tozalashni xohlaysizmi?")) {
        Store.clearCart();
        UI.toast("info", "Savatcha tozalandi");
      }
    });

    window.addEventListener("cart:updated", renderCart);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
