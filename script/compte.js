document.addEventListener('DOMContentLoaded', async () => {
    // Récupération de l'utilisateur connecté
    const user = JSON.parse(localStorage.getItem('user'));
    const userInfoDiv = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logoutBtn');
    const lastLoginSpan = document.getElementById('last-login');

    // Redirection si non connecté
    if (!user || !user.id || !user.token) {
        window.location.href = 'login.html';
        return;
    }

    // Affichage de la dernière connexion (simulée)
    lastLoginSpan.textContent = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

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

        // Affichage des informations
        userInfoDiv.classList.remove('loading');
        userInfoDiv.innerHTML = `
            <p><strong>Nom complet</strong><span>${data.prenom ? data.prenom + ' ' : ''}${data.nom || ''}</span></p>
            <p><strong>Email</strong><span>${data.email || ''}</span></p>
            <p><strong>Téléphone</strong><span>${data.telephone || 'Non renseigné'}</span></p>
            <p><strong>Adresse</strong><span>${data.adresse || 'Non renseignée'}</span></p>
            <p><strong>Membre depuis</strong><span>${data.dateInscription ? new Date(data.dateInscription).toLocaleDateString('fr-FR') : ''}</span></p>
            <p><strong>Statut</strong><span class="status-badge">${data.statut_compte === '1' ? 'Actif' : 'En attente'}</span></p>
        `;

        // Ajout des styles pour le badge de statut
        const statusBadge = document.querySelector('.status-badge');
        if (statusBadge) {
            statusBadge.style.display = 'inline-block';
            statusBadge.style.padding = '0.25rem 0.5rem';
            statusBadge.style.borderRadius = '1rem';
            statusBadge.style.fontSize = '0.75rem';
            statusBadge.style.fontWeight = '600';
            statusBadge.style.backgroundColor = data.statut_compte === '1' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(241, 196, 15, 0.2)';
            statusBadge.style.color = data.statut_compte === '1' ? 'var(--color-success)' : '#F1C40F';
        }
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

        // Animation de déconnexion
        document.querySelector('.account-container').style.animation = 'fadeOut 0.5s ease forwards';
        
        setTimeout(() => {
            localStorage.removeItem('user');
            window.location.href = '../index.html';
        }, 800);
    });

    // Ajout d'effets interactifs pour les boutons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.boxShadow = 'var(--shadow-sm)';
        });

        btn.addEventListener('mousedown', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        });
    });

    // Animation d'entrée
    document.querySelector('.account-container').style.opacity = '0';
    document.querySelector('.account-container').style.animation = 'fadeIn 0.5s ease forwards';
});

// Ajout des animations CSS dynamiquement
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
    }
`;
document.head.appendChild(style);

