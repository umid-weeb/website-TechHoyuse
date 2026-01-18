// DataStore: products persistence + lookup
(function () {
  "use strict";

  const DataStore = (function () {
    let products = [];

    function _seed() {
      if (products.length) return;
      // minimal sample products; extend as needed
      products = Array.from({ length: 12 }, (_, i) => {
        const id = i + 1;
        return {
          id,
          slug: `product-${id}`,
          name: `Mahsulot ${id}`,
          price: 1000 + id * 50,
          oldPrice: id % 3 === 0 ? 1000 + id * 70 : null,
          rating: 4 + (id % 5) * 0.2,
          images: [`assets/images/product-${id}.jpg`],
          discount: id % 4 === 0,
          description: `Tavsif ${id}`,
        };
      });
    }

    function getAll() {
      return products.slice();
    }

    function getById(id) {
      const n = Number(id);
      if (Number.isNaN(n)) return null;
      return products.find((p) => p.id === n) || null;
    }

    function getBySlug(slug) {
      return products.find((p) => p.slug === slug) || null;
    }

    return {
      _seed,
      getAll,
      getById,
      getBySlug,
    };
  })();

  // expose globally if needed
  window.DataStore = window.DataStore || DataStore;
})();

(function () {
  // Single source of truth for products used across the site.
  const PRODUCTS = [
    // Minimal product objects for IDs referenced in HTML (1..20).
    {
      id: 1,
      slug: "premium-stand-mixer",
      name: "Premium Stand Mixer - 1000W",
      price: 299.0,
      image: "assets/images/product1.jpg",
      description: "Powerful stand mixer.",
    },
    {
      id: 2,
      slug: "smart-robot-cleaner",
      name: "Smart Robot Cleaner",
      price: 449.0,
      image: "assets/images/product4.png",
      description: "Smart cleaning robot.",
    },
    {
      id: 3,
      slug: "smart-home-hub",
      name: "Smart Home Hub",
      price: 199.0,
      image: "assets/images/smart.jpg",
      description: "Connect your smart devices.",
    },
    {
      id: 4,
      slug: "premium-stand-mixer",
      name: "Premium Stand Mixer - 1000W",
      price: 299.0,
      image: "assets/images/product1.jpg",
      description: "Powerful stand mixer.",
    },
    {
      id: 5,
      slug: "smart-microwave-25l",
      name: "Smart Microwave Oven 25L",
      price: 189.0,
      image: "assets/images/product2.png",
      description: "Smart microwave.",
    },
    {
      id: 6,
      slug: "high-speed-blender",
      name: "High-Speed Blender 2000W",
      price: 159.0,
      image: "assets/images/product3.jpg",
      description: "High speed blender.",
    },
    {
      id: 7,
      slug: "robot-vacuum-cleaner",
      name: "Robot Vacuum Cleaner",
      price: 449.0,
      image: "assets/images/product4.png",
      description: "Efficient robot vacuum.",
    },
    {
      id: 13,
      slug: "smart-air-conditioner",
      name: "Smart Air Conditioner",
      price: 699.0,
      image:
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500",
      description: "Smart AC.",
    },
    {
      id: 14,
      slug: "professional-hair-dryer",
      name: "Professional Hair Dryer",
      price: 89.0,
      image:
        "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500",
      description: "Salon grade hair dryer.",
    },
    {
      id: 15,
      slug: "cordless-vacuum",
      name: "Cordless Vacuum",
      price: 349.0,
      image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500",
      description: "Cordless vacuum.",
    },
    {
      id: 16,
      slug: "steam-iron",
      name: "Steam Iron",
      price: 45.0,
      image: "https://images.unsplash.com/photo-1560343060-c140a58e9944?w=500",
      description: "Powerful steam iron.",
    },
    {
      id: 17,
      slug: "smart-home-hub",
      name: "Smart Home Hub",
      price: 199.0,
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=500",
      description: "Smart home central hub.",
    },
    {
      id: 18,
      slug: "tower-fan-with-remote",
      name: "Tower Fan with Remote",
      price: 129.0,
      image: "https://images.unsplash.com/photo-1544161513-0179fe746fd5?w=500",
      description: "Tower fan.",
    },
    {
      id: 19,
      slug: "stand-mixer-pro",
      name: "Stand Mixer Pro",
      price: 299.0,
      image:
        "https://images.unsplash.com/photo-1594385208974-2e75f9d8ad48?w=500",
      description: "Pro stand mixer.",
    },
    {
      id: 20,
      slug: "espresso-machine",
      name: "Espresso Machine",
      price: 599.0,
      image:
        "https://images.unsplash.com/photo-1510520434124-5bc7e642b61d?w=500",
      description: "Espresso machine.",
    },
    // Ensure IDs 8-12 exist if needed (add placeholders)
    {
      id: 8,
      slug: "product-8",
      name: "Product 8",
      price: 49.0,
      image: "",
      description: "",
    },
    {
      id: 9,
      slug: "product-9",
      name: "Product 9",
      price: 59.0,
      image: "",
      description: "",
    },
    {
      id: 10,
      slug: "product-10",
      name: "Product 10",
      price: 69.0,
      image: "",
      description: "",
    },
    {
      id: 11,
      slug: "product-11",
      name: "Product 11",
      price: 79.0,
      image: "",
      description: "",
    },
    {
      id: 12,
      slug: "product-12",
      name: "Product 12",
      price: 89.0,
      image: "",
      description: "",
    },
  ];

  // Expose DataStore globally
  window.DataStore = {
    getAll: function () {
      return PRODUCTS.slice();
    },
    getById: function (id) {
      if (typeof id === "string") id = parseInt(id, 10);
      return PRODUCTS.find((p) => p.id === id) || null;
    },
    getBySlug: function (slug) {
      if (!slug) return null;
      return PRODUCTS.find((p) => p.slug === slug) || null;
    },
  };
})();

