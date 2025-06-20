document.addEventListener('DOMContentLoaded', () => {
    // ... (votre code existant pour la gestion de l'interface)

    // Gestion des formulaires
    const signUpForm = document.querySelector('.sign-up form');
    const signInForm = document.querySelector('.sign-in form');

    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(signUpForm);
        const userData = {
            nom: formData.get('nom'),
            email: formData.get('email'),
            telephone: formData.get('telephone'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/inscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            
            if (data.requiresOtpVerification) {
                // Stocker temporairement les données utilisateur
                localStorage.setItem('pendingUser', JSON.stringify(userData));
                // Rediriger vers la page OTP
                window.location.href = 'verification-otp.html';
            } else if (data.success) {
                alert('Inscription réussie !');
                window.location.href = 'login.html';
            }
        } catch (err) {
            console.error('Erreur lors de l\'inscription:', err);
            alert('Erreur lors de l\'inscription');
        }
    });

    signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(signInForm);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('http://localhost:4000/connexion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Stocker les informations de l'utilisateur dans le localStorage
                localStorage.setItem('user', JSON.stringify({
                    id: data.userId,
                    email: loginData.email,
                    token: data.token,
                    statut_compte: data.statut_compte
                }));
                
                // Rediriger vers la page d'accueil ou dashboard
                window.location.href = '../index.html';
            } else {
                alert(data.message || 'Erreur de connexion');
            }
        } catch (err) {
            console.error('Erreur lors de la connexion:', err);
            alert('Erreur lors de la connexion');
        }
    });
});