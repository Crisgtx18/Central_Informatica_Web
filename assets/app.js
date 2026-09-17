// STEP 1: Put your number here. Example: "5511999999999" (country + number, no + or spaces)
const WHATSAPP_NUMBER = "";

// STEP 2: Your products. Add more by copying a { ... } block.
// Note: category keys are code (English). Labels shown on screen are in Portuguese in HTML.
const PRODUCTS = [
  { id: 1, name: "Arduino UNO R3", category: "components", price: 350, stock: 12, icon: "🔌" },
  { id: 2, name: "Kit Resistores 600 pcs", category: "components", price: 199, stock: 20, icon: "⚡" },
  { id: 3, name: "Memória RAM 8GB DDR4 Notebook", category: "laptops", price: 650, stock: 8, icon: "💻" },
  { id: 4, name: "SSD 480GB SATA", category: "laptops", price: 850, stock: 10, icon: "💾" },
  { id: 5, name: "Tela iPhone 11", category: "phones", price: 900, stock: 5, icon: "📱" },
  { id: 6, name: "Bateria Samsung A32", category: "phones", price: 450, stock: 7, icon: "🔋" },
  { id: 7, name: "Placa RTX 3060 12GB", category: "gpu", price: 7500, stock: 3, icon: "🎮" },
  { id: 8, name: "Pasta térmica + pads GPU", category: "gpu", price: 250, stock: 15, icon: "🌡️" },
  { id: 9, name: "Ferro de solda + estanho kit", category: "accessories", price: 400, stock: 9, icon: "🔧" },
  { id: 10, name: "Multímetro digital", category: "accessories", price: 350, stock: 11, icon: "📟" },
  { id: 11, name: "Carregador universal notebook", category: "laptops", price: 550, stock: 6, icon: "🔌" },
  { id: 12, name: "Cabo USB-C dados rápidos", category: "accessories", price: 150, stock: 30, icon: "🔗" },
];

let activeCategory = "all";
let searchQuery = "";
// Cart saved in localStorage so it survives page changes
let cartItems = [];
try { cartItems = JSON.parse(localStorage.getItem("ci_cart") || "[]"); } catch { cartItems = []; }

// Helper: get element by id, returns null if page has no such element (multi-page)
const getById = (id) => document.getElementById(id);
const productGrid = getById("grid");
const emptyMessage = getById("empty");
const searchInput = getById("search");
const cartPanel = getById("cart-panel");
const pageOverlay = getById("overlay");

function formatMoney(value) { return "R$" + value.toLocaleString("pt-BR"); }

function renderProducts() {
  if (!productGrid) return; // this page has no store (ex. home, services)
  productGrid.innerHTML = "";
  const filteredList = PRODUCTS.filter((product) =>
    (activeCategory === "all" || product.category === activeCategory) &&
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (emptyMessage) emptyMessage.classList.toggle("hidden", filteredList.length > 0);
  filteredList.forEach((product) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="icon">${product.icon}</div>
      <h3>${product.name}</h3>
      <p class="stock">${product.category} • estoque: ${product.stock}</p>
      <p class="price">${formatMoney(product.price)}</p>
      <button class="btn btn-primary" type="button">Adicionar 🛒</button>`;
    card.querySelector("button").addEventListener("click", () => addToCart(product.id));
    productGrid.appendChild(card);
  });
}

function saveCart() {
  localStorage.setItem("ci_cart", JSON.stringify(cartItems));
  renderCart();
}

function addToCart(productId) {
  const foundItem = cartItems.find((item) => item.id === productId);
  if (foundItem) foundItem.quantity++;
  else cartItems.push({ id: productId, quantity: 1 });
  saveCart();
  openCart();
}

function renderCart() {
  const itemsBox = getById("cart-items");
  const countBadge = getById("cart-count");
  const totalLabel = getById("cart-total");
  if (!itemsBox || !countBadge || !totalLabel) return;
  itemsBox.innerHTML = "";
  let totalPrice = 0, totalCount = 0;
  cartItems.forEach((item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.id);
    if (!product) return;
    totalPrice += product.price * item.quantity;
    totalCount += item.quantity;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div><strong>${product.icon} ${product.name}</strong><br/><span class="stock">${formatMoney(product.price)} x ${item.quantity}</span></div>
      <div><button type="button">✕</button></div>`;
    row.querySelector("button").addEventListener("click", () => {
      cartItems = cartItems.filter((entry) => entry.id !== item.id);
      saveCart();
    });
    itemsBox.appendChild(row);
  });
  if (cartItems.length === 0) itemsBox.innerHTML = '<p class="muted">Carrinho vazio. Vá para Loja 👆</p>';
  countBadge.textContent = totalCount;
  totalLabel.textContent = formatMoney(totalPrice);
}

function openCart() {
  if (!cartPanel || !pageOverlay) return;
  cartPanel.classList.add("open");
  pageOverlay.classList.remove("hidden");
}
function closeCart() {
  if (!cartPanel || !pageOverlay) return;
  cartPanel.classList.remove("open");
  pageOverlay.classList.add("hidden");
}

function sendWhatsApp(message) {
  if (!WHATSAPP_NUMBER) {
    alert("Ainda sem número de WhatsApp. Adicione WHATSAPP_NUMBER em assets/app.js");
    return;
  }
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

// Events (only if element exists on current page)
document.querySelectorAll("#filters .chip").forEach((filterButton) => {
  filterButton.addEventListener("click", () => {
    document.querySelectorAll("#filters .chip").forEach((btn) => btn.classList.remove("active"));
    filterButton.classList.add("active");
    activeCategory = filterButton.dataset.category;
    renderProducts();
  });
});
if (searchInput) searchInput.addEventListener("input", (event) => { searchQuery = event.target.value; renderProducts(); });

if (getById("btn-cart")) getById("btn-cart").addEventListener("click", openCart);
if (getById("btn-close-cart")) getById("btn-close-cart").addEventListener("click", closeCart);
if (pageOverlay) pageOverlay.addEventListener("click", closeCart);
if (getById("btn-clear")) getById("btn-clear").addEventListener("click", () => { cartItems = []; saveCart(); });

if (getById("btn-order")) getById("btn-order").addEventListener("click", () => {
  if (cartItems.length === 0) return alert("Carrinho vazio");
  const orderLines = cartItems.map((item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.id);
    return `• ${product.name} x${item.quantity} = R$${product.price * item.quantity}`;
  });
  const orderTotal = getById("cart-total").textContent;
  sendWhatsApp(`Olá Central Informática, quero comprar:\n${orderLines.join("\n")}\nTotal: ${orderTotal}`);
});

if (getById("quote-form")) getById("quote-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const customerName = getById("customer-name").value;
  const deviceType = getById("device-type").value;
  const issueDesc = getById("issue-desc").value;
  sendWhatsApp(`Olá, sou ${customerName}. Tenho um(a) ${deviceType} com este defeito: ${issueDesc}. Pode me ajudar com orçamento?`);
});

if (getById("btn-menu")) getById("btn-menu").addEventListener("click", () => {
  getById("nav").classList.toggle("open");
});

// Start (works on all 5 pages)
renderProducts();
renderCart();
