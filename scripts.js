// 1. Global Application State
let products = [];
let cart = JSON.parse(localStorage.getItem('tech_store_cart')) || [];

// 2. DOM Elements
const productGrid = document.getElementById('product-grid');
const cartBtn = document.getElementById('cart-btn');
const cartDropdown = document.getElementById('cart-dropdown');
const cartItemsList = document.getElementById('cart-items-list');
const cartCount = document.getElementById('cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const clearCartBtn = document.getElementById('clear-cart-btn');
const checkoutBtn = document.getElementById('checkout-btn');

// 3. Fetch Data từ file product.json
async function loadApp() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        products = await response.json();
        
        renderProducts();
        updateCartUI();
    } catch (error) {
        console.error("Không thể tải danh sách sản phẩm:", error);
        productGrid.innerHTML = `<p style="color:red; font-size:16px; text-align:center; grid-column:1/-1;">Lỗi tải dữ liệu. Hãy chắc chắn bạn đang chạy dự án bằng Live Server (Local Server).</p>`;
    }
}

// 4. Hiển thị danh sách sản phẩm ra trang chủ
function renderProducts() {
    productGrid.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        const imageMarkup = product.image
            ? `<img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.hidden=true; this.nextElementSibling.hidden=false;">`
            : '';
        productCard.innerHTML = `
            <div class="product-image">
                ${imageMarkup}
                <span class="product-image-fallback" ${product.image ? 'hidden' : ''}>${product.emoji || '📦'}</span>
            </div>
            <div class="product-info">
                <div>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-desc">${product.desc}</p>
                </div>
                <div class="product-price-row">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Thêm vào giỏ</button>
                </div>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
}

// 5. Thêm sản phẩm vào giỏ hàng
window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
};

// 6. XÓA sản phẩm khỏi giỏ hàng (Chức năng mới)
window.removeFromCart = function(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex > -1) {
        // Giảm số lượng đi 1 đơn vị
        cart[itemIndex].quantity -= 1;
        
        // Nếu số lượng bằng 0 thì xóa hẳn khỏi mảng giỏ hàng
        if (cart[itemIndex].quantity === 0) {
            cart.splice(itemIndex, 1);
        }
    }
    
    saveCart();
    updateCartUI();
};

function saveCart() {
    localStorage.setItem('tech_store_cart', JSON.stringify(cart));
}

// 7. Cập nhật giao diện giỏ hàng (Đã cập nhật nút Xóa lẻ)
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    cartItemsList.innerHTML = '';
    if (cart.length === 0) {
        cartItemsList.innerHTML = `<p style="color:#777; font-size: 14px; text-align:center; padding:10px 0;">Giỏ hàng trống.</p>`;
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <span>${item.name}</span>
                    <small style="color: #777;">SL: ${item.quantity}</small>
                </div>
                <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                <button class="remove-item-btn" onclick="removeFromCart(${item.id})" title="Xóa bớt">❌</button>
            `;
            cartItemsList.appendChild(itemElement);
        });
    }

    const totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalPrice.textContent = totalCost.toFixed(2);
}

// 8. Đóng / Mở giỏ hàng nhanh
cartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    cartDropdown.classList.toggle('hidden');
});

// 9. Xóa toàn bộ giỏ hàng
clearCartBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?")) {
        cart = [];
        saveCart();
        updateCartUI();
    }
});

// 10. CHỨC NĂNG THANH TOÁN (Chức năng mới)
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi thanh toán!");
        return;
    }

    const totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Tạo thông báo đơn hàng đơn giản hiển thị cho khách
    let message = `🎉 Cảm ơn bạn đã mua sắm tại HaStore!\n\n`;
    message += `Chi tiết đơn hàng của bạn:\n`;
    cart.forEach(item => {
        message += `- ${item.name} (x${item.quantity}): $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\nTổng thanh toán: $${totalCost.toFixed(2)}\n\n`;
    message += `Hệ thống giả lập thanh toán thành công!`;

    alert(message);

    // Sau khi thanh toán thành công, làm sạch giỏ hàng
    cart = [];
    saveCart();
    updateCartUI();
    cartDropdown.classList.add('hidden'); // Ẩn giỏ hàng đi
});

// Đóng giỏ hàng khi nhấn ra ngoài vùng dropdown
document.addEventListener('click', (e) => {
    if (!cartDropdown.contains(e.target) && e.target !== cartBtn) {
        cartDropdown.classList.add('hidden');
    }
});

// Khởi chạy ứng dụng
document.addEventListener('DOMContentLoaded', loadApp);