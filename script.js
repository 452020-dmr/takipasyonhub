// ELEMENTLER
const registerBtn = document.getElementById('register-btn');
const usernameInput = document.getElementById('username');
const registerSection = document.getElementById('register-section');
const productSection = document.getElementById('product-section');
const form = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const exportBtn = document.getElementById('export-btn');

let currentUser = null;
let products = [];

// Kayıt / Giriş işlemi
registerBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if(!username) return alert("Lütfen kullanıcı adı girin.");

  currentUser = username;
  products = JSON.parse(localStorage.getItem(`products_${currentUser}`)) || [];

  registerSection.style.display = 'none';
  productSection.style.display = 'block';

  renderProducts();
});

// Ürün ekleme
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('product-name').value;
  const purchaseDate = document.getElementById('purchase-date').value;
  const warrantyMonths = parseInt(document.getElementById('warranty-months').value);

  const purchase = new Date(purchaseDate);
  const expiry = new Date(purchase.setMonth(purchase.getMonth() + warrantyMonths));
  const today = new Date();

  let status = '';
  if ((expiry - today)/(1000*60*60*24) <= 30) {
    status = ' ⚠️ Garanti bitmek üzere!';
    alert(`UYARI: ${name} ürününün garantisi 30 gün içinde bitiyor!`);
  }

  const product = { name, expiry: expiry.toISOString(), status };
  products.push(product);

  localStorage.setItem(`products_${currentUser}`, JSON.stringify(products));
  renderProducts();
  form.reset();
});

// Ürünleri render
function renderProducts() {
  productList.innerHTML = '';
  const today = new Date();

  products.forEach((p, index) => {
    const expiry = new Date(p.expiry);
    let status = '';
    if ((expiry - today)/(1000*60*60*24) <= 30) status = ' ⚠️ Garanti bitmek üzere!';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.textContent = `${p.name} - Garanti Bitiş: ${expiry.toLocaleDateString()}${status}`;

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Sil';
    delBtn.onclick = () => {
      products.splice(index, 1);
      localStorage.setItem(`products_${currentUser}`, JSON.stringify(products));
      renderProducts();
    };

    card.appendChild(delBtn);
    productList.appendChild(card);
  });
}

// JSON dışa aktar
exportBtn.addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({user: currentUser, products}));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `${currentUser}_products.json`);
  dlAnchor.click();
});
