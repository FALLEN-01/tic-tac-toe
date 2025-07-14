import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; 

export default function Result() {
  const navigate = useNavigate();
  const { gameId } = useParams();

  const handlePlayAgain = () => {
    // Generate a new game ID for a fresh game
    const newGameId = Math.random().toString(36).substr(2, 9);
    navigate(`/game/${newGameId}`);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div style={{ textAlign: "center", paddingTop: "50px" }}>
      <h1>Game Result</h1>
      <p>Game ID: {gameId}</p>
      <div style={{ marginTop: "30px" }}>
        <button 
          onClick={handlePlayAgain}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px"
          }}
        >
          Play Again
        </button>
        <button 
          onClick={handleGoHome}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#008CBA",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
