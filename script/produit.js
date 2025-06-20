document.addEventListener('DOMContentLoaded', async function() {
    // Récupérer l'ID du produit depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const id_produit = urlParams.get('id');
    if (!id_produit) {
        window.location.href = './boutique.html';
        return;
    }
    // Charger le produit depuis l'API
    let product = null;
    try {
        const res = await fetch(`/produits/${id_produit}`);
        product = await res.json();
    } catch (error) {
        alert('Erreur lors du chargement du produit.');
        window.location.href = './boutique.html';
        return;
    }
    if (!product) {
        window.location.href = './boutique.html';
        return;
    }

    // Mettre à jour le titre de la page
    document.title = `${product.name} - B'OR`;

    // Créer la structure HTML pour le détail du produit
    const productDetailSection = document.querySelector('.product-detail');
    productDetailSection.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
            <h1 class="product-name">${product.name}</h1>
            <div class="product-price">${new Intl.NumberFormat('fr-FR').format(product.price)} Fcfa</div>
            <div class="product-description">${product.description}</div>
            <div class="product-details">
                <p><strong>Catégorie:</strong> ${product.category}</p>
                <p><strong>Genre:</strong> ${product.genre}</p>
                <p><strong>Matière:</strong> ${product.matiere}</p>
                <p><strong>Stock:</strong> ${product.stock} disponible${product.stock > 1 ? 's' : ''}</p>
            </div>
            <div class="quantity-selector">
                <button class="decrease-quantity" aria-label="Diminuer la quantité">-</button>
                <input type="number" value="1" min="1" max="${product.stock}" class="quantity-input">
                <button class="increase-quantity" aria-label="Augmenter la quantité">+</button>
            </div>
            <button class="add-to-cart">Ajouter au panier</button>
        </div>
    `;

    // Gestion de la quantité
    const quantityInput = document.querySelector('.quantity-input');
    const decreaseBtn = document.querySelector('.decrease-quantity');
    const increaseBtn = document.querySelector('.increase-quantity');

    decreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });

    increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < product.stock) {
            quantityInput.value = currentValue + 1;
        }
    });

    // Gestion de l'ajout au panier
    const addToCartBtn = document.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        };

        // Récupérer le panier existant ou créer un nouveau
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Vérifier si le produit existe déjà dans le panier
        const existingItemIndex = cart.findIndex(item => item.id === cartItem.id);
        
        if (existingItemIndex !== -1) {
            // Mettre à jour la quantité si le produit existe déjà
            cart[existingItemIndex].quantity += quantity;
        } else {
            // Ajouter le nouveau produit au panier
            cart.push(cartItem);
        }

        // Sauvegarder le panier mis à jour
        localStorage.setItem('cart', JSON.stringify(cart));

        // Mettre à jour le compteur du panier
        updateCartCount();

        // Afficher un message de confirmation
        alert('Produit ajouté au panier !');
    });
});

// Fonction pour mettre à jour le compteur du panier
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}
