document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const signinForm = document.getElementById("signinForm");
  const switchForm = document.getElementById("switchForm");
  const formTitle = document.getElementById("formTitle");
  const switchInfo = document.getElementById("switchInfo");

  /* =========================
     UTILITY FUNCTIONS
  ========================= */
  const get = (key) => JSON.parse(localStorage.getItem(key));
  const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  /* =========================
     SWITCH LOGIN / REGISTER
  ========================= */
  switchForm?.addEventListener("click", (e) => {
    e.preventDefault();
    const isSignupActive = signupForm.classList.contains("active");

    if (isSignupActive) {
      signupForm.classList.remove("active");
      signinForm.classList.add("active");
      if (formTitle) formTitle.textContent = "Tizimga kirish";
      if (switchInfo) switchInfo.textContent = "Hisobingiz yo'qmi?";
      switchForm.textContent = "Ro'yxatdan o'tish";
    } else {
      signinForm.classList.remove("active");
      signupForm.classList.add("active");
      if (formTitle) formTitle.textContent = "Yangi hisob yaratish";
      if (switchInfo) switchInfo.textContent = "Hisobingiz allaqachon bormi?";
      switchForm.textContent = "Tizimga kirish";
    }
    // Parol tiklash oynasi ochiq bo'lsa, uni yopamiz
    document.getElementById("resetPasswordSection").style.display = "none";
  });

  /* =========================
     REGISTER (SIGN UP)
  ========================= */
  signupForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signupFullname").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm").value;

    if (!name || !email || !password || password !== confirm) {
      alert("Iltimos, barcha maydonlarni to'g'ri to'ldiring.");
      return;
    }

    const users = get("users") || [];
    if (users.find((u) => u.email === email)) {
      alert("Bu email allaqachon ro'yxatdan o'tgan.");
      return;
    }

    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);
    set("users", users);
    set("currentUser", newUser); // Avtomatik login

    alert("Ro'yxatdan muvaffaqiyatli o'tdingiz!");
    location.href = "../profile.html";
  });

  /* =========================
     LOGIN (SIGN IN)
  ========================= */
  signinForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("signinEmail").value.trim();
    const password = document.getElementById("signinPassword").value;

    const users = get("users") || [];
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      alert("Email yoki parol xato");
      return;
    }

    set("currentUser", user);
    alert("Tizimga muvaffaqiyatli kirdingiz!");
    location.href = "../profile.html";
  });

  /* =========================
     FORGOT PASSWORD LOGIC
  ========================= */
  const forgotBtn = document.getElementById("forgotPasswordBtn");
  const resetSection = document.getElementById("resetPasswordSection");
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const resetTitle = document.getElementById("resetTitle");
  
  let foundUserIndex = -1;

  forgotBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    // Login formani yashirib, tiklash oynasini ko'rsatamiz
    signinForm.classList.remove("active");
    resetSection.style.display = "block";
    step1.style.display = "block";
    step2.style.display = "none";
    resetTitle.textContent = "Hisobni tiklash";
  });

  document.getElementById("checkUserBtn")?.addEventListener("click", () => {
    const name = document.getElementById("resetName").value.trim();
    const email = document.getElementById("resetEmail").value.trim();
    const users = get("users") || [];

    const idx = users.findIndex(u => u.name === name && u.email === email);

    if (idx !== -1) {
      foundUserIndex = idx;
      step1.style.display = "none";
      step2.style.display = "block";
      resetTitle.textContent = "Yangi parol kiriting";
    } else {
      alert("Ism yoki email mos kelmadi! ❌");
    }
  });

  document.getElementById("saveNewPassBtn")?.addEventListener("click", () => {
    const newPass = document.getElementById("newResetPassword").value;
    const users = get("users") || [];

    if (newPass.length < 6) {
      alert("Parol kamida 6 belgidan iborat bo'lsin!");
      return;
    }

    if (foundUserIndex !== -1) {
      users[foundUserIndex].password = newPass;
      set("users", users);
      alert("Parol yangilandi! Endi tizimga kirishingiz mumkin. ✅");
      location.reload(); 
    }
  });

  document.getElementById("cancelReset")?.addEventListener("click", () => {
    resetSection.style.display = "none";
    signinForm.classList.add("active");
  });

  /* =========================
     TOGGLE PASSWORD VISIBILITY
  ========================= */
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
});
// forgotBtn bosilganda:
forgotBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  
  // Login formani butunlay yashirish
  signinForm.style.display = "none";
  signupForm.style.display = "none"; // Agar ochiq bo'lsa
  
  // Tiklash bo'limini ko'rsatish
  resetSection.style.display = "block";
  step1.style.display = "block";
  step2.style.display = "none";
  resetTitle.textContent = "Ism va Emailni kiriting";
});

// "Orqaga qaytish" bosilganda:
document.getElementById("cancelReset")?.addEventListener("click", (e) => {
  e.preventDefault();
  resetSection.style.display = "none";
  signinForm.style.display = "block"; // Login formani qaytarish
});

// Foydalanuvchini tekshirish tugmasi:
document.getElementById("checkUserBtn")?.addEventListener("click", () => {
  const name = document.getElementById("resetName").value.trim();
  const email = document.getElementById("resetEmail").value.trim();
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const idx = users.findIndex(u => u.name === name && u.email === email);

  if (idx !== -1) {
      foundUserIndex = idx;
      step1.style.display = "none"; // Birinchi bosqichni yashirish
      step2.style.display = "block"; // Parol kiritishni ko'rsatish
      resetTitle.textContent = "Yangi parol kiriting";
  } else {
      alert("Bunday foydalanuvchi topilmadi! ❌");
  }
});