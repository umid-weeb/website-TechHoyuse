/**
 * PRODUCT.JS - Product Detail Page
 * Load product by slug from URL, show related products
 */
(function() {
  "use strict";

  if (!location.pathname.includes("product-detail.html")) return;

  let currentProduct = null;
  let quantity = 1;

  function getSlugFromUrl() {
    const params = new URLSearchParams(location.search);
    return params.get("slug") || params.get("id") || "";
  }

  function getProductBySlug(slug) {
    if (!window.products || !Array.isArray(window.products)) return null;
    return window.products.find(p => p.slug === slug) || null;
  }

  function getRelatedProducts(product, limit = 4) {
    if (!product || !window.products) return [];
    return window.products
      .filter(p => p.id !== product.id && p.category === product.category)
      .slice(0, limit);
  }

  function getCategoryName(catId) {
    if (!window.categories) return catId;
    const cat = window.categories.find(c => c.id === catId);
    return cat ? cat.name : catId;
  }

  function renderNotFound() {
    const main = document.querySelector("main");
    if (main) {
      main.innerHTML = `
        <div class="product-not-found">
          <i class="fa-solid fa-box-open"></i>
          <h1>Mahsulot topilmadi</h1>
          <p>Kechirasiz, siz qidirgan mahsulot mavjud emas yoki o'chirilgan.</p>
          <a href="products.html" class="btn-primary">
            <i class="fa-solid fa-arrow-left"></i> Mahsulotlarga qaytish
          </a>
        </div>
      `;
    }

    const related = document.querySelector(".related-products");
    if (related) related.style.display = "none";
    
    const mobileBar = document.getElementById("mobile-product-bar");
    if (mobileBar) mobileBar.style.display = "none";
  }

  function renderProduct(product) {
    currentProduct = product;
    document.title = `${product.name} | Tech House`;

    const imgEl = document.getElementById("product-main-image");
    if (imgEl) {
      imgEl.src = product.images[0] || "assets/images/placeholder.jpg";
      imgEl.alt = product.name;
    }

    const titleEl = document.getElementById("product-title");
    if (titleEl) titleEl.textContent = product.name;

    const mobileTitleEl = document.getElementById("mobile-product-title");
    if (mobileTitleEl) {
      mobileTitleEl.textContent = product.name.length > 25 
        ? product.name.substring(0, 25) + "..." 
        : product.name;
    }

    const breadcrumbEl = document.getElementById("product-breadcrumb");
    if (breadcrumbEl) breadcrumbEl.textContent = product.name;

    const categoryEl = document.getElementById("product-category");
    if (categoryEl) categoryEl.textContent = getCategoryName(product.category);

    const priceEl = document.getElementById("product-price");
    if (priceEl) {
      priceEl.innerHTML = `
        <span class="current-price">${UI.formatPrice(product.price)}</span>
        ${product.oldPrice ? `<span class="old-price">${UI.formatPrice(product.oldPrice)}</span>` : ""}
      `;
    }

    const mobilePrice = document.getElementById("mobile-product-price");
    if (mobilePrice) mobilePrice.textContent = UI.formatPrice(product.price);

    const ratingEl = document.getElementById("product-rating");
    if (ratingEl) {
      ratingEl.innerHTML = `${UI.renderStars(product.rating)} <span>(${product.reviewsCount || 0} sharhlar)</span>`;
    }

    const descEl = document.getElementById("product-description");
    if (descEl) descEl.textContent = product.description || "";

    const stockEl = document.getElementById("product-stock");
    if (stockEl) {
      if (product.inStock && product.stock > 0) {
        stockEl.innerHTML = `<span class="in-stock"><i class="fa-solid fa-check-circle"></i> Mavjud (${product.stock} dona)</span>`;
      } else {
        stockEl.innerHTML = `<span class="out-of-stock"><i class="fa-solid fa-times-circle"></i> Mavjud emas</span>`;
      }
    }

    const actionsEl = document.getElementById("product-actions");
    if (actionsEl) {
      const isWishlisted = Store.isInWishlist(product.id);
      actionsEl.innerHTML = `
        <div class="qty-controls">
          <span>Miqdor:</span>
          <button class="qty-btn qty-minus" aria-label="Kamaytirish">−</button>
          <input type="number" id="qty-input" value="1" min="1" max="${product.stock}">
          <button class="qty-btn qty-plus" aria-label="Oshirish">+</button>
        </div>
        <div class="action-buttons">
          <button class="add-to-cart btn-primary" id="desktop-add-cart" data-id="${product.id}" ${!product.inStock ? "disabled" : ""}>
            <i class="fa-solid fa-cart-shopping"></i>
            Savatchaga qo'shish
          </button>
          <button class="wishlist-btn" id="desktop-wishlist" data-id="${product.id}" aria-label="Sevimlilar">
            <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart" style="${isWishlisted ? 'color:#ef4444;' : ''}"></i>
          </button>
        </div>
      `;

      const qtyMinus = actionsEl.querySelector(".qty-minus");
      const qtyPlus = actionsEl.querySelector(".qty-plus");
      const qtyInput = actionsEl.querySelector("#qty-input");

      qtyMinus?.addEventListener("click", () => {
        quantity = Math.max(1, quantity - 1);
        if (qtyInput) qtyInput.value = quantity;
      });

      qtyPlus?.addEventListener("click", () => {
        quantity = Math.min(product.stock, quantity + 1);
        if (qtyInput) qtyInput.value = quantity;
      });

      qtyInput?.addEventListener("change", (e) => {
        quantity = Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1));
        e.target.value = quantity;
      });

      document.getElementById("desktop-add-cart")?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart();
      });
    }

    setupMobileActions(product);
    renderRelatedProducts(product);
  }

  function setupMobileActions(product) {
    const mobileAddCart = document.getElementById("mobile-add-cart");
    const mobileWishlist = document.getElementById("mobile-wishlist-toggle");

    if (mobileAddCart) {
      if (!product.inStock) {
        mobileAddCart.disabled = true;
        mobileAddCart.textContent = "Mavjud emas";
      }

      mobileAddCart.addEventListener("click", (e) => {
        e.preventDefault();
        addToCart();
      });
    }

    if (mobileWishlist) {
      const isWishlisted = Store.isInWishlist(product.id);
      updateWishlistButton(mobileWishlist, isWishlisted);

      mobileWishlist.addEventListener("click", (e) => {
        e.preventDefault();
        const wasAdded = Store.toggleWishlist(product.id);
        updateWishlistButton(mobileWishlist, wasAdded);
        
        const desktopBtn = document.getElementById("desktop-wishlist");
        if (desktopBtn) {
          updateWishlistButton(desktopBtn, wasAdded);
        }

        UI.toast(wasAdded ? "success" : "info", 
          wasAdded ? "Sevimlilarga qo'shildi" : "Sevimlilardan o'chirildi");
      });
    }
  }

  function updateWishlistButton(btn, isActive) {
    const icon = btn.querySelector("i");
    if (icon) {
      icon.className = isActive ? "fa-solid fa-heart" : "fa-regular fa-heart";
      icon.style.color = isActive ? "#ef4444" : "";
    }
    btn.classList.toggle("active", isActive);
  }

  function addToCart() {
    if (!currentProduct) return;

    if (!currentProduct.inStock || currentProduct.stock <= 0) {
      UI.toast("error", "Mahsulot omborda yo'q");
      return;
    }

    const added = Store.addToCart(currentProduct.id, quantity);
    if (added) {
      UI.toast("success", `${currentProduct.name} savatchaga qo'shildi`);
    }
  }

  function renderRelatedProducts(product) {
    const container = document.getElementById("related-grid");
    const section = document.querySelector(".related-products");
    
    if (!container || !section) return;

    const related = getRelatedProducts(product, 4);
    
    if (!related.length) {
      section.style.display = "none";
      return;
    }

    section.style.display = "block";
    container.innerHTML = related.map(p => `
      <div class="related-card">
        <a href="product-detail.html?slug=${p.slug}">
          <img src="${p.images[0] || 'assets/images/placeholder.jpg'}" alt="${p.name}" loading="lazy">
        </a>
        <h4><a href="product-detail.html?slug=${p.slug}">${p.name}</a></h4>
        <div class="rating">${UI.renderStars(p.rating)}</div>
        <span class="price">${UI.formatPrice(p.price)}</span>
      </div>
    `).join("");
  }

  function init() {
    const slug = getSlugFromUrl();
    
    if (!slug) {
      renderNotFound();
      return;
    }

    const product = getProductBySlug(slug);
    
    if (!product) {
      renderNotFound();
      return;
    }

    renderProduct(product);

    if (window.Store) {
      let viewed = JSON.parse(localStorage.getItem("techhouse_recently_viewed") || "[]");
      viewed = viewed.filter(id => id !== product.id);
      viewed.unshift(product.id);
      viewed = viewed.slice(0, 10);
      localStorage.setItem("techhouse_recently_viewed", JSON.stringify(viewed));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
