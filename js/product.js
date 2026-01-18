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
        <div style="text-align:center;padding:80px 20px;max-width:500px;margin:0 auto;">
          <i class="fa-solid fa-box-open" style="font-size:64px;color:#ccc;margin-bottom:20px;"></i>
          <h1 style="font-size:28px;margin-bottom:15px;">Mahsulot topilmadi</h1>
          <p style="color:#666;margin-bottom:30px;">Kechirasiz, siz qidirgan mahsulot mavjud emas yoki o'chirilgan.</p>
          <a href="products.html" style="display:inline-block;padding:14px 30px;background:#ff6a00;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
            <i class="fa-solid fa-arrow-left"></i> Mahsulotlarga qaytish
          </a>
        </div>
      `;
    }

    // Hide related products section
    const related = document.querySelector(".related-products");
    if (related) related.style.display = "none";
  }

  function renderProduct(product) {
    currentProduct = product;
    document.title = `${product.name} | Tech House`;

    // Update main product info
    const imgEl = document.querySelector(".product-image img");
    if (imgEl) {
      imgEl.src = product.images[0] || "assets/images/placeholder.jpg";
      imgEl.alt = product.name;
    }

    const titleEl = document.querySelector(".product-title");
    if (titleEl) titleEl.textContent = product.name;

    const priceEl = document.querySelector(".product-price");
    if (priceEl) {
      priceEl.innerHTML = `
        <span class="current-price">${UI.formatPrice(product.price)}</span>
        ${product.oldPrice ? `<span class="old-price" style="text-decoration:line-through;color:#999;margin-left:10px;font-size:18px;">${UI.formatPrice(product.oldPrice)}</span>` : ""}
      `;
    }

    // Description
    const descEl = document.querySelector(".product-description");
    if (descEl) {
      descEl.textContent = product.description || "";
    } else {
      const infoContainer = document.querySelector(".product-info");
      if (infoContainer && product.description) {
        const desc = document.createElement("p");
        desc.className = "product-description";
        desc.style.cssText = "color:#555;line-height:1.7;margin:15px 0;";
        desc.textContent = product.description;
        const priceEl = infoContainer.querySelector(".product-price");
        if (priceEl) priceEl.after(desc);
      }
    }

    // Rating
    let ratingEl = document.querySelector(".product-rating");
    if (!ratingEl) {
      const infoContainer = document.querySelector(".product-info");
      if (infoContainer) {
        ratingEl = document.createElement("div");
        ratingEl.className = "product-rating";
        ratingEl.style.cssText = "margin:10px 0;font-size:14px;color:#f59e0b;";
        const titleEl = infoContainer.querySelector(".product-title");
        if (titleEl) titleEl.after(ratingEl);
      }
    }
    if (ratingEl) {
      ratingEl.innerHTML = `${UI.renderStars(product.rating)} <span style="color:#666;">(${product.reviewsCount || 0} sharhlar)</span>`;
    }

    // Category
    let catEl = document.querySelector(".product-category");
    if (!catEl) {
      const infoContainer = document.querySelector(".product-info");
      if (infoContainer) {
        catEl = document.createElement("small");
        catEl.className = "product-category";
        catEl.style.cssText = "color:#6b7280;display:block;margin-bottom:5px;";
        const titleEl = infoContainer.querySelector(".product-title");
        if (titleEl) titleEl.before(catEl);
      }
    }
    if (catEl) catEl.textContent = getCategoryName(product.category);

    // Stock status
    let stockEl = document.querySelector(".product-stock");
    if (!stockEl) {
      const infoContainer = document.querySelector(".product-info");
      if (infoContainer) {
        stockEl = document.createElement("div");
        stockEl.className = "product-stock";
        stockEl.style.cssText = "margin:15px 0;";
        const descEl = infoContainer.querySelector(".product-description");
        if (descEl) descEl.after(stockEl);
        else {
          const priceEl = infoContainer.querySelector(".product-price");
          if (priceEl) priceEl.after(stockEl);
        }
      }
    }
    if (stockEl) {
      if (product.inStock && product.stock > 0) {
        stockEl.innerHTML = `<span style="color:#22c55e;font-weight:600;"><i class="fa-solid fa-check-circle"></i> Mavjud (${product.stock} dona)</span>`;
      } else {
        stockEl.innerHTML = `<span style="color:#ef4444;font-weight:600;"><i class="fa-solid fa-times-circle"></i> Mavjud emas</span>`;
      }
    }

    // Actions container
    const actionsEl = document.querySelector(".product-actions");
    if (actionsEl) {
      const isWishlisted = Store.isInWishlist(product.id);
      actionsEl.innerHTML = `
        <div class="qty-controls" style="display:flex;align-items:center;gap:10px;margin-bottom:15px;">
          <span style="font-weight:600;">Miqdor:</span>
          <button class="qty-btn qty-minus" style="width:36px;height:36px;border:1px solid #ddd;background:#f5f5f5;border-radius:6px;cursor:pointer;font-size:18px;">−</button>
          <input type="number" id="qty-input" value="1" min="1" max="${product.stock}" style="width:60px;height:36px;text-align:center;border:1px solid #ddd;border-radius:6px;font-size:16px;">
          <button class="qty-btn qty-plus" style="width:36px;height:36px;border:1px solid #ddd;background:#f5f5f5;border-radius:6px;cursor:pointer;font-size:18px;">+</button>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="add-to-cart btn btn-primary" data-id="${product.id}" ${!product.inStock ? "disabled" : ""} style="flex:1;display:flex;align-items:center;justify-content:center;gap:10px;">
            <i class="fa-solid fa-cart-shopping"></i>
            Savatchaga qo'shish
          </button>
          <button class="wishlist-btn" data-id="${product.id}" style="width:50px;height:50px;border:1px solid #ddd;background:#fff;border-radius:8px;cursor:pointer;font-size:20px;">
            <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart" style="${isWishlisted ? 'color:#ef4444;' : ''}"></i>
          </button>
        </div>
      `;

      // Quantity controls
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

      // Override add to cart for this page to use quantity
      const addBtn = actionsEl.querySelector(".add-to-cart");
      addBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!product.inStock || product.stock <= 0) {
          UI.toast("error", "Mahsulot omborda yo'q");
          return;
        }

        const added = Store.addToCart(product.id, quantity);
        if (added) {
          UI.toast("success", `${product.name} (${quantity} dona) savatchaga qo'shildi`);
        }
      });
    }

    // Render related products
    renderRelatedProducts(product);
  }

  function renderRelatedProducts(product) {
    const container = document.querySelector(".related-grid");
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
        <div class="rating" style="color:#f59e0b;font-size:14px;">${UI.renderStars(p.rating)}</div>
        <span class="price" style="color:#ff6a00;font-weight:700;">${UI.formatPrice(p.price)}</span>
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

    // Track recently viewed
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
