import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  const handleStartGame = () => {
    // Generate a unique game ID or use a default one
    const gameId = Math.random().toString(36).substr(2, 9);
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="home-container">
      <div className="game-logo">🎯</div>
      <h1 className="home-title">TWIST TAC TOE</h1>
      <p className="home-subtitle">
        🎮 Experience the classic tic-tac-toe game with a modern twist! 🚀
      </p>
      <button 
        onClick={handleStartGame}
        className="start-game-button"
      >
        🎯 Start New Game
      </button>
    </div>
  );
}
