import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleStartGame = () => {
    // Generate a unique game ID or use a default one
    const gameId = Math.random().toString(36).substr(2, 9);
    navigate(`/game/${gameId}`);
  };

  return (
    <div style={{ textAlign: "center", paddingTop: "50px" }}>
      <h1>Home Page</h1>
      <button 
        onClick={handleStartGame}
        style={{
          padding: "10px 20px",
          fontSize: "18px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: "20px"
        }}
      >
        Start New Game
      </button>
    </div>
  );
}
