import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./Game.css";

export default function Game() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'classic';
  
  // Game selection state
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Game state
  const [board, setBoard] = useState(Array(9).fill(''));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'draw'
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [isAiTurn, setIsAiTurn] = useState(false);

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
    setGameStarted(true);
    
    // If playing with AI, start a new game with the backend
    if (selectedOpponent === 'ai') {
      startNewGame();
    }
  };

  // Handle cell click in game
  const handleCellClick = (index) => {
    if (board[index] !== '' || gameStatus !== 'playing' || isAiTurn) return;

    // Make move via API for AI games, or locally for friend games
    makeMove(index);
  };

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(''));
    setCurrentPlayer('X');
    setGameStatus('playing');
    setWinner(null);
    setWinningCells([]);
    setIsAiTurn(false);
  };

  // Go back to opponent selection
  const goBackToSelection = () => {
    setGameStarted(false);
    resetGame();
  };

  const goBack = () => {
    navigate('/');
  };

  // Navigate to results
  const goToResults = () => {
    const result = winner === 'draw' ? 'draw' : winner;
    navigate(`/result/${gameId}?winner=${result}&result=${gameStatus}`);
  };

  // Game logic functions
  const checkWinner = (board) => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], winningCells: pattern };
      }
    }

    if (board.every(cell => cell !== '')) {
      return { winner: 'draw', winningCells: [] };
    }

    return null;
  };

  // API calls to FastAPI backend
  const API_BASE_URL = 'http://localhost:8000'; // FastAPI backend URL

  const startNewGame = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/new_game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: mode,
          ai_mode: selectedOpponent === 'ai',
          depth: currentDifficulty
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start new game');
      }
      
      const gameData = await response.json();
      setBoard(gameData.board);
      setCurrentPlayer(gameData.player_symbol);
      setGameStatus(gameData.result === 'in_progress' ? 'playing' : 'won');
      
      if (gameData.result !== 'in_progress') {
        setWinner(gameData.result);
        const winResult = checkWinner(gameData.board);
        if (winResult) {
          setWinningCells(winResult.winningCells);
        }
      }
      
      // If AI made the first move, update the turn
      if (!gameData.your_turn && selectedOpponent === 'ai') {
        setIsAiTurn(false);
      }
      
    } catch (error) {
      console.error('Error starting new game:', error);
      // Fallback to local game if API is not available
      alert('Backend server not available. Playing in local mode.');
    }
  };

  const makeMove = async (index) => {
    if (selectedOpponent !== 'ai') {
      // For local multiplayer, handle moves locally
      handleLocalMove(index);
      return;
    }

    try {
      setIsAiTurn(true);
      
      const response = await fetch(`${API_BASE_URL}/make_move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          board: board,
          player_move: index,
          player_symbol: currentPlayer,
          ai_enabled: true,
          depth: currentDifficulty,
          mode: mode
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to make move');
      }
      
      const gameData = await response.json();
      setBoard(gameData.board);
      setGameStatus(gameData.result === 'in_progress' ? 'playing' : (gameData.result === 'draw' ? 'draw' : 'won'));
      
      if (gameData.result !== 'in_progress') {
        setWinner(gameData.result);
        const winResult = checkWinner(gameData.board);
        if (winResult) {
          setWinningCells(winResult.winningCells);
        }
      }
      
      setIsAiTurn(false);
      
    } catch (error) {
      console.error('Error making move:', error);
      setIsAiTurn(false);
      // Fallback to local move
      handleLocalMove(index);
    }
  };

  const handleLocalMove = (index) => {
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    // Check for game end
    const result = checkWinner(newBoard);
    if (result) {
      setGameStatus(result.winner === 'draw' ? 'draw' : 'won');
      setWinner(result.winner);
      setWinningCells(result.winningCells);
      return;
    }

    // Switch player for local multiplayer
    const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
    setCurrentPlayer(nextPlayer);
  };

  // Helper functions for game display
  const getStatusMessage = () => {
    if (gameStatus === 'won') {
      if (selectedOpponent === 'ai') {
        return winner === 'X' ? '🎉 You Won!' : '🤖 AI Won!';
      }
      return `🎉 Player ${winner} Won!`;
    }
    if (gameStatus === 'draw') {
      return "🤝 It's a Draw!";
    }
    if (isAiTurn) {
      return '🤔 AI is thinking...';
    }
    if (selectedOpponent === 'ai') {
      return currentPlayer === 'X' ? '👤 Your Turn' : '🤖 AI Turn';
    }
    return `👤 Player ${currentPlayer}'s Turn`;
  };

  const getGlowClass = () => {
    if (gameStatus === 'won') {
      if (winner === 'X') return 'glow-blue';
      if (winner === 'O') return 'glow-red';
    }
    if (gameStatus === 'draw') return 'glow-green';
    return '';
  };

  // Show game board if game has started
  if (gameStarted) {
    return (
      <div className="container">
        <div className="main-card">
          {/* Title */}
          <div className="title-container">
            <h1 className="main-title">Tic Tac Toe</h1>
          </div>

          {/* Decorative Elements */}
          <div className="decorative-x decorative-x-1">X</div>
          <div className="decorative-o decorative-o-1">O</div>
          <div className="decorative-x decorative-x-2">X</div>
          <div className="decorative-o decorative-o-2">O</div>

          {/* Game Info */}
          <div className="game-info">
            <div className="info-panel">
              <div className="status-message">{getStatusMessage()}</div>
              {selectedOpponent === 'ai' && (
                <div className="ai-difficulty">
                  AI Difficulty: {difficultyNames[currentDifficulty]}
                </div>
              )}
            </div>
          </div>

          {/* Game Board */}
          <div className={`game-board-container ${getGlowClass()}`}>
            <div className="game-board">
              {board.map((cell, index) => (
                <button
                  key={index}
                  className={`cell ${winningCells.includes(index) ? 'winning' : ''} ${isAiTurn ? 'ai-thinking' : ''}`}
                  onClick={() => handleCellClick(index)}
                  disabled={cell !== '' || gameStatus !== 'playing' || isAiTurn}
                >
                  {cell && (
                    <span className={cell.toLowerCase()}>
                      {cell}
                    </span>
                  )}
                  {isAiTurn && cell === '' && (
                    <div className="thinking-indicator">⏳</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn btn-back" onClick={goBackToSelection}>
              ← Back
            </button>
            <button className="btn btn-reset" onClick={resetGame}>
              🔄 Reset
            </button>
            {gameStatus !== 'playing' && (
              <button className="btn btn-new" onClick={goToResults}>
                📊 Results
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show opponent selection
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
