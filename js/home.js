/**
 * HOME.JS - Home Page Dynamic Sections
 */
(function() {
  "use strict";

  if (!location.pathname.includes("index.html") && location.pathname !== "/" && !location.pathname.endsWith("/")) {
    // Check if we're on home page
    if (!document.querySelector(".hero")) return;
  }

  function getProducts() {
    return window.products || [];
  }

  function getFeaturedProducts(limit = 4) {
    const products = getProducts();
    // Popular/featured = high rating + has 'popular' or 'bestseller' badge
    return products
      .filter(p => p.badges?.includes("popular") || p.badges?.includes("bestseller") || p.rating >= 4.5)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  function getLatestProducts(limit = 4) {
    const products = getProducts();
    // Latest = newest (highest ID) or has 'new' badge
    return products
      .filter(p => p.badges?.includes("new") || p.badges?.includes("sale"))
      .concat(products.sort((a, b) => b.id - a.id))
      .filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i) // unique
      .slice(0, limit);
  }

  function getSaleProducts(limit = 4) {
    const products = getProducts();
    return products
      .filter(p => p.oldPrice && p.oldPrice > p.price)
      .sort((a, b) => {
        const discA = (a.oldPrice - a.price) / a.oldPrice;
        const discB = (b.oldPrice - b.price) / b.oldPrice;
        return discB - discA;
      })
      .slice(0, limit);
  }

  function renderProductSection(container, products) {
    if (!container || !products.length) return;

    container.innerHTML = products.map(p => UI.createProductCard(p)).join("");
  }

  function init() {
    // Featured/Best Selling Products Section
    const featuredGrid = document.getElementById("featured-products-grid") || 
                         document.querySelector(".featured-products .product-grid, .tanlangan-products .product-grid");
    if (featuredGrid) {
      renderProductSection(featuredGrid, getFeaturedProducts(4));
    }

    // Latest Products Section  
    const latestGrid = document.getElementById("latest-products-grid") ||
                       document.querySelector(".latest-products .product-grid, #latest-products .product-grid");
    if (latestGrid) {
      renderProductSection(latestGrid, getLatestProducts(4));
    }

    // Sale Products Section
    const saleGrid = document.getElementById("sale-products-grid") ||
                     document.querySelector(".sale-products .product-grid");
    if (saleGrid) {
      renderProductSection(saleGrid, getSaleProducts(4));
    }

    // Category cards add-to-cart - these already have data-id in HTML
    // The global handler in ui.js will pick them up

    // Hero "Sotib olish" button
    document.querySelector(".hero button")?.addEventListener("click", () => {
      location.href = "products.html";
    });

    // Sale box button
    document.querySelector(".sale-box button")?.addEventListener("click", () => {
      location.href = "products.html?sort=price-asc";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
