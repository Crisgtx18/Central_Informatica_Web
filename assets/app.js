const WHATSAPP_NUMBER = "5575981942021";
const EMAIL_CONTACT = "contato@centralinformatica.com.br";
const CATEGORY_LABELS = {
  "pc-nuevo": "Componentes PC Nuevos",
  "pc-usado": "Componentes PC Usados",
  "cel-nuevo": "Celulares Nuevos",
  "cel-usado": "Celulares Usados",
  "componentes": "Componentes",
  "notebooks": "Notebooks",
  "all": "Todos"
};
const PRODUCTS = [
  { id: 1, name: "Memoria RAM 8GB DDR4 3200MHz Nueva", category: "pc-nuevo", condition: "nuevo", price: 650, stock: 10, icon: "💾" },
  { id: 2, name: "SSD 480GB SATA Nuevo", category: "pc-nuevo", condition: "nuevo", price: 850, stock: 12, icon: "💽" },
  { id: 3, name: "Placa RTX 3060 12GB Nueva", category: "pc-nuevo", condition: "nuevo", price: 7500, stock: 3, icon: "🎮" },
  { id: 4, name: "Fuente 650W 80 Plus Nueva", category: "pc-nuevo", condition: "nuevo", price: 1200, stock: 6, icon: "🔌" },
  { id: 5, name: "Placa Madre B550 Usada Testeada", category: "pc-usado", condition: "usado", price: 1800, stock: 2, icon: "🖥️" },
  { id: 6, name: "GTX 1660 Super Usada con Garantia", category: "pc-usado", condition: "usado", price: 3200, stock: 2, icon: "🎮" },
  { id: 7, name: "Kit RAM 16GB DDR3 Usado", category: "pc-usado", condition: "usado", price: 450, stock: 5, icon: "💾" },
  { id: 8, name: "Galaxy A32 Nuevo Sellado", category: "cel-nuevo", condition: "nuevo", price: 4500, stock: 4, icon: "📱" },
  { id: 9, name: "iPhone 11 Nuevo", category: "cel-nuevo", condition: "nuevo", price: 9800, stock: 2, icon: "📱" },
  { id: 10, name: "Cargador USB-C Nuevo", category: "cel-nuevo", condition: "nuevo", price: 250, stock: 20, icon: "🔗" },
  { id: 11, name: "Galaxy S21 Usado Muy Buen Estado", category: "cel-usado", condition: "usado", price: 3200, stock: 3, icon: "📱" },
  { id: 12, name: "iPhone XR Usado con Bateria Nueva", category: "cel-usado", condition: "usado", price: 3800, stock: 2, icon: "📱" },
  { id: 13, name: "Tela iPhone 11 Repuesto", category: "cel-usado", condition: "usado", price: 900, stock: 5, icon: "📲" },
  { id: 14, name: "Arduino UNO R3", category: "componentes", condition: "nuevo", price: 350, stock: 12, icon: "🔌" },
  { id: 15, name: "Kit Resistores 600 pcs", category: "componentes", condition: "nuevo", price: 199, stock: 20, icon: "⚡" },
  { id: 16, name: "Multimetro Digital", category: "componentes", condition: "nuevo", price: 350, stock: 11, icon: "📟" },
  { id: 17, name: "Notebook i5 8GB/256GB Reacondicionado", category: "notebooks", condition: "usado", price: 6500, stock: 4, icon: "💻" },
  { id: 18, name: "Notebook Gamer RTX 3050 Nuevo", category: "notebooks", condition: "nuevo", price: 15500, stock: 2, icon: "💻" },
  { id: 19, name: "Macbook Air M1 Usado", category: "notebooks", condition: "usado", price: 18000, stock: 1, icon: "🍎" }
];
let activeCategory = "all";
let searchQuery = "";
let cartItems = [];
try { cartItems = JSON.parse(localStorage.getItem("ci_cart") || "[]"); } catch (e) { cartItems = []; }
const getById = (id) => document.getElementById(id);
const productGrid = getById("grid");
const shopSections = getById("shop-sections");
const emptyMessage = getById("empty");
const searchInput = getById("search");
const cartPanel = getById("cart-panel");
const pageOverlay = getById("overlay");
function formatMoney(value) { return "R$" + value.toLocaleString("pt-BR"); }
function categoryLabel(key) { return CATEGORY_LABELS[key] || key; }
function conditionTag(condition) {
  if (condition === "nuevo") return '<span class="tag tag-nuevo">Nuevo</span>';
  if (condition === "usado") return '<span class="tag tag-usado">Usado</span>';
  return "";
}
function productCard(product) {
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML =
    conditionTag(product.condition) +
    '<div class="icon">' + product.icon + '</div>' +
    '<h3>' + product.name + '</h3>' +
    '<p class="stock">' + categoryLabel(product.category) + ' • estoque: ' + product.stock + '</p>' +
    '<p class="price">' + formatMoney(product.price) + '</p>' +
    '<button class="btn btn-primary" type="button">Adicionar 🛒</button>';
  card.querySelector("button").addEventListener("click", () => addToCart(product.id));
  return card;
}
function matchesSearch(product) {
  return product.name.toLowerCase().includes(searchQuery.toLowerCase());
}
function renderProducts() {
  if (!productGrid) return;
  productGrid.innerHTML = "";
  if (shopSections) shopSections.innerHTML = "";
  const searching = searchQuery.trim() !== "";
  if (activeCategory === "all" && !searching && shopSections) {
    productGrid.style.display = "none";
    if (emptyMessage) emptyMessage.classList.add("hidden");
    Object.keys(CATEGORY_LABELS).forEach((cat) => {
      if (cat === "all") return;
      const list = PRODUCTS.filter((p) => p.category === cat);
      if (list.length === 0) return;
      const section = document.createElement("div");
      section.className = "shop-section";
      section.innerHTML = '<h3>' + categoryLabel(cat) + '</h3><p>' + list.length + ' productos</p>';
      const grid = document.createElement("div");
      grid.className = "grid";
      list.forEach((product) => grid.appendChild(productCard(product)));
      section.appendChild(grid);
      shopSections.appendChild(section);
    });
    return;
  }
  productGrid.style.display = "";
  const filteredList = PRODUCTS.filter((product) =>
    (activeCategory === "all" || product.category === activeCategory) &&
    matchesSearch(product)
  );
  if (emptyMessage) emptyMessage.classList.toggle("hidden", filteredList.length > 0);
  filteredList.forEach((product) => productGrid.appendChild(productCard(product)));
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
    row.innerHTML =
      '<div><strong>' + product.icon + ' ' + product.name + '</strong><br/><span class="stock">' + formatMoney(product.price) + ' x ' + item.quantity + '</span></div>' +
      '<div><button type="button">✕</button></div>';
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
  if (!WHATSAPP_NUMBER) return;
  window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message), "_blank");
}
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
  if (cartItems.length === 0) return;
  const orderLines = cartItems.map((item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.id);
    return "• " + product.name + " x" + item.quantity + " = R$" + (product.price * item.quantity);
  });
  const orderTotal = getById("cart-total").textContent;
  sendWhatsApp("Olá Central Informática, quero comprar:\n" + orderLines.join("\n") + "\nTotal: " + orderTotal);
});
if (getById("quote-form")) getById("quote-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const customerName = getById("customer-name").value;
  const deviceType = getById("device-type").value;
  const issueDesc = getById("issue-desc").value;
  sendWhatsApp("Olá, sou " + customerName + ". Tenho um(a) " + deviceType + " com este defeito: " + issueDesc + ". Pode me ajudar com orçamento?");
});
if (getById("btn-menu")) getById("btn-menu").addEventListener("click", () => {
  getById("nav").classList.toggle("open");
});
renderProducts();
renderCart();
