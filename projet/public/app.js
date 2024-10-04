// Attendre que le DOM soit complètement chargé avant d'exécuter le script
document.addEventListener('DOMContentLoaded', () => {

    // Récupérer les éléments du DOM nécessaires
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const searchScope = document.getElementById('search-scope');
    const reportContent = document.getElementById('report-content');

    // Variables pour stocker les instances des graphiques et de la carte
    let treeSpeciesChart = null;
    let treeBenefitsChart = null;
    let map = null;

    // Ajouter un écouteur d'événement sur le bouton de recherche
    searchButton.addEventListener('click', () => {
        const query = searchInput.value;
        const scope = searchScope.value;
        generateReport(query, scope);
    });

    // Fonction asynchrone pour générer le rapport
    async function generateReport(query, scope) {
        try {
            // Récupérer les données des arbres et la réponse de l'IA
            const treeData = await fetchTreeData();
            const aiResponse = await getAIResponse(query);

            // Générer le contenu du rapport et l'afficher
            const reportText = generateReportContent(aiResponse, treeData, scope);
            reportContent.innerHTML = reportText;

            // Créer les graphiques et la carte
            createCharts(treeData);
            createMap(treeData, scope);
        } catch (error) {
            console.error('Erreur lors de la génération du rapport:', error);
            reportContent.innerHTML = 'Une erreur est survenue lors de la génération du rapport. Veuillez réessayer.';
        }
    }

    // Fonction pour récupérer les données des arbres depuis l'API de Paris
    async function fetchTreeData() {
        const response = await fetch('https://opendata.paris.fr/api/records/1.0/search/?dataset=les-arbres&rows=1000');
        const data = await response.json();
        return data.records;
    }

    // Fonction pour obtenir une réponse de l'IA via l'API
    async function getAIResponse(query) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `En tant qu'expert en biodiversité et climat à Paris, répondez à la question suivante de manière concise et informative : ${query}`
                })
            });
            const data = await response.json();
            console.log('Réponse complète de l\'API:', JSON.stringify(data, null, 2));

            // Vérifier si la réponse est une erreur d'authentification
            if (data.message === 'Unauthorized') {
                throw new Error('Erreur d\'authentification : Vérifiez votre clé API');
            }

            // Extraire le contenu de la réponse de l'IA
            if (data.choices && data.choices[0] && data.choices[0].message) {
                return data.choices[0].message.content;
            } else {
                throw new Error('Structure de réponse inattendue de l\'API');
            }
        } catch (error) {
            console.error('Erreur lors de la requête à l\'API:', error);
            return `Désolé, une erreur s'est produite : ${error.message}`;
        }
    }

    // Fonction pour générer le contenu du rapport
    function generateReportContent(aiResponse, treeData, scope) {
        let reportText = `
            <h2>Rapport sur la biodiversité et le climat à Paris</h2>
            <p>${aiResponse}</p>
            <p>Paris compte environ ${treeData.length} arbres répertoriés dans notre base de données.</p>
        `;

        // Ajouter les scores par arrondissement si le scope est 'arrondissement'
        if (scope === 'arrondissement') {
            const scores = calculateScores(treeData);
            const sortedScores = sortScores(scores);
            let scoreContent = '';
            for (const [arrondissement, score] of sortedScores) {
                scoreContent += `<p>Arrondissement ${arrondissement}: Score ${score.toFixed(2)}</p>`;
            }
            reportText += scoreContent;
        }

        return reportText;
    }

    // Fonction pour créer les graphiques
    function createCharts(treeData) {
        createTreeSpeciesChart(treeData);
        createTreeBenefitsChart();
    }

    // Fonction pour créer le graphique des espèces d'arbres
    function createTreeSpeciesChart(treeData) {
        const speciesCount = {};
        treeData.forEach(tree => {
            const species = tree.fields.espece;
            speciesCount[species] = (speciesCount[species] || 0) + 1;
        });
    
        const labels = Object.keys(speciesCount).slice(0, 5);
        const data = labels.map(species => speciesCount[species]);
    
        const ctx = document.getElementById('tree-species-chart').getContext('2d');
        if (treeSpeciesChart) {
            treeSpeciesChart.destroy();
        }
    
        treeSpeciesChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                    borderColor: '#fff',
                    borderWidth: 2,
                    hoverOffset: 15, // Effet de zoom sur hover pour l'effet 3D
                    hoverBorderColor: '#ccc' // Couleur de bordure sur hover
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 5 des espèces d\'arbres à Paris',
                        font: { size: 18 }
                    }
                }
            }
        });
    }
    

    // Fonction pour créer le graphique des bénéfices des arbres
    function createTreeBenefitsChart() {
        const ctx = document.getElementById('tree-benefits-chart').getContext('2d');
        if (treeBenefitsChart) {
            treeBenefitsChart.destroy();
        }
    
        treeBenefitsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Réduction CO2', 'Régulation température', 'Amélioration qualité air', 'Biodiversité', 'Bien-être'],
                datasets: [{
                    label: 'Impact des arbres (échelle de 1 à 10)',
                    data: [8, 7, 9, 6, 8],
                    backgroundColor: '#4CAF50',
                    borderColor: '#388E3C',
                    borderWidth: 1,
                    hoverBackgroundColor: '#66BB6A', // Couleur plus claire sur hover
                    hoverBorderColor: '#2E7D32',
                    barThickness: 30, // Ajuster l'épaisseur des barres pour un effet plus marqué
                    borderRadius: 5, // Bordures arrondies des barres pour effet moderne
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        grid: {
                            color: '#E0E0E0'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Bénéfices des arbres en milieu urbain',
                        font: { size: 18 }
                    }
                }
            }
        });
    }
    

    // Fonction pour créer la carte
    function createMap(treeData, scope) {
        // Supprimer la carte existante s'il y en a une
        if (map) {
            map.remove();
        }

        // Créer une nouvelle carte centrée sur Paris
        map = L.map('map').setView([48.8566, 2.3522], 12);

        // Ajouter une couche de tuiles OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Ajouter des marqueurs pour chaque arbre
        treeData.forEach(tree => {
            const lat = tree.fields.geo_point_2d[0];
            const lon = tree.fields.geo_point_2d[1];
            const species = tree.fields.espece;

            L.marker([lat, lon]).addTo(map)
                .bindPopup(`<b>${species}</b><br>${tree.fields.adresse}`);
        });

        // Ajouter des marqueurs pour les scores des arrondissements si le scope est 'arrondissement'
        if (scope === 'arrondissement') {
            const scores = calculateScores(treeData);
            for (const [arrondissement, score] of Object.entries(scores)) {
                L.marker([48.8566, 2.3522]).addTo(map)
                    .bindPopup(`<b>Arrondissement ${arrondissement}</b><br>Score: ${score.toFixed(2)}`);
            }
        }
    }

    // Fonction pour calculer les scores des arrondissements
    function calculateScores(treeData) {
        const scores = {};
        const arrondissements = {};

        // Collecter les données par arrondissement
        treeData.forEach(tree => {
            const arrondissement = tree.fields.arrondissement;
            if (!arrondissements[arrondissement]) {
                arrondissements[arrondissement] = {
                    count: 0,
                    speciesCount: new Set(),
                    ageSum: 0,
                    population: 10000 // Exemple de population par arrondissement
                };
            }
            arrondissements[arrondissement].count++;
            arrondissements[arrondissement].speciesCount.add(tree.fields.espece);
            arrondissements[arrondissement].ageSum += tree.fields.hauteur || 0; // Exemple de calcul de l'âge basé sur la hauteur
        });

        // Calculer les scores pour chaque arrondissement
        for (const [arrondissement, data] of Object.entries(arrondissements)) {
            const ageAverage = data.ageSum / data.count;
            const speciesDiversity = data.speciesCount.size;
            const treesPerCapita = data.count / data.population;
            const airQuality = 100; // Exemple de qualité de l'air

            // Calculer le score final
            const score = (ageAverage + speciesDiversity + treesPerCapita + airQuality) / 4;
            scores[arrondissement] = Math.min(Math.max(score, 0), 100);
        }

        return scores;
    }

    // Fonction pour trier les scores des arrondissements
    function sortScores(scores) {
        return Object.entries(scores).sort((a, b) => b[1] - a[1]);
    }
});
