/**
 * PROFILE.JS - Profile Page Logic
 */
(function() {
  "use strict";

  if (!location.pathname.includes("profile.html")) return;

  function renderProfile() {
    const user = Store.getUser();

    if (!user) {
      location.href = "auth/login.html";
      return;
    }

    // Update menu
    document.getElementById("menuName").textContent = user.name || "Sizning ismingiz";
    document.getElementById("menuEmail").textContent = user.email || "email@example.com";
    
    // Update profile card
    document.getElementById("profileName").textContent = user.name || "Sizning ismingiz";
    document.getElementById("profileEmail").textContent = user.email || "email@example.com";

    // Fill form inputs
    document.getElementById("name").value = user.name || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("phone").value = user.phone || "";
    document.getElementById("address").value = user.address || "";
  }

  function init() {
    renderProfile();

    // Save profile
    document.getElementById("saveProfile")?.addEventListener("click", () => {
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const address = document.getElementById("address").value.trim();

      if (!name) {
        UI.toast("error", "Ism kiritilishi shart");
        return;
      }

      const updated = Store.updateUser({ name, email, phone, address });
      if (updated) {
        UI.toast("success", "Ma'lumotlar saqlandi");
        renderProfile();
      } else {
        UI.toast("error", "Xatolik yuz berdi");
      }
    });

    // Change password
    document.getElementById("changePassword")?.addEventListener("click", () => {
      const oldPassword = document.getElementById("oldPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (!oldPassword || !newPassword) {
        UI.toast("error", "Barcha maydonlarni to'ldiring");
        return;
      }

      if (newPassword !== confirmPassword) {
        UI.toast("error", "Parollar mos kelmadi");
        return;
      }

      if (newPassword.length < 6) {
        UI.toast("error", "Parol kamida 6 belgidan iborat bo'lsin");
        return;
      }

      const result = Store.changePassword(oldPassword, newPassword);
      if (result.success) {
        UI.toast("success", "Parol yangilandi");
        document.getElementById("oldPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmPassword").value = "";
      } else {
        UI.toast("error", result.error);
      }
    });

    // Logout
    document.getElementById("logout")?.addEventListener("click", () => {
      Store.logout();
      UI.toast("info", "Tizimdan chiqdingiz");
      setTimeout(() => {
        location.href = "index.html";
      }, 1000);
    });

    // Menu navigation
    document.querySelector(".menu-profile")?.addEventListener("click", () => {
      document.querySelector(".profile-info")?.parentElement?.style.setProperty("display", "block");
      document.getElementById("settingsSection")?.style.setProperty("display", "none");
      document.querySelectorAll(".profile-menu li").forEach(li => li.classList.remove("active"));
      document.querySelector(".menu-profile")?.classList.add("active");
    });

    document.querySelector(".menu-settings")?.addEventListener("click", () => {
      document.querySelector(".profile-info")?.parentElement?.style.setProperty("display", "none");
      document.getElementById("settingsSection")?.style.setProperty("display", "block");
      document.querySelectorAll(".profile-menu li").forEach(li => li.classList.remove("active"));
      document.querySelector(".menu-settings")?.classList.add("active");
    });

    // Avatar upload (mock)
    document.getElementById("avatarInput")?.addEventListener("change", function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const avatarUrl = event.target.result;
          document.getElementById("avatar").src = avatarUrl;
          document.getElementById("menuAvatar").src = avatarUrl;
          UI.toast("success", "Rasm yangilandi");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
