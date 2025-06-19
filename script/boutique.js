document.addEventListener('DOMContentLoaded', function() {
    // Gestion des filtres sur mobile
    const filtersSection = document.querySelector('.filters');
    const filterToggleBtn = document.querySelector('.filter-toggle-mobile');
    const filterCloseBtn = document.querySelector('.filter-close');
    const filtersOverlay = document.querySelector('.filters-overlay');

    function toggleFilters() {
        if (!filtersSection || !filtersOverlay) return;
        filtersSection.classList.toggle('active');
        filtersOverlay.classList.toggle('active');
        document.body.style.overflow = filtersSection.classList.contains('active') ? 'hidden' : '';
    }

    // Gestionnaires d'événements pour les filtres mobiles
    filterToggleBtn?.addEventListener('click', toggleFilters);
    filterCloseBtn?.addEventListener('click', toggleFilters);
    filtersOverlay?.addEventListener('click', toggleFilters);

    // Gestion du loader
    const loadingOverlay = document.querySelector('.loading-overlay');
    
    // Afficher le loader pendant 5 secondes
    setTimeout(() => {
        loadingOverlay.classList.add('fade-out');
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 300);
    }, false);

    // Fonction pour formatter le prix
    function formatPrice(price) {
        return new Intl.NumberFormat('fr-FR').format(price) + ' Fcfa';
    }

    // Fonction pour afficher les produits
    function displayProducts(productsToShow = products) {
        const container = document.getElementById('products-container');
        const template = document.getElementById('product-template');
        container.innerHTML = ''; // Nettoyer le conteneur

        productsToShow.forEach(product => {
            const clone = template.content.cloneNode(true);
            
            // Image et attributs de données
            const card = clone.querySelector('.product-card');
            card.dataset.genre = product.genre;
            card.dataset.type = product.category;
            card.dataset.matiere = product.matiere;
            card.dataset.price = product.price;

            // Image
            const img = clone.querySelector('img');
            img.src = product.image;
            img.alt = product.name;

            // Informations du produit
            clone.querySelector('h3').textContent = product.name;
            clone.querySelector('.category').textContent = product.category.toUpperCase();
            clone.querySelector('.description').textContent = product.description;
            clone.querySelector('.material').textContent = product.matiere.replace('-', ' ').toUpperCase();
            
            // Prix et stock
            clone.querySelector('.price').textContent = formatPrice(product.price);
            const stockStatus = clone.querySelector('.stock-status');
            const stockQty = clone.querySelector('.stock-qty');
            
            if (product.stock > 0) {
                stockStatus.textContent = 'En stock';
                stockStatus.classList.add('in-stock');
                stockQty.textContent = `${product.stock} disponible${product.stock > 1 ? 's' : ''}`;
            } else {
                stockStatus.textContent = 'Rupture de stock';
                stockStatus.classList.add('out-of-stock');
                stockQty.textContent = 'Indisponible';
            }

            container.appendChild(clone);
        });

        // Mettre à jour le compteur de produits
        document.getElementById('products-total').textContent = productsToShow.length;
    }

    // Fonction pour filtrer les produits
    function filterProducts() {
        const selectedFilters = {
            genres: Array.from(document.querySelectorAll('input[name="genre"]:checked')).map(input => input.value),
            types: Array.from(document.querySelectorAll('input[name="type"]:checked')).map(input => input.value),
            matieres: Array.from(document.querySelectorAll('input[name="matiere"]:checked')).map(input => input.value),
            maxPrice: parseInt(document.getElementById('priceRange').value)
        };

        const filteredProducts = products.filter(product => {
            const genreMatch = selectedFilters.genres.length === 0 || selectedFilters.genres.includes(product.genre);
            const typeMatch = selectedFilters.types.length === 0 || selectedFilters.types.includes(product.category);
            const matiereMatch = selectedFilters.matieres.length === 0 || selectedFilters.matieres.includes(product.matiere);
            const priceMatch = product.price <= selectedFilters.maxPrice;

            return genreMatch && typeMatch && matiereMatch && priceMatch;
        });

        displayProducts(filteredProducts);
    }

    // Gestionnaires d'événements pour les filtres
    const filterToggles = document.querySelectorAll('.filter-toggle');
    filterToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !expanded);
        });
    });

    // Gestion du slider de prix
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    if (priceRange && priceValue) {
        priceRange.addEventListener('input', () => {
            priceValue.textContent = formatPrice(priceRange.value);
        });
    }

    // Gestion des boutons de filtres
    const applyFilters = document.querySelector('.apply-filters');
    const resetFilters = document.querySelector('.reset-filters');
    
    if (applyFilters) {
        applyFilters.addEventListener('click', function() {
            filterProducts();
            // Fermer les menus déroulants
            filterToggles.forEach(toggle => {
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
    
    if (resetFilters) {
        resetFilters.addEventListener('click', function() {
            // Réinitialiser les filtres
            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            if (priceRange && priceValue) {
                priceRange.value = 50000;
                priceValue.textContent = formatPrice(50000);
            }
            displayProducts(); // Afficher tous les produits
        });
    }

    // Afficher les produits initiaux
    displayProducts();
});