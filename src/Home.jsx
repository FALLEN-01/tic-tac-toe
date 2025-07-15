import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [showGameModes, setShowGameModes] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleStartGame = () => {
    // Show game modes selection
    setShowGameModes(true);
  };

  const selectGameMode = (mode) => {
    // Navigate directly to game with selected mode
    navigate(`/game?mode=${mode}`);
  };

  const handleComingSoon = () => {
    setShowComingSoon(true);
  };

  const closeOverlay = () => {
    setShowComingSoon(false);
  };

  const goBackToHome = () => {
    setShowGameModes(false);
  };

  if (showGameModes) {
    return (
      <div className="container">
        {/* Main Card Container */}
        <div className="main-card">
          {/* Title */}
          <div className="title-container">
            <h1 className="main-title">Game Modes</h1>
          </div>
          
          {/* Decorative Elements */}
          <div className="decorative-x decorative-x-1">X</div>
          <div className="decorative-o decorative-o-1">O</div>
          <div className="decorative-x decorative-x-2">X</div>
          <div className="decorative-o decorative-o-2">O</div>
          
          {/* Game Mode Cards */}
          <div className="game-modes-container">
            {/* Tic Tac Toe Card */}
            <div className="game-card">
              <button className="game-button" onClick={() => selectGameMode('classic')}>
                <div className="game-content">
                  <div className="game-icon red-icon">⭕</div>
                  <h2 className="game-title">Tic Tac Toe</h2>
                  <p className="game-description">The classic game you know and love. Simple rules, timeless fun.</p>
                </div>
              </button>
            </div>
            
            {/* Decay Tac Toe Card */}
            <div className="game-card">
              <button className="game-button" onClick={() => selectGameMode('decay')}>
                <div className="game-content">
                  <div className="game-icon yellow-icon">😵</div>
                  <h2 className="game-title">Decay Tac Toe</h2>
                  <p className="game-description">Pieces disappear over time! Plan your moves carefully before they fade away.</p>
                </div>
              </button>
            </div>
            
            {/* Ultimate Tic Tac Toe Card */}
            <div className="game-card">
              <button className="game-button" onClick={handleComingSoon}>
                <div className="game-content">
                  <div className="game-icon star-icon">⭐</div>
                  <h2 className="game-title">Ultimate Tic Tac Toe</h2>
                  <p className="game-description">The ultimate challenge with multiple grids and advanced mechanics.</p>
                </div>
              </button>
            </div>
          </div>
          
          {/* Back Button */}
          <button className="back-button" onClick={goBackToHome}>← BACK</button>
        </div>
        
        {/* Coming Soon Overlay */}
        {showComingSoon && (
          <div className="overlay">
            <div className="overlay-content">
              <h2 className="overlay-title">Coming Soon</h2>
              <p className="overlay-text">Ultimate Tic Tac Toe is still in development. Stay tuned for this exciting new game mode!</p>
              <button className="overlay-button" onClick={closeOverlay}>Close</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="decorative-background">
        <div className="floating-x floating-x-1">X</div>
        <div className="floating-o floating-o-1">O</div>
        <div className="floating-x floating-x-2">X</div>
        <div className="floating-o floating-o-2">O</div>
        <div className="floating-x floating-x-3">X</div>
      </div>
      
      <div className="main-content">
        <div className="game-logo">🎯</div>
        <h1 className="home-title">TWIST TAC TOE</h1>
        <p className="home-subtitle">
          Experience the classic tic-tac-toe game with a modern twist!<br/>
          Choose from multiple game modes and challenge yourself.
        </p>
        <button 
          onClick={handleStartGame}
          className="start-game-button"
        >
          <span className="button-content">
            <span className="button-icon">🎮</span>
            <span className="button-text">Start Playing</span>
          </span>
        </button>
      </div>
    </div>
  );
}
