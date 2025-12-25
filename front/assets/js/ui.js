/* front/assets/js/ui.js */

const UI = {
    // 顯示 Toast 通知 (取代醜醜的 alert)
    showToast: (message, type = 'success') => {
        // 檢查是否已存在 toast 容器，沒有就建立
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed; bottom: 20px; right: 20px; z-index: 9999;
                display: flex; flex-direction: column; gap: 10px;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.innerText = message;
        
        // 根據類型設定顏色
        const bgColor = type === 'error' ? '#f44336' : '#4caf50';
        
        toast.style.cssText = `
            background-color: ${bgColor}; color: white;
            padding: 12px 20px; border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            opacity: 0; transform: translateY(20px); transition: 0.3s;
            min-width: 200px;
        `;

        container.appendChild(toast);

        // 動畫進入
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        // 3秒後移除
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // 顯示/隱藏 Loading 遮罩
    showLoading: () => {
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.innerHTML = '<div class="spinner"></div>';
            loader.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(255,255,255,0.8); z-index: 10000;
                display: flex; justify-content: center; align-items: center;
            `;
            // 簡單的 CSS Spinner 樣式
            const style = document.createElement('style');
            style.innerHTML = `.spinner { width: 40px; height: 40px; border: 4px solid #ddd; border-top: 4px solid #ff9800; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
            document.body.appendChild(loader);
        }
        loader.classList.remove('hidden');
    },

    hideLoading: () => {
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.add('hidden');
    }
};

// 讓其他檔案可以直接用 UI.showToast('...')
window.UI = UI;