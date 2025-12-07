// Thrift Haven basic cart system
const CART_KEY = "thriftHavenCart";

function getCart() {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount(cart);
}

function updateCartCount(cart) {
  const badge = document.querySelector("[data-cart-count]");
  if (!badge) return;
  const list = cart || getCart();
  const count = list.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = count;
}

function addToCartFromButton(button) {
  const product = {
    id: button.dataset.productId,
    name: button.dataset.productName,
    price: parseFloat(button.dataset.productPrice),
    image: button.dataset.productImage || "",
  };

  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);

  button.textContent = "Added";
  setTimeout(() => (button.textContent = "Add to cart"), 800);
}

// CART PAGE RENDERING ---------------------------------------

function renderCartPage() {
  const container = document.getElementById("cart-items");
  const summaryBox = document.getElementById("cart-summary");
  if (!container || !summaryBox) return;

  const cart = getCart();
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML =
      '<p style="font-size:14px;color:#6b7280;">Your cart is empty. Head to the shop to add some pieces.</p>';
  } else {
    cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div class="cart-thumb">
          ${
            item.image
              ? <img src="${item.image}" alt="${item.name}">
              : ""
          }
        </div>
        <div>
          <div class="cart-title">${item.name}</div>
          <div class="cart-meta">£${item.price.toFixed(2)}</div>
          <div class="cart-qty">
            <button data-action="minus" data-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button data-action="plus" data-id="${item.id}">+</button>
            <button data-action="remove" data-id="${item.id}" style="margin-left:8px;font-size:11px;">Remove</button>
          </div>
        </div>
        <div style="text-align:right;font-size:14px;">
          £${(item.price * item.quantity).toFixed(2)}
        </div>
      `;
      container.appendChild(row);
    });

    // quantity controls
    container.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      let cartNow = getCart();
      const item = cartNow.find((x) => x.id === id);
      if (!item) return;

      if (action === "plus") item.quantity += 1;
      if (action === "minus") item.quantity = Math.max(1, item.quantity - 1);
      if (action === "remove") cartNow = cartNow.filter((x) => x.id !== id);

      saveCart(cartNow);
      renderCartPage();
    });
  }

  // summary
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = cart.length ? 4.5 : 0;
  const total = subtotal + shipping;

  summaryBox.innerHTML = `
    <div class="cart-summary-row">
      <span>Subtotal</span><span>£${subtotal.toFixed(2)}</span>
    </div>
    <div class="cart-summary-row">
      <span>Estimated shipping</span><span>${shipping ? "£" + shipping.toFixed(2) : "Free"}</span>
    </div>
    <div class="cart-summary-row">
      <span>Total</span><span>£${total.toFixed(2)}</span>
    </div>
    <button class="btn-primary" style="width:100%;margin-top:10px;" id="buy-now-btn">
      Buy cart now
    </button>
    <button class="btn-secondary" style="width:100%;margin-top:8px;" id="clear-cart-btn">
      Clear cart
    </button>
  `;

  const buyBtn = document.getElementById("buy-now-btn");
  const clearBtn = document.getElementById("clear-cart-btn");

  buyBtn.addEventListener("click", () => {
    if (!cart.length) return;
    alert("Thank you for your order! We’ll email your confirmation shortly.");
    saveCart([]);
    renderCartPage();
  });

  clearBtn.addEventListener("click", () => {
    saveCart([]);
    renderCartPage();
  });
}

// CONTACT FORM ------------------------------------------------

function initContactForm() {
  const form = document.querySelector("form[data-contact-form]");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const messageBox = document.getElementById("contact-message");
    if (messageBox) {
      messageBox.textContent =
        "Thank you for your message. We’ll get back to you soon.";
    }
    form.reset();
  });
}

// INIT --------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  const page = document.body.dataset.page;

  if (page === "cart") {
    renderCartPage();
  }
  if (page === "contact") {
    initContactForm();
  }
});
