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
    const otpForm = document.querySelector('.otp-form');
    const otpMessage = otpForm.querySelector('.otp-message');
    let pendingEmail = null;

    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Récupération des données du formulaire d'inscription
        const formData = new FormData(signUpForm);
        const userData = {
            nom: formData.get('nom'),
            email: formData.get('email'),
            telephone: formData.get('telephone'),
            password: formData.get('password')
        };

        // Appel API d'inscription
        try {
            const response = await fetch('http://localhost:3000/api/inscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            if (data.requiresOtpVerification) {
                pendingEmail = userData.email;
                signUpForm.style.display = 'none';
                otpForm.style.display = 'block';
                otpMessage.textContent = 'Un code OTP a été envoyé à votre email.';
            } else {
                otpMessage.textContent = data.message || 'Inscription réussie.';
            }
        } catch (err) {
            otpMessage.textContent = 'Erreur lors de l\'inscription.';
        }
    });

    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = otpForm.querySelector('input[name="otp"]').value;
        if (!pendingEmail) {
            otpMessage.textContent = 'Erreur : email non trouvé.';
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/verifier-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: pendingEmail, otp })
            });
            const data = await response.json();
            if (response.ok) {
                otpMessage.textContent = 'Vérification réussie ! Vous pouvez vous connecter.';
                setTimeout(() => { window.location.reload(); }, 2000);
            } else {
                otpMessage.textContent = data.message || 'OTP incorrect ou expiré.';
            }
        } catch (err) {
            otpMessage.textContent = 'Erreur lors de la vérification OTP.';
        }
    });

    signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Récupération des données du formulaire de connexion
        const formData = new FormData(signInForm);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        // Exemple d'appel API harmonisé (à adapter selon votre URL)
        
        fetch('http://localhost:3000/api/connexion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        })
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.error(err));
        
        console.log('Données de connexion:', loginData);
    });
});