const express = require('express');

// Fonction qui prend db en paramètre
module.exports = (db) => {
  const router = express.Router();
  
  // GET tous les produits
  router.get('/', async (req, res) => {
    try {
      console.log('📦 GET /products');
      const result = await db.query('SELECT * FROM products ORDER BY id');
      console.log(`✅ Retourné ${result.rows.length} produits`);
      res.json(result.rows);
    } catch (error) {
      console.error('❌ Erreur GET /products:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  // GET un produit par ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`📦 GET /products/${id}`);
      
      const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        console.log(`❌ Produit ${id} non trouvé`);
        return res.status(404).json({ error: 'Product not found' });
      }
      
      console.log(`✅ Produit #${id} retourné`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error(`❌ Erreur GET /products/${req.params.id}:`, error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
  return router;
};