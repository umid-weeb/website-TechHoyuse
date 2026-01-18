/**
 * NAV.JS - Mobile Navigation & Drawer Logic
 * Hamburger menu, filter drawer, bottom nav
 */
(function() {
  "use strict";

  const NAV = {
    drawer: null,
    overlay: null,
    filterDrawer: null,
    isOpen: false,
    isFilterOpen: false,

    init() {
      this.drawer = document.getElementById("mobile-drawer");
      this.overlay = document.getElementById("drawer-overlay");
      this.filterDrawer = document.getElementById("filter-drawer");

      this.bindEvents();
      this.updateUserInfo();
      this.updateBadges();
      this.setupSearch();
      this.setupFilterDrawer();
    },

    bindEvents() {
      document.querySelectorAll(".hamburger-btn, .menu-toggle").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          this.openDrawer();
        });
      });

      document.querySelectorAll(".drawer-close").forEach(el => {
        el.addEventListener("click", () => {
          this.closeDrawer();
        });
      });

      this.overlay?.addEventListener("click", () => {
        if (this.isOpen) this.closeDrawer();
        if (this.isFilterOpen) this.closeFilter();
      });

      document.querySelectorAll(".mobile-filter-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          this.openFilter();
        });
      });

      document.querySelectorAll(".filter-drawer-close").forEach(el => {
        el.addEventListener("click", () => {
          this.closeFilter();
        });
      });

      document.querySelectorAll(".filter-apply-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          this.applyMobileFilters();
          this.closeFilter();
        });
      });

      document.querySelectorAll(".filter-clear-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          this.clearMobileFilters();
        });
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          if (this.isOpen) this.closeDrawer();
          if (this.isFilterOpen) this.closeFilter();
        }
      });

      window.addEventListener("cart:updated", () => this.updateBadges());
      window.addEventListener("wishlist:updated", () => this.updateBadges());
      window.addEventListener("auth:changed", () => this.updateUserInfo());
    },

    openDrawer() {
      if (!this.drawer || !this.overlay) return;
      
      this.drawer.classList.add("active");
      this.overlay.classList.add("active");
      document.body.classList.add("menu-open");
      this.isOpen = true;

      const firstFocusable = this.drawer.querySelector("button, a, input");
      if (firstFocusable) firstFocusable.focus();
    },

    closeDrawer() {
      if (!this.drawer || !this.overlay) return;
      
      this.drawer.classList.remove("active");
      this.overlay.classList.remove("active");
      document.body.classList.remove("menu-open");
      this.isOpen = false;
    },

    toggleDrawer() {
      if (this.isOpen) {
        this.closeDrawer();
      } else {
        this.openDrawer();
      }
    },

    openFilter() {
      if (!this.filterDrawer || !this.overlay) return;
      
      this.filterDrawer.classList.add("active");
      this.overlay.classList.add("active");
      document.body.classList.add("menu-open");
      this.isFilterOpen = true;
    },

    closeFilter() {
      if (!this.filterDrawer || !this.overlay) return;
      
      this.filterDrawer.classList.remove("active");
      this.overlay.classList.remove("active");
      document.body.classList.remove("menu-open");
      this.isFilterOpen = false;
    },

    setupFilterDrawer() {
      if (!this.filterDrawer) return;

      const categoryContainer = this.filterDrawer.querySelector(".filter-categories-mobile");
      const brandContainer = this.filterDrawer.querySelector(".filter-brands-mobile");
      const priceRange = this.filterDrawer.querySelector("#mobile-price-range");
      const priceDisplay = this.filterDrawer.querySelector(".filter-price-display");

      if (categoryContainer && window.categories) {
        categoryContainer.innerHTML = window.categories.map(c => `
          <label>
            <input type="checkbox" name="mobile-category" value="${c.id}">
            ${c.name}
          </label>
        `).join("");
      }

      if (brandContainer && window.brands) {
        brandContainer.innerHTML = window.brands.map(b => `
          <label>
            <input type="checkbox" name="mobile-brand" value="${b.id}">
            ${b.name}
          </label>
        `).join("");
      }

      if (priceRange && priceDisplay) {
        let maxPrice = 1000;
        if (window.products && window.products.length) {
          maxPrice = Math.ceil(Math.max(...window.products.map(p => p.price)));
        }
        priceRange.max = maxPrice;
        priceRange.value = maxPrice;
        priceDisplay.textContent = `$0 — $${maxPrice}`;

        priceRange.addEventListener("input", () => {
          priceDisplay.textContent = `$0 — $${priceRange.value}`;
        });
      }

      this.syncFiltersFromDesktop();
    },

    syncFiltersFromDesktop() {
      const desktopCategory = document.querySelector('input[name="category"]:checked');
      const desktopBrand = document.querySelector('input[name="brand"]:checked');
      const desktopPrice = document.getElementById("price-range");
      const desktopSearch = document.getElementById("search-input");

      if (desktopCategory) {
        const mobileCategory = this.filterDrawer?.querySelector(`input[name="mobile-category"][value="${desktopCategory.value}"]`);
        if (mobileCategory) mobileCategory.checked = true;
      }

      if (desktopBrand) {
        const mobileBrand = this.filterDrawer?.querySelector(`input[name="mobile-brand"][value="${desktopBrand.value}"]`);
        if (mobileBrand) mobileBrand.checked = true;
      }

      if (desktopPrice) {
        const mobilePrice = this.filterDrawer?.querySelector("#mobile-price-range");
        const mobileDisplay = this.filterDrawer?.querySelector(".filter-price-display");
        if (mobilePrice) {
          mobilePrice.value = desktopPrice.value;
          if (mobileDisplay) mobileDisplay.textContent = `$0 — $${desktopPrice.value}`;
        }
      }

      if (desktopSearch) {
        const mobileSearch = this.filterDrawer?.querySelector("#mobile-filter-search");
        if (mobileSearch) mobileSearch.value = desktopSearch.value;
      }
    },

    applyMobileFilters() {
      const mobileCategory = this.filterDrawer?.querySelector('input[name="mobile-category"]:checked');
      const mobileBrand = this.filterDrawer?.querySelector('input[name="mobile-brand"]:checked');
      const mobilePrice = this.filterDrawer?.querySelector("#mobile-price-range");
      const mobileSearch = this.filterDrawer?.querySelector("#mobile-filter-search");

      const desktopSearch = document.getElementById("search-input");
      if (desktopSearch && mobileSearch) {
        desktopSearch.value = mobileSearch.value;
        desktopSearch.dispatchEvent(new Event("input", { bubbles: true }));
      }

      document.querySelectorAll('input[name="category"]').forEach(cb => cb.checked = false);
      if (mobileCategory) {
        const desktopCat = document.querySelector(`input[name="category"][value="${mobileCategory.value}"]`);
        if (desktopCat) {
          desktopCat.checked = true;
          desktopCat.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }

      document.querySelectorAll('input[name="brand"]').forEach(cb => cb.checked = false);
      if (mobileBrand) {
        const desktopBrand = document.querySelector(`input[name="brand"][value="${mobileBrand.value}"]`);
        if (desktopBrand) {
          desktopBrand.checked = true;
          desktopBrand.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }

      const desktopPrice = document.getElementById("price-range");
      if (desktopPrice && mobilePrice) {
        desktopPrice.value = mobilePrice.value;
        desktopPrice.dispatchEvent(new Event("change", { bubbles: true }));
      }
    },

    clearMobileFilters() {
      this.filterDrawer?.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      
      const mobileSearch = this.filterDrawer?.querySelector("#mobile-filter-search");
      if (mobileSearch) mobileSearch.value = "";

      const mobilePrice = this.filterDrawer?.querySelector("#mobile-price-range");
      const mobileDisplay = this.filterDrawer?.querySelector(".filter-price-display");
      if (mobilePrice) {
        mobilePrice.value = mobilePrice.max;
        if (mobileDisplay) mobileDisplay.textContent = `$0 — $${mobilePrice.max}`;
      }

      const clearBtn = document.querySelector(".clear-filter");
      if (clearBtn) clearBtn.click();
    },

    updateBadges() {
      const cartCount = window.Store ? Store.getCartCount() : 0;
      const wishlistCount = window.Store ? Store.getWishlistCount() : 0;

      document.querySelectorAll("#cart-count, #mobile-cart-count, #bottom-cart-count").forEach(el => {
        el.textContent = cartCount;
        el.style.display = cartCount > 0 ? "flex" : "none";
      });

      document.querySelectorAll("#wishlist-count, #mobile-wishlist-count, #bottom-wishlist-count").forEach(el => {
        el.textContent = wishlistCount;
        el.style.display = wishlistCount > 0 ? "flex" : "none";
      });
    },

    updateUserInfo() {
      const user = window.Store ? Store.getUser() : null;
      const isLoggedIn = !!user;

      const drawerUserName = document.getElementById("drawer-user-name");
      const drawerUserText = document.getElementById("drawer-user-text");
      
      if (drawerUserName) {
        drawerUserName.textContent = isLoggedIn ? user.name : "Mehmon";
      }
      if (drawerUserText) {
        drawerUserText.textContent = isLoggedIn ? user.email : "Kirish / Ro'yxatdan o'tish";
      }

      const basePath = this.getBasePath();
      document.querySelectorAll(".drawer-profile-link, [data-action='profile']").forEach(el => {
        if (el.tagName === "A") {
          el.href = isLoggedIn ? basePath + "profile.html" : basePath + "auth/login.html";
        }
      });
    },

    setupSearch() {
      const mobileSearchInput = document.getElementById("mobile-search-input");
      const mobileSearchBtn = document.getElementById("mobile-search-btn");
      const basePath = this.getBasePath();

      const doSearch = () => {
        const query = mobileSearchInput?.value.trim();
        if (query) {
          window.location.href = basePath + "products.html?search=" + encodeURIComponent(query);
        }
      };

      mobileSearchBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        doSearch();
      });

      mobileSearchInput?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          doSearch();
        }
      });
    },

    getBasePath() {
      const path = location.pathname;
      if (path.includes("/auth/")) {
        return "../";
      }
      return "";
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => NAV.init());
  } else {
    NAV.init();
  }

  window.NAV = NAV;
})();
