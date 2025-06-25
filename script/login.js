const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// Connexion
document.addEventListener("DOMContentLoaded", function () {
    // Formulaire de connexion
    const signInForm = document.querySelector('.form-container.sign-in form');
    signInForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = signInForm.querySelector('input[type="email"]').value.trim();
        const password = signInForm.querySelector('input[type="password"]').value.trim();

        try {
            const response = await fetch('http://localhost:4000/connexion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                // Connexion client réussie
                localStorage.setItem('user', JSON.stringify({
                    id: data.id,
                    token: data.token,
                    email: email
                }));
                alert("Connexion réussie !");
                window.location.href = "../index.html";
            } else {
                // Si la connexion client échoue, tenter la connexion admin
                const adminResponse = await fetch('http://localhost:4000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const adminData = await adminResponse.json();
                if (adminResponse.ok) {
                    // Connexion admin réussie
                    localStorage.setItem('adminToken', adminData.token);
                    alert("Connexion admin réussie !");
                    window.location.href = "admin.html";
                } else {
                    alert(data.message || adminData.message || "Erreur lors de la connexion.");
                }
            }
        } catch (error) {
            alert("Erreur réseau ou serveur.");
            console.error(error);
        }
    });

    // Formulaire d'inscription
    const signUpForm = document.querySelector('.form-container.sign-up form');
    signUpForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const nom = signUpForm.querySelector('input[placeholder="Nom"]').value.trim();
        const email = signUpForm.querySelector('input[type="email"]').value.trim();
        const password = signUpForm.querySelector('input[type="password"]').value.trim();

        try {
            const response = await fetch('http://localhost:4000/inscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom, email, password })
            });
            const data = await response.json();

            if (response.ok && data.requiresOtpVerification) {
                localStorage.setItem('pendingEmail', email);
                localStorage.setItem('user', JSON.stringify({
                    id: data.IdUtilisateur || data.id || "",
                    email: email
                }));
                alert("Inscription réussie. Vérifiez votre e-mail pour le code OTP.");
                window.location.href = "otp.html";
            } else {
                alert(data.message || "Erreur lors de l'inscription.");
            }
        } catch (error) {
            alert("Erreur réseau ou serveur.");
            console.error(error);
        }
    });
});