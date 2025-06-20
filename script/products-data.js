const products = [
    {
        id_produit: 1,
        id_categorie: 1, // Remplacer par l'ID réel de la catégorie
        nom: "Collier Élégant",
        genre: "femme",
        matieres: "or",
        prix: 10000,
        image: "../img/colier4.jpeg",
        description: "Magnifique collier en or 18 carats, design moderne et raffiné",
        stock: 5
    },
    {
        id_produit: 2,
        id_categorie: 2,
        nom: "Boucles Élégantes",
        genre: "femme",
        matieres: "or-rose",
        prix: 10000,
        image: "../img/boucles.jpeg",
        description: "Boucles d'oreilles raffinées en or rose, parfaites pour toutes les occasions",
        stock: 8
    },
    {
        id_produit: 3,
        id_categorie: 1, // Remplacer par l'ID réel de la catégorie
        nom: "Collier Chic",
        genre: "unisexe",
        matieres: "argent",
        prix: 10000,
        image: "../img/collier5.jpeg",
        description: "Collier moderne en argent 925, design épuré",
        stock: 3
    },
    {
        id_produit: 4,
        id_categorie: 1, // Remplacer par l'ID réel de la catégorie
        nom: "Collier Modern",
        genre: "femme",
        matieres: "or",
        prix: 10000,
        image: "../img/colier.jpeg",
        description: "Collier moderne en or, style tendance",
        stock: 2
    },
    {
        id_produit: 5,
        id_categorie:3,
        nom: "Bracelet Élégant homme",
        genre: "homme",
        matieres:"cuir",
        prix: 5000,
        image:"../img/bracelet homme.jpg",
        description: "Bracelet en cuir véritable, style élégant et moderne",
        stock: 10
    },
    {
        id_produit:6,
        id_categorie:2,
        nom: "Boucles d'oreilles Chic",
        genre: "femme",
        matieres: "plaquer or",
        prix: 8000,
        image: "../img/boucles-chique3.jpg",
        description: "Boucles d'oreilles en plaqué or, design élégant et moderne",
        stock: 7
    },
    {
        id_produit: 7,
        id_categorie:2,
        nom: "Boucles d'oreilles chic",
        genre: "femme",
        matieres: "perles",
        prix: 12000,
        image:"../img/boucles-elegante.jpg",
        description: "Boucles d'oreilles en or 18 carats, design chic et élégant",
        stock:0,
    },
    {
        id_produit: 8,
        id_categorie:2,
        nom:"Boucles d'oreilles élégantes",
        genre: "femme",
        matieres: "perles",
        prix: 15000,
        image: "../img/boucles-elegante2.jpg",
        description: "Boucles d'oreilles en or 18 carats, design élégant et intemporel",
        stock: 4
    },
    {
        id_produit: 9,
        id_categorie:2,
        nom:"Boucles d'oreilles modernes",
        genre: "femme",
        matieres: "or",
        prix: 16000,
        image: "../img/boucles.jpg",
        description: "Boucles d'oreilles en or 18 carats, design moderne et raffiné",
        stock: 5
    },
    {
        id_produit: 10,
        id_categorie:3,
        nom: "Bracelet Chic",
        genre:"homme",
        matieres: "cuir",
        prix: 6000,
        image: "../img/bracelet homme.jpg",
        description: "Bracelet en cuir véritable, style chic et élégant",
        stock: 6
    },
    {
        id_produit: 11,
        id_categorie:3,
        nom: "Bracelet Élégant pour enfant",
        genre: "enfant",
        matieres: "cuir",
        prix: 3000,
        image:"../img/bracelet-emfant.jpg",
        description: "Bracelet en cuir pour enfant, design coloré et amusant",
        stock: 12
    },
    {
        id_produit: 12,
        id_categorie:3,
        nom: "Bracelet moderne enfant",
        genre: "enfant",
        matieres: "perles",
        prix: 4000,
        image:"../img/bracelet-enfant2.jpg",
        description: "Bracelet moderne en perles pour enfant, design élégant et amusant",
        stock: 8
    },
    {
        id_produit:13,
        id_categorie:3,
        nom:"Bracelet modernehomme",
        genre:"homme",
        matieres: "or cuir",
        prix: 7000,
        image:"../img/bracelet-homm2.jpg",
        description: "Bracelet moderne en or et cuir pour homme, design élégant et tendance",
        stock: 9
    },
    {
        id_produit:14,
        id_categorie:3,
        nom:"Bracelet moderne mixte",
        genre: "mixte",
        matieres: "or",
        prix: 8000,
        image:"../img/bracelet-mixte.jpg",
        description: "Bracelet moderne en or pour tous, design élégant et tendance",
        stock: 11
    },
    {
        id_produit: 15,
        id_categorie:1,
        nom: "Collier Élégant",
        genre: "enfant",
        matieres: "or",
        prix: 12000,
        image: "../img/colier-enfant.jpg",
        description: "Collier élégant en or 18 carats, design raffiné et intemporel",
        stock: 5
    },
    {
        id_produit: 16,
        id_categorie:1,
        nom: "Collier Chic pour enfant",
        genre: "enfant",
        matieres: "or",
        prix: 14000,
        image: "../img/colier-enfant.jpg",
        description: "Collier chic en or 18 carats pour enfant, design élégant et moderne",
        stock: 6
    },
    {
        id_produit: 17,
        id_categorie:1,
        nom:"colier moderne pour homme",
        genre: "homme",
        matieres: "or",
        prix: 15000,
        image: "../img/colier-homme.jpg",
        description: "Collier moderne en or 18 carats pour homme, design élégant et contemporain",
        stock: 5
    },
    {
        id_produit: 18,
        id_categorie:1,
        nom: "Collier Élégant pour femme",
        genre: "femme",
        matieres: "plaqué or",
        prix: 16000,
        image: "../img/colliers elegant.jpg",
        description: "Collier élégant en plaqué or pour femme, design raffiné et moderne",
        stock: 5
    },
    {
        id_produit: 19,
        id_categorie:1,
        nom: "Collier moderne pour femme",
        genre: "femme",
        matieres: "acier inox",
        prix: 17000,
        image: "../img/colliers-chic.jpg",
        description: "Collier moderne en acier inoxydable pour femme, design élégant et contemporain",
        stock: 5
    },
    {
        id_produit: 20,
        id_categorie:1,
        nom : "Collier chic pour femme",
        genre:"femme",
        matieres:"perles",
        prix: 18000,
        image: "../img/colliers-perle.jpg",
        description: "Collier chic en perles pour femme, design élégant et intemporel",
        stock: 5
    },
    {
        id_produit: 21,
        id_categorie: [1, 3],
        nom: "Collier mixte",
        genre: "mixte",
        matieres: "acier inox",
        prix: 19000,
        image: "../img/emsembles-chic.jpg",
        description: "Collier mixte en acier inoxydable, design moderne et élégant",
        stock: 5
    }
    
];
