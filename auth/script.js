
(function() {
  "use strict";

  const signupForm = document.getElementById("signupForm");
  const signinForm = document.getElementById("signinForm");
  const switchForm = document.getElementById("switchForm");
  const formTitle = document.getElementById("formTitle");
  const switchInfo = document.getElementById("switchInfo");
  const recoveryForm = document.getElementById("recoveryForm");
  const switchWrap = document.getElementById("switchWrap");
  const openRecovery = document.getElementById("openRecovery");
  const backToLogin = document.getElementById("backToLogin");
  const signinPhoneGroup = document.getElementById("signinPhoneGroup");
  const loginTabs = document.querySelectorAll(".tab-btn");
  let loginMethod = "email";

  
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

  function normalizePhone(value) {
    return String(value || "").replace(/[^\d]/g, "");
  }

  function setActiveForm(type) {
    signupForm?.classList.remove("active");
    signinForm?.classList.remove("active");
    recoveryForm?.classList.remove("active");

    if (type === "signup") {
      signupForm?.classList.add("active");
      if (formTitle) formTitle.textContent = "Yangi hisob yaratish";
      if (switchInfo) switchInfo.textContent = "Hisobingiz allaqachon bormi?";
      if (switchForm) switchForm.textContent = "Tizimga kirish";
      if (switchWrap) switchWrap.style.display = "block";
    } else if (type === "signin") {
      signinForm?.classList.add("active");
      if (formTitle) formTitle.textContent = "Tizimga kirish";
      if (switchInfo) switchInfo.textContent = "Hisobingiz yo'qmi?";
      if (switchForm) switchForm.textContent = "Ro'yxatdan o'tish";
      if (switchWrap) switchWrap.style.display = "block";
    } else if (type === "recovery") {
      recoveryForm?.classList.add("active");
      if (formTitle) formTitle.textContent = "Parolni tiklash";
      if (switchWrap) switchWrap.style.display = "none";
    }
  }

  function setLoginMethod(method) {
    loginMethod = method;
    loginTabs.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.login === method);
    });
    const emailGroup = document.getElementById("signinEmail")?.closest(".input-group");
    if (method === "phone") {
      emailGroup?.classList.add("is-hidden");
      signinPhoneGroup?.classList.remove("is-hidden");
      document.getElementById("signinEmail")?.removeAttribute("required");
      document.getElementById("signinPhone")?.setAttribute("required", "required");
    } else {
      emailGroup?.classList.remove("is-hidden");
      signinPhoneGroup?.classList.add("is-hidden");
      document.getElementById("signinPhone")?.removeAttribute("required");
      document.getElementById("signinEmail")?.setAttribute("required", "required");
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

  
  switchForm?.addEventListener("click", (e) => {
    e.preventDefault();
    const isSignupActive = signupForm?.classList.contains("active");
    setActiveForm(isSignupActive ? "signin" : "signup");
  });

  openRecovery?.addEventListener("click", () => {
    setActiveForm("recovery");
  });

  backToLogin?.addEventListener("click", () => {
    setActiveForm("signin");
  });

  loginTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      setLoginMethod(btn.dataset.login || "email");
    });
  });

  
  signupForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const name = document.getElementById("signupFullname")?.value.trim();
    const email = document.getElementById("signupEmail")?.value.trim();
    const phoneRaw = document.getElementById("signupPhone")?.value.trim();
    const phone = normalizePhone(phoneRaw);
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

    if (phone && phone.length < 7) {
      showMessage("error", "Telefon raqam noto'g'ri");
      return;
    }

    if (phone && users.find(u => normalizePhone(u.phone) === phone)) {
      showMessage("error", "Bu telefon raqam allaqachon ro'yxatdan o'tgan");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: name,
      email: email.toLowerCase(),
      password: password,
      phone: phoneRaw || "",
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

  
  signinForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const email = document.getElementById("signinEmail")?.value.trim();
    const phoneInput = document.getElementById("signinPhone")?.value.trim();
    const phone = normalizePhone(phoneInput);
    const password = document.getElementById("signinPassword")?.value;

    const users = getUsers();
    let user = null;

    if (loginMethod === "phone") {
      if (!phone || !password) {
        showMessage("error", "Telefon va parol kiriting");
        return;
      }
      user = users.find(u => normalizePhone(u.phone) === phone && u.password === password);
    } else {
      if (!email || !password) {
        showMessage("error", "Email va parol kiriting");
        return;
      }
      user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    }

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

  recoveryForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("recoveryEmail")?.value.trim();
    if (!email) {
      showMessage("error", "Email kiriting");
      return;
    }
    showMessage("success", "Agar email mavjud bo'lsa, tiklash havolasi yuboriladi");
    setTimeout(() => {
      setActiveForm("signin");
    }, 1200);
  });

  
  document.querySelectorAll(".input-group.password .toggle").forEach(toggle => {
    toggle.addEventListener("click", () => {
      const input = toggle.closest(".input-group").querySelector("input");
      const icon = toggle.querySelector("i");
      if (input.type === "password") {
        input.type = "text";
        if (icon) {
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
        }
      } else {
        input.type = "password";
        if (icon) {
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
        }
      }
    });
  });

  setActiveForm("signup");
  setLoginMethod("email");

  
  const currentUser = localStorage.getItem(KEYS.USER);
  if (currentUser) {
    const goToProfile = confirm("Siz allaqachon tizimga kirgansiz. Profilga o'tishni xohlaysizmi?");
    if (goToProfile) {
      location.href = "../profile.html";
    }
  }

})();
