 // Clé API OpenWeatherMap
        const API_KEY = '5235fc3a54dfaf211e57bdd7ef08a609';
        const BASE_URL = 'https://api.openweathermap.org/data/2.5';

        // Données des villes tchadiennes avec coordonnées
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

        // Variables globales
        let map;
        let markers = [];
        let currentLocationMarker = null;
        let userLocation = null;

        // Mapping des icônes météo
        const weatherIcons = {
            '01d': 'fa-sun',
            '01n': 'fa-moon',
            '02d': 'fa-cloud-sun',
            '02n': 'fa-cloud-moon',
            '03d': 'fa-cloud',
            '03n': 'fa-cloud',
            '04d': 'fa-cloud',
            '04n': 'fa-cloud',
            '09d': 'fa-cloud-rain',
            '09n': 'fa-cloud-rain',
            '10d': 'fa-cloud-showers-heavy',
            '10n': 'fa-cloud-showers-heavy',
            '11d': 'fa-bolt',
            '11n': 'fa-bolt',
            '13d': 'fa-snowflake',
            '13n': 'fa-snowflake',
            '50d': 'fa-smog',
            '50n': 'fa-smog'
        };

        // Initialisation de l'application
        document.addEventListener('DOMContentLoaded', function() {
            // Initialiser la carte
            initMap();
            
            // Générer les boutons de sélection de ville
            const cityList = document.querySelector('.city-list');
            cities.forEach(city => {
                const button = document.createElement('button');
                button.className = 'city-btn';
                button.innerHTML = `<i class="fas fa-city"></i> ${city.name}`;
                button.addEventListener('click', () => selectCity(city));
                cityList.appendChild(button);
            });

            // Gestionnaire pour le bouton de localisation
            document.getElementById('locate-me').addEventListener('click', locateUser);

            // Sélectionner N'Djamena par défaut
            selectCity(cities[0]);
        });

        // Initialiser la carte Leaflet
        function initMap() {
            // Centrer sur le Tchad
            map = L.map('map').setView([12.1348, 15.0557], 6);

            // Ajouter la couche OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(map);

            // Ajouter les marqueurs pour chaque ville
            cities.forEach(city => {
                const marker = L.marker([city.lat, city.lon], {
                    icon: L.divIcon({
                        className: 'city-marker',
                        html: `<div style="background: #3498db; color: white; padding: 5px 10px; border-radius: 15px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">${city.name}</div>`,
                        iconSize: [100, 30],
                        iconAnchor: [50, 15]
                    })
                })
                .addTo(map)
                .bindPopup(`
                    <div style="text-align: center;">
                        <h3 style="margin: 0 0 10px 0; color: #2c3e50;">${city.name}</h3>
                        <button onclick="selectCityByName('${city.name}')" 
                                style="background: #3498db; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                            Voir la météo
                        </button>
                    </div>
                `);
                
                markers.push(marker);
            });
        }

        // Sélectionner une ville par son nom (pour les popups)
        function selectCityByName(cityName) {
            const city = cities.find(c => c.name === cityName);
            if (city) {
                selectCity(city);
            }
        }

        // Mettre à jour la carte pour centrer sur une ville
        function updateMap(lat, lon, cityName) {
            map.setView([lat, lon], 10);
            
            // Animer le marqueur correspondant
            markers.forEach(marker => {
                const markerLat = marker.getLatLng().lat;
                const markerLon = marker.getLatLng().lng;
                if (Math.abs(markerLat - lat) < 0.1 && Math.abs(markerLon - lon) < 0.1) {
                    marker.openPopup();
                }
            });
        }

        // Localiser l'utilisateur
        function locateUser() {
            const locateBtn = document.getElementById('locate-me');
            const statusDiv = document.getElementById('location-status');
            
            locateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Localisation en cours...';
            locateBtn.disabled = true;
            statusDiv.innerHTML = '';
            statusDiv.className = 'location-status';

            if (!navigator.geolocation) {
                showLocationError('La géolocalisation n\'est pas supportée par votre navigateur');
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    userLocation = { lat, lon };
                    
                    // Vérifier si l'utilisateur est au Tchad (approximativement)
                    const isInChad = lat >= 7 && lat <= 24 && lon >= 13 && lon <= 24;
                    
                    if (!isInChad) {
                        if (!confirm('Vous semblez être en dehors du Tchad. Voulez-vous quand même voir la météo à votre position ?')) {
                            resetLocateButton();
                            return;
                        }
                    }

                    // Ajouter un marqueur pour la position actuelle
                    if (currentLocationMarker) {
                        map.removeLayer(currentLocationMarker);
                    }
                    
                    currentLocationMarker = L.marker([lat, lon], {
                        icon: L.divIcon({
                            className: 'current-location-marker',
                            html: '<i class="fas fa-location-dot" style="color: #e74c3c; font-size: 24px; text-shadow: 0 0 5px white;"></i>',
                            iconSize: [24, 24],
                            iconAnchor: [12, 12]
                        })
                    }).addTo(map)
                    .bindPopup('<b>📍 Votre position actuelle</b>')
                    .openPopup();

                    // Centrer la carte sur la position utilisateur avec un zoom adapté
                    map.setView([lat, lon], 10);

                    // Afficher le succès
                    statusDiv.innerHTML = `<i class="fas fa-check-circle"></i> Position localisée avec succès`;
                    statusDiv.className = 'location-status location-success';

                    // Créer un objet ville temporaire pour la localisation
                    const tempCity = {
                        name: 'Ma Position',
                        lat: lat,
                        lon: lon
                    };

                    // Charger les données météo pour cette position
                    await selectCity(tempCity, true);
                    resetLocateButton();

                },
                (error) => {
                    console.error('Erreur de géolocalisation:', error);
                    let message = 'Erreur lors de la localisation';
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            message = 'Localisation refusée. Autorisez la localisation dans les paramètres de votre navigateur.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = 'Information de localisation indisponible.';
                            break;
                        case error.TIMEOUT:
                            message = 'La demande de localisation a expiré.';
                            break;
                    }
                    
                    showLocationError(message);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        }

        function showLocationError(message) {
            const statusDiv = document.getElementById('location-status');
            statusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
            statusDiv.className = 'location-status location-error';
            resetLocateButton();
        }

        function resetLocateButton() {
            const locateBtn = document.getElementById('locate-me');
            locateBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Me localiser automatiquement';
            locateBtn.disabled = false;
        }

        // Fonction pour sélectionner une ville
        async function selectCity(city, isUserLocation = false) {
            // Mettre à jour les boutons actifs (sauf pour la localisation utilisateur)
            if (!isUserLocation) {
                document.querySelectorAll('.city-btn').forEach(btn => {
                    btn.classList.remove('active', 'loading');
                    if (btn.textContent.includes(city.name)) {
                        btn.classList.add('active', 'loading');
                        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${city.name}`;
                    }
                });
            }

            try {
                // Afficher le chargement
                document.querySelector('.loading').innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Chargement des données météo...</p>';
                document.querySelector('.loading').style.display = 'block';
                document.querySelector('.forecast').innerHTML = '';

                // Mettre à jour la carte (sauf pour la localisation utilisateur)
                if (!isUserLocation) {
                    updateMap(city.lat, city.lon, city.name);
                }

                // Récupérer les données météo actuelles
                const currentWeather = await fetchCurrentWeather(city.lat, city.lon);
                
                // Récupérer les prévisions sur 7 jours
                const forecast = await fetchForecast(city.lat, city.lon);
                
                // Mettre à jour l'interface
                updateCurrentWeather(city.name, currentWeather, isUserLocation);
                updateForecast(forecast);

                // Mettre à jour le bouton
                if (!isUserLocation) {
                    document.querySelectorAll('.city-btn').forEach(btn => {
                        if (btn.textContent.includes(city.name)) {
                            btn.classList.remove('loading');
                            btn.innerHTML = `<i class="fas fa-city"></i> ${city.name}`;
                        }
                    });
                }

            } catch (error) {
                console.error('Erreur:', error);
                document.querySelector('.loading').innerHTML = `
                    <div class="error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Erreur lors du chargement des données météo</p>
                        <small>${error.message}</small>
                    </div>
                `;
                
                // Réinitialiser les boutons
                if (!isUserLocation) {
                    document.querySelectorAll('.city-btn').forEach(btn => {
                        btn.classList.remove('loading');
                        btn.innerHTML = `<i class="fas fa-city"></i> ${btn.textContent.trim()}`;
                    });
                }
            }
        }

        // Fonction pour récupérer la météo actuelle
        async function fetchCurrentWeather(lat, lon) {
            const response = await fetch(
                `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
            );
            
            if (!response.ok) {
                throw new Error('Erreur API météo actuelle');
            }
            
            return await response.json();
        }

        // Fonction pour récupérer les prévisions sur 7 jours
        async function fetchForecast(lat, lon) {
            const response = await fetch(
                `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
            );
            
            if (!response.ok) {
                throw new Error('Erreur API prévisions');
            }
            
            const data = await response.json();
            
            // Grouper les prévisions par jour
            const dailyForecasts = {};
            data.list.forEach(item => {
                const date = new Date(item.dt * 1000);
                const dateKey = date.toDateString();
                
                if (!dailyForecasts[dateKey]) {
                    dailyForecasts[dateKey] = {
                        date: date,
                        temps: [],
                        conditions: [],
                        icons: []
                    };
                }
                
                dailyForecasts[dateKey].temps.push(item.main.temp);
                dailyForecasts[dateKey].conditions.push(item.weather[0].description);
                dailyForecasts[dateKey].icons.push(item.weather[0].icon);
            });
            
            // Convertir en tableau et prendre les 7 prochains jours
            const forecastArray = Object.values(dailyForecasts)
                .slice(0, 7)
                .map(day => {
                    const maxTemp = Math.round(Math.max(...day.temps));
                    const minTemp = Math.round(Math.min(...day.temps));
                    const mostFrequentCondition = day.conditions.reduce((a, b, i, arr) => 
                        arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
                    );
                    const icon = day.icons[day.conditions.indexOf(mostFrequentCondition)];
                    
                    return {
                        date: day.date,
                        maxTemp,
                        minTemp,
                        condition: mostFrequentCondition,
                        icon: weatherIcons[icon] || 'fa-cloud'
                    };
                });
            
            return forecastArray;
        }

        // Mettre à jour l'affichage de la météo actuelle
        function updateCurrentWeather(cityName, data, isUserLocation = false) {
            const currentWeather = document.querySelector('.current-weather');
            
            // Nom de la ville avec indicateur de localisation
            const locationIndicator = isUserLocation ? ' <i class="fas fa-crosshairs" style="color: #e74c3c; font-size: 1.5rem;"></i>' : '';
            currentWeather.querySelector('.city-info h2').innerHTML = `${cityName}${locationIndicator}`;
            
            // Date actuelle
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            currentWeather.querySelector('.date').textContent = now.toLocaleDateString('fr-FR', options);
            
            // Icône météo
            const weatherIcon = weatherIcons[data.weather[0].icon] || 'fa-cloud';
            currentWeather.querySelector('.weather-icon i').className = `fas ${weatherIcon}`;
            
            // Température
            currentWeather.querySelector('.temperature').textContent = `${Math.round(data.main.temp)}°C`;
            
            // Condition météo
            currentWeather.querySelector('.weather-condition').textContent = 
                data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
            
            // Détails supplémentaires
            document.getElementById('humidity').textContent = `${data.main.humidity}%`;
            document.getElementById('wind').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
            document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
            document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;
        }

        // Mettre à jour l'affichage des prévisions
        function updateForecast(forecastData) {
            const forecastContainer = document.querySelector('.forecast');
            forecastContainer.innerHTML = '';
            
            // Masquer le message de chargement
            document.querySelector('.loading').style.display = 'none';

            // Noms des jours en français
            const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
            
            forecastData.forEach((day, index) => {
                const dayElement = document.createElement('div');
                dayElement.className = 'forecast-day';
                
                let dayName;
                if (index === 0) {
                    dayName = "Aujourd'hui";
                } else if (index === 1) {
                    dayName = "Demain";
                } else {
                    dayName = days[day.date.getDay()];
                }
                
                dayElement.innerHTML = `
                    <div class="day-name">${dayName}</div>
                    <div class="forecast-icon"><i class="fas ${day.icon}"></i></div>
                    <div class="weather-condition">${day.condition}</div>
                    <div class="forecast-temp">
                        <span class="max-temp">${day.maxTemp}°</span>
                        <span class="min-temp">${day.minTemp}°</span>
                    </div>
                `;
                forecastContainer.appendChild(dayElement);
            });
        }