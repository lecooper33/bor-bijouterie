document.addEventListener('DOMContentLoaded', async function() {
    // Variables globales
    let products = [];
    let categories = [];
    let filteredProducts = [];
    const productsPerPage = 12;
    let currentPage = 1;

    // Éléments DOM
    const productsContainer = document.getElementById('products-container');
    const productTemplate = document.getElementById('product-template');
    const productsTotal = document.getElementById('products-total');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const filterToggleBtn = document.querySelector('.filter-toggle-mobile');
    const filterCloseBtn = document.querySelector('.filter-close');
    const filtersOverlay = document.querySelector('.filters-overlay');
    const filtersSection = document.querySelector('.filters');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const applyFiltersBtn = document.querySelector('.apply-filters');
    const resetFiltersBtn = document.querySelector('.reset-filters');

    // Initialisation
    init();

    async function init() {
        showLoading();
        await loadData();
        renderCategoryFilters();
        displayProducts();
        setupEventListeners();
        hideLoading();
        updateCartCount();
    }

    // Fonctions de chargement
    async function loadData() {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                fetch('http://localhost:4000/produits'),
                fetch('http://localhost:4000/categories')
            ]);
            
            if (!productsRes.ok || !categoriesRes.ok) {
                throw new Error('Erreur de chargement des données');
            }
            
            products = await productsRes.json();
            categories = await categoriesRes.json();
            filteredProducts = [...products];
        } catch (error) {
            console.error('Erreur:', error);
            showError('Erreur de chargement des produits');
        }
    }

    // Fonctions d'affichage
    function displayProducts(productsToShow = filteredProducts) {
        productsContainer.innerHTML = '';
        
        if (productsToShow.length === 0) {
            productsContainer.innerHTML = '<p class="no-products">Aucun produit ne correspond à vos critères.</p>';
            productsTotal.textContent = '0';
            return;
        }

        productsToShow.forEach(product => {
            const clone = productTemplate.content.cloneNode(true);
            const card = clone.querySelector('.product-card');
            const link = clone.querySelector('.product-link');
            
            // Données du produit
            card.dataset.id = product.id_produit;
            card.dataset.genre = product.genre;
            card.dataset.categorie = product.id_categorie;
            card.dataset.matieres = product.matieres;
            card.dataset.prix = product.prix;
            
            // Lien vers la page produit
            link.href = `produit.html?id=${product.id_produit}`;
            
            // Image
            const img = clone.querySelector('img');
            img.src = product.image || '../img/default-product.jpg';
            img.alt = product.nom;
            
            // Informations
            clone.querySelector('.nom').textContent = product.nom;
            clone.querySelector('.categorie').textContent = getCategoryName(product.id_categorie);
            clone.querySelector('.prix').textContent = formatPrice(product.prix);
            clone.querySelector('.description').textContent = truncateDescription(product.description);
            clone.querySelector('.matieres').textContent = formatMaterial(product.matieres);
            
            // Stock
            const stockStatus = clone.querySelector('.stock-status');
            const stockQty = clone.querySelector('.stock-qty');
            
            if (product.stock > 0) {
                stockStatus.textContent = 'En stock';
                stockStatus.classList.add('in-stock');
                stockQty.textContent = `${product.stock} disponible${product.stock > 1 ? 's' : ''}`;
            } else {
                stockStatus.textContent = 'Rupture';
                stockStatus.classList.add('out-of-stock');
                stockQty.textContent = '';
                clone.querySelector('.add-to-cart').disabled = true;
            }
            
            // Ajout au panier
            clone.querySelector('.add-to-cart').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product);
            });
            
            productsContainer.appendChild(clone);
        });
        
        productsTotal.textContent = productsToShow.length;
    }

    function renderCategoryFilters() {
        const typeOptions = document.getElementById('type-options');
        if (!typeOptions) return;
        
        typeOptions.innerHTML = '';
        
        categories.forEach(category => {
            const label = document.createElement('label');
            label.className = 'filter-option';
            label.innerHTML = `
                <input type="checkbox" name="type" value="${category.id_categorie}">
                <span class="checkmark"></span>
                ${category.nom}
            `;
            typeOptions.appendChild(label);
        });
    }

    // Fonctions de filtrage
    function filterProducts() {
        const selectedFilters = getSelectedFilters();
        
        filteredProducts = products.filter(product => {
            // Filtre par genre
            const genreMatch = selectedFilters.genres.length === 0 || 
                             selectedFilters.genres.includes(product.genre);
            
            // Filtre par catégorie
            const categorieMatch = selectedFilters.categories.length === 0 || 
                                 selectedFilters.categories.includes(String(product.id_categorie));
            
            // Filtre par matière
            const matiereMatch = selectedFilters.matieres.length === 0 || 
                               selectedFilters.matieres.some(m => product.matieres.includes(m));
            
            // Filtre par prix
            const prixMatch = product.prix <= selectedFilters.maxPrix;
            
            return genreMatch && categorieMatch && matiereMatch && prixMatch;
        });
        
        currentPage = 1;
        displayProducts();
    }

    function getSelectedFilters() {
        return {
            genres: Array.from(document.querySelectorAll('input[name="genre"]:checked')).map(i => i.value),
            categories: Array.from(document.querySelectorAll('input[name="type"]:checked')).map(i => i.value),
            matieres: Array.from(document.querySelectorAll('input[name="matiere"]:checked')).map(i => i.value),
            maxPrix: parseInt(priceRange.value)
        };
    }

    function resetFilters() {
        // Réinitialiser les cases à cocher
        document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Réinitialiser le slider de prix
        if (priceRange && priceValue) {
            priceRange.value = 50000;
            priceValue.textContent = formatPrice(50000);
        }
        
        // Réinitialiser les produits affichés
        filteredProducts = [...products];
        displayProducts();
    }

    // Fonctions utilitaires
    function formatPrice(price) {
        return new Intl.NumberFormat('fr-FR').format(price) + ' Fcfa';
    }

    function truncateDescription(desc, maxLength = 100) {
        return desc.length > maxLength ? desc.substring(0, maxLength) + '...' : desc;
    }

    function formatMaterial(material) {
        return material.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    function getCategoryName(categoryId) {
        const category = categories.find(c => c.id_categorie == categoryId);
        return category ? category.nom : '';
    }

    function addToCart(product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === product.id_produit);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id_produit,
                name: product.nom,
                price: product.prix,
                image: product.image,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showToast(`${product.nom} ajouté au panier`);
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = totalItems;
        });
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
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.innerHTML = `
            <iconify-icon icon="mdi:alert-circle" width="24" height="24"></iconify-icon>
            <span>${message}</span>
        `;
        productsContainer.innerHTML = '';
        productsContainer.appendChild(errorEl);
    }

    // Gestion des événements
    function setupEventListeners() {
        // Filtres mobiles
        filterToggleBtn.addEventListener('click', toggleFilters);
        filterCloseBtn.addEventListener('click', toggleFilters);
        filtersOverlay.addEventListener('click', toggleFilters);

        // Slider de prix
        if (priceRange && priceValue) {
            priceRange.addEventListener('input', () => {
                priceValue.textContent = formatPrice(priceRange.value);
            });
        }

        // Boutons de filtres
        applyFiltersBtn.addEventListener('click', filterProducts);
        resetFiltersBtn.addEventListener('click', resetFilters);

        // Toggles des filtres
        document.querySelectorAll('.filter-toggle').forEach(toggle => {
            toggle.addEventListener('click', function() {
                const expanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !expanded);
            });
        });
    }

    function toggleFilters() {
        filtersSection.classList.toggle('active');
        filtersOverlay.classList.toggle('active');
        document.body.style.overflow = filtersSection.classList.contains('active') ? 'hidden' : '';
    }

    const typeOptions = document.getElementById('type-options');
    if (!typeOptions) return;

    try {
        const response = await fetch('http://localhost:4000/categories');
        if (!response.ok) throw new Error('Erreur lors du chargement des catégories');
        const categories = await response.json();

        // Nettoie d'abord le conteneur
        typeOptions.innerHTML = '';

        categories.forEach(cat => {
            const label = document.createElement('label');
            label.className = 'filter-option';
            label.innerHTML = `
                <input type="checkbox" name="categorie" value="${cat.id_categorie}">
                <span class="checkmark"></span>
                ${cat.nom}
            `;
            typeOptions.appendChild(label);
        });
    } catch (error) {
        typeOptions.innerHTML = '<p>Impossible de charger les catégories.</p>';
        console.error(error);
    }
});