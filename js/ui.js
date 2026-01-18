/**
 * UI.JS - UI Utilities, Toast, Header Updates
 */
(function() {
  "use strict";
  if (window.UI && window.UI._initialized) return;

  const TOAST_ID = "site-toast";
  let toastTimer = null;

  function getToastEl() {
    let el = document.getElementById(TOAST_ID);
    if (!el) {
      el = document.createElement("div");
      el.id = TOAST_ID;
      el.style.cssText = "position:fixed;top:20px;right:20px;z-index:99999;min-width:250px;max-width:350px;font-family:sans-serif;";
      document.body.appendChild(el);
    }
    return el;
  }

  function getBasePath() {
    const path = location.pathname;
    if (path.includes("/auth/")) {
      return "../";
    }
    return "";
  }

  window.UI = {
    _initialized: true,

    toast(type, message, timeout = 3000) {
      if (typeof type === "string" && !message) {
        message = type;
        type = "info";
      }
      const root = getToastEl();
      const bg = type === "success" ? "#22c55e" : type === "error" ? "#ef4444" : "#3b82f6";
      const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";
      root.innerHTML = `
        <div style="background:${bg};color:#fff;padding:14px 18px;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.2);margin-bottom:8px;display:flex;align-items:center;gap:10px;">
          <span style="font-size:18px;">${icon}</span>
          <span>${message}</span>
        </div>
      `;
      
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { root.innerHTML = ""; }, timeout);
    },

    updateCartCount() {
      const count = window.Store ? Store.getCartCount() : 0;
      document.querySelectorAll("#cart-count, .cart-count").forEach(el => {
        el.textContent = count;
      });
    },

    updateWishlistCount() {
      const count = window.Store ? Store.getWishlistCount() : 0;
      document.querySelectorAll("#wishlist-count, .wishlist-count").forEach(el => {
        el.textContent = count;
      });
    },

    updateProfileLink() {
      const isLoggedIn = window.Store ? Store.isLoggedIn() : false;
      const basePath = getBasePath();
      
      document.querySelectorAll('[data-action="profile"], #nav-profile').forEach(el => {
        if (el.tagName === "A") {
          el.href = isLoggedIn ? basePath + "profile.html" : basePath + "auth/login.html";
        }
      });

      // Update profile text if exists
      const user = window.Store ? Store.getUser() : null;
      document.querySelectorAll(".user-name, #user-name").forEach(el => {
        el.textContent = user ? user.name : "Profile";
      });
    },

    formatPrice(price) {
      return "$" + Number(price || 0).toFixed(2);
    },

    renderStars(rating) {
      const r = Math.round(Number(rating) || 0);
      const full = Math.min(5, Math.max(0, r));
      return "★".repeat(full) + "☆".repeat(5 - full);
    },

    renderStarsHTML(rating) {
      const r = Number(rating) || 0;
      const full = Math.floor(r);
      const half = r % 1 >= 0.5 ? 1 : 0;
      const empty = 5 - full - half;
      let html = "";
      for (let i = 0; i < full; i++) html += '<i class="fa-solid fa-star"></i>';
      if (half) html += '<i class="fa-solid fa-star-half-stroke"></i>';
      for (let i = 0; i < empty; i++) html += '<i class="fa-regular fa-star"></i>';
      return html;
    },

    setupHeaderSearch() {
      const searchInput = document.querySelector(".search-box input[type='search'], #search, #header-search");
      const searchBtn = document.querySelector(".search-box button, #search-btn");
      const basePath = getBasePath();

      function doSearch() {
        const query = searchInput ? searchInput.value.trim() : "";
        if (query) {
          location.href = basePath + "products.html?search=" + encodeURIComponent(query);
        }
      }

      if (searchBtn) {
        searchBtn.addEventListener("click", (e) => {
          e.preventDefault();
          doSearch();
        });
      }

      if (searchInput) {
        searchInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            doSearch();
          }
        });
      }
    },

    createProductCard(product, options = {}) {
      const basePath = options.basePath || "";
      const isWishlisted = window.Store ? Store.isInWishlist(product.id) : false;
      const heartClass = isWishlisted ? "fa-solid" : "fa-regular";
      const heartColor = isWishlisted ? "color:#ef4444;" : "";

      const badges = (product.badges || []).map(badge => {
        if (badge === "sale") return '<span class="badge sale-badge">SALE</span>';
        if (badge === "new") return '<span class="badge new-badge">NEW</span>';
        if (badge === "popular") return '<span class="badge popular-badge">TOP</span>';
        if (badge === "bestseller") return '<span class="badge bestseller-badge">BEST</span>';
        return "";
      }).join("");

      const categoryName = window.categories 
        ? (window.categories.find(c => c.id === product.category)?.name || product.category)
        : product.category;

      return `
        <div class="product-card" data-id="${product.id}">
          ${badges}
          <button class="wishlist-btn" data-id="${product.id}" title="Sevimlilar">
            <i class="${heartClass} fa-heart" style="${heartColor}"></i>
          </button>
          <div class="product-image">
            <a href="${basePath}product-detail.html?slug=${product.slug}">
              <img src="${basePath}${product.images[0] || 'assets/images/placeholder.jpg'}" alt="${product.name}" loading="lazy">
            </a>
          </div>
          <small class="category">${categoryName}</small>
          <h4><a href="${basePath}product-detail.html?slug=${product.slug}">${product.name}</a></h4>
          <div class="rating">${this.renderStars(product.rating)} <span>(${product.reviewsCount || 0})</span></div>
          <div class="product-bottom">
            <div class="price-wrap">
              <span class="price">${this.formatPrice(product.price)}</span>
              ${product.oldPrice ? `<span class="old-price">${this.formatPrice(product.oldPrice)}</span>` : ""}
            </div>
            <button class="add-to-cart cart-btn" data-id="${product.id}" ${!product.inStock ? "disabled" : ""}>
              <i class="fa-solid fa-cart-shopping"></i>
            </button>
          </div>
        </div>
      `;
    },

    debounce(fn, delay) {
      let timer;
      return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    }
  };

  // Event listeners
  window.addEventListener("cart:updated", () => UI.updateCartCount());
  window.addEventListener("wishlist:updated", () => UI.updateWishlistCount());
  window.addEventListener("auth:changed", () => UI.updateProfileLink());

  document.addEventListener("DOMContentLoaded", () => {
    UI.updateCartCount();
    UI.updateWishlistCount();
    UI.updateProfileLink();
    UI.setupHeaderSearch();

    // Global add-to-cart handler
    document.body.addEventListener("click", (e) => {
      const btn = e.target.closest(".add-to-cart");
      if (!btn) return;
      e.preventDefault();

      const id = btn.dataset.id;
      if (!id) {
        UI.toast("error", "Mahsulot topilmadi");
        return;
      }

      const product = Store.getProductById(id);
      if (!product) {
        UI.toast("error", "Mahsulot topilmadi");
        return;
      }

      if (!product.inStock || product.stock <= 0) {
        UI.toast("error", "Mahsulot omborda yo'q");
        return;
      }

      const added = Store.addToCart(product.id, 1);
      if (added) {
        UI.toast("success", `${product.name} savatchaga qo'shildi`);
      }
    });

    // Global wishlist toggle handler
    document.body.addEventListener("click", (e) => {
      const btn = e.target.closest(".wishlist-btn, .like-btn");
      if (!btn) return;
      e.preventDefault();

      const id = btn.dataset.id;
      if (!id) return;

      const wasAdded = Store.toggleWishlist(id);
      const icon = btn.querySelector("i");
      
      if (icon) {
        if (wasAdded) {
          icon.classList.remove("fa-regular");
          icon.classList.add("fa-solid");
          icon.style.color = "#ef4444";
          UI.toast("success", "Sevimlilarga qo'shildi");
        } else {
          icon.classList.remove("fa-solid");
          icon.classList.add("fa-regular");
          icon.style.color = "";
          UI.toast("info", "Sevimlilardan o'chirildi");
        }
      }

      // Refresh wishlist page if on it
      if (location.pathname.includes("wishlist.html") && typeof renderWishlist === "function") {
        renderWishlist();
      }
    });
  });
})();
