document.addEventListener('DOMContentLoaded', function() {
    // Check if the cart is empty and redirect if it is
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        window.location.href = 'panier.html';
        return;
    }

    // Handle payment method changes
    const paymentMethods = document.getElementsByName('payment-method');
    const forms = {
        'card': document.getElementById('card-payment-form'),
        'orange': document.getElementById('orange-money-form'),
        'wave': document.getElementById('wave-form'),
        'airtel': document.getElementById('airtel-money-form'),
        'moov': document.getElementById('moov-money-form')
    };

    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            // Hide all forms
            Object.values(forms).forEach(form => {
                if (form) { // Ensure the form element exists before trying to access its style
                    form.style.display = 'none';
                }
            });
            // Show the selected form
            if (forms[this.value]) { // Ensure the selected form exists
                forms[this.value].style.display = 'block';
            }
        });
    });

    // Automatically format card number
    const cardNumberInput = document.getElementById('cardnumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            e.target.value = formattedValue.substring(0, 19);
        });
    }

    // Automatically format expiry date (MM/YY)
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value.substring(0, 5); // Limit to MM/YY format length
        });
    }

    // Limit CVC length
    const cvcInput = document.getElementById('cvc');
    if (cvcInput) {
        cvcInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').substring(0, 3);
        });
    }

    // Function to format prices
    function formatPrice(price) {
        return price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
    }

    // Retrieve and display order details from localStorage
    function updateOrderSummary() {
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        let subtotal = 0;
        const orderDetails = document.querySelector('.order-details');

        if (!orderDetails) {
            console.error("Element with class 'order-details' not found.");
            return;
        }

        // Clear existing items in the order summary
        orderDetails.innerHTML = ''; // More efficient than removeChild loop

        // Add each item
        currentCart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'order-item';
            itemDiv.innerHTML = `
                <span>${item.name} (${item.quantity})</span>
                <span>${formatPrice(itemTotal)}</span>
            `;
            orderDetails.appendChild(itemDiv);
        });

        const shipping = subtotal > 100000 ? 0 : 3000; // Free shipping above 100,000 FCFA
        const totalAmount = subtotal + shipping;

        // Add subtotal, shipping, and total
        orderDetails.innerHTML += `
            <div class="order-item">
                <span>Sous-total</span>
                <span>${formatPrice(subtotal)}</span>
            </div>
            <div class="order-item">
                <span>Frais de livraison</span>
                <span>${formatPrice(shipping)}</span>
            </div>
            <div class="order-total">
                <span>Total</span>
                <span>${formatPrice(totalAmount)}</span>
            </div>
        `;
    }

    // Handle phone number validation for all tel inputs
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
            // Limit to 10 digits for general phone numbers if no specific length is required
            if (value.length > 10) value = value.substring(0, 10);
            e.target.value = value;
        });
    });

    // Handle phone number validation for Mobile Money Gabon (Airtel Money, Moov Money)
    // Assuming these are the ones that should start with '07' and be 8 digits long
    const mobileMoneyInputs = document.querySelectorAll('.mobile-money-input'); // Add this class to relevant inputs
    mobileMoneyInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
            if (value.length > 0) {
                // Specific validation for Gabon's 07 XX XX XX XX format
                if (!value.startsWith('07') && value.length >= 2) {
                    alert('Le numéro doit commencer par 07 pour Airtel Money ou Moov Money au Gabon');
                    e.target.value = ''; // Clear input if invalid prefix
                    return;
                } else if (value.length > 8) { // Assuming 8 digits after '07' for the full number
                    value = value.substring(0, 8);
                }
            }
            e.target.value = value;
        });
    });


    // Function to process Mobile Money payments
    async function processMobileMoneyPayment(provider, phoneNumber) {
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (currentCart.length === 0) {
            alert('Votre panier est vide');
            window.location.href = 'panier.html';
            return;
        }

        // Calculate total amount
        let total = 0;
        currentCart.forEach(item => {
            total += item.price * item.quantity;
        });
        const shipping = total > 100000 ? 0 : 3000;
        total += shipping;

        const submitButton = document.querySelector(`#${provider}-money-form .submit-button`);
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<iconify-icon icon="mdi:loading" class="spin"></iconify-icon> Envoi de la demande...';
        }

        // Simulate mobile money payment process
        try {
            // In a real application, you would send this data to your backend
            // for secure processing with your payment gateway.
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call delay

            const order = {
                id: 'ORD-' + Date.now(),
                date: new Date().toISOString(),
                items: currentCart,
                total: total,
                shipping: shipping,
                paymentMethod: provider,
                phoneNumber: phoneNumber,
                status: 'pending' // Status is pending until confirmed by the mobile money provider
            };

            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));

            localStorage.removeItem('cart'); // Clear cart after order is placed

            window.location.href = 'confirmation.html?orderId=' + order.id + '&status=pending';
        } catch (error) {
            console.error('Erreur lors du traitement du paiement:', error);
            alert('Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer.');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Payer'; // Restore button text
            }
        }
    }

    // Handle form submissions
    Object.values(forms).forEach(form => {
        if (form) { // Ensure the form element exists
            form.addEventListener('submit', async function(e) { // Added async keyword
                e.preventDefault();
                const method = form.id.split('-')[0];

                // Validation specific to each method
                if (method === 'card') {
                    const cardNumber = document.getElementById('cardnumber')?.value.replace(/\s+/g, '');
                    const expiry = document.getElementById('expiry')?.value;
                    const cvc = document.getElementById('cvc')?.value;

                    // Improved validation for card details
                    if (!cardNumber || cardNumber.length !== 16 || !/^\d{16}$/.test(cardNumber)) {
                        alert('Veuillez entrer un numéro de carte valide (16 chiffres).');
                        return;
                    }

                    if (!expiry || expiry.length !== 5 || !/^\d{2}\/\d{2}$/.test(expiry)) {
                        alert('Veuillez entrer une date d\'expiration valide (MM/AA).');
                        return;
                    }

                    const [month, year] = expiry.split('/').map(Number);
                    const currentYear = new Date().getFullYear() % 100; // Last two digits of current year
                    const currentMonth = new Date().getMonth() + 1; // Month is 0-indexed

                    if (month < 1 || month > 12 || year < currentYear || (year === currentYear && month < currentMonth)) {
                        alert('La date d\'expiration n\'est pas valide.');
                        return;
                    }

                    if (!cvc || cvc.length !== 3 || !/^\d{3}$/.test(cvc)) {
                        alert('Veuillez entrer un code CVC valide (3 chiffres).');
                        return;
                    }

                    // --- Card payment processing (moved here from a fragmented part) ---
                    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
                    if (currentCart.length === 0) {
                        alert('Votre panier est vide');
                        window.location.href = 'panier.html';
                        return;
                    }

                    let total = 0;
                    currentCart.forEach(item => {
                        total += item.price * item.quantity;
                    });

                    // Simuler le paiement réussi
                    alert('Paiement par carte réussi !');
                    localStorage.removeItem('cart'); // Vider le panier après paiement réussi
                    updateOrderSummary && updateOrderSummary(); // Mettre à jour le résumé si besoin
                    window.location.href = 'confirmation.html?status=success';
                    return;

                } else if (method === 'orange' || method === 'wave' || method === 'airtel' || method === 'moov') {
                    const phoneNumberInput = document.getElementById(`${method}-phone`);
                    const phoneNumber = phoneNumberInput ? phoneNumberInput.value : '';

                    // Validate phone number based on provider specific rules if any, otherwise general
                    if (!phoneNumber || phoneNumber.length !== 8 || !/^\d{8}$/.test(phoneNumber)) { // Assuming 8 digits for all MM in Gabon
                        alert(`Veuillez entrer un numéro de téléphone ${method} valide (8 chiffres).`);
                        return;
                    }

                    // For Airtel and Moov, re-check the '07' prefix just in case the input event was bypassed or changed
                    if ((method === 'airtel' || method === 'moov') && !phoneNumber.startsWith('07')) {
                        alert('Le numéro doit commencer par 07 pour Airtel Money ou Moov Money au Gabon');
                        return;
                    }

                    processMobileMoneyPayment(method, phoneNumber);
                }
            });
        }
    });

    // Initialize order summary on page load
    updateOrderSummary();

    // Set initial form display (card payment by default)
    // This should be done after all forms are registered and before any change events are triggered.
    const initialPaymentMethod = document.querySelector('input[name="payment-method"]:checked');
    if (initialPaymentMethod && forms[initialPaymentMethod.value]) {
        Object.values(forms).forEach(form => {
            if (form) form.style.display = 'none';
        });
        forms[initialPaymentMethod.value].style.display = 'block';
    } else if (forms.card) { // Fallback to card payment form if no radio button is checked
        forms.card.style.display = 'block';
    }
});