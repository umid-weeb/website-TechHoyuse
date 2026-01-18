/**
 * CHECKOUT-PAGE.JS - Checkout Page Logic
 */
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
    if (!container) return;

    const items = Store.getCartDetails();
    
    if (!items.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px 20px;">
          <p style="color:#666;">Savatingiz bo'sh</p>
          <a href="products.html" style="color:#ff6a00;">Xarid qilish</a>
        </div>
      `;
      return;
    }

    const subtotal = Store.getCartSubtotal();
    const shipping = Store.getShippingFee();
    const total = Store.getCartTotal();

    container.innerHTML = `
      <h3 style="margin-bottom:20px;font-size:18px;">Buyurtma xulosasi</h3>
      <div class="order-items" style="max-height:300px;overflow-y:auto;margin-bottom:20px;">
        ${items.map(item => `
          <div class="order-item" style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #eee;">
            <img src="${item.image}" alt="${item.name}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">
            <div style="flex:1;">
              <p style="font-weight:500;margin-bottom:4px;">${item.name}</p>
              <small style="color:#666;">${item.qty} x ${UI.formatPrice(item.price)}</small>
            </div>
            <span style="font-weight:600;">${UI.formatPrice(item.subtotal)}</span>
          </div>
        `).join("")}
      </div>
      <div class="order-totals" style="border-top:2px solid #eee;padding-top:15px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span>Oraliq jami:</span>
          <span>${UI.formatPrice(subtotal)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span>Yetkazib berish:</span>
          <span>${shipping === 0 ? '<span style="color:#22c55e;">Bepul</span>' : UI.formatPrice(shipping)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;margin-top:15px;padding-top:15px;border-top:1px solid #eee;">
          <span>Jami:</span>
          <span style="color:#ff6a00;">${UI.formatPrice(total)}</span>
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

    // Delivery address validation
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

    // Payment method
    formData.paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || "cash";

    return errors;
  }

  function showErrors(errors) {
    // Clear previous errors
    document.querySelectorAll(".field-error").forEach(el => el.remove());
    document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));

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

    // Create order
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
      // Save order ID for success page
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

    deliveryOptions.forEach(opt => {
      opt.addEventListener("click", () => {
        deliveryOptions.forEach(o => o.classList.remove("active"));
        opt.classList.add("active");

        const input = opt.querySelector('input[name="delivery"]');
        if (input) input.checked = true;

        if (addressSection) {
          addressSection.style.display = input?.value === "delivery" ? "block" : "none";
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

    // Place order button
    document.getElementById("place-order-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      placeOrder();
    });

    // Also handle form submit
    document.getElementById("checkout-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      placeOrder();
    });

    // Clear errors on input
    document.querySelectorAll("input, select, textarea").forEach(el => {
      el.addEventListener("input", () => {
        el.classList.remove("input-error");
        el.style.borderColor = "";
        const error = el.parentNode.querySelector(".field-error");
        if (error) error.remove();
      });
    });

    // Listen for cart updates
    window.addEventListener("cart:updated", renderOrderSummary);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
