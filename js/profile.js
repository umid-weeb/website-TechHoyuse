// Profile page logic: require authentication, edit profile, change password, avatar upload (base64)
(function () {
  "use strict";

  // run only on profile page
  if (!/profile\.html/i.test(window.location.pathname)) return;

  document.addEventListener("DOMContentLoaded", function () {
    const current =
      window.Auth && window.Auth.getCurrentUser
        ? window.Auth.getCurrentUser()
        : null;
    if (!current) {
      // not logged in -> redirect to auth
      window.location.href = "/auth/index.html";
      return;
    }

    // elements
    const menuName = document.getElementById("menuName");
    const menuEmail = document.getElementById("menuEmail");
    const avatar = document.getElementById("avatar");
    const menuAvatar = document.getElementById("menuAvatar");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const addressInput = document.getElementById("address");
    const saveBtn = document.getElementById("saveProfile");
    const avatarInput = document.getElementById("avatarInput");

    // populate
    function populate(user) {
      if (!user) return;
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const full = users.find((u) => u.id === user.id) || user;
      menuName && (menuName.textContent = full.name || "Sizning ismingiz");
      menuEmail && (menuEmail.textContent = full.email || "");
      if (avatar) avatar.src = full.avatar || avatar.src;
      if (menuAvatar) menuAvatar.src = full.avatar || menuAvatar.src;
      if (nameInput) nameInput.value = full.name || "";
      if (emailInput) emailInput.value = full.email || "";
      if (phoneInput) phoneInput.value = full.phone || "";
      if (addressInput) addressInput.value = full.address || "";
    }

    populate(current);

    // save profile
    saveBtn &&
      saveBtn.addEventListener("click", function () {
        const name = (nameInput.value || "").trim();
        const email = (emailInput.value || "").toLowerCase().trim();
        const phone = (phoneInput.value || "").trim();
        const address = (addressInput.value || "").trim();

        // check duplicate email (except current)
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const dup = users.find((u) => u.email === email && u.id !== current.id);
        if (dup) {
          window.UI &&
            window.UI.toast &&
            window.UI.toast(
              "error",
              "Bu email boshqa foydalanuvchi tomonidan ishlatilmoqda"
            );
          return;
        }

        // update stored user object (keep password)
        const updated = users.map((u) => {
          if (u.id === current.id) {
            return Object.assign({}, u, {
              name,
              email,
              phone,
              address,
              avatar: u.avatar || "",
            });
          }
          return u;
        });
        localStorage.setItem("users", JSON.stringify(updated));
        // update current user
        const cur = updated.find((u) => u.id === current.id);
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: cur.id,
            name: cur.name,
            email: cur.email,
            avatar: cur.avatar,
          })
        );
        window.UI &&
          window.UI.toast &&
          window.UI.toast("success", "Profil yangilandi");
        // refresh UI
        populate(cur);
        // inform Auth module
        window.Auth &&
          window.Auth.updateCurrent &&
          window.Auth.updateCurrent({
            name: cur.name,
            email: cur.email,
            avatar: cur.avatar,
          });
      });

    // avatar upload -> base64
    avatarInput &&
      avatarInput.addEventListener("change", function (ev) {
        const file = ev.target.files && ev.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
          const base64 = e.target.result;
          // update users and currentUser
          const users = JSON.parse(localStorage.getItem("users") || "[]");
          const updated = users.map((u) => {
            if (u.id === current.id) {
              return Object.assign({}, u, { avatar: base64 });
            }
            return u;
          });
          localStorage.setItem("users", JSON.stringify(updated));
          const cur = updated.find((u) => u.id === current.id);
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              id: cur.id,
              name: cur.name,
              email: cur.email,
              avatar: cur.avatar,
            })
          );
          if (avatar) avatar.src = base64;
          if (menuAvatar) menuAvatar.src = base64;
          window.UI &&
            window.UI.toast &&
            window.UI.toast("success", "Avatar o‘zgartirildi");
          // inform Auth
          window.Auth &&
            window.Auth.updateCurrent &&
            window.Auth.updateCurrent({ avatar: base64 });
        };
        reader.readAsDataURL(file);
      });

    // settings section toggle
    const settingsBtn = document.querySelector(".menu-settings");
    const settingsSection = document.getElementById("settingsSection");
    if (settingsBtn && settingsSection) {
      settingsBtn.addEventListener("click", function () {
        settingsSection.style.display =
          settingsSection.style.display === "none" ? "block" : "none";
      });
    }

    // change password
    const changeBtn = document.getElementById("changePassword");
    if (changeBtn) {
      changeBtn.addEventListener("click", function () {
        const oldPw = document.getElementById("oldPassword").value || "";
        const newPw = document.getElementById("newPassword").value || "";
        const confirmPw =
          document.getElementById("confirmPassword").value || "";
        if (!oldPw || !newPw) {
          window.UI &&
            window.UI.toast &&
            window.UI.toast("error", "Parol maydonlari to‘ldirilishi kerak");
          return;
        }
        if (newPw !== confirmPw) {
          window.UI &&
            window.UI.toast &&
            window.UI.toast("error", "Yangi parollar mos kelmaydi");
          return;
        }
        // verify old password from users list
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const user = users.find((u) => u.id === current.id);
        if (!user || user.password !== oldPw) {
          window.UI &&
            window.UI.toast &&
            window.UI.toast("error", "Eski parol noto‘g‘ri");
          return;
        }
        // update password
        const updated = users.map((u) =>
          u.id === current.id ? Object.assign({}, u, { password: newPw }) : u
        );
        localStorage.setItem("users", JSON.stringify(updated));
        window.UI &&
          window.UI.toast &&
          window.UI.toast("success", "Parol muvaffaqiyatli o‘zgartirildi");
      });
    }

    // logout
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        window.Auth && window.Auth.logout && window.Auth.logout();
        window.location.href = "/";
      });
    }
  });
})();
