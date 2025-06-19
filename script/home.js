document.addEventListener('DOMContentLoaded', () => {
    // Récupérer les éléments nécessaires
    const productsContainer = document.getElementById('products-container');
    const template = document.getElementById('product-template');
    const productsTotal = document.getElementById('products-total');

    // Mettre à jour le nombre total de produits
    productsTotal.textContent = products.length;    // Fonction pour formater le prix
    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    // Fonction pour créer une carte de produit
    const createProductCard = (product) => {
        const card = template.content.cloneNode(true);
        
        // Image du produit
        const img = card.querySelector('img');
        img.src = product.image;
        img.alt = product.name;

        // Informations du produit
        card.querySelector('h3').textContent = product.name;
        card.querySelector('.category').textContent = product.category;
        card.querySelector('.description').textContent = product.description;
        card.querySelector('.material').textContent = `Matière: ${product.matiere}`;
        card.querySelector('.price').textContent = formatPrice(product.price);
        card.querySelector('.stock-qty').textContent = `Stock: ${product.stock}`;

        // État du stock
        const stockStatus = card.querySelector('.stock-status');
        if (product.stock > 0) {
            stockStatus.textContent = 'En stock';
            stockStatus.classList.add('in-stock');
        } else {
            stockStatus.textContent = 'Rupture de stock';
            stockStatus.classList.add('out-of-stock');
        }

        // Ajouter les gestionnaires d'événements
        const addToCartBtn = card.querySelector('.add-to-cart');
        addToCartBtn.addEventListener('click', () => {
            // TODO: Implémenter l'ajout au panier
            alert(`${product.name} ajouté au panier !`);
        });

        const quickViewBtn = card.querySelector('.quick-view');
        quickViewBtn.addEventListener('click', () => {
            window.location.href = `pages/produit.html?id=${product.id}`;
        });

        return card;
    };

    // Afficher tous les produits
    products.forEach(product => {
        productsContainer.appendChild(createProductCard(product));
    });
});
