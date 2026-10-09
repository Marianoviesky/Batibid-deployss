const express = require('express');
const path = require('path');
const app = express();

// Indique le dossier contenant vos pages et vos fichiers statiques (CSS, images, etc.)
// Si vos fichiers sont dans un dossier "public", laissez path.join(__dirname, 'public')
// Si vos fichiers HTML/CSS sont directement à la racine, mettez : __dirname
// const DOSSIER_SITE = path.join(__dirname, 'public');
const DOSSIER_SITE = path.join(__dirname);

// Permet au navigateur de charger vos fichiers CSS, images et scripts JS
app.use(express.static(DOSSIER_SITE));

// La table de correspondance (routeur)
const routes = [
  { path: '/construire', file: 'construire.html' },
  { path: '/gerer', file: 'gerer.html' },
  { path: '/mise-en-location', file: 'mise-en-location.html' },
  { path: '/juridique', file: 'juridique.html' },
  { path: '/corporate-housing', file: 'corporate-housing.html' },
  { path: '/private-market', file: 'private-market.html' },
  { path: '/partenariats', file: 'partenariats.html' },
  { path: '/blog', file: 'blog.html' },
  { path: '/contact', file: 'contact.html' },
  { path: '/detail', file: 'detail.html' }
];

// Enregistrement automatique de chaque page
routes.forEach(route => {
  app.get(route.path, (req, res) => {
    res.sendFile(path.join(DOSSIER_SITE, route.file));
  });
});

// Page d'accueil (http://localhost:5000/)
app.get('/', (req, res) => {
  res.sendFile(path.join(DOSSIER_SITE, 'index.html'));
});

// Gestion des pages introuvables (404)
app.use((req, res) => {
  res.status(404).send('<h1>Page non trouvée (404)</h1>');
});

// Lancement du serveur sur le port 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur prêt sur http://localhost:${PORT}`);
});