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
});