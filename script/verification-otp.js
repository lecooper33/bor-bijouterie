document.addEventListener('DOMContentLoaded', () => {
    const otpForm = document.getElementById('otpForm');
    const otpMessage = document.getElementById('otpMessage');
    const resendOtp = document.getElementById('resendOtp');
    const otpCode = document.getElementById('otpCode');
    const otpTimer = document.getElementById('otpTimer');
    const countdown = document.getElementById('countdown');
    
    // Désactiver le bouton de renvoi initialement
    resendOtp.disabled = true;
    
    // Timer pour le renvoi d'OTP
    let timeLeft = 60;
    const timer = setInterval(() => {
        timeLeft--;
        countdown.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            otpTimer.style.display = 'none';
            resendOtp.disabled = false;
        }
    }, 1000);
    
    // Auto-focus sur le champ OTP
    otpCode.focus();
    
    // Vérification de l'OTP
    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const code = otpCode.value.trim();
        const pendingUser = JSON.parse(localStorage.getItem('pendingUser'));
        
        if (!pendingUser) {
            showMessage('Session expirée, veuillez recommencer l\'inscription.', 'error');
            return;
        }

        if (code.length !== 4 || !/^\d+$/.test(code)) {
            showMessage('Veuillez entrer un code OTP valide à 4 chiffres', 'error');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:4000/inscription/verifier-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: pendingUser.email, 
                    otp: code 
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('Vérification réussie ! Redirection en cours...', 'success');
                
                // Stocker les informations de l'utilisateur
                localStorage.setItem('user', JSON.stringify({
                    id: data.userId,
                    email: pendingUser.email,
                    token: data.token
                }));
                
                // Nettoyer les données temporaires
                localStorage.removeItem('pendingUser');
                
                // Rediriger après un délai
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            } else {
                showMessage(data.message || 'Code OTP incorrect', 'error');
            }
        } catch (err) {
            console.error('Erreur lors de la vérification:', err);
            showMessage('Erreur lors de la vérification', 'error');
        }
    });
    
    // Renvoyer l'OTP
    resendOtp.addEventListener('click', async () => {
        const pendingUser = JSON.parse(localStorage.getItem('pendingUser'));
        
        if (!pendingUser) {
            showMessage('Session expirée, veuillez recommencer l\'inscription.', 'error');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:4000/inscription/renvoyer-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: pendingUser.email })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('Un nouveau code a été envoyé à votre email.', 'success');
                
                // Réinitialiser le timer
                timeLeft = 60;
                countdown.textContent = timeLeft;
                otpTimer.style.display = 'block';
                resendOtp.disabled = true;
                
                const timer = setInterval(() => {
                    timeLeft--;
                    countdown.textContent = timeLeft;
                    
                    if (timeLeft <= 0) {
                        clearInterval(timer);
                        otpTimer.style.display = 'none';
                        resendOtp.disabled = false;
                    }
                }, 1000);
            } else {
                showMessage(data.message || 'Erreur lors de l\'envoi du code', 'error');
            }
        } catch (err) {
            console.error('Erreur:', err);
            showMessage('Erreur lors de l\'envoi du code', 'error');
        }
    });
    
    function showMessage(message, type) {
        otpMessage.textContent = message;
        otpMessage.className = 'otp-message';
        otpMessage.classList.add(`otp-message--${type}`);
    }
});