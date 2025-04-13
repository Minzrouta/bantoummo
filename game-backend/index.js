const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

require('dotenv').config({ path: './../.env' });


// Créer une instance du Pool PostgreSQL avec les variables d'environnement
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Exemple de route
app.get('/player/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM players WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

app.listen(port, () => {
  console.log(`Serveur backend lancé sur http://localhost:${port}`);
});
