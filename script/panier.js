document.addEventListener('DOMContentLoaded', function() {
    displayCart();
});

function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.querySelector('main');

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <iconify-icon icon="mdi:cart-off"></iconify-icon>
                <h2>Votre panier est vide</h2>
                <p>Découvrez notre collection de bijoux et ajoutez vos articles préférés</p>
                <a href="boutique.html" class="continue-shopping">Continuer mes achats</a>
            </div>
        `;
        return;
    }

    cartContainer.innerHTML = `
        <div class="cart-container">
            <section class="cart-items">
                <h1>Mon Panier</h1>
                <div class="items-list"></div>
            </section>
            <section class="cart-summary">
                <h2>Récapitulatif</h2>
                <div class="summary-content">
                    <div class="summary-line">
                        <span>Sous-total</span>
                        <span class="subtotal">0 Fcfa</span>
                    </div>
                    <div class="summary-line">
                        <span>Livraison</span>
                        <span class="shipping">Gratuite</span>
                    </div>
                    <div class="summary-line total-line">
                        <span>Total</span>
                        <span class="total">0 Fcfa</span>
                    </div>
                </div>
                <button class="checkout-button" onclick="proceedToCheckout()">Procéder au paiement</button>
            </section>
        </div>
    `;

    const itemsList = document.querySelector('.items-list');
    
    cart.forEach(item => {
        const itemElement = createCartItemElement(item);
        itemsList.appendChild(itemElement);
    });

    updateCartTotal();
}

function createCartItemElement(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.dataset.id = item.id;

    div.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
            <h3 class="cart-item-name">${item.name}</h3>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
            <div class="quantity-control">
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <input type="number" value="${item.quantity}" min="1" 
                       onchange="updateQuantityInput(${item.id}, this.value)">
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
        </div>
        <button class="remove-item" onclick="removeItem(${item.id})">
            <iconify-icon icon="mdi:delete"></iconify-icon>
        </button>
    `;

    return div;
}

function updateQuantity(itemId, change) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        const newQuantity = cart[itemIndex].quantity + change;
        if (newQuantity > 0) {
            cart[itemIndex].quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCart();
            updateCartCount();
        }
    }
}

function updateQuantityInput(itemId, newValue) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        const quantity = parseInt(newValue);
        if (quantity > 0) {
            cart[itemIndex].quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCart();
            updateCartCount();
        }
    }
}

function removeItem(itemId) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const newCart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(newCart));
    displayCart();
    updateCartCount();
}

function updateCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    document.querySelector('.subtotal').textContent = formatPrice(subtotal);
    document.querySelector('.total').textContent = formatPrice(subtotal);
}

function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR').format(price) + ' Fcfa';
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Votre panier est vide');
        return;
    }
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
        alert('Veuillez vous connecter pour passer une commande');
        window.location.href = 'login.html';
        return;
    }
    // Préparer les données pour l'API (clé quantité avec accent !)
    const produits = cart.map(item => ({
        id_produit: item.id_produit || item.id,
        quantité: item.quantity, // clé correcte pour l'API
        prix_unitaire: item.price
    }));
    // Données complètes de la commande
    const commandeData = {
        id_client: user.id,
        mode_paiement: 'Espèces', // Correction : valeur attendue par l'API
        adresse_livraison: user.adresse || 'port_gentil',
        produits: produits
    };
    console.log('Données envoyées au serveur:', commandeData);
    fetch('http://localhost:4000/commandes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token || ''}`
        },
        body: JSON.stringify(commandeData)
    })
    .then(async response => {
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.id_commande) {
            alert('Commande créée avec succès!');
            updateCartCount();
            window.location.href = 'paiement.html?commande=' + encodeURIComponent(data.id_commande);
        } else {
            throw new Error(data.message || 'Erreur lors de la création de la commande');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert(`Erreur lors de la commande: ${error.message}`);
        if (error.response) {
            error.response.json().then(errData => {
                console.error('Détails de l\'erreur:', errData);
            });
        }
    });
}

// Vérifier l'authentification au chargement
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
        window.location.href = 'login.html';
    }
}

// Initialiser le panier au chargement
function initCart() {
    updateCartCount();
    checkAuth();
}

// Appeler initCart lorsque la page est chargée
window.onload = initCart;