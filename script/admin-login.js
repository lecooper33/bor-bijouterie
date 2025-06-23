document.addEventListener('DOMContentLoaded', function() {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const closeMessage = document.getElementById('closeMessage');

    // URL de votre backend - à adapter selon votre configuration
    const BASE_URL = 'http://localhost:4000'; // Remplacez par l'URL de votre backend

    // Animation pour basculer entre les formulaires
    signUpButton.addEventListener('click', () => {
        container.classList.add("right-panel-active");
    });

    signInButton.addEventListener('click', () => {
        container.classList.remove("right-panel-active");
    });

    // Gestion de la fermeture du message
    closeMessage.addEventListener('click', () => {
        messageBox.classList.add('hidden');
    });

    // Fonction pour afficher les messages
    function showMessage(message, isError = false) {
        messageText.textContent = message;
        messageBox.classList.remove('hidden');
        if (isError) {
            messageBox.style.color = '#FF4B2B';
        } else {
            messageBox.style.color = '#4CAF50';
        }
    }

    // Gestion de la soumission du formulaire de connexion
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la connexion');
            }

            showMessage(data.message);
            console.log('Connexion réussie, token:', data.token);
            
            // Stocker le token dans le localStorage
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminId', data.userId);
            
            // Redirection vers le tableau de bord après 2 secondes
            setTimeout(() => {
                window.location.href = '../pages/admin.html'; // Remplacez par votre page de dashboard
            }, 2000);

        } catch (error) {
            showMessage(error.message, true);
            console.error('Erreur:', error);
        }
    });

    // Gestion de la soumission du formulaire d'inscription
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nom = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        try {
            const response = await fetch(`${BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nom, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de l\'inscription');
            }

            showMessage(data.message);
            console.log('Inscription réussie pour:', data.email);
            
            // Basculer vers le formulaire de connexion après inscription
            setTimeout(() => {
                container.classList.remove("right-panel-active");
                loginEmail.value = email; // Pré-remplir l'email dans le formulaire de connexion
                messageBox.classList.add('hidden');
            }, 2000);

        } catch (error) {
            showMessage(error.message, true);
            console.error('Erreur:', error);
        }
    });

    // Vérifier si l'utilisateur est déjà connecté
    function checkAuth() {
        const token = localStorage.getItem('adminToken');
        if (token) {
            // L'utilisateur est déjà connecté, rediriger vers le dashboard
            window.location.href = '../pages/admin.html';
        }
    }

    // Vérifier l'authentification au chargement de la page
    checkAuth();
});