// Single source of truth for products
window.products = [
  {
    id: 1,
    slug: "simsiz-changyutgich-pro-v2",
    name: "Simsiz changyutgich Pro V2",
    price: 349.0,
    images: ["assets/images/product1.jpg"],
  },
  {
    id: 2,
    slug: "aqlli-kir-yuvish-mashinasi",
    name: "Aqlli kir yuvish mashinasi",
    price: 599.0,
    images: ["assets/images/product2.png"],
  },
  {
    id: 3,
    slug: "mikrotolqinli-pech",
    name: "Mikroto‘lqinli pech",
    price: 189.0,
    images: ["assets/images/product3.jpg"],
  },
  {
    id: 4,
    slug: "aqlli-konditsioner",
    name: "Aqlli konditsioner",
    price: 499.0,
    images: ["assets/images/product4.jpg"],
  },
];

// helper
window.getProductById = function (id) {
  return window.products.find((p) => Number(p.id) === Number(id)) || null;
};
window.getProductBySlug = function (slug) {
  return window.products.find((p) => p.slug === String(slug)) || null;
};
