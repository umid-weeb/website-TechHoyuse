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

    const menuName = document.getElementById("menuName");
    const menuEmail = document.getElementById("menuEmail");
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    
    if (menuName) menuName.textContent = user.name || "Sizning ismingiz";
    if (menuEmail) menuEmail.textContent = user.email || "email@example.com";
    if (profileName) profileName.textContent = user.name || "Sizning ismingiz";
    if (profileEmail) profileEmail.textContent = user.email || "email@example.com";

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const addressInput = document.getElementById("address");

    if (nameInput) nameInput.value = user.name || "";
    if (emailInput) emailInput.value = user.email || "";
    if (phoneInput) phoneInput.value = user.phone || "";
    if (addressInput) addressInput.value = user.address || "";

    renderOrders();
  }

  function renderOrders() {
    const container = document.getElementById("orders-list");
    if (!container) return;

    const orders = Store.getUserOrders();

    if (!orders.length) {
      container.innerHTML = `
        <div class="orders-empty">
          <i class="fa-solid fa-box-open"></i>
          <p>Hali buyurtmalar yo'q</p>
          <a href="products.html" class="btn-primary">Xarid qilish</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <span class="order-id">${order.id}</span>
            <span class="order-date">${new Date(order.createdAt).toLocaleDateString('uz-UZ')}</span>
          </div>
          <span class="order-status ${order.status}">${order.status === 'pending' ? 'Kutilmoqda' : 'Bajarildi'}</span>
        </div>
        <div class="order-card-body">
          <span>${order.items.length} ta mahsulot</span>
          <span class="order-total">${UI.formatPrice(order.total)}</span>
        </div>
      </div>
    `).join("");
  }

  function switchTab(tabId) {
    document.querySelectorAll(".profile-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.tab === tabId);
    });

    document.querySelectorAll(".profile-tab-content").forEach(content => {
      content.classList.toggle("active", content.id === `tab-${tabId}`);
    });

    document.querySelectorAll(".profile-menu li").forEach(li => {
      li.classList.remove("active");
    });

    if (tabId === "info") {
      document.querySelector(".menu-profile")?.classList.add("active");
    } else if (tabId === "orders") {
      document.querySelector(".menu-orders")?.classList.add("active");
    } else if (tabId === "settings") {
      document.querySelector(".menu-settings")?.classList.add("active");
    }
  }

  function init() {
    renderProfile();

    document.querySelectorAll(".profile-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        switchTab(tab.dataset.tab);
      });
    });

    document.querySelector(".menu-profile")?.addEventListener("click", () => switchTab("info"));
    document.querySelector(".menu-orders")?.addEventListener("click", () => switchTab("orders"));
    document.querySelector(".menu-settings")?.addEventListener("click", () => switchTab("settings"));

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

    function handleLogout() {
      Store.logout();
      UI.toast("info", "Tizimdan chiqdingiz");
      setTimeout(() => {
        location.href = "index.html";
      }, 1000);
    }

    document.getElementById("logout")?.addEventListener("click", handleLogout);
    document.getElementById("mobile-logout")?.addEventListener("click", handleLogout);
    document.getElementById("mobile-logout-btn")?.addEventListener("click", handleLogout);

    document.getElementById("avatarInput")?.addEventListener("change", function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const avatarUrl = event.target.result;
          const avatar = document.getElementById("avatar");
          const menuAvatar = document.getElementById("menuAvatar");
          if (avatar) avatar.src = avatarUrl;
          if (menuAvatar) menuAvatar.src = avatarUrl;
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
