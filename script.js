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

// Kayıt / Giriş
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
    const diffDays = Math.ceil((expiry - today)/(1000*60*60*24));

    let statusText = '✅ Aktif';
    let statusClass = 'active';
    if(diffDays <= 30 && diffDays > 0) {
      statusText = '⚠️ Bitmek üzere';
      statusClass = 'warning';
    } else if(diffDays <= 0) {
      statusText = '❌ Süresi doldu';
      statusClass = 'expired';
    }

    const li = document.createElement('li');
    li.classList.add(statusClass);
    li.innerHTML = `
      <span>
        <strong>${p.name}</strong><br>
        Garanti Bitiş: ${expiry.toLocaleDateString()}<br>
        <span class="status">${statusText}</span>
      </span>
    `;

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Sil';
    delBtn.onclick = () => {
      products.splice(index, 1);
      localStorage.setItem(`products_${currentUser}`, JSON.stringify(products));
      renderProducts();
    };

    li.appendChild(delBtn);
    productList.appendChild(li);
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
// Sayfa yüklendiğinde otomatik garanti kontrolü
function checkWarranty() {
  const today = new Date();
  let warningProducts = [];

  products.forEach(p => {
    const expiry = new Date(p.expiry);
    const diffDays = Math.ceil((expiry - today)/(1000*60*60*24));
    if(diffDays <= 30 && diffDays > 0){
      warningProducts.push(`${p.name} garantisi ${diffDays} gün içinde bitiyor!`);
    }
  });

  if(warningProducts.length > 0){
    alert("UYARI! Aşağıdaki ürünlerin garantisi bitmek üzere:\n\n" + warningProducts.join("\n"));
  }
}

// Sayfa yüklendiğinde ve giriş yaptıktan sonra kontrol
registerBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if(!username) return alert("Lütfen kullanıcı adı girin.");

  currentUser = username;
  products = JSON.parse(localStorage.getItem(`products_${currentUser}`)) || [];

  registerSection.style.display = 'none';
  productSection.style.display = 'block';

  renderProducts();
  checkWarranty(); // buraya eklendi
});
