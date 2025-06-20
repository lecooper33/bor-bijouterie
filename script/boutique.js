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
    function formatPrice(prix) {
        return new Intl.NumberFormat('fr-FR').format(prix) + ' Fcfa';
    }

    // Fonction pour afficher les produits
    function displayProducts(productsToShow = products) {
        const container = document.getElementById('products-container');
        const template = document.getElementById('product-template');
        container.innerHTML = ''; // Nettoyer le conteneur

        productsToShow.forEach(product => {
            const clone = template.content.cloneNode(true);
            // Mise à jour des attributs data-* selon la nouvelle structure
            const card = clone.querySelector('.product-card');
            card.dataset.genre = product.genre;
            card.dataset.id_categorie = Array.isArray(product.id_categorie) ? product.id_categorie.join(',') : product.id_categorie;
            card.dataset.matieres = product.matieres;
            card.dataset.prix = product.prix;
            card.dataset.id_produit = product.id_produit; // Ajouter l'ID du produit

            // Ajouter le gestionnaire de clic sur la carte produit
            card.addEventListener('click', () => {
                // Stocker les données du produit dans le localStorage
                localStorage.setItem('selectedProduct', JSON.stringify(product));
                // Rediriger vers la page produit
                window.location.href = './produit.html';
            });

            // Image
            const img = clone.querySelector('img');
            img.src = product.image;
            img.alt = product.nom;

            // Informations du produit
            clone.querySelector('h3.nom').textContent = product.nom;
            // Affichage des catégories : si tableau, afficher les noms séparés, sinon afficher l'ID
            if (Array.isArray(product.id_categorie)) {
                // Si tu as accès à la liste des catégories, tu peux afficher les noms ici
                clone.querySelector('.categorie').textContent = product.id_categorie.map(id => {
                    const cat = (typeof categories !== 'undefined') ? categories.find(c => c.id_categorie == id) : null;
                    return cat ? cat.nom : id;
                }).join(', ');
            } else {
                const cat = (typeof categories !== 'undefined') ? categories.find(c => c.id_categorie == product.id_categorie) : null;
                clone.querySelector('.categorie').textContent = cat ? cat.nom : product.id_categorie;
            }
            clone.querySelector('.description').textContent = product.description;
            clone.querySelector('.matieres').textContent = product.matieres.replace('-', ' ').toUpperCase();
            
            // Prix et stock
            clone.querySelector('.prix').textContent = formatPrice(product.prix);
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
            id_categories: Array.from(document.querySelectorAll('input[name="type"]:checked')).map(input => input.value),
            matieres: Array.from(document.querySelectorAll('input[name="matiere"]:checked')).map(input => input.value),
            maxPrix: parseInt(document.getElementById('priceRange').value)
        };

        const filteredProducts = products.filter(product => {
            const genreMatch = selectedFilters.genres.length === 0 || selectedFilters.genres.includes(product.genre);
            // Adaptation pour gérer id_categorie tableau ou nombre
            let categorieMatch = false;
            if (selectedFilters.id_categories.length === 0) {
                categorieMatch = true;
            } else if (Array.isArray(product.id_categorie)) {
                categorieMatch = product.id_categorie.some(id => selectedFilters.id_categories.includes(String(id)));
            } else {
                categorieMatch = selectedFilters.id_categories.includes(String(product.id_categorie));
            }
            const matiereMatch = selectedFilters.matieres.length === 0 || selectedFilters.matieres.includes(product.matieres);
            const prixMatch = product.prix <= selectedFilters.maxPrix;

            return genreMatch && categorieMatch && matiereMatch && prixMatch;
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

    // Importer les catégories
    // Assurez-vous que <script src="../script/categories-data.js"></script> est inclus dans boutique.html avant ce script !

    // Générer dynamiquement les filtres de catégories APRÈS que le DOM est prêt
    function renderCategoryFilters() {
        const typeOptions = document.getElementById('type-options');
        // Correction : utiliser la variable globale 'categories' directement
        if (!typeOptions || typeof categories === 'undefined') return;
        typeOptions.innerHTML = '';
        categories.forEach(cat => {
            const label = document.createElement('label');
            label.className = 'filter-option';
            label.innerHTML = `
                <input type="checkbox" name="type" value="${cat.id_categorie}">
                <span class="checkmark"></span>
                ${cat.nom}
            `;
            typeOptions.appendChild(label);
        });
    }

    // Appeler la fonction au chargement
    renderCategoryFilters();

    // Afficher les produits initiaux
    displayProducts();
});