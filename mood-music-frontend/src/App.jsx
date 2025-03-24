import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedMood, setSelectedMood] = useState('');
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const moods = ['Happy', 'Sad', 'Energetic', 'Calm'];

  const handleGetRecommendations = async () => {
    if (!selectedMood) {
      setError('Please select a mood');
      return;
    }

    try {
      // ✅ Logging mood being sent
      console.log("Sending mood to backend:", selectedMood);

      const response = await fetch('http://localhost:3000/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood: selectedMood }),
      });

      const data = await response.json();

      if (response.ok) {
        setSongs(data.songs || []);
        setError('');
      } else {
        setSongs([]);
        setError(data.error || 'Failed to fetch song recommendations');
      }
    } catch (err) {
      console.error('Frontend error:', err);
      setSongs([]);
      setError('Error fetching data from backend.');
    }
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <div className="container">
        <h1 className="title">Mood Music App 🎵</h1>

        <div className="controls">
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
          >
            <option value="">-- Select a mood --</option>
            {moods.map((mood) => (
              <option key={mood} value={mood.toLowerCase()}>
                {mood}
              </option>
            ))}
          </select>

          <button onClick={handleGetRecommendations}>
            Get Recommendations
          </button>

          <div className="dark-mode-toggle">
            <label>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              Dark Mode
            </label>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        {songs.length > 0 && (
          <div className="recommendations">
            <h2>Recommended Songs:</h2>
            <ul>
              {songs.map((song, index) => (
                <li key={index}>
                  <a href={song.url} target="_blank" rel="noopener noreferrer">
                    {song.name} - {song.artist}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;








