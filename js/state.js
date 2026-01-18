class StateManager {
  constructor() {
    this.listeners = {};
  }

  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
  }

  unsubscribe(key, callback) {
    if (this.listeners[key]) {
      this.listeners[key] = this.listeners[key].filter((cb) => cb !== callback);
    }
  }

  notify(key, value) {
    if (this.listeners[key]) {
      this.listeners[key].forEach((callback) => callback(value));
    }
  }

  // Cart
  getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }

  setCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    this.notify("cart", cart);
  }

  addToCart(productId, qty = 1) {
    const cart = this.getCart();
    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.qty += qty;
    } else {
      cart.push({ id: productId, qty });
    }

    this.setCart(cart);
    return cart;
  }

  removeFromCart(productId) {
    const cart = this.getCart().filter((item) => item.id !== productId);
    this.setCart(cart);
    return cart;
  }

  updateCartQty(productId, qty) {
    const cart = this.getCart();
    const item = cart.find((item) => item.id === productId);

    if (item) {
      if (qty <= 0) {
        return this.removeFromCart(productId);
      }
      item.qty = qty;
      this.setCart(cart);
    }

    return cart;
  }

  clearCart() {
    this.setCart([]);
  }

  getCartCount() {
    return this.getCart().reduce((sum, item) => sum + item.qty, 0);
  }

  // Auth
  getCurrentUser() {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("currentUser");
    }
    this.notify("auth", user);
  }

  isLoggedIn() {
    return !!this.getCurrentUser();
  }

  logout() {
    this.setCurrentUser(null);
  }

  // Users (registration)
  getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
  }

  setUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }

  registerUser(email, password, name) {
    const users = this.getUsers();

    if (users.find((u) => u.email === email)) {
      throw new Error("Email already registered");
    }

    const user = {
      id: Date.now(),
      email,
      password, // In production, hash this!
      name,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    this.setUsers(users);
    return user;
  }

  loginUser(email, password) {
    const users = this.getUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const loggedInUser = { ...user };
    delete loggedInUser.password;
    this.setCurrentUser(loggedInUser);
    return loggedInUser;
  }

  // Wishlist
  getWishlist() {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  }

  setWishlist(wishlist) {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    this.notify("wishlist", wishlist);
  }

  toggleWishlist(productId) {
    const wishlist = this.getWishlist();
    const index = wishlist.indexOf(productId);

    if (index > -1) {
      wishlist.splice(index, 1);
    } else {
      wishlist.push(productId);
    }

    this.setWishlist(wishlist);
    return wishlist;
  }

  isInWishlist(productId) {
    return this.getWishlist().includes(productId);
  }

  // Recently Viewed
  getRecentlyViewed() {
    return JSON.parse(localStorage.getItem("recentlyViewed")) || [];
  }

  setRecentlyViewed(viewed) {
    localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
  }

  addToRecentlyViewed(productId) {
    const viewed = this.getRecentlyViewed();
    const index = viewed.indexOf(productId);

    if (index > -1) {
      viewed.splice(index, 1);
    }

    viewed.unshift(productId);
    if (viewed.length > 10) {
      viewed.pop();
    }

    this.setRecentlyViewed(viewed);
    return viewed;
  }
}

const state = new StateManager();
