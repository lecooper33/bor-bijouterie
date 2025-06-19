document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const mobileSignUpButton = document.getElementById('mobileSignUp');
    const mobileSignInButton = document.getElementById('mobileSignIn');

    // Fonction pour basculer entre les formulaires sur desktop
    signUpButton.addEventListener('click', () => {
        container.classList.add('right-panel-active');
    });

    signInButton.addEventListener('click', () => {
        container.classList.remove('right-panel-active');
    });

    // Fonction pour basculer entre les formulaires sur mobile
    mobileSignUpButton.addEventListener('click', () => {
        container.classList.add('right-panel-active');
        mobileSignUpButton.classList.add('active');
        mobileSignInButton.classList.remove('active');
    });

    mobileSignInButton.addEventListener('click', () => {
        container.classList.remove('right-panel-active');
        mobileSignInButton.classList.add('active');
        mobileSignUpButton.classList.remove('active');
    });

    // Fonction pour détecter le changement de taille d'écran
    const checkScreenSize = () => {
        const isMobile = window.innerWidth <= 768;
        const buttons = document.querySelector('.mobile-nav');
        if (buttons) {
            buttons.style.display = isMobile ? 'flex' : 'none';
        }
    };

    // Vérifier la taille de l'écran au chargement
    checkScreenSize();

    // Vérifier la taille de l'écran lors du redimensionnement
    window.addEventListener('resize', checkScreenSize);

    // Gestion des formulaires
    const signUpForm = document.querySelector('.sign-up form');
    const signInForm = document.querySelector('.sign-in form');

    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Récupération des données du formulaire d'inscription
        const formData = new FormData(signUpForm);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password')
        };

        // TODO: Ajouter la logique d'inscription ici
        console.log('Données d\'inscription:', userData);
    });

    signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Récupération des données du formulaire de connexion
        const formData = new FormData(signInForm);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        // TODO: Ajouter la logique de connexion ici
        console.log('Données de connexion:', loginData);
    });
});