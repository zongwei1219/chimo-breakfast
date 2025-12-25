/* front/assets/js/cart.js */

document.addEventListener('DOMContentLoaded', () => {
    loadCartItems();
    
    // 監聽表單送出
    document.getElementById('checkout-form').addEventListener('submit', submitOrder);
});

function loadCartItems() {
    const cart = Cart.get(); // 使用 utils.js 定義的 Cart 物件
    const container = document.getElementById('cart-list');
    const form = document.getElementById('checkout-form');
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-msg">購物車是空的，快去點餐吧！</p>';
        form.classList.add('hidden'); // 隱藏結帳表單
        document.getElementById('total-amount').innerText = '0';
        return;
    }

    // 顯示結帳表單
    form.classList.remove('hidden');

    // 渲染列表
    let total = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        return `
            <div class="cart-item">
                <div class="item-info">
                    <h4>${item.name} x ${item.quantity}</h4>
                    <p>${item.options ? '客製: ' + item.options : '一般'}</p>
                </div>
                <div class="item-actions">
                    <span class="price-tag">NT$ ${itemTotal}</span>
                    <button class="remove-btn" onclick="removeItem(${item.uniqueId})">刪除</button>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('total-amount').innerText = total;
}

// 移除單一項目
window.removeItem = (uniqueId) => {
    let cart = Cart.get();
    // 過濾掉該 ID 的項目
    cart = cart.filter(item => item.uniqueId !== uniqueId);
    
    // 更新 LocalStorage
    localStorage.setItem('chimo_cart', JSON.stringify(cart));
    
    // 重新渲染畫面
    loadCartItems();
    // 更新 header 數量 (來自 utils.js)
    updateCartCount(); 
};

// 送出訂單

async function submitOrder(e) {
    e.preventDefault();

    const cart = Cart.get();
    if (cart.length === 0) return alert('購物車是空的');

    // 1. 收集表單資料
    const tableNumber = document.getElementById('table-number').value.trim();
    const pickupTime = document.getElementById('pickup-time').value;
    const customerNote = document.getElementById('customer-note').value.trim();
    
    // 計算總金額
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // === 新增：取得當前用戶 ID (若已登入) ===
    let userId = null;
    const userStr = localStorage.getItem('chimo_user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            userId = user.id;
        } catch (err) {
            console.error('會員資料讀取錯誤', err);
        }
    }

    // 2. 整理成後端要的格式
    const orderData = {
        user_id: userId, // 傳送 user_id (訪客則為 null)
        table_number: tableNumber || '外帶', // 若沒填則預設外帶
        pickup_time: pickupTime,
        customer_note: customerNote,
        total_amount: totalAmount,
        items: cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            options: item.options
        }))
    };

    try {
        const res = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await res.json();

        if (res.ok) {
            alert(`訂單建立成功！單號: ${result.orderId}`);
            Cart.clear(); // 清空購物車
            updateCartCount(); // 更新 header
            window.location.href = '../menu/menu.html'; // 導回菜單
        } else {
            alert('訂單建立失敗: ' + result.message);
        }

    } catch (err) {
        console.error(err);
        alert('連線錯誤，請稍後再試');
    }
}