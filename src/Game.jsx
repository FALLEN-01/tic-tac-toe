import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Game.css";

export default function Game() {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const selectGameMode = (mode) => {
    // Generate a unique game ID
    const gameId = Math.random().toString(36).substr(2, 9);
    navigate(`/game/${gameId}?mode=${mode}`);
  };

  const handleComingSoon = () => {
    setShowComingSoon(true);
  };

  const closeOverlay = () => {
    setShowComingSoon(false);
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
          
          {/* Super Tac Toe Card */}
          <div className="game-card">
            <button className="game-button" onClick={handleComingSoon}>
              <div className="game-content">
                <div className="game-icon star-icon">⭐</div>
                <h2 className="game-title">Super Tac Toe</h2>
                <p className="game-description">The ultimate challenge with multiple grids and advanced mechanics.</p>
              </div>
            </button>
          </div>
        </div>
        
        {/* Back Button */}
        <button className="back-button" onClick={goBack}>← BACK</button>
      </div>
      
      {/* Coming Soon Overlay */}
      {showComingSoon && (
        <div className="overlay">
          <div className="overlay-content">
            <h2 className="overlay-title">Coming Soon</h2>
            <p className="overlay-text">Super Tac Toe is still in development. Stay tuned for this exciting new game mode!</p>
            <button className="overlay-button" onClick={closeOverlay}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
