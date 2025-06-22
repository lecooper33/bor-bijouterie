document.addEventListener('DOMContentLoaded', async () => {
    // Récupération de l'utilisateur connecté
    const user = JSON.parse(localStorage.getItem('user'));
    const userInfoDiv = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logoutBtn');

    // Redirection si non connecté
    if (!user || !user.id || !user.token) {
        window.location.href = 'login.html';
        return;
    }

    // Simulation de chargement
    userInfoDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Chargement de vos informations...</p>
    `;

    // Récupération des infos utilisateur depuis l'API
    try {
        const response = await fetch(`http://localhost:4000/clients/${user.id}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });

        if (!response.ok) {
            throw new Error("Impossible de récupérer les informations utilisateur.");
        }

        const data = await response.json();

        // Affichage des informations (adapte les champs selon ta BDD)
        userInfoDiv.classList.remove('loading');
        userInfoDiv.innerHTML = `
            <p><strong>Nom complet</strong><span>${data.prenom ? data.prenom + ' ' : ''}${data.nom || ''}</span></p>
            <p><strong>Email</strong><span>${data.email || ''}</span></p>
            <p><strong>Téléphone</strong><span>${data.telephone || 'Non renseigné'}</span></p>
            <p><strong>Adresse</strong><span>${data.adresse || 'Non renseignée'}</span></p>
            <p><strong>Membre depuis</strong><span>${data.dateInscription ? new Date(data.dateInscription).toLocaleDateString('fr-FR') : ''}</span></p>
        `;
    } catch (err) {
        userInfoDiv.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${err.message}</p>
            </div>
        `;
    }

    // Gestion de la déconnexion
    logoutBtn.addEventListener('click', () => {
        logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Déconnexion en cours...';
        logoutBtn.disabled = true;

        setTimeout(() => {
            localStorage.removeItem('user');
            window.location.href = '../index.html';
        }, 800);
    });

    // Ajout d'effets interactifs
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('mousedown', () => {
            btn.style.transform = 'translateY(0)';
        });

        btn.addEventListener('mouseup', () => {
            btn.style.transform = 'translateY(-2px)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
});