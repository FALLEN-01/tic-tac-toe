import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Game.css";

export default function Game() {
  const navigate = useNavigate();
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(3);

  const difficultyNames = ['', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Expert'];
  const difficultyColors = ['', 'blue', 'green', 'orange', 'red', 'purple'];

  const selectOpponent = (opponent) => {
    setSelectedOpponent(opponent);
  };

  const updateDifficulty = (value) => {
    setCurrentDifficulty(parseInt(value));
  };

  const startGame = () => {
    if (!selectedOpponent) return;
    
    const gameId = Math.random().toString(36).substr(2, 9);
    const opponent = selectedOpponent === 'ai' ? `ai-${currentDifficulty}` : 'friends';
    navigate(`/actual-game/${gameId}?opponent=${opponent}`);
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="container">
      {/* Main Card Container */}
      <div className="main-card">
        {/* Title */}
        <div className="title-container">
          <h1 className="main-title">Choose Your Opponent</h1>
        </div>

        {/* Decorative Elements */}
        <div className="decorative-x decorative-x-1">X</div>
        <div className="decorative-o decorative-o-1">O</div>
        <div className="decorative-x decorative-x-2">X</div>
        <div className="decorative-o decorative-o-2">O</div>

        {/* Opponent Selection Cards */}
        <div className="opponent-cards-container">
          {/* Friends Option */}
          <div className="opponent-card">
            <button 
              className={`opponent-button ${selectedOpponent === 'friends' ? 'selected' : ''}`}
              onClick={() => selectOpponent('friends')}
            >
              <div className="opponent-content">
                <div className="opponent-icon">👥</div>
                <div className="opponent-text">
                  <h2 className="opponent-title">Play with Friend</h2>
                  <p className="opponent-description">Challenge a friend in local multiplayer. Take turns and see who's the ultimate strategist!</p>
                </div>
              </div>
            </button>
          </div>

          {/* AI Option */}
          <div className="opponent-card ai-card">
            <button 
              className={`opponent-button ${selectedOpponent === 'ai' ? 'selected' : ''}`}
              onClick={() => selectOpponent('ai')}
            >
              <div className="opponent-content">
                <div className="opponent-icon">🤖</div>
                <div className="opponent-text">
                  <h2 className="opponent-title">Play with AI</h2>
                  <p className="opponent-description">Test your skills against our intelligent AI opponent. Choose your difficulty level!</p>
                </div>
              </div>
            </button>

            {/* AI Difficulty Slider */}
            <div className={`difficulty-slider ${selectedOpponent !== 'ai' ? 'hidden' : ''}`}>
              <div className="difficulty-display">
                <span className="difficulty-label">Difficulty:</span>
                <span 
                  className={`difficulty-name ${difficultyColors[currentDifficulty]}`}
                >
                  {difficultyNames[currentDifficulty]}
                </span>
              </div>
              
              <div className="slider-container">
                <div className="slider-track">
                  <div 
                    className={`slider-progress ${difficultyColors[currentDifficulty]}`}
                    style={{ width: `${((currentDifficulty - 1) / 4) * 100}%` }}
                  ></div>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={currentDifficulty}
                  className="slider-input"
                  onChange={(e) => updateDifficulty(e.target.value)}
                />
              </div>
              
              <div className="difficulty-labels">
                {difficultyNames.slice(1).map((name, index) => (
                  <span 
                    key={index + 1}
                    className={`label ${currentDifficulty === index + 1 ? `active ${difficultyColors[index + 1]}` : ''}`}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <button className="back-button" onClick={goBack}>← BACK</button>
        <button 
          className={`start-button ${!selectedOpponent ? 'disabled' : ''}`}
          onClick={startGame}
          disabled={!selectedOpponent}
        >
          START GAME →
        </button>
      </div>
    </div>
  );
}
