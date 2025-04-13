require('dotenv').config();  // Charger les variables d'environnement
const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { Pool } = require('pg');

const app = express();

// Setup PostgreSQL connection
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Configure Passport with Discord strategy
passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'email'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // On reçoit ici les données de l'utilisateur Discord
      const { id, username, email } = profile;

      // Vérifier si l'utilisateur existe déjà dans la base de données
      const result = await pool.query('SELECT * FROM users WHERE discord_id = $1', [id]);
      
      let user = result.rows[0];

      if (!user) {
        // Si l'utilisateur n'existe pas, on l'ajoute
        const newUser = await pool.query(
          'INSERT INTO users (discord_id, username, email) VALUES ($1, $2, $3) RETURNING *',
          [id, username, email]
        );
        user = newUser.rows[0];
      }

      return done(null, user);
    } catch (err) {
      console.error(err);
      return done(err, null);
    }
  }
));

// Middleware pour la session Passport
app.use(passport.initialize());
app.use(passport.session());

// Route de callback Discord
app.get('/auth/discord', passport.authenticate('discord'));

// Route pour récupérer les informations après l'authentification
app.get('/auth/discord/callback', 
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/me');
  });

// Route pour obtenir les données de l'utilisateur connecté
app.get('/me', async (req, res) => {
  if (!req.user) {
    return res.status(401).send('Not logged in');
  }

  res.json(req.user);
});

// Route pour se déconnecter
app.get('/logout', (req, res) => {
  req.logout((err) => {
    res.redirect('/');
  });
});

// Lancer le serveur
app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port 3000');
});
