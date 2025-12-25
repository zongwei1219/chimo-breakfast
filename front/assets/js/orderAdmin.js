/* front/assets/js/orderAdmin.js */

document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
    
    // 綁定手動刷新按鈕
    document.getElementById('refresh-btn').onclick = fetchOrders;

    // 設定自動刷新 (每 30 秒)
    setInterval(fetchOrders, 30000);
});

async function fetchOrders() {
    try {
        // 現在後端的 GET /api/orders 已經包含 items 了，直接呼叫即可
        const res = await fetch(`${API_BASE}/orders`); 
        
        if (!res.ok) throw new Error('無法取得訂單資料');

        const fullOrders = await res.json();
        
        // 刪除了原本為了取得 detail 的 "暫時解法" 與 Promise.all 區塊
        // 直接渲染結果
        renderOrders(fullOrders);
        updateLastUpdatedTime();

    } catch (err) {
        console.error('Fetch orders error:', err);
    }
}

function renderOrders(orders) {
    const container = document.getElementById('orders-grid');
    if (orders.length === 0) {
        container.innerHTML = '<p>目前沒有訂單。</p>';
        return;
    }

    container.innerHTML = orders.map(order => {
        // 根據狀態決定按鈕顯示
        let actionButtons = '';
        if (order.status === 'pending') {
            actionButtons = `
                <button class="btn-cancel" onclick="updateStatus(${order.id}, 'cancelled')">取消</button>
                <button class="btn-prepare" onclick="updateStatus(${order.id}, 'preparing')">開始製作</button>
            `;
        } else if (order.status === 'preparing') {
            actionButtons = `
                <button class="btn-complete" onclick="updateStatus(${order.id}, 'completed')">完成訂單</button>
            `;
        } else {
            // 已完成或取消，不顯示按鈕
            actionButtons = `<span class="status-text">${order.status}</span>`;
        }

        // 整理餐點列表 HTML
        const itemsHtml = order.items.map(item => `
            <div class="order-item">
                <strong>${item.product_name}</strong> x ${item.quantity}
                ${item.custom_options ? `<div class="item-options">(${item.custom_options})</div>` : ''}
            </div>
        `).join('');

        return `
            <div class="order-card status-${order.status}">
                <div class="order-header">
                    <span class="table-num">桌號: ${order.table_number || '外帶'}</span>
                    <span class="time-info">取餐: ${order.pickup_time}</span>
                </div>
                
                <div class="order-items">
                    ${itemsHtml}
                </div>

                ${order.customer_note ? `<div class="order-note">備註: ${order.customer_note}</div>` : ''}

                <div class="order-summary">
                    總計: $${order.total_amount}
                </div>

                <div class="order-actions">
                    ${actionButtons}
                </div>
            </div>
        `;
    }).join('');
}

async function updateStatus(orderId, newStatus) {
    if (!confirm(`確定要將訂單 #${orderId} 狀態更改為 ${newStatus}?`)) return;

    try {
        const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            fetchOrders(); // 成功後刷新列表
        } else {
            alert('更新失敗');
        }
    } catch (err) {
        console.error(err);
        alert('連線錯誤');
    }
}

function updateLastUpdatedTime() {
    const now = new Date();
    document.getElementById('last-updated').innerText = `更新於: ${now.toLocaleTimeString()}`;
}