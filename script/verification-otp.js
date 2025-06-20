document.addEventListener('DOMContentLoaded', () => {
    const otpForm = document.getElementById('otpForm');
    const otpMessage = document.getElementById('otpMessage');
    const resendLink = document.getElementById('resendOtp');
    const otpInputs = document.querySelectorAll('.otp-inputs input');

    // Auto-focus et navigation entre les champs OTP
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            if (input.value.length === 1) {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value.length === 0) {
                if (index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });
    });

    // Vérification de l'OTP
    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const otpCode = Array.from(otpInputs).map(input => input.value).join('');
        const pendingUser = JSON.parse(localStorage.getItem('pendingUser'));
        
        if (!pendingUser) {
            otpMessage.textContent = 'Session expirée, veuillez recommencer l\'inscription.';
            otpMessage.style.color = 'red';
            return;
        }

        try {
            const response = await fetch('/verifier-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: pendingUser.email, 
                    otp: otpCode 
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                otpMessage.textContent = 'Vérification réussie !';
                otpMessage.style.color = 'green';
                
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
                otpMessage.textContent = data.message || 'Code OTP incorrect';
                otpMessage.style.color = 'red';
            }
        } catch (err) {
            console.error('Erreur lors de la vérification:', err);
            otpMessage.textContent = 'Erreur lors de la vérification';
            otpMessage.style.color = 'red';
        }
    });

    // Renvoyer l'OTP
    resendLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const pendingUser = JSON.parse(localStorage.getItem('pendingUser'));
        
        if (!pendingUser) {
            otpMessage.textContent = 'Session expirée, veuillez recommencer l\'inscription.';
            otpMessage.style.color = 'red';
            return;
        }

        try {
            const response = await fetch('/renvoyer-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: pendingUser.email })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                otpMessage.textContent = 'Un nouveau code a été envoyé à votre email.';
                otpMessage.style.color = 'green';
            } else {
                otpMessage.textContent = data.message || 'Erreur lors de l\'envoi du code';
                otpMessage.style.color = 'red';
            }
        } catch (err) {
            console.error('Erreur:', err);
            otpMessage.textContent = 'Erreur lors de l\'envoi du code';
            otpMessage.style.color = 'red';
        }
    });
});