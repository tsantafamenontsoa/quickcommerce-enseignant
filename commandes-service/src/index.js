const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration BDD
const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'commandes',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

// Middleware
app.use(cors());
app.use(express.json());

// URLs des autres services
const PANIER_URL = process.env.PANIER_SERVICE_URL || 'http://localhost:3002';
const CATALOGUE_URL = process.env.CATALOGUE_SERVICE_URL || 'http://localhost:3001';

// Créer commande
app.post('/orders', async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(`📦 POST /orders - User: ${userId}`);
    
    // 1. Récupérer panier
    console.log(`📞 Appel Panier: ${PANIER_URL}/cart/${userId}`);
    const cartResponse = await axios.get(`${PANIER_URL}/cart/${userId}`);
    const cart = cartResponse.data.items;
    
    if (Object.keys(cart).length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    console.log(`✅ Panier récupéré: ${Object.keys(cart).length} articles`);
    
    // 2. Récupérer prix des produits
    let total = 0;
    for (const [productId, quantity] of Object.entries(cart)) {
      console.log(`📞 Appel Catalogue: ${CATALOGUE_URL}/products/${productId}`);
      const productResponse = await axios.get(`${CATALOGUE_URL}/products/${productId}`);
      total += productResponse.data.price * parseInt(quantity);
    }
    
    console.log(`✅ Total calculé: ${total}€`);
    
    // 3. Créer commande
    const result = await db.query(
      'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, total, 'pending']
    );
    
    console.log(`✅ Commande créée: #${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`📦 Commandes Service - Port ${PORT}`);
});

