
(function() {
  "use strict";

  if (!location.pathname.includes("checkout.html")) return;

  let formData = {
    name: "",
    surname: "",
    email: "",
    phone: "",
    deliveryMethod: "pickup",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "card"
  };

  function renderOrderSummary() {
    const container = document.getElementById("order-summary");
    const mobileTotal = document.getElementById("mobile-order-total");
    
    if (!container) return;

    const items = Store.getCartDetails();
    
    if (!items.length) {
      container.innerHTML = `
        <div class="order-empty">
          <p>Savatingiz bo'sh</p>
          <a href="products.html">Xarid qilish</a>
        </div>
      `;
      if (mobileTotal) mobileTotal.textContent = "$0.00";
      return;
    }

    const subtotal = Store.getCartSubtotal();
    const shipping = Store.getShippingFee();
    const total = Store.getCartTotal();

    if (mobileTotal) mobileTotal.textContent = UI.formatPrice(total);

    container.innerHTML = `
      <div class="order-items">
        ${items.map(item => `
          <div class="order-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="order-item-info">
              <p>${item.name}</p>
              <small>${item.qty} x ${UI.formatPrice(item.price)}</small>
            </div>
            <span class="order-item-price">${UI.formatPrice(item.subtotal)}</span>
          </div>
        `).join("")}
      </div>
      <div class="order-totals">
        <div class="row">
          <span>Oraliq jami:</span>
          <span>${UI.formatPrice(subtotal)}</span>
        </div>
        <div class="row">
          <span>Yetkazib berish:</span>
          <span>${shipping === 0 ? '<span class="free">Bepul</span>' : UI.formatPrice(shipping)}</span>
        </div>
        <div class="row total">
          <span>Jami:</span>
          <span>${UI.formatPrice(total)}</span>
        </div>
      </div>
    `;
  }

  function validateForm() {
    const errors = [];

    const nameEl = document.getElementById("checkout-name");
    const surnameEl = document.getElementById("checkout-surname");
    const emailEl = document.getElementById("checkout-email");
    const phoneEl = document.getElementById("checkout-phone");

    formData.name = nameEl?.value.trim() || "";
    formData.surname = surnameEl?.value.trim() || "";
    formData.email = emailEl?.value.trim() || "";
    formData.phone = phoneEl?.value.trim() || "";

    if (!formData.name) errors.push({ field: "checkout-name", message: "Ism kiritilishi shart" });
    if (!formData.phone) errors.push({ field: "checkout-phone", message: "Telefon raqam kiritilishi shart" });
    if (formData.email && !formData.email.includes("@")) {
      errors.push({ field: "checkout-email", message: "Email formati noto'g'ri" });
    }

    const deliveryMethod = document.querySelector('input[name="delivery"]:checked')?.value || "pickup";
    formData.deliveryMethod = deliveryMethod;

    if (deliveryMethod === "delivery") {
      const addressEl = document.getElementById("checkout-address");
      const cityEl = document.getElementById("checkout-city");
      
      formData.address = addressEl?.value.trim() || "";
      formData.city = cityEl?.value.trim() || "";

      if (!formData.address) errors.push({ field: "checkout-address", message: "Manzil kiritilishi shart" });
      if (!formData.city) errors.push({ field: "checkout-city", message: "Shahar kiritilishi shart" });
    }

    formData.paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || "cash";

    return errors;
  }

  function showErrors(errors) {
    document.querySelectorAll(".field-error").forEach(el => el.remove());
    document.querySelectorAll(".input-error").forEach(el => {
      el.classList.remove("input-error");
      el.style.borderColor = "";
    });

    errors.forEach(err => {
      const field = document.getElementById(err.field);
      if (field) {
        field.classList.add("input-error");
        field.style.borderColor = "#ef4444";
        
        const errorEl = document.createElement("small");
        errorEl.className = "field-error";
        errorEl.style.cssText = "color:#ef4444;display:block;margin-top:4px;";
        errorEl.textContent = err.message;
        field.parentNode.appendChild(errorEl);
      }
    });

    if (errors.length > 0) {
      const firstField = document.getElementById(errors[0].field);
      if (firstField) {
        firstField.focus();
        firstField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

  function placeOrder() {
    if (Store.isCartEmpty()) {
      UI.toast("error", "Savatingiz bo'sh");
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      showErrors(errors);
      UI.toast("error", "Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    const result = Store.createOrder({
      name: formData.name + " " + formData.surname,
      phone: formData.phone,
      email: formData.email,
      deliveryMethod: formData.deliveryMethod,
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      paymentMethod: formData.paymentMethod
    });

    if (result.success) {
      sessionStorage.setItem("lastOrderId", result.order.id);
      
      UI.toast("success", "Buyurtma muvaffaqiyatli joylashtirildi!");
      
      setTimeout(() => {
        location.href = "order-success.html";
      }, 1000);
    } else {
      UI.toast("error", result.error || "Xatolik yuz berdi");
    }
  }

  function setupDeliveryToggle() {
    const deliveryOptions = document.querySelectorAll('.delivery-option');
    const addressSection = document.getElementById("address-section");
    const storeField = document.getElementById("store-field");

    deliveryOptions.forEach(opt => {
      opt.addEventListener("click", () => {
        deliveryOptions.forEach(o => o.classList.remove("active"));
        opt.classList.add("active");

        const input = opt.querySelector('input[name="delivery"]');
        if (input) input.checked = true;

        const isDelivery = input?.value === "delivery";
        if (addressSection) {
          addressSection.style.display = isDelivery ? "block" : "none";
        }
        if (storeField) {
          storeField.style.display = isDelivery ? "none" : "block";
        }
      });
    });
  }

  function setupPaymentToggle() {
    const paymentOptions = document.querySelectorAll('.payment-option');

    paymentOptions.forEach(opt => {
      opt.addEventListener("click", () => {
        paymentOptions.forEach(o => o.classList.remove("active"));
        opt.classList.add("active");

        const input = opt.querySelector('input[name="payment"]');
        if (input) input.checked = true;
      });
    });
  }

  function prefillUserData() {
    const user = Store.getUser();
    if (!user) return;

    const nameEl = document.getElementById("checkout-name");
    const emailEl = document.getElementById("checkout-email");
    const phoneEl = document.getElementById("checkout-phone");

    if (nameEl && user.name) {
      const parts = user.name.split(" ");
      nameEl.value = parts[0] || "";
      const surnameEl = document.getElementById("checkout-surname");
      if (surnameEl && parts.length > 1) {
        surnameEl.value = parts.slice(1).join(" ");
      }
    }
    if (emailEl && user.email) emailEl.value = user.email;
    if (phoneEl && user.phone) phoneEl.value = user.phone;
  }

  function init() {
    renderOrderSummary();
    prefillUserData();
    setupDeliveryToggle();
    setupPaymentToggle();

    document.getElementById("place-order-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      placeOrder();
    });

    document.getElementById("mobile-place-order-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      placeOrder();
    });

    document.getElementById("checkout-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      placeOrder();
    });

    document.querySelectorAll("input, select, textarea").forEach(el => {
      el.addEventListener("input", () => {
        el.classList.remove("input-error");
        el.style.borderColor = "";
        const error = el.parentNode.querySelector(".field-error");
        if (error) error.remove();
      });
    });

    window.addEventListener("cart:updated", renderOrderSummary);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
