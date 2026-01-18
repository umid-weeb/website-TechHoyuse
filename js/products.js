document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    location.href = "products.html";
    return;
  }

  const product = DataStore.getBySlug(slug);

  if (!product) {
    alert("Mahsulot topilmadi");
    location.href = "products.html";
    return;
  }

  renderProduct(product);
});
function renderProduct(product) {
  document.querySelector(".product-title").textContent = product.name;
  document.querySelector(".product-price").textContent = `$${product.price}`;
  document.querySelector(".product-image img").src = product.images[0];

  document.querySelector(".add-to-cart").dataset.id = product.id;
}

const products = [
  {
    id: 1,
    slug: "premium-stand-mixer",
    name: "Premium Stand Mixer - 1000W",
    brand: "TechHouse",
    category: "Kitchen Appliances",
    price: 299,
    oldPrice: 399,
    discount: 25,
    images: ["assets/images/product1.jpg"],
    rating: 5,
    reviewsCount: 120,
    inStock: true,
    stockCount: 15,
    badges: ["Sale", "Best Seller"],
    monthlyPayment: 25,
    specs: {
      power: "1000W",
      capacity: "5L",
      color: "Silver",
    },
  },
  {
    id: 2,
    slug: "smart-microwave-oven",
    name: "Smart Microwave Oven 25L",
    brand: "TechHouse",
    category: "Kitchen Appliances",
    price: 189,
    oldPrice: 249,
    discount: 24,
    images: ["assets/images/product2.png"],
    rating: 5,
    reviewsCount: 85,
    inStock: true,
    stockCount: 10,
    badges: ["Sale"],
    monthlyPayment: 15.75,
    specs: {
      capacity: "25L",
      power: "800W",
      color: "Black",
    },
  },
  // ... Add more products here
];

// Save products to localStorage if not already present
if (!localStorage.getItem("products")) {
  localStorage.setItem("products", JSON.stringify(products));
}
