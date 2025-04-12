const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');
const ARTICLES_FILE = path.join(__dirname, 'articles.json');

// Utilitaires
function readFile(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file));
}

function writeFile(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Register
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const users = readFile(USERS_FILE);
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Utilisateur déjà inscrit' });
  }
  users.push({ username, password });
  writeFile(USERS_FILE, users);
  res.json({ success: true, message: 'Inscription réussie' });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readFile(USERS_FILE);
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Identifiants incorrects' });
  res.json({ success: true, message: 'Connexion réussie' });
});

// GET tous les articles
app.get('/articles', (req, res) => {
  const articles = readFile(ARTICLES_FILE);
  res.json(articles);
});

// GET article par ID
app.get('/articles/:id', (req, res) => {
  const articles = readFile(ARTICLES_FILE);
  const article = articles.find(a => a.id === parseInt(req.params.id));
  if (!article) return res.status(404).json({ error: 'Article introuvable' });
  res.json(article);
});

// POST nouvel article
app.post('/articles', (req, res) => {
  const articles = readFile(ARTICLES_FILE);
  const { title, content, price } = req.body;
  const newArticle = {
    id: Date.now(),
    title,
    content,
    price
  };
  articles.push(newArticle);
  writeFile(ARTICLES_FILE, articles);
  res.status(201).json({ success: true, article: newArticle });
});

// DELETE article
app.delete('/articles/:id', (req, res) => {
  let articles = readFile(ARTICLES_FILE);
  const id = parseInt(req.params.id);
  const found = articles.find(a => a.id === id);
  if (!found) return res.status(404).json({ error: 'Article introuvable' });
  articles = articles.filter(a => a.id !== id);
  writeFile(ARTICLES_FILE, articles);
  res.json({ success: true, message: 'Article supprimé' });
});

// Démarrage serveur (Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API lancée sur le port ${PORT}`));
