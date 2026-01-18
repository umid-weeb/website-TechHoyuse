// Auth module: simple localStorage-based registration/login/logout
(function () {
  "use strict";

  const LS_USERS = "users";
  const LS_CURRENT = "currentUser";

  function readUsers() {
    const raw = localStorage.getItem(LS_USERS);
    if (!raw) return [];
    try {
      return JSON.parse(raw) || [];
    } catch (e) {
      return [];
    }
  }
  function writeUsers(users) {
    localStorage.setItem(LS_USERS, JSON.stringify(users || []));
  }

  function readCurrent() {
    const raw = localStorage.getItem(LS_CURRENT);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }
  function writeCurrent(user) {
    if (!user) localStorage.removeItem(LS_CURRENT);
    else localStorage.setItem(LS_CURRENT, JSON.stringify(user));
    // let UI adjust profile link
    window.UI && window.UI.adjustProfileLink && window.UI.adjustProfileLink();
  }

  const Auth = {
    register({ name, email, password }) {
      email = (email || "").toLowerCase().trim();
      if (!email || !password) {
        return { ok: false, error: "Email va parol kerak" };
      }
      const users = readUsers();
      if (users.find((u) => u.email === email)) {
        return { ok: false, error: "Bu email allaqachon ro‘yxatdan o‘tgan" };
      }
      const id = Date.now();
      const user = { id, name: name || "", email, password, avatar: "" };
      users.push(user);
      writeUsers(users);
      writeCurrent({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      });
      return { ok: true, user };
    },
    login(email, password) {
      email = (email || "").toLowerCase().trim();
      const users = readUsers();
      const user = users.find(
        (u) => u.email === email && u.password === password
      );
      if (!user) return { ok: false, error: "Email yoki parol noto‘g‘ri" };
      writeCurrent({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      });
      return { ok: true, user };
    },
    logout() {
      writeCurrent(null);
      return { ok: true };
    },
    getCurrentUser() {
      return readCurrent();
    },
    updateCurrent(userObj) {
      // update currentUser and users list
      const cur = readCurrent();
      if (!cur) return { ok: false, error: "No current user" };
      let users = readUsers();
      users = users.map((u) => {
        if (u.id === cur.id) {
          return Object.assign({}, u, userObj);
        }
        return u;
      });
      writeUsers(users);
      const updated = users.find((u) => u.id === cur.id);
      writeCurrent({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        avatar: updated.avatar,
      });
      return { ok: true, user: updated };
    },
  };

  window.Auth = Auth;

  // adjust profile link on load
  document.addEventListener("DOMContentLoaded", function () {
    window.UI && window.UI.adjustProfileLink && window.UI.adjustProfileLink();
  });
})();
