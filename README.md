# Météo Tchad
Application web de prévisions météorologiques pour les villes tchadiennes, offrant des prévisions détaillées sur 7 jours.

# Table des matières
- Fonctionnalités

- Technologies utilisées

- Installation

- Configuration

- Utilisation

- API Endpoints

- Structure du projet

- Développement


## Fonctionnalités
Prévisions pour 10 villes tchadiennes : N'Djamena, Moundou, Sarh, Abéché, etc.

Prévisions sur 7 jours : Données météo détaillées pour chaque jour

Informations complètes :

- Température actuelle, minimale et maximale

- Conditions météorologiques (ensoleillé, nuageux, pluie, etc.)

- Vitesse et direction du vent

- Taux d'humidité

- Pression atmosphérique

```
- Interface responsive : Compatible desktop, tablette et mobile

- Design moderne : Interface utilisateur intuitive et esthétique

- Temps réel : Données météo actualisées

- Carte de geolocalisations: https://unpkg.com/leaflet@1.9.4/dist/leaflet
```

### Apercu de maquettes de l'interface 
- Des captures d'écran des différentes vues de l'application sont disponibles pour visualiser le design et l'expérience utilisateur.
<img width="1848" height="915" alt="Capture d’écran du 2025-10-15 10-58-05" src="https://github.com/user-attachments/assets/1f6e5bef-2dfc-4ce7-ac2b-08dbbfa5b680" />

  

## Technologies utilisées

### Backend!


- Node.js - Environnement d'exécution JavaScript

- Express.js - Framework web pour Node.js

- CORS - Middleware pour les requêtes cross-origin

- dotenv - Gestion des variables d'environnement

### Frontend

- HTML5 - Structure de l'application

- CSS3 - Styles et design responsive

- JavaScript Vanilla - Interactivité et appel API

- Font Awesome - Icônes

### API Externe

OpenWeatherMap - Service de données météorologiques

## Installation

### Prérequis
- Node.js (version 14 ou supérieure)

- npm ou yarn

- Clé API OpenWeatherMap gratuite


### Étapes d'installation


- Cloner le repository
```
bash
git clone git@github.com:hadjehaouamahamatissa/App-Meteo.git
cd meteo-chad

``` 
- Installer les dépendances

bash
```
npm install
Configurer les variables d'environnement
```

bash
```
cp .env.example .env
Configurer votre clé API OpenWeatherMap
```

### Créer un compte sur OpenWeatherMap

Obtenir une clé API gratuite

Ajouter la clé dans le fichier .env

Démarrer le serveur

bash
npm start
Accéder à l'application
Ouvrir votre navigateur et aller sur : http://localhost:3000

# Configuration

Variables d'environnement

Créez un fichier .env à la racine du projet :
```
.env
PORT=3000
OPENWEATHER_API_KEY=la_cle_api_openweather_ici

```
### L'application supporte actuellement 8 villes tchadiennes :

- Abéché

- Ati

- Arada

- Biltine

- Chari-Baguirmi

- Moundou

- N'Djaména

- Sarh


# Utilisation

Sélectionnez une ville dans le menu déroulant

Cliquez sur le marker laissez la sélection automatique

## Consultez les données :

- Météo actuelle en haut de page

- Prévisions sur 7 jours en dessous

- Changez de ville à tout moment pour voir d'autres prévisions

# API Endpoints

## Backend Routes
Méthode 	Endpoint    	                Description
GET	     /api/cities	         Liste des villes tchadiennes disponibles
GET	    /api/weather/:city	    Données météo actuelles pour une ville
GET	    /api/forecast/:city	    Prévisions sur 7 jours pour une ville
GET	   /api/health	            Statut du serveur


@ Structure du projet
App_Meteo
meteo_chad/
├── server.js              # Serveur principal Express
├── package.json           # Dépendances et scripts
├── .env                   # Variables d'environnement
└── public/                # Fichiers frontend
    ├── index.html         # Page principale
    ├── style.css          # Styles CSS
    └── script.js          # JavaScript frontend

# Développement

## Mode développement

bash
```
npm run dev
Cette commande utilise nodemon pour redémarrer automatiquement le serveur lors des modifications.
```


## Variables d'environnement recommandées pour la production
```
.env
NODE_ENV=production
PORT=3000
OPENWEATHER_API_KEY=la_cle_api_production
```


## Auteurs
```
Hadje Haoua Mahamat Issa - Développeur principal
```
## Remerciements
```
OpenWeatherMap pour l'API météo gratuite

Font Awesome pour les icônes
```
