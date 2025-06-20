document.addEventListener('DOMContentLoaded', () => {
    // Éléments de navigation
    const header = document.querySelector('header');
    const hamburger = document.querySelector('.hamburger');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    
    // Gestion du menu mobile
    hamburger.addEventListener('click', () => {
        navbar.classList.toggle('menu-open');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navbar.classList.contains('menu-open') ? 'hidden' : '';
    });

    // Ferme le menu quand un lien est cliqué
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.remove('menu-open');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Ferme le menu quand on clique en dehors
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && navLinks.classList.contains('active')) {
            navbar.classList.remove('menu-open');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Gestion de l'affichage/masquage du header au scroll
    let lastScroll = 0;
    const scrollThreshold = 100;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Affiche le header au scroll vers le haut
        if (currentScroll < lastScroll || currentScroll < scrollThreshold) {
            header.classList.remove('header-hidden');
        } 
        // Cache le header au scroll vers le bas
        else if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
            header.classList.add('header-hidden');
        }
        
        lastScroll = currentScroll;
    });

    // Ajout de la classe active sur le lien courant
    const currentPage = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPage || 
            (currentPage === '/' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Affichage dynamique des produits sur la page d'accueil
    const productsContainer = document.getElementById('products-container');
    const productTemplate = document.getElementById('product-template');
    if (productsContainer && productTemplate && typeof products !== 'undefined') {
        products.forEach(product => {
            const clone = productTemplate.content.cloneNode(true);
            const img = clone.querySelector('img');
            const nom = clone.querySelector('.nom');
            const categorie = clone.querySelector('.categorie');
            const description = clone.querySelector('.description');
            const matieres = clone.querySelector('.matieres');
            const prix = clone.querySelector('.prix');
            const stockQty = clone.querySelector('.stock-qty');
            const stockStatus = clone.querySelector('.stock-status');

            if (img) {
                img.src = product.image;
                img.alt = product.nom;
            }
            if (nom) nom.textContent = product.nom;
            if (categorie) categorie.textContent = product.genre;
            if (description) description.textContent = product.description;
            if (matieres) matieres.textContent = product.matieres;
            if (prix) prix.textContent = product.prix + ' FCFA';
            if (stockQty) stockQty.textContent = `Stock: ${product.stock}`;
            if (stockStatus) {
                stockStatus.textContent = product.stock > 0 ? 'En stock' : 'Rupture';
                stockStatus.className = 'stock-status ' + (product.stock > 0 ? 'en-stock' : 'rupture');
            }
            productsContainer.appendChild(clone);
        });
    }
});
// Vérifier l'état d'authentification au chargement de chaque page
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const protectedRoutes = ['panier.html', 'compte.html']; // Ajoutez vos routes protégées
    
    if (protectedRoutes.some(route => window.location.pathname.includes(route))) {
        if (!user || !user.token) {
            window.location.href = 'login.html';
        }
    }
    
    // Mettre à jour l'interface en fonction de l'état de connexion
    updateAuthUI();
});

function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginLink = document.querySelector('a[href="login.html"]');
    const logoutLink = document.getElementById('logoutLink');
    
    if (user && user.token) {
        if (loginLink) {
            loginLink.textContent = 'Mon compte';
            loginLink.href = 'compte.html';
        }
        
        if (logoutLink) {
            logoutLink.style.display = 'block';
        }
    } else {
        if (logoutLink) {
            logoutLink.style.display = 'none';
        }
    }
}

// Fonction de déconnexion
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}