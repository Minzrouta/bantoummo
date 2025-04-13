const express = require('express');
const pool = require('./db');

const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Serveur backend lancé sur http://localhost:${port}`);
});


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

