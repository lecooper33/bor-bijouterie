document.addEventListener('DOMContentLoaded', async function() {
    // Éléments DOM
    const productDetailContainer = document.querySelector('.product-detail-container');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const relatedProductsContainer = document.getElementById('related-products-container');
    
    // Variables
    let currentProduct = null;

    // Initialisation
    init();

    async function init() {
        showLoading();
        await loadProduct();
        if (currentProduct) {
            renderProductDetails();
            await loadRelatedProducts();
            setupEventListeners();
            updateCartCount();
        }
        hideLoading();
    }

    // Fonctions de chargement
    async function loadProduct() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (!productId) {
            redirectToBoutique();
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:4000/produits/${productId}`);
            
            if (!response.ok) {
                throw new Error('Produit non trouvé');
            }
            
            currentProduct = await response.json();
        } catch (error) {
            console.error('Erreur:', error);
            showError('Produit non trouvé');
            setTimeout(redirectToBoutique, 2000);
        }
    }

    async function loadRelatedProducts() {
        if (!currentProduct) return;
        
        try {
            const response = await fetch(`http://localhost:4000/produits?categorie=${currentProduct.id_categorie}`);
            const products = await response.json();
            
            // Filtrer le produit actuel et limiter à 4
            const relatedProducts = products
                .filter(p => p.id_produit !== currentProduct.id_produit)
                .slice(0, 4);
            
            if (relatedProducts.length > 0) {
                renderRelatedProducts(relatedProducts);
            } else {
                document.querySelector('.related-products').style.display = 'none';
            }
        } catch (error) {
            console.error('Erreur lors du chargement des produits similaires:', error);
            document.querySelector('.related-products').style.display = 'none';
        }
    }

    // Fonctions de rendu
    function renderProductDetails() {
        if (!currentProduct) return;
        
        document.title = `${currentProduct.nom} - B'OR`;
        
        const mainImage = document.getElementById('main-product-image');
        mainImage.src = currentProduct.image || '../img/default-product.jpg';
        mainImage.alt = currentProduct.nom;
        
        document.getElementById('product-name').textContent = currentProduct.nom;
        document.getElementById('product-price').textContent = formatPrice(currentProduct.prix);
        document.getElementById('product-description').textContent = currentProduct.description;
        
        // Détails supplémentaires
        const detailsList = document.getElementById('product-details-list');
        detailsList.innerHTML = `
            <li><strong>Référence:</strong> ${currentProduct.id_produit}</li>
            <li><strong>Catégorie:</strong> ${getCategoryName(currentProduct.id_categorie)}</li>
            <li><strong>Matière:</strong> ${formatMaterial(currentProduct.matieres)}</li>
            <li><strong>Genre:</strong> ${formatGenre(currentProduct.genre)}</li>
            <li><strong>Disponibilité:</strong> ${currentProduct.stock > 0 ? 'En stock' : 'Rupture de stock'}</li>
        `;
        
        // Gestion du stock
        const quantityInput = document.getElementById('product-quantity');
        const addToCartBtn = document.getElementById('add-to-cart');
        
        quantityInput.max = currentProduct.stock;
        
        if (currentProduct.stock <= 0) {
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'Rupture de stock';
            quantityInput.disabled = true;
        }
    }

    function renderRelatedProducts(products) {
        relatedProductsContainer.innerHTML = '';
        
        products.forEach(product => {
            const productEl = document.createElement('div');
            productEl.className = 'product-card';
            productEl.innerHTML = `
                <a href="produit.html?id=${product.id_produit}" class="product-link">
                    <div class="image-container">
                        <img src="${product.image || '../img/default-product.jpg'}" alt="${product.nom}" loading="lazy">
                        <div class="product-overlay">
                            <button class="quick-view" aria-label="Voir le produit">
                                <iconify-icon icon="mdi:eye-outline" width="24"></iconify-icon>
                            </button>
                        </div>
                    </div>
                </a>
                <div class="product-info">
                    <h3 class="nom">${product.nom}</h3>
                    <div class="product-footer">
                        <div class="price-info">
                            <span class="prix">${formatPrice(product.prix)}</span>
                        </div>
                        <button class="add-to-cart-mini" aria-label="Ajouter au panier">
                            <iconify-icon icon="mdi:cart-plus" width="20"></iconify-icon>
                        </button>
                    </div>
                </div>
            `;
            
            relatedProductsContainer.appendChild(productEl);
        });
    }

    // Fonctions d'interaction
    function setupEventListeners() {
        // Gestion de la quantité
        document.querySelector('.decrease').addEventListener('click', decreaseQuantity);
        document.querySelector('.increase').addEventListener('click', increaseQuantity);
        
        // Ajout au panier
        document.getElementById('add-to-cart').addEventListener('click', addToCart);
    }

    function decreaseQuantity() {
        const input = document.getElementById('product-quantity');
        if (parseInt(input.value) > 1) {
            input.value = parseInt(input.value) - 1;
        }
    }

    function increaseQuantity() {
        const input = document.getElementById('product-quantity');
        if (parseInt(input.value) < parseInt(input.max)) {
            input.value = parseInt(input.value) + 1;
        }
    }

    function addToCart() {
        if (!currentProduct) return;
        
        const quantity = parseInt(document.getElementById('product-quantity').value);
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        const existingItem = cart.find(item => item.id === currentProduct.id_produit);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: currentProduct.id_produit,
                name: currentProduct.nom,
                price: currentProduct.prix,
                image: currentProduct.image,
                quantity: quantity
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showToast(`${quantity} ${currentProduct.nom} ajouté au panier`);
    }

    // Fonctions utilitaires
    function formatPrice(price) {
        return new Intl.NumberFormat('fr-FR').format(price) + ' Fcfa';
    }

    function formatMaterial(material) {
        return material.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    function formatGenre(genre) {
        const genres = {
            'femme': 'Femme',
            'homme': 'Homme',
            'unisexe': 'Unisexe',
            'enfant': 'Enfant'
        };
        return genres[genre] || genre;
    }

    function getCategoryName(categoryId) {
        // Note: Vous devrez charger les catégories si vous voulez les noms complets
        return categoryId; // Retourne l'ID en attendant
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelector('.cart-count').textContent = totalItems;
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        loadingOverlay.classList.add('fade-out');
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            loadingOverlay.classList.remove('fade-out');
        }, 300);
    }

    function showError(message) {
        productDetailContainer.innerHTML = `
            <div class="error-message">
                <iconify-icon icon="mdi:alert-circle" width="48" height="48"></iconify-icon>
                <h3>${message}</h3>
                <p>Redirection vers la boutique...</p>
            </div>
        `;
    }

    function redirectToBoutique() {
        window.location.href = 'boutique.html';
    }
});