/* front/assets/js/productAdmin.js */

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    setupModal();
});

let allProducts = [];

// 1. 讀取所有餐點
async function fetchProducts() {
    try {
        // 加上 ?admin=true 以取得包含下架的商品
        const res = await fetch(`${API_BASE}/products?admin=true`);
        allProducts = await res.json();
        renderTable(allProducts);
    } catch (err) {
        console.error(err);
    }
}

// 2. 渲染表格
function renderTable(products) {
    const tbody = document.getElementById('product-tbody');
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.category || '-'}</td>
            <td>$${p.price}</td>
            <td>
                <span class="status-badge ${p.is_available ? 'status-on' : 'status-off'}">
                    ${p.is_available ? '上架中' : '已下架'}
                </span>
            </td>
            <td>
                ${p.is_featured ? '<span class="featured-icon">★ 熱門</span>' : '-'}
            </td>
            <td class="action-btns">
                <button class="btn-edit" onclick="openEditModal(${p.id})">編輯</button>
                <button class="btn-delete" onclick="deleteProduct(${p.id})">刪除</button>
            </td>
        </tr>
    `).join('');
}

// 3. Modal 相關邏輯
const modal = document.getElementById('edit-modal');
const form = document.getElementById('product-form');

function setupModal() {
    // 開啟「新增」
    document.getElementById('add-btn').onclick = () => {
        form.reset();
        document.getElementById('p-id').value = ''; // 清空 ID 代表新增
        document.getElementById('modal-title').innerText = '新增餐點';
        document.getElementById('p-available').checked = true; // 預設上架
        modal.classList.remove('hidden');
    };

    // 關閉
    document.querySelector('.close-btn').onclick = () => modal.classList.add('hidden');
    
    // 表單送出 (新增或更新)
    form.onsubmit = handleFormSubmit;
}

// 開啟「編輯」
window.openEditModal = (id) => {
    const p = allProducts.find(item => item.id === id);
    if (!p) return;

    document.getElementById('p-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-category').value = p.category;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-desc').value = p.description;
    document.getElementById('p-available').checked = !!p.is_available;
    document.getElementById('p-featured').checked = !!p.is_featured;

    document.getElementById('modal-title').innerText = '編輯餐點';
    modal.classList.remove('hidden');
};

// 4. 處理表單送出
async function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('p-id').value;
    const data = {
        name: document.getElementById('p-name').value,
        category: document.getElementById('p-category').value,
        price: parseInt(document.getElementById('p-price').value),
        description: document.getElementById('p-desc').value,
        is_available: document.getElementById('p-available').checked ? 1 : 0,
        is_featured: document.getElementById('p-featured').checked ? 1 : 0
    };

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert('儲存成功！');
            modal.classList.add('hidden');
            fetchProducts(); // 重新整理列表
        } else {
            alert('儲存失敗');
        }
    } catch (err) {
        console.error(err);
        alert('連線錯誤');
    }
}

// 5. 刪除餐點
window.deleteProduct = async (id) => {
    if (!confirm('確定要刪除此餐點嗎？(此操作無法復原)')) return;

    try {
        const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchProducts();
        } else {
            alert('刪除失敗');
        }
    } catch (err) {
        console.error(err);
        alert('連線錯誤');
    }
};