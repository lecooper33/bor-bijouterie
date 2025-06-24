document.addEventListener('DOMContentLoaded', async () => {
    const productsContainer = document.getElementById('products-container');
    const productsTotal = document.getElementById('products-total');
    const template = document.getElementById('product-template');

    // Récupérer les catégories et créer un dictionnaire id => nom
    let categoriesMap = {};
    try {
        const catRes = await fetch('http://localhost:4000/categories');
        const categories = await catRes.json();
        categories.forEach(cat => {
            categoriesMap[cat.id_categorie] = cat.nom;
        });
    } catch (error) {
        console.error("Erreur lors du chargement des catégories :", error);
    }

    // Récupérer les produits
    let products = [];
    try {
        const prodRes = await fetch('http://localhost:4000/produits');
        products = await prodRes.json();
    } catch (error) {
        console.error("Erreur lors du chargement des produits :", error);
    }

    // Mettre à jour le nombre total de produits
    productsTotal.textContent = products.length;

    // Fonction pour formater le prix
    const formatPrice = (prix) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Number(prix));
    };

    // Création de la carte produit
    const createProductCard = (product) => {
        const card = template.content.cloneNode(true);

        // Image
        const img = card.querySelector('img');
        img.src = product.image || 'images/placeholder.jpg';
        img.alt = product.nom;

        // Nom
        card.querySelector('h3.nom').textContent = product.nom;

        // Catégorie (nom)
        card.querySelector('.categorie').textContent = categoriesMap[product.id_categorie] || '';

        // Description
        card.querySelector('.description').textContent = product.description;

        // Matière
        card.querySelector('.matieres').textContent = `Matière: ${product.matieres}`;

        // Prix
        card.querySelector('.prix').textContent = formatPrice(product.prix);

        // Stock
        card.querySelector('.stock-qty').textContent = `Stock: ${product.stock}`;

        // Statut du stock
        const stockStatus = card.querySelector('.stock-status');
        if (product.stock > 0) {
            stockStatus.textContent = 'En stock';
            stockStatus.classList.add('in-stock');
        } else {
            stockStatus.textContent = 'Rupture de stock';
            stockStatus.classList.add('out-of-stock');
        }

        // Ajoute l'attribut data-id
        const cardRoot = card.querySelector('.product-card');
        if (cardRoot) {
            cardRoot.setAttribute('data-id', product.id_produit);
        }

        // Bouton ajouter au panier
        const addToCartBtn = card.querySelector('.add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                addToCart({
                    id: product.id_produit,
                    nom: product.nom,
                    prix: product.prix,
                    image: product.image
                });
            });
        }

        // Bouton voir détails
        const quickViewBtn = card.querySelector('.quick-view');
        if (quickViewBtn) {
            quickViewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = `pages/produit.html?id=${product.id_produit}`;
            });
        }

        return card;
    };

    // Fonction pour afficher un message temporaire
    function showCartMessage(msg) {
        const msgBox = document.getElementById('cart-message');
        if (!msgBox) return;
        msgBox.textContent = msg;
        msgBox.style.display = 'block';
        setTimeout(() => {
            msgBox.style.display = 'none';
        }, 2000);
    }

    // Fonction pour ajouter au panier
    function addToCart(product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        // Vérifie si le produit existe déjà (par ID)
        const found = cart.find(item => item.id === product.id);
        if (found) {
            found.quantity += 1; // Utilise 'quantity' au lieu de 'qty'
        } else {
            cart.push({
                id: product.id_produit || product.id,
                name: product.nom,
                price: Number(product.prix),
                image: product.image,
                quantity: 1 // Utilise 'quantity'
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showCartMessage("Produit ajouté au panier !");
    }

    // Met à jour le compteur du panier
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((sum, item) => sum + item.qty, 0);
        document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
    }

    // Afficher seulement les 8 premiers produits
    products.slice(0, 8).forEach(product => {
        productsContainer.appendChild(createProductCard(product));
    });

    // ...après avoir affiché les produits
    updateCartCount();
});
