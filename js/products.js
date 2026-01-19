
(function() {
  "use strict";

  if (!document.getElementById("products-grid")) return;

  const PRODUCTS_PER_PAGE = 12;

  let state = {
    search: "",
    categories: ["all"],
    brands: ["all"],
    minPrice: 0,
    maxPrice: 1000,
    sort: "popular",
    page: 1,
    viewMode: "grid"
  };

  function getProducts() {
    return window.products || [];
  }

  function getCategories() {
    return window.categories || [];
  }

  function getBrands() {
    return window.brands || [];
  }

  function getPriceRange() {
    const products = getProducts();
    if (!products.length) return { min: 0, max: 1000 };
    const prices = products.map(p => p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    };
  }

  function getCategoryName(catId) {
    const cat = getCategories().find(c => c.id === catId);
    return cat ? cat.name : catId;
  }

  function filterProducts() {
    let products = getProducts().slice();

    
    if (state.search.trim()) {
      const q = state.search.toLowerCase().trim();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    
    if (state.categories.length && !state.categories.includes("all")) {
      products = products.filter(p => state.categories.includes(p.category));
    }

    
    if (state.brands.length && !state.brands.includes("all")) {
      products = products.filter(p => state.brands.includes(p.brand));
    }

    
    products = products.filter(p => p.price >= state.minPrice && p.price <= state.maxPrice);

    
    switch (state.sort) {
      case "price-asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        products.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        products.sort((a, b) => b.id - a.id);
        break;
      case "popular":
      default:
        products.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
        break;
    }

    return products;
  }

  function paginate(products) {
    const start = (state.page - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    return products.slice(start, end);
  }

  function renderProducts() {
    const container = document.getElementById("products-grid");
    if (!container) return;

    const allFiltered = filterProducts();
    const products = paginate(allFiltered);

    
    const countEl = document.querySelector(".results-count");
    if (countEl) countEl.textContent = `${allFiltered.length} ta mahsulot topildi`;

    
    if (!products.length) {
      container.innerHTML = `
        <div class="no-products" style="grid-column:1/-1;text-align:center;padding:60px 20px;">
          <i class="fa-solid fa-box-open" style="font-size:48px;color:#ccc;margin-bottom:20px;display:block;"></i>
          <h3 style="margin-bottom:10px;">Mahsulot topilmadi</h3>
          <p style="color:#666;">Filtrlarni o'zgartirib ko'ring</p>
        </div>
      `;
      renderPagination(0);
      return;
    }

    
    container.innerHTML = products.map(p => UI.createProductCard(p)).join("");
    container.className = state.viewMode === "list" ? "products-grid list-view" : "products-grid";

    
    renderPagination(allFiltered.length);
  }

  function renderPagination(totalItems) {
    const container = document.querySelector(".pagination");
    if (!container) return;

    const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);
    
    if (totalPages <= 1) {
      container.innerHTML = "";
      return;
    }

    let html = `<button class="page-btn prev" ${state.page <= 1 ? "disabled" : ""}>‹</button>`;

    for (let i = 1; i <= totalPages; i++) {
      if (totalPages > 7) {
        if (i === 1 || i === totalPages || (i >= state.page - 1 && i <= state.page + 1)) {
          html += `<button class="page-btn ${i === state.page ? "active" : ""}" data-page="${i}">${i}</button>`;
        } else if (i === state.page - 2 || i === state.page + 2) {
          html += `<span class="page-dots">...</span>`;
        }
      } else {
        html += `<button class="page-btn ${i === state.page ? "active" : ""}" data-page="${i}">${i}</button>`;
      }
    }

    html += `<button class="page-btn next" ${state.page >= totalPages ? "disabled" : ""}>›</button>`;
    container.innerHTML = html;
  }

  function renderFilters() {
    const priceRange = getPriceRange();
    state.maxPrice = priceRange.max;

    
    const categoryContainer = document.querySelector(".filter-categories");
    if (categoryContainer) {
      categoryContainer.innerHTML = getCategories().map(c => `
        <label>
          <input type="checkbox" name="category" value="${c.id}" ${state.categories.includes(c.id) ? "checked" : ""}>
          ${c.name}
        </label>
      `).join("");
    }

    
    const brandContainer = document.querySelector(".filter-brands");
    if (brandContainer) {
      brandContainer.innerHTML = getBrands().map(b => `
        <label>
          <input type="checkbox" name="brand" value="${b.id}" ${state.brands.includes(b.id) ? "checked" : ""}>
          ${b.name}
        </label>
      `).join("");
    }

    
    const rangeEl = document.getElementById("price-range");
    if (rangeEl) {
      rangeEl.min = priceRange.min;
      rangeEl.max = priceRange.max;
      rangeEl.value = state.maxPrice;
    }

    const rangeValueEl = document.querySelector(".price-range");
    if (rangeValueEl) {
      rangeValueEl.textContent = `$${state.minPrice} — $${state.maxPrice}`;
    }

    
    const sortEl = document.getElementById("sort");
    if (sortEl) {
      sortEl.value = state.sort;
    }

    
    const searchEl = document.getElementById("search-input");
    if (searchEl) {
      searchEl.value = state.search;
    }
  }

  function parseUrlParams() {
    const params = new URLSearchParams(location.search);
    
    if (params.get("search")) state.search = params.get("search");
    if (params.get("category")) state.categories = [params.get("category")];
    if (params.get("brand")) state.brands = [params.get("brand")];
    if (params.get("sort")) state.sort = params.get("sort");
    if (params.get("page")) state.page = parseInt(params.get("page")) || 1;
  }

  function init() {
    parseUrlParams();
    renderFilters();
    renderProducts();

    
    document.getElementById("sort")?.addEventListener("change", e => {
      state.sort = e.target.value;
      state.page = 1;
      const mobileSort = document.getElementById("mobile-sort");
      if (mobileSort) mobileSort.value = state.sort;
      renderProducts();
    });

    
    document.getElementById("mobile-sort")?.addEventListener("change", e => {
      state.sort = e.target.value;
      state.page = 1;
      const desktopSort = document.getElementById("sort");
      if (desktopSort) desktopSort.value = state.sort;
      renderProducts();
    });

    
    document.getElementById("price-range")?.addEventListener("input", e => {
      state.maxPrice = Number(e.target.value);
      const rangeValueEl = document.querySelector(".price-range");
      if (rangeValueEl) rangeValueEl.textContent = `$${state.minPrice} — $${state.maxPrice}`;
    });

    document.getElementById("price-range")?.addEventListener("change", () => {
      state.page = 1;
      renderProducts();
    });

    
    document.getElementById("search-input")?.addEventListener("input", UI.debounce(e => {
      state.search = e.target.value;
      state.page = 1;
      renderProducts();
    }, 300));

    
    document.querySelector(".filters")?.addEventListener("change", e => {
      if (e.target.name === "category") {
        const allBox = document.querySelector('input[name="category"][value="all"]');
        if (e.target.value === "all" && e.target.checked) {
          document.querySelectorAll('input[name="category"]').forEach(cb => {
            if (cb !== e.target) cb.checked = false;
          });
        } else {
          if (allBox) allBox.checked = false;
        }

        const selected = Array.from(document.querySelectorAll('input[name="category"]:checked'))
          .map(cb => cb.value);
        if (!selected.length && allBox) {
          allBox.checked = true;
          state.categories = ["all"];
        } else {
          state.categories = selected.length ? selected : ["all"];
        }
        state.page = 1;
        renderProducts();
      }

      if (e.target.name === "brand") {
        const allBox = document.querySelector('input[name="brand"][value="all"]');
        if (e.target.value === "all" && e.target.checked) {
          document.querySelectorAll('input[name="brand"]').forEach(cb => {
            if (cb !== e.target) cb.checked = false;
          });
        } else {
          if (allBox) allBox.checked = false;
        }

        const selected = Array.from(document.querySelectorAll('input[name="brand"]:checked'))
          .map(cb => cb.value);
        if (!selected.length && allBox) {
          allBox.checked = true;
          state.brands = ["all"];
        } else {
          state.brands = selected.length ? selected : ["all"];
        }
        state.page = 1;
        renderProducts();
      }
    });

    
    document.querySelector(".clear-filter")?.addEventListener("click", () => {
      state = {
        search: "",
        categories: ["all"],
        brands: ["all"],
        minPrice: 0,
        maxPrice: getPriceRange().max,
        sort: "popular",
        page: 1,
        viewMode: state.viewMode
      };
      renderFilters();
      renderProducts();
    });

    
    document.querySelectorAll(".view-toggle button").forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".view-toggle button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.viewMode = idx === 0 ? "grid" : "list";
        const container = document.getElementById("products-grid");
        if (container) {
          container.className = state.viewMode === "list" ? "products-grid list-view" : "products-grid";
        }
      });
    });

    
    document.querySelector(".pagination")?.addEventListener("click", e => {
      const btn = e.target.closest(".page-btn");
      if (!btn || btn.disabled) return;

      const allFiltered = filterProducts();
      const totalPages = Math.ceil(allFiltered.length / PRODUCTS_PER_PAGE);

      if (btn.classList.contains("prev")) {
        state.page = Math.max(1, state.page - 1);
      } else if (btn.classList.contains("next")) {
        state.page = Math.min(totalPages, state.page + 1);
      } else if (btn.dataset.page) {
        state.page = parseInt(btn.dataset.page);
      }

      renderProducts();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    
    document.querySelector(".filter-btn")?.addEventListener("click", () => {
      const filters = document.querySelector(".filters");
      if (filters) {
        filters.classList.toggle("show");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
