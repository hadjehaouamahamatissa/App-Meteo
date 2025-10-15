const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Clé API OpenWeatherMap
const API_KEY = process.env.OPENWEATHER_API_KEY || "5235fc3a54dfaf211e57bdd7ef08a609";

// Liste des villes tchadiennes
const cities = [
    { id: 4, name: "Abéché", lat: 13.8292, lon: 20.8322 },
    { id: 5, name: "Arada", lat: 12.948878, lon: 16.704569 },
    { id: 5, name: "Ati", lat: 13.213595, lon: 18.340686 },
    { id: 5, name: "Biltine", lat: 14.533006, lon: 20.900617 },
    { id: 5, name: "Chari-Baguirmi", lat: 10.974839, lon: 17.271519 },
    { id: 2, name: "Moundou", lat: 8.5667, lon: 16.0833 },
    { id: 1, name: "N'Djamena", lat: 12.1348, lon: 15.0557 },
    { id: 3, name: "Sarh", lat: 9.15, lon: 18.3833 },
];

// Route pour la liste des villes
app.get('/api/cities', (req, res) => {
    res.json(cities);
});

// Route pour les prévisions météo
app.get('/api/weather/:city', async (req, res) => {
    try {
        const cityName = req.params.city;

        // Trouver la ville dans la liste
        const city = cities.find(c => c.name === cityName);
        if (!city) {
            return res.status(404).json({ error: 'Ville non trouvée' });
        }

        // Récupérer les données météo actuelles
        const currentWeatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric&lang=fr`
        );

        if (!currentWeatherResponse.ok) {
            throw new Error('Erreur API météo actuelle');
        }

        const currentWeather = await currentWeatherResponse.json();

        // Récupérer les prévisions sur 5 jours
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric&lang=fr`
        );

        if (!forecastResponse.ok) {
            throw new Error('Erreur API prévisions');
        }

        const forecastData = await forecastResponse.json();

        // Formater la réponse
        const response = {
            city: city.name,
            current: {
                temp: Math.round(currentWeather.main.temp),
                feels_like: Math.round(currentWeather.main.feels_like),
                humidity: currentWeather.main.humidity,
                pressure: currentWeather.main.pressure,
                wind_speed: currentWeather.wind.speed,
                description: currentWeather.weather[0].description,
                icon: currentWeather.weather[0].icon,
                date: new Date(currentWeather.dt * 1000)
            },
            forecast: processForecastData(forecastData.list)
        };

        res.json(response);

    } catch (error) {
        console.error('Erreur:', error.message);
        res.status(500).json({
            error: 'Erreur serveur',
            message: error.message
        });
    }
});

// Route pour les prévisions détaillées sur 7 jours
app.get('/api/forecast/:city', async (req, res) => {
    try {
        const cityName = req.params.city;

        const city = cities.find(c => c.name === cityName);
        if (!city) {
            return res.status(404).json({ error: 'Ville non trouvée' });
        }

        // Utiliser l'API One Call pour les prévisions sur 7 jours
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/onecall?lat=${city.lat}&lon=${city.lon}&exclude=minutely,hourly,alerts&appid=${API_KEY}&units=metric&lang=fr`
        );

        if (!forecastResponse.ok) {
            throw new Error('Erreur API prévisions détaillées');
        }

        const forecastData = await forecastResponse.json();

        const response = {
            city: city.name,
            current: forecastData.current,
            daily: forecastData.daily.slice(0, 7) // 7 jours
        };

        res.json(response);

    } catch (error) {
        console.error('Erreur:', error.message);
        res.status(500).json({
            error: 'Erreur serveur',
            message: error.message
        });
    }
});

// Fonction pour traiter les données de prévisions
function processForecastData(forecastList) {
    const dailyForecasts = {};

    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString('fr-FR');

        if (!dailyForecasts[date]) {
            dailyForecasts[date] = {
                date: date,
                temps: [],
                weather: item.weather[0],
                humidity: [],
                wind_speed: []
            };
        }

        dailyForecasts[date].temps.push(item.main.temp);
        dailyForecasts[date].humidity.push(item.main.humidity);
        dailyForecasts[date].wind_speed.push(item.wind.speed);
    });

    // Calcul des moyennes et formater pour le frontend
    return Object.values(dailyForecasts).map(day => ({
        date: day.date,
        temp: {
            min: Math.min(...day.temps),
            max: Math.max(...day.temps),
            avg: Math.round(day.temps.reduce((a, b) => a + b) / day.temps.length)
        },
        weather: day.weather,
        humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
        wind_speed: Math.round(day.wind_speed.reduce((a, b) => a + b) / day.wind_speed.length * 10) / 10
    })).slice(0, 5); // 5 jours maximum
}

// Route de santé
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Serveur Météo Tchad en fonctionnement',
        timestamp: new Date().toISOString(),
        cities: cities.length
    });
});

// Route pour servir le frontend - CORRECTION ICI
// Utiliser express.static pour les fichiers statiques et une route spécifique pour SPA
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Pour les autres routes, servir aussi index.html (Single Page Application)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(` Serveur démarré sur le port ${PORT}`);
    console.log(` Accédez à l'application: http://localhost:${PORT}`);
    console.log(` API météo Tchad ready!`);
    console.log(` ${cities.length} villes tchadiennes disponibles`);
});