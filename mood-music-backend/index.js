const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const moodGenres = require('./moodGenres'); // 👈 import the mood-to-genre mapping

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Get Spotify Access Token
async function getSpotifyToken() {
  try {
    console.log('Getting Spotify token...');
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(
              process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
            ).toString('base64'),
        },
      }
    );

    console.log('Spotify token received!');
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Spotify token error:', error.response?.data || error.message);
    throw new Error('Unable to get Spotify token');
  }
}


// 🆕 Route: Get song recommendations based on mood
app.post('/api/recommend', async (req, res) => {
  const { mood } = req.body.mood;
  console.log('Mood received:', mood); // Log received mood

  if (!mood || !moodGenres[mood.toLowercase()]) {
    return res.status(400).json({ error: 'Invalid or missing mood' });
  }

  try {
    const token = await getSpotifyToken();
    console.log('Spotify Token:', token ? '✅ Token received' : '❌ No token');

    const seedGenres = moodGenres[mood].join(',');
    console.log('Genres for mood:', seedGenres);

    const response = await axios.get(
      `https://api.spotify.com/v1/recommendations?limit=10&seed_genres=${seedGenres}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const tracks = response.data.tracks.map((track) => ({
      name: track.name,
      artist: track.artists[0]?.name,
      album: track.album.name,
      preview_url: track.preview_url,
      external_url: track.external_urls.spotify,
    }));

    console.log('🎵 Tracks fetched:', tracks.length);
    res.json({ mood, recommendations: tracks });
  } catch (error) {
    console.error('❌ Error fetching recommendations:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch song recommendations' });
  }
});



// Root route (optional)
app.get('/', (req, res) => {
  res.send('Mood Music App Backend is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


