/* front/assets/js/menu.js */

let allProducts = [];
let currentProduct = null;
let currentQuantity = 1;

document.addEventListener('DOMContentLoaded', () => {
    fetchFeatured();
    fetchProducts();
    setupModalEvents();
});

// 1. 取得熱門商品
async function fetchFeatured() {
    try {
        const res = await fetch(`${API_BASE}/products/featured`);
        const products = await res.json();
        
        const container = document.getElementById('featured-container');
        const section = document.getElementById('featured-section');

        if (products.length > 0) {
            section.classList.remove('hidden');
            container.innerHTML = products.map(p => `
                <div class="featured-card" onclick="openModal(${p.id})">
                    <h3>${p.name}</h3>
                    <p>NT$ ${p.price}</p>
                    <small>🔥 熱銷中</small>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Fetch featured error:', err);
    }
}

// 2. 取得所有商品
async function fetchProducts() {
    try {
        const res = await fetch(`${API_BASE}/products`);
        allProducts = await res.json();
        renderProducts(allProducts);
    } catch (err) {
        console.error('Fetch products error:', err);
        document.getElementById('product-list').innerHTML = '<p>載入失敗，請稍後再試。</p>';
    }
}

function renderProducts(products) {
    const list = document.getElementById('product-list');
    list.innerHTML = products.map(p => `
        <div class="product-card" onclick="openModal(${p.id})">
            <h3>${p.name}</h3>
            <p>${p.category || '一般'}</p>
            <p class="price">NT$ ${p.price}</p>
        </div>
    `).join('');
}

// 3. 處理 Modal (彈窗)
window.openModal = (productId) => {
    currentProduct = allProducts.find(p => p.id === productId);
    if (!currentProduct) return;

    // 重置選項
    currentQuantity = 1;
    document.getElementById('qty-value').innerText = 1;
    document.querySelectorAll('.custom-options input[type="checkbox"]').forEach(el => el.checked = false);

    // 填入資料
    document.getElementById('modal-product-name').innerText = currentProduct.name;
    document.getElementById('modal-product-desc').innerText = currentProduct.description || '無描述';
    document.getElementById('modal-product-price').innerText = currentProduct.price;

    document.getElementById('product-modal').classList.remove('hidden');
};

function setupModalEvents() {
    const modal = document.getElementById('product-modal');
    const closeBtn = document.querySelector('.close-btn');
    
    // 關閉
    closeBtn.onclick = () => modal.classList.add('hidden');
    window.onclick = (e) => { if (e.target == modal) modal.classList.add('hidden'); };

    // 數量增減
    document.getElementById('qty-minus').onclick = () => {
        if (currentQuantity > 1) {
            currentQuantity--;
            document.getElementById('qty-value').innerText = currentQuantity;
        }
    };
    document.getElementById('qty-plus').onclick = () => {
        currentQuantity++;
        document.getElementById('qty-value').innerText = currentQuantity;
    };

    // 加入購物車
    document.getElementById('add-to-cart-btn').onclick = addToCart;
}

// 4. 加入購物車邏輯
function addToCart() {
    if (!currentProduct) return;

    // 收集客製化選項
    let extraPrice = 0;
    let optionsArr = [];

    // 檢查 Checkbox (加蛋/加起司)
    document.querySelectorAll('.custom-options input[type="checkbox"]:checked').forEach(cb => {
        extraPrice += parseInt(cb.dataset.price);
        optionsArr.push(cb.value);
    });

    // 檢查下拉選單 (熟度) - 僅當有加蛋時才記錄，或是簡單處理都記錄
    const eggOption = document.getElementById('egg-option').value;
    if (optionsArr.includes('加蛋')) {
        optionsArr.push(eggOption);
    }

    const finalPrice = currentProduct.price + extraPrice;
    
    const cartItem = {
        uniqueId: Date.now(), // 用於購物車刪除時辨識
        product_id: currentProduct.id,
        name: currentProduct.name,
        price: finalPrice, // 單價(含加料)
        quantity: currentQuantity,
        options: optionsArr.join(', ') // "加蛋, 半熟"
    };

    Cart.add(cartItem);
    alert('已加入購物車！');
    document.getElementById('product-modal').classList.add('hidden');
}