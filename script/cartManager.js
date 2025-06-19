class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.eventListeners = new Map();
    }

    // Ajouter un produit au panier
    addItem(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({ ...product, quantity });
        }
        
        this.saveCart();
        this.notifyListeners('itemAdded');
    }

    // Mettre à jour la quantité
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item && quantity > 0) {
            item.quantity = quantity;
            this.saveCart();
            this.notifyListeners('quantityUpdated');
            return true;
        }
        return false;
    }

    // Supprimer un produit
    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.notifyListeners('itemRemoved');
    }

    // Vider le panier
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.notifyListeners('cartCleared');
    }

    // Calculer le total
    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Obtenir le nombre total d'articles
    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Sauvegarder le panier
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    // Vérifier si un produit est dans le panier
    hasItem(productId) {
        return this.cart.some(item => item.id === productId);
    }

    // Système d'événements
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
    }

    removeEventListener(event, callback) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).delete(callback);
        }
    }

    notifyListeners(event) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => callback(this.cart));
        }
    }
}

// Créer une instance globale
const cartManager = new CartManager();
