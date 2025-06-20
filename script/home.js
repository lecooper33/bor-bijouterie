document.addEventListener('DOMContentLoaded', () => {
    // Récupérer les éléments nécessaires
    const productsContainer = document.getElementById('products-container');
    const template = document.getElementById('product-template');
    const productsTotal = document.getElementById('products-total');

    // Mettre à jour le nombre total de produits
    productsTotal.textContent = products.length;
    const formatPrice = (prix) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(prix);
    };

    const createProductCard = (product) => {
        const card = template.content.cloneNode(true);
        // Image du produit
        const img = card.querySelector('img');
        img.src = product.image;
        img.alt = product.nom;
        // Informations du produit
        card.querySelector('h3.nom').textContent = product.nom;
        card.querySelector('.categorie').textContent = product.id_categorie;
        card.querySelector('.description').textContent = product.description;
        card.querySelector('.matieres').textContent = `Matière: ${product.matieres}`;
        card.querySelector('.prix').textContent = formatPrice(product.prix);
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
        // Gestionnaire d'ajout au panier
        const addToCartBtn = card.querySelector('.add-to-cart');
        addToCartBtn.addEventListener('click', () => {
            alert(`${product.nom} ajouté au panier !`);
        });
        // Vue rapide
        const quickViewBtn = card.querySelector('.quick-view');
        quickViewBtn.addEventListener('click', () => {
            window.location.href = `pages/produit.html?id=${product.id_produit}`;
        });
        return card;
    };
    // Afficher seulement les 8 premiers produits
    products.slice(0, 8).forEach(product => {
        productsContainer.appendChild(createProductCard(product));
    });
});
