// Charger les variables d'environnement depuis le fichier .env
require('dotenv').config();

// Importer les modules nécessaires
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

// Créer une instance de l'application Express
const app = express();
const port = 3000;

// Configurer les middlewares
app.use(cors()); // Activer CORS pour permettre les requêtes cross-origin
app.use(express.json()); // Parser le corps des requêtes en JSON
app.use(express.static(path.join(__dirname, 'public'))); // Servir les fichiers statiques depuis le dossier 'public'

// Définir la route POST pour l'API de chat
app.post('/api/chat', async (req, res) => {
    try {
        // Récupérer la clé API depuis les variables d'environnement
        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            return res.status(401).json({ error: 'Clé API manquante' });
        }

        // Faire une requête à l'API Mistral AI
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "mistral-small-latest",
                messages: [
                    { role: "user", content: req.body.message }
                ],
                max_tokens: 1000
            })
        });

        // Vérifier si la réponse de l'API est OK
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erreur API Mistral:', errorData);
            return res.status(response.status).json(errorData);
        }

        // Traiter et renvoyer la réponse de l'API
        const data = await response.json();
        res.json(data);
    } catch (error) {
        // Gérer les erreurs
        console.error('Erreur lors de la requête à Mistral AI:', error);
        res.status(500).json({ error: 'Une erreur interne est survenue.' });
    }
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
