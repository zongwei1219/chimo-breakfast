/* front/assets/js/utils.js */
const API_BASE = '/api';

// 簡單的購物車管理 (使用 LocalStorage)
const Cart = {
    get: () => JSON.parse(localStorage.getItem('chimo_cart')) || [],
    add: (item) => {
        const cart = Cart.get();
        cart.push(item);
        localStorage.setItem('chimo_cart', JSON.stringify(cart));
        updateCartCount();
    },
    clear: () => localStorage.removeItem('chimo_cart')
};

function updateCartCount() {
    const cart = Cart.get();
    const countSpan = document.getElementById('cart-count');
    if(countSpan) countSpan.innerText = cart.length;
}

// 頁面載入時更新一次購物車數量
document.addEventListener('DOMContentLoaded', updateCartCount);

/* front/assets/js/utils.js (新增部分) */

// ... (原本的 API_BASE 和 Cart 物件保留) ...

// 動態載入 Header 和 Footer
async function loadComponents() {
    try {
        // 1. 載入 Header (使用絕對路徑，避免不同資料夾層級造成的 404 錯誤)
        // 假設你的伺服器掛載路徑是 /front，這樣寫最穩
        const headerRes = await fetch('/front/components/header.html');
        
        if (headerRes.ok) {
            const headerHtml = await headerRes.text();
            document.querySelector('header').innerHTML = headerHtml;
            
            // A. 更新購物車數字
            updateCartCount(); 
            
            // B. 設定導覽列 Active 狀態
            setActiveLink();   

            // C. 檢查登入狀態 (切換顯示：登入 / 會員中心)
            const userStr = localStorage.getItem('chimo_user');
            const navLogin = document.getElementById('nav-login');
            const navProfile = document.getElementById('nav-profile');

            if (userStr) {
                // 已登入：顯示會員中心，隱藏登入
                if(navProfile) navProfile.classList.remove('hidden');
                if(navLogin) navLogin.classList.add('hidden');
                
                // 若有顯示使用者名稱的地方 (選用)
                // const user = JSON.parse(userStr);
                // console.log('Current User:', user.username);
            } else {
                // 未登入：顯示登入，隱藏會員中心
                if(navLogin) navLogin.classList.remove('hidden');
                if(navProfile) navProfile.classList.add('hidden');
            }
        }

        // 2. 載入 Footer
        const footerRes = await fetch('/front/components/footer.html');
        if (footerRes.ok) {
            const footerHtml = await footerRes.text();
            document.querySelector('footer').innerHTML = footerHtml;
        }

    } catch (err) {
        console.error('載入元件失敗:', err);
    }
}

// 自動設定導覽列的 Active 狀態
function setActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('header nav a');
    
    navLinks.forEach(link => {
        // 如果網址包含 href 的關鍵字 (例如 "menu.html")
        if (currentPath.includes(link.getAttribute('href').split('/').pop())) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// 頁面載入時執行
document.addEventListener('DOMContentLoaded', loadComponents);