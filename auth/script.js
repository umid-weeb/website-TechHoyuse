/**
 * AUTH SCRIPT - Login/Register Page
 */
(function() {
  "use strict";

  const signupForm = document.getElementById("signupForm");
  const signinForm = document.getElementById("signinForm");
  const switchForm = document.getElementById("switchForm");
  const formTitle = document.getElementById("formTitle");
  const switchInfo = document.getElementById("switchInfo");

  // Storage helpers (use same keys as Store.js)
  const KEYS = {
    USER: "techhouse_user",
    USERS: "techhouse_users"
  };

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.USERS)) || [];
    } catch (e) {
      return [];
    }
  }

  function setUsers(users) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }

  function setUser(user) {
    if (user) {
      const safeUser = { ...user };
      delete safeUser.password;
      localStorage.setItem(KEYS.USER, JSON.stringify(safeUser));
    } else {
      localStorage.removeItem(KEYS.USER);
    }
  }

  function showMessage(type, message) {
    const colors = {
      success: "#22c55e",
      error: "#ef4444",
      info: "#3b82f6"
    };
    
    let toastEl = document.getElementById("auth-toast");
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.id = "auth-toast";
      toastEl.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;";
      document.body.appendChild(toastEl);
    }
    
    toastEl.innerHTML = `
      <div style="background:${colors[type] || colors.info};color:#fff;padding:14px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);min-width:250px;">
        ${message}
      </div>
    `;
    
    setTimeout(() => { toastEl.innerHTML = ""; }, 3000);
  }

  // Switch between login and register
  switchForm?.addEventListener("click", (e) => {
    e.preventDefault();
    const isSignupActive = signupForm?.classList.contains("active");

    if (isSignupActive) {
      signupForm?.classList.remove("active");
      signinForm?.classList.add("active");
      if (formTitle) formTitle.textContent = "Tizimga kirish";
      if (switchInfo) switchInfo.textContent = "Hisobingiz yo'qmi?";
      if (switchForm) switchForm.textContent = "Ro'yxatdan o'tish";
    } else {
      signinForm?.classList.remove("active");
      signupForm?.classList.add("active");
      if (formTitle) formTitle.textContent = "Yangi hisob yaratish";
      if (switchInfo) switchInfo.textContent = "Hisobingiz allaqachon bormi?";
      if (switchForm) switchForm.textContent = "Tizimga kirish";
    }
  });

  // Register
  signupForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const name = document.getElementById("signupFullname")?.value.trim();
    const email = document.getElementById("signupEmail")?.value.trim();
    const password = document.getElementById("signupPassword")?.value;
    const confirm = document.getElementById("signupConfirm")?.value;

    if (!name || !email || !password) {
      showMessage("error", "Barcha maydonlarni to'ldiring");
      return;
    }

    if (password !== confirm) {
      showMessage("error", "Parollar mos kelmadi");
      return;
    }

    if (password.length < 6) {
      showMessage("error", "Parol kamida 6 belgidan iborat bo'lsin");
      return;
    }

    const users = getUsers();
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      showMessage("error", "Bu email allaqachon ro'yxatdan o'tgan");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: name,
      email: email.toLowerCase(),
      password: password,
      phone: "",
      address: "",
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    setUsers(users);
    setUser(newUser);

    showMessage("success", "Ro'yxatdan muvaffaqiyatli o'tdingiz!");
    
    setTimeout(() => {
      location.href = "../profile.html";
    }, 1500);
  });

  // Login
  signinForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const email = document.getElementById("signinEmail")?.value.trim();
    const password = document.getElementById("signinPassword")?.value;

    if (!email || !password) {
      showMessage("error", "Email va parol kiriting");
      return;
    }

    const users = getUsers();
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );

    if (!user) {
      showMessage("error", "Email yoki parol xato");
      return;
    }

    setUser(user);
    showMessage("success", "Tizimga muvaffaqiyatli kirdingiz!");
    
    setTimeout(() => {
      location.href = "../profile.html";
    }, 1500);
  });

  // Toggle password visibility
  document.querySelectorAll(".input-group.password .toggle").forEach(toggle => {
    toggle.addEventListener("click", () => {
      const input = toggle.closest(".input-group").querySelector("input");
      if (input.type === "password") {
        input.type = "text";
        toggle.textContent = "🙈";
      } else {
        input.type = "password";
        toggle.textContent = "👁";
      }
    });
  });

  // Check if already logged in
  const currentUser = localStorage.getItem(KEYS.USER);
  if (currentUser) {
    const goToProfile = confirm("Siz allaqachon tizimga kirgansiz. Profilga o'tishni xohlaysizmi?");
    if (goToProfile) {
      location.href = "../profile.html";
    }
  }

})();
