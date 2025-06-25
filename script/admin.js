document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = 'http://localhost:4000/';
    let currentSection = 'dashboard';
    
    // DOM Elements
    const sidebarLinks = document.querySelectorAll('.sidebar-nav li');
    const contentSections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('section-title');
    
    // Modal Elements
    const modalOverlay = document.getElementById('modal-overlay');
    const modals = document.querySelectorAll('.modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // Initialize the dashboard
    initDashboard();
    
    // Sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            navigateToSection(section);
        });
    });
    
    // Close modal buttons
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeAllModals);
    });
    
    // Modal overlay click
    modalOverlay.addEventListener('click', closeAllModals);
    // Navigation function
    function navigateToSection(section) {
        currentSection = section;
        
        // Update active link in sidebar
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === section) {
                link.classList.add('active');
            }
        });
        
        // Update active content section
        contentSections.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${section}-section`) {
                content.classList.add('active');
            }
        });
        
        // Update section title
        sectionTitle.textContent = getSectionTitle(section);
        
        // Load data for the section
        switch(section) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'clients':
                loadClients();
                break;
            case 'commandes':
                loadCommandes();
                break;
            case 'produits':
                loadProduits();
                break;
            case 'categories':
                loadCategories();
                break;
        }
    }
    
    // Get section title
    function getSectionTitle(section) {
        const titles = {
            'dashboard': 'Tableau de bord',
            'clients': 'Clients',
            'commandes': 'Commandes',
            'produits': 'Produits',
            'categories': 'Catégories'
        };
        return titles[section] || 'Tableau de bord';
    }
    
    // Modal functions
    function openModal(modalId) {
        modalOverlay.classList.add('active');
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeAllModals() {
        modalOverlay.classList.remove('active');
        modals.forEach(modal => modal.classList.remove('active'));
        document.body.style.overflow = '';
    }
    
    // Initialize dashboard with charts
    function initDashboard() {
        // Récupérer les commandes et produits en parallèle
        Promise.all([
            fetch(`${API_BASE_URL}commandes`).then(res => res.json()),
            fetch(`${API_BASE_URL}produits`).then(res => res.json())
        ]).then(([commandes, produits]) => {
            // --- Commandes par mois ---
            const commandesParMois = Array(12).fill(0);
            commandes.forEach(cmd => {
                const date = new Date(cmd.date_creation);
                const mois = date.getMonth(); // 0 = Janvier
                commandesParMois[mois]++;
            });
            const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

            const ordersCtx = document.getElementById('orders-chart').getContext('2d');
            new Chart(ordersCtx, {
                type: 'bar',
                data: {
                    labels: moisLabels,
                    datasets: [{
                        label: 'Commandes',
                        data: commandesParMois,
                        backgroundColor: 'rgba(79, 70, 229, 0.7)',
                        borderColor: 'rgba(79, 70, 229, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });

            // --- Produits vendus ---
            // On suppose que chaque commande a un champ details_produits ou produits_vendus
            // Sinon, il faut une API pour les détails de commande, ou alors tu dois adapter ici
            // On va compter le nombre total vendu par produit à partir des commandes
            const ventesParProduit = {};
            commandes.forEach(cmd => {
                if (cmd.details_produits && Array.isArray(cmd.details_produits)) {
                    cmd.details_produits.forEach(prod => {
                        ventesParProduit[prod.nom_produit] = (ventesParProduit[prod.nom_produit] || 0) + prod.quantite;
                    });
                }
            });

            // Si tu n'as pas details_produits dans chaque commande, il faut faire une requête supplémentaire pour chaque commande pour récupérer les détails

            // On prépare les labels et data pour le graphique
            const produitsLabels = Object.keys(ventesParProduit);
            const produitsData = Object.values(ventesParProduit);

            // Si pas de ventes, on affiche les produits du catalogue avec 0
            if (produitsLabels.length === 0) {
                produits.forEach(prod => {
                    produitsLabels.push(prod.nom);
                    produitsData.push(0);
                });
            }

            const productsCtx = document.getElementById('products-chart').getContext('2d');
            new Chart(productsCtx, {
                type: 'doughnut',
                data: {
                    labels: produitsLabels,
                    datasets: [{
                        data: produitsData,
                        backgroundColor: [
                            'rgba(79, 70, 229, 0.7)',
                            'rgba(16, 185, 129, 0.7)',
                            'rgba(245, 158, 11, 0.7)',
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(231, 76, 60, 0.7)',
                            'rgba(52, 152, 219, 0.7)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true
                }
            });
        });
    }
    
    // Load dashboard data
    function loadDashboardData() {
        fetch(`${API_BASE_URL}clients`)
            .then(response => response.json())
            .then(clients => {
                document.getElementById('total-clients').textContent = clients.length;
            });
        
        fetch(`${API_BASE_URL}commandes`)
            .then(response => response.json())
            .then(commandes => {
                document.getElementById('total-commandes').textContent = commandes.length;
                const totalRevenue = commandes.reduce((sum, cmd) => sum + parseFloat(cmd.montant), 0);
                document.getElementById('total-revenu').textContent = `${totalRevenue.toFixed(2)} FCFA`;
                
                // Update recent activity
                const activityList = document.getElementById('activity-list');
                activityList.innerHTML = '';
                
                const recentOrders = commandes.slice(0, 5).map(order => {
                    const activityItem = document.createElement('div');
                    activityItem.className = 'activity-item';
                    activityItem.innerHTML = `
                        <div class="activity-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <div class="activity-content">
                            <h4 class="activity-title">Nouvelle commande #${order.id_commande}</h4>
                            <p class="activity-description">${order.nom_client} - ${order.montant} FCFA</p>
                            <p class="activity-time">${new Date(order.date_creation).toLocaleString()}</p>
                        </div>
                    `;
                    return activityItem;
                });
                
                recentOrders.forEach(item => activityList.appendChild(item));
            });
        
        fetch(`${API_BASE_URL}produits`)
            .then(response => response.json())
            .then(produits => {
                document.getElementById('total-produits').textContent = produits.length;
            });
    }
    
    // Clients functions
    function loadClients() {
        fetch(`${API_BASE_URL}clients`)
            .then(response => response.json())
            .then(clients => {
                const tbody = document.querySelector('#clients-table tbody');
                tbody.innerHTML = '';
                
                clients.forEach(client => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${client.id_client}</td>
                        <td>${client.nom}</td>
                        <td>${client.email}</td>
                        <td>${client.telephone}</td>
                        <td><span class="status ${client.statut_compte === '1' ? 'validée' : 'en_attente'}">${client.statut_compte === '1' ? 'Actif' : 'Inactif'}</span></td>
                        <td>${new Date(client.date_creation).toLocaleDateString()}</td>
                        <td>
                            <button class="action-btn edit" data-id="${client.id_client}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" data-id="${client.id_client}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                
                // Add event listeners to action buttons
                document.querySelectorAll('.action-btn.edit').forEach(btn => {
                    btn.addEventListener('click', () => editClient(btn.getAttribute('data-id')));
                });
                
                document.querySelectorAll('.action-btn.delete').forEach(btn => {
                    btn.addEventListener('click', () => confirmDelete('client', btn.getAttribute('data-id')));
                });
            });
    }
    
    // Add client button
    document.getElementById('add-client-btn').addEventListener('click', () => {
        document.getElementById('client-modal-title').textContent = 'Ajouter un client';
        document.getElementById('client-form').reset();
        document.getElementById('client-id').value = '';
        openModal('client-modal');
    });
    
    // Client form submission
    document.getElementById('client-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('client-id').value;
        const clientData = {
            nom: document.getElementById('client-nom').value,
            email: document.getElementById('client-email').value,
            telephone: document.getElementById('client-telephone').value,
            statut_compte: document.getElementById('client-statut').value,
            image: document.getElementById('client-image').value
        };
        
        // Only include password if it's not empty (for updates)
        const password = document.getElementById('client-password').value;
        if (password) {
            clientData.password = password;
        }
        
        const url = id ? `${API_BASE_URL}clients/${id}` : `${API_BASE_URL}clients`;
        const method = id ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clientData)
        })
        .then(response => response.json())
        .then(data => {
            showToast(id ? 'Client mis à jour avec succès' : 'Client créé avec succès');
            closeAllModals();
            loadClients();
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Une erreur est survenue', 'error');
        });
    });
    
    function editClient(id) {
        fetch(`${API_BASE_URL}clients/${id}`)
            .then(response => response.json())
            .then(client => {
                document.getElementById('client-modal-title').textContent = 'Modifier le client';
                document.getElementById('client-id').value = client.id_client;
                document.getElementById('client-nom').value = client.nom;
                document.getElementById('client-email').value = client.email;
                document.getElementById('client-telephone').value = client.telephone;
                document.getElementById('client-statut').value = client.statut_compte;
                document.getElementById('client-image').value = client.image || '';
                
                openModal('client-modal');
            });
    }
    
    // Commandes functions
    function loadCommandes() {
        fetch(`${API_BASE_URL}commandes`)
            .then(response => response.json())
            .then(commandes => {
                const tbody = document.querySelector('#commandes-table tbody');
                tbody.innerHTML = '';
                
                commandes.forEach(commande => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${commande.id_commande}</td>
                        <td>${commande.nom_client}</td>
                        <td>${commande.montant} FCFA</td>
                        <td><span class="status ${commande.statut_commande}">${getStatusText(commande.statut_commande)}</span></td>
                        <td>${new Date(commande.date_creation).toLocaleDateString()}</td>
                        <td>
                            <button class="action-btn view" data-id="${commande.id_commande}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn delete" data-id="${commande.id_commande}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                
                // Add event listeners to action buttons
                document.querySelectorAll('.action-btn.view').forEach(btn => {
                    btn.addEventListener('click', () => viewCommande(btn.getAttribute('data-id')));
                });
                
                document.querySelectorAll('.action-btn.delete').forEach(btn => {
                    btn.addEventListener('click', () => confirmDelete('commande', btn.getAttribute('data-id')));
                });
                
                // Filter functionality
                document.getElementById('order-status-filter').addEventListener('change', function() {
                    const status = this.value;
                    filterCommandes(status, document.getElementById('order-date-filter').value);
                });
                
                document.getElementById('order-date-filter').addEventListener('change', function() {
                    filterCommandes(document.getElementById('order-status-filter').value, this.value);
                });
            });
    }
    
    function filterCommandes(status, date) {
        const rows = document.querySelectorAll('#commandes-table tbody tr');
        
        rows.forEach(row => {
            const rowStatus = row.querySelector('.status').classList[1];
            const rowDate = new Date(row.cells[4].textContent).toDateString();
            const filterDate = date ? new Date(date).toDateString() : null;
            
            const statusMatch = status === 'all' || rowStatus === status;
            const dateMatch = !filterDate || rowDate === filterDate;
            
            row.style.display = statusMatch && dateMatch ? '' : 'none';
        });
    }
    
    function viewCommande(id) {
        fetch(`${API_BASE_URL}commandes/${id}`)
            .then(response => response.json())
            .then(data => {
                const commande = data.commande;
                const produits = data.details_produits;
                
                document.getElementById('commande-id').textContent = commande.id_commande;
                document.getElementById('commande-client').textContent = commande.id_client; // You might want to fetch client name
                document.getElementById('commande-montant').textContent = `${commande.montant} FCFA`;
                document.getElementById('commande-date').textContent = new Date(commande.date_creation).toLocaleString();
                document.getElementById('commande-adresse').textContent = commande.adresse_livraison;
                document.getElementById('commande-statut').value = commande.statut_commande;
                
                const produitsTbody = document.querySelector('#commande-produits-table tbody');
                produitsTbody.innerHTML = '';
                
                produits.forEach(prod => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${prod.nom_produit}</td>
                        <td>${prod.quantite}</td>
                        <td>${prod.prix_unitaire} FCFA</td>
                        <td>${prod.quantite * prod.prix_unitaire} FCFA</td>
                    `;
                    produitsTbody.appendChild(tr);
                });
                
                openModal('commande-modal');
            });
    }
    
    // Update commande status
    document.getElementById('update-commande-btn').addEventListener('click', function() {
        const id = document.getElementById('commande-id').textContent;
        const newStatus = document.getElementById('commande-statut').value;
        
        fetch(`${API_BASE_URL}commandes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                statut_commande: newStatus
            })
        })
        .then(response => response.json())
        .then(data => {
            showToast('Statut de la commande mis à jour');
            closeAllModals();
            loadCommandes();
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Une erreur est survenue', 'error');
        });
    });
    
    // Produits functions
    function loadProduits() {
        fetch(`${API_BASE_URL}produits`)
            .then(response => response.json())
            .then(produits => {
                const tbody = document.querySelector('#produits-table tbody');
                tbody.innerHTML = '';
                
                // First, fetch categories to map category IDs to names
                fetch(`${API_BASE_URL}categories`)
                    .then(response => response.json())
                    .then(categories => {
                        const categoryMap = {};
                        categories.forEach(cat => {
                            categoryMap[cat.id_categorie] = cat.nom;
                        });
                        
                        // Now render products with category names
                        produits.forEach(produit => {
                            const tr = document.createElement('tr');
                            tr.innerHTML = `
                                <td>${produit.id_produit}</td>
                                <td>${produit.nom}</td>
                                <td>${categoryMap[produit.id_categorie] || 'N/A'}</td>
                                <td>${produit.prix} FCFA</td>
                                <td>${produit.stock}</td>
                                <td>
                                    <button class="action-btn edit" data-id="${produit.id_produit}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn delete" data-id="${produit.id_produit}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            `;
                            tbody.appendChild(tr);
                        });
                        
                        // Add event listeners to action buttons
                        document.querySelectorAll('.action-btn.edit').forEach(btn => {
                            btn.addEventListener('click', () => editProduit(btn.getAttribute('data-id')));
                        });
                        
                        document.querySelectorAll('.action-btn.delete').forEach(btn => {
                            btn.addEventListener('click', () => confirmDelete('produit', btn.getAttribute('data-id')));
                        });
                    });
            });
    }
    
    // Add produit button
    document.getElementById('add-product-btn').addEventListener('click', () => {
        document.getElementById('produit-modal-title').textContent = 'Ajouter un produit';
        document.getElementById('produit-form').reset();
        document.getElementById('produit-id').value = '';
        
        // Load categories for dropdown
        fetch(`${API_BASE_URL}categories`)
            .then(response => response.json())
            .then(categories => {
                const select = document.getElementById('produit-categorie');
                select.innerHTML = '';
                
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id_categorie;
                    option.textContent = cat.nom;
                    select.appendChild(option);
                });
                
                openModal('produit-modal');
            });
    });
    
    // Produit form submission
    document.getElementById('produit-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('produit-id').value;
        const produitData = {
            id_categorie: document.getElementById('produit-categorie').value,
            nom: document.getElementById('produit-nom').value,
            genre: document.getElementById('produit-genre').value,
            matieres: document.getElementById('produit-matieres').value,
            description: document.getElementById('produit-description').value,
            prix: document.getElementById('produit-prix').value,
            stock: document.getElementById('produit-stock').value,
            image: document.getElementById('produit-image').value
        };
        
        const url = id ? `${API_BASE_URL}produits/${id}` : `${API_BASE_URL}produits`;
        const method = id ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(produitData)
        })
        .then(response => response.json())
        .then(data => {
            showToast(id ? 'Produit mis à jour avec succès' : 'Produit créé avec succès');
            closeAllModals();
            loadProduits();
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Une erreur est survenue', 'error');
        });
    });
    
    function editProduit(id) {
        fetch(`${API_BASE_URL}produits/${id}`)
            .then(response => response.json())
            .then(produit => {
                document.getElementById('produit-modal-title').textContent = 'Modifier le produit';
                document.getElementById('produit-id').value = produit.id_produit;
                document.getElementById('produit-nom').value = produit.nom;
                document.getElementById('produit-genre').value = produit.genre;
                document.getElementById('produit-matieres').value = produit.matieres;
                document.getElementById('produit-description').value = produit.description;
                document.getElementById('produit-prix').value = produit.prix;
                document.getElementById('produit-stock').value = produit.stock;
                document.getElementById('produit-image').value = produit.image || '';
                
                // Load categories for dropdown and set the current value
                fetch(`${API_BASE_URL}categories`)
                    .then(response => response.json())
                    .then(categories => {
                        const select = document.getElementById('produit-categorie');
                        select.innerHTML = '';
                        
                        categories.forEach(cat => {
                            const option = document.createElement('option');
                            option.value = cat.id_categorie;
                            option.textContent = cat.nom;
                            option.selected = cat.id_categorie == produit.id_categorie;
                            select.appendChild(option);
                        });
                        
                        openModal('produit-modal');
                    });
            });
    }
    
    // Categories functions
    function loadCategories() {
        fetch(`${API_BASE_URL}categories`)
            .then(response => response.json())
            .then(categories => {
                const tbody = document.querySelector('#categories-table tbody');
                tbody.innerHTML = '';
                
                categories.forEach(categorie => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${categorie.id_categorie}</td>
                        <td>${categorie.nom}</td>
                        <td>
                            <button class="action-btn edit" data-id="${categorie.id_categorie}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" data-id="${categorie.id_categorie}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                
                // Add event listeners to action buttons
                document.querySelectorAll('.action-btn.edit').forEach(btn => {
                    btn.addEventListener('click', () => editCategorie(btn.getAttribute('data-id')));
                });
                
                document.querySelectorAll('.action-btn.delete').forEach(btn => {
                    btn.addEventListener('click', () => confirmDelete('categorie', btn.getAttribute('data-id')));
                });
            });
    }
    
    // Add categorie button
    document.getElementById('add-category-btn').addEventListener('click', () => {
        document.getElementById('categorie-modal-title').textContent = 'Ajouter une catégorie';
        document.getElementById('categorie-form').reset();
        document.getElementById('categorie-id').value = '';
        openModal('categorie-modal');
    });
    
    // Categorie form submission
    document.getElementById('categorie-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('categorie-id').value;
        const categorieData = {
            nom: document.getElementById('categorie-nom').value,
            image: document.getElementById('categorie-image').value
        };
        
        const url = id ? `${API_BASE_URL}categories/${id}` : `${API_BASE_URL}categories`;
        const method = id ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categorieData)
        })
        .then(response => response.json())
        .then(data => {
            showToast(id ? 'Catégorie mise à jour avec succès' : 'Catégorie créée avec succès');
            closeAllModals();
            loadCategories();
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Une erreur est survenue', 'error');
        });
    });
    
    function editCategorie(id) {
        fetch(`${API_BASE_URL}categories/${id}`)
            .then(response => response.json())
            .then(categorie => {
                document.getElementById('categorie-modal-title').textContent = 'Modifier la catégorie';
                document.getElementById('categorie-id').value = categorie.id_categorie;
                document.getElementById('categorie-nom').value = categorie.nom;
                document.getElementById('categorie-image').value = categorie.image || '';
                
                openModal('categorie-modal');
            });
    }
    
    // Delete confirmation
    function confirmDelete(type, id) {
        const messages = {
            'client': 'Voulez-vous vraiment supprimer ce client ?',
            'commande': 'Voulez-vous vraiment supprimer cette commande ?',
            'produit': 'Voulez-vous vraiment supprimer ce produit ?',
            'categorie': 'Voulez-vous vraiment supprimer cette catégorie ?'
        };
        
        document.getElementById('confirm-message').textContent = messages[type];
        document.getElementById('confirm-action-btn').onclick = function() {
            deleteItem(type, id);
        };
        
        openModal('confirm-modal');
    }
    
    function deleteItem(type, id) {
        fetch(`${API_BASE_URL}${type}s/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} supprimé(e) avec succès`);
            closeAllModals();
            
            // Reload the appropriate section
            switch(type) {
                case 'client':
                    loadClients();
                    break;
                case 'commande':
                    loadCommandes();
                    break;
                case 'produit':
                    loadProduits();
                    break;
                case 'categorie':
                    loadCategories();
                    break;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Une erreur est survenue', 'error');
        });
    }
    
    // Helper functions
    function getStatusText(status) {
        const statusMap = {
            'en_attente': 'En attente',
            'validée': 'Validée',
            'expédiée': 'Expédiée',
            'livrée': 'Livrée',
            'annulée': 'Annulée'
        };
        return statusMap[status] || status;
    }
    
    function showToast(message, type = 'success') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        // Add to body
        document.body.appendChild(toast);
        
        // Remove after animation
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Add toast styles dynamically
    const toastStyles = document.createElement('style');
    toastStyles.textContent = `
        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 999;
            animation: slideIn 0.3s ease-out;
        }
        
        .toast.success {
            background-color: var(--success-color);
        }
        
        .toast.error {
            background-color: var(--danger-color);
        }
        
        .toast.fade-out {
            animation: fadeOut 0.3s ease-out;
        }
        
        @keyframes slideIn {
            from { transform: translateY(100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(toastStyles);
    
    // Initialize with dashboard
    navigateToSection('dashboard');
});

function setupImageUpload(areaId, fileInputId, previewId, hiddenInputId) {
    const area = document.getElementById(areaId);
    const fileInput = document.getElementById(fileInputId);
    const preview = document.getElementById(previewId);
    const hiddenInput = document.getElementById(hiddenInputId);

    area.addEventListener('click', () => fileInput.click());

    area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.style.borderColor = '#333';
    });
    area.addEventListener('dragleave', (e) => {
        e.preventDefault();
        area.style.borderColor = '#aaa';
    });
    area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.style.borderColor = '#aaa';
        const file = e.dataTransfer.files[0];
        handleImageFile(file, preview, hiddenInput);
    });
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleImageFile(file, preview, hiddenInput);
    });
}

function handleImageFile(file, preview, hiddenInput) {
    if (!file) return;
    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'bior-bijouterie');
    fetch('https://api.cloudinary.com/v1_1/dwhqa7huy/image/upload', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        hiddenInput.value = data.secure_url;
    })
    .catch(() => {
        alert("Erreur lors de l'upload de l'image.");
    });
}

// Initialisation pour chaque modal
document.addEventListener('DOMContentLoaded', function() {
    setupImageUpload('produit-image-upload', 'produit-image-file', 'produit-image-preview', 'produit-image');
    setupImageUpload('client-image-upload', 'client-image-file', 'client-image-preview', 'client-image');
    setupImageUpload('categorie-image-upload', 'categorie-image-file', 'categorie-image-preview', 'categorie-image');
});

// Affichage du nom de l'administrateur connecté
document.addEventListener('DOMContentLoaded', function() {
    const adminData = localStorage.getItem('admin');
    if (adminData) {
        const admin = JSON.parse(adminData);
        if (admin.id_admin) {
            fetch(`http://localhost:4000/administrateur/${admin.id_admin}`)
                .then(res => res.json())
                .then(data => {
                    const adminNameElement = document.getElementById('admin-name');
                    if (adminNameElement && data.nom) {
                        adminNameElement.textContent = data.nom;
                    }
                })
                .catch(() => {
                    // En cas d'erreur, on peut afficher le nom du localStorage
                    const adminNameElement = document.getElementById('admin-name');
                    if (adminNameElement && admin.nom) {
                        adminNameElement.textContent = admin.nom;
                    }
                });
        }
    }
});