(function () {
  if (
    window.DataStore &&
    window.DataStore.getAll &&
    window.DataStore.getById &&
    window.DataStore.getBySlug
  )
    return;

  // Minimal DataStore that won't overwrite existing data if present
  const STORE = {
    _items: [],
    _seed() {
      if (this._items && this._items.length) return;
      // minimal seed -- replace with your project's real data.js content if available
      this._items = [
        {
          id: 1,
          slug: "example-product-1",
          name: "Example Product 1",
          price: 49.99,
          oldPrice: 59.99,
          rating: 4.8,
          images: ["assets/img/example1.jpg"],
          discount: true,
        },
        {
          id: 2,
          slug: "example-product-2",
          name: "Example Product 2",
          price: 29.99,
          oldPrice: 0,
          rating: 4.2,
          images: ["assets/img/example2.jpg"],
        },
      ];
    },
    getAll() {
      if (!this._items || !this._items.length) this._seed();
      return this._items.slice();
    },
    getById(id) {
      if (!this._items || !this._items.length) this._seed();
      return this._items.find((p) => Number(p.id) === Number(id)) || null;
    },
    getBySlug(slug) {
      if (!this._items || !this._items.length) this._seed();
      return this._items.find((p) => String(p.slug) === String(slug)) || null;
    },
  };

  // If a global DataStore exists partially, augment instead of overwrite
  if (!window.DataStore) {
    window.DataStore = STORE;
  } else {
    window.DataStore.getAll =
      window.DataStore.getAll || STORE.getAll.bind(STORE);
    window.DataStore.getById =
      window.DataStore.getById || STORE.getById.bind(STORE);
    window.DataStore.getBySlug =
      window.DataStore.getBySlug || STORE.getBySlug.bind(STORE);
    window.DataStore._seed = window.DataStore._seed || STORE._seed.bind(STORE);
  }
})();
