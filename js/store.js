
(function() {
  "use strict";

  if (window.Store && window.Store._initialized) return;

  const KEYS = {
    CART: "techhouse_cart",
    WISHLIST: "techhouse_wishlist",
    USER: "techhouse_user",
    USERS: "techhouse_users",
    ORDERS: "techhouse_orders"
  };

  function safeGet(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn("Store.safeGet error:", key, e);
      return fallback;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Store.safeSet error:", key, e);
    }
  }

  function dispatch(eventName, detail = {}) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  function getProductById(id) {
    if (!window.products || !Array.isArray(window.products)) return null;
    return window.products.find(p => Number(p.id) === Number(id)) || null;
  }

  function getProductBySlug(slug) {
    if (!window.products || !Array.isArray(window.products) || !slug) return null;
    return window.products.find(p => p.slug === String(slug)) || null;
  }

  const Store = {
    _initialized: true,

    
    getCart() {
      return safeGet(KEYS.CART, []);
    },

    setCart(cart) {
      safeSet(KEYS.CART, cart);
      dispatch("cart:updated", { cart, count: this.getCartCount() });
    },

    addToCart(productId, qty = 1) {
      productId = Number(productId);
      qty = Math.max(1, Number(qty) || 1);
      
      const product = getProductById(productId);
      if (!product) return false;
      if (!product.inStock || product.stock <= 0) return false;

      const cart = this.getCart();
      const idx = cart.findIndex(item => Number(item.id) === productId);

      if (idx >= 0) {
        const newQty = cart[idx].qty + qty;
        cart[idx].qty = Math.min(newQty, product.stock);
      } else {
        cart.push({ id: productId, qty: Math.min(qty, product.stock) });
      }

      this.setCart(cart);
      return true;
    },

    removeFromCart(productId) {
      productId = Number(productId);
      const cart = this.getCart().filter(item => Number(item.id) !== productId);
      this.setCart(cart);
      return true;
    },

    updateCartQty(productId, qty) {
      productId = Number(productId);
      qty = Number(qty);

      if (qty <= 0) return this.removeFromCart(productId);

      const product = getProductById(productId);
      const maxQty = product ? product.stock : qty;

      const cart = this.getCart();
      const idx = cart.findIndex(item => Number(item.id) === productId);

      if (idx >= 0) {
        cart[idx].qty = Math.min(qty, maxQty);
        this.setCart(cart);
        return true;
      }
      return false;
    },

    incrementCartItem(productId) {
      const cart = this.getCart();
      const item = cart.find(i => Number(i.id) === Number(productId));
      if (item) {
        return this.updateCartQty(productId, item.qty + 1);
      }
      return false;
    },

    decrementCartItem(productId) {
      const cart = this.getCart();
      const item = cart.find(i => Number(i.id) === Number(productId));
      if (item) {
        return this.updateCartQty(productId, item.qty - 1);
      }
      return false;
    },

    clearCart() {
      this.setCart([]);
    },

    getCartCount() {
      return this.getCart().reduce((sum, item) => sum + (item.qty || 0), 0);
    },

    getCartDetails() {
      const cart = this.getCart();
      return cart.map(item => {
        const product = getProductById(item.id);
        if (!product) return null;
        const qty = Number(item.qty || 0);
        const price = Number(product.price || 0);
        return {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: price,
          oldPrice: product.oldPrice,
          qty: qty,
          subtotal: price * qty,
          image: (product.images && product.images[0]) || "assets/images/placeholder.jpg",
          inStock: product.inStock,
          stock: product.stock
        };
      }).filter(Boolean);
    },

    getCartSubtotal() {
      return this.getCartDetails().reduce((sum, item) => sum + item.subtotal, 0);
    },

    getShippingFee() {
      const subtotal = this.getCartSubtotal();
      return subtotal >= 299 ? 0 : 15;
    },

    getCartTotal() {
      return this.getCartSubtotal() + this.getShippingFee();
    },

    isCartEmpty() {
      return this.getCartCount() === 0;
    },

    
    getWishlist() {
      return safeGet(KEYS.WISHLIST, []);
    },

    setWishlist(wishlist) {
      safeSet(KEYS.WISHLIST, wishlist);
      dispatch("wishlist:updated", { wishlist, count: wishlist.length });
    },

    toggleWishlist(productId) {
      productId = Number(productId);
      const wishlist = this.getWishlist();
      const idx = wishlist.indexOf(productId);

      if (idx >= 0) {
        wishlist.splice(idx, 1);
      } else {
        wishlist.push(productId);
      }

      this.setWishlist(wishlist);
      return idx < 0; 
    },

    addToWishlist(productId) {
      productId = Number(productId);
      const wishlist = this.getWishlist();
      if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        this.setWishlist(wishlist);
      }
      return true;
    },

    removeFromWishlist(productId) {
      productId = Number(productId);
      const wishlist = this.getWishlist().filter(id => id !== productId);
      this.setWishlist(wishlist);
      return true;
    },

    isInWishlist(productId) {
      return this.getWishlist().includes(Number(productId));
    },

    getWishlistDetails() {
      const wishlist = this.getWishlist();
      return wishlist.map(id => getProductById(id)).filter(Boolean);
    },

    getWishlistCount() {
      return this.getWishlist().length;
    },

    
    getUser() {
      return safeGet(KEYS.USER, null);
    },

    setUser(user) {
      if (user) {
        const safeUser = { ...user };
        delete safeUser.password;
        safeSet(KEYS.USER, safeUser);
      } else {
        localStorage.removeItem(KEYS.USER);
      }
      dispatch("auth:changed", { user: this.getUser() });
    },

    isLoggedIn() {
      return !!this.getUser();
    },

    logout() {
      this.setUser(null);
    },

    getUsers() {
      return safeGet(KEYS.USERS, []);
    },

    registerUser(name, email, password) {
      const users = this.getUsers();
      
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: "Bu email allaqachon ro'yxatdan o'tgan" };
      }

      const user = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        phone: "",
        address: "",
        createdAt: new Date().toISOString()
      };

      users.push(user);
      safeSet(KEYS.USERS, users);

      const safeUser = { ...user };
      delete safeUser.password;
      this.setUser(safeUser);

      return { success: true, user: safeUser };
    },

    loginUser(email, password) {
      const users = this.getUsers();
      const user = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
      );

      if (!user) {
        return { success: false, error: "Email yoki parol xato" };
      }

      const safeUser = { ...user };
      delete safeUser.password;
      this.setUser(safeUser);

      return { success: true, user: safeUser };
    },

    updateUser(updates) {
      const user = this.getUser();
      if (!user) return false;

      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === user.id);

      if (idx >= 0) {
        users[idx] = { ...users[idx], ...updates };
        safeSet(KEYS.USERS, users);
        
        const safeUser = { ...users[idx] };
        delete safeUser.password;
        this.setUser(safeUser);
        return true;
      }
      return false;
    },

    changePassword(oldPassword, newPassword) {
      const user = this.getUser();
      if (!user) return { success: false, error: "Tizimga kiring" };

      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === user.id);

      if (idx < 0) return { success: false, error: "Foydalanuvchi topilmadi" };
      if (users[idx].password !== oldPassword) {
        return { success: false, error: "Eski parol xato" };
      }

      users[idx].password = newPassword;
      safeSet(KEYS.USERS, users);
      return { success: true };
    },

    
    getOrders() {
      return safeGet(KEYS.ORDERS, []);
    },

    getUserOrders() {
      const user = this.getUser();
      if (!user) return [];
      return this.getOrders().filter(o => o.userId === user.id);
    },

    createOrder(orderData) {
      const user = this.getUser();
      const cart = this.getCartDetails();
      
      if (cart.length === 0) {
        return { success: false, error: "Savat bo'sh" };
      }

      const order = {
        id: "TH-" + Date.now(),
        userId: user ? user.id : null,
        items: cart,
        subtotal: this.getCartSubtotal(),
        shipping: this.getShippingFee(),
        total: this.getCartTotal(),
        customer: {
          name: orderData.name || "",
          phone: orderData.phone || "",
          email: orderData.email || ""
        },
        delivery: {
          method: orderData.deliveryMethod || "delivery",
          address: orderData.address || "",
          city: orderData.city || "",
          postalCode: orderData.postalCode || ""
        },
        payment: {
          method: orderData.paymentMethod || "cash"
        },
        status: "pending",
        createdAt: new Date().toISOString()
      };

      const orders = this.getOrders();
      orders.unshift(order);
      safeSet(KEYS.ORDERS, orders);

      this.clearCart();

      return { success: true, order };
    },

    getOrderById(orderId) {
      return this.getOrders().find(o => o.id === orderId) || null;
    },

    
    formatPrice(price) {
      return "$" + Number(price || 0).toFixed(2);
    },

    renderStars(rating) {
      const r = Math.round(Number(rating) || 0);
      const full = Math.min(5, Math.max(0, r));
      return "★".repeat(full) + "☆".repeat(5 - full);
    },

    getProductById: getProductById,
    getProductBySlug: getProductBySlug,

    
    init() {
      
      if (!safeGet(KEYS.CART)) safeSet(KEYS.CART, []);
      if (!safeGet(KEYS.WISHLIST)) safeSet(KEYS.WISHLIST, []);
      if (!safeGet(KEYS.ORDERS)) safeSet(KEYS.ORDERS, []);
      if (!safeGet(KEYS.USERS)) safeSet(KEYS.USERS, []);

      
      dispatch("cart:updated", { cart: this.getCart(), count: this.getCartCount() });
      dispatch("wishlist:updated", { wishlist: this.getWishlist(), count: this.getWishlistCount() });
      dispatch("auth:changed", { user: this.getUser() });
    }
  };

  window.Store = Store;

  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => Store.init());
  } else {
    Store.init();
  }

  
  window.addEventListener("storage", function(e) {
    if (e.key === KEYS.CART) {
      dispatch("cart:updated", { cart: Store.getCart(), count: Store.getCartCount() });
    }
    if (e.key === KEYS.WISHLIST) {
      dispatch("wishlist:updated", { wishlist: Store.getWishlist(), count: Store.getWishlistCount() });
    }
    if (e.key === KEYS.USER) {
      dispatch("auth:changed", { user: Store.getUser() });
    }
  });
})();
