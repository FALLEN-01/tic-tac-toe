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
  const [playerSymbol, setPlayerSymbol] = useState('');
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

    if (selectedOpponent === 'ai') {
      startNewGame();
    }
  };

  // Handle cell click in game
  const handleCellClick = (index) => {
    if (board[index] !== '' || gameStatus !== 'playing' || isAiTurn) return;
    makeMove(index);
  };

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(''));
    setCurrentPlayer('X');
    setPlayerSymbol('');
    setGameStatus('playing');
    setWinner(null);
    setWinningCells([]);
    setIsAiTurn(false);
    
    if (selectedOpponent === 'ai') {
      startNewGame();
    }
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

  // API calls to FastAPI backend
  const API_BASE_URL = 'https://tictactoe-backend-e24r.onrender.com'; // Adjust this to your FastAPI server URL

  const startNewGame = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/new_game`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: mode,  // 'classic' or 'decay' from URL param
        ai_mode: selectedOpponent === 'ai',
        depth: currentDifficulty  // 1-5 depending on slider
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to start new game');
    }

    const gameData = await response.json();
    setBoard(gameData.board);
    setCurrentPlayer(gameData.player_symbol);
    setPlayerSymbol(gameData.player_symbol);
    setMoveHistory(gameData.move_history || []);

    if (gameData.result === 'in_progress') {
      setGameStatus('playing');
    } else if (gameData.result === 'draw') {
      setGameStatus('draw');
      setWinner('draw');
    } else {
      setGameStatus('won');
      setWinner(gameData.result);
    }

    if (!gameData.your_turn && selectedOpponent === 'ai') {
      setIsAiTurn(false);
    }

  } catch (error) {
    console.error('Error starting new game:', error);
    alert('Backend server not available. Playing in local mode.');
  }
};

  const makeMove = async (index) => {
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
        ai_enabled: selectedOpponent === 'ai',
        depth: currentDifficulty,
        mode: mode,
        move_history: moveHistory
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to make move');
    }

    const gameData = await response.json();
    setBoard(gameData.board);
    setMoveHistory(gameData.move_history || []);

    if (gameData.result === 'in_progress') {
      setGameStatus('playing');
    } else if (gameData.result === 'draw') {
      setGameStatus('draw');
      setWinner('draw');
    } else {
      setGameStatus('won');
      setWinner(gameData.result);
    }

    setIsAiTurn(!gameData.your_turn);

  } catch (error) {
    console.error('Error making move:', error);
    setIsAiTurn(false);
  }
};

  const getStatusMessage = () => {
    if (gameStatus === 'won') {
      if (selectedOpponent === 'ai') {
        
        return winner === playerSymbol ? '🎉 You Won!' : '🤖 AI Won!';
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
      return isAiTurn ? '🤖 AI Turn' : '👤 Your Turn';
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

          {/* Game Board Container with Integrated Info */}
          <div className={`game-board-container ${getGlowClass()}`}>
            {/* Game Info - Integrated above board */}
            <div className="game-info-integrated">
              <div className="status-message">{getStatusMessage()}</div>
              {selectedOpponent === 'ai' && (
                <div className="ai-difficulty">
                  AI Difficulty: {difficultyNames[currentDifficulty]}
                </div>
              )}
            </div>

            {/* Game Board */}
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

        {/* Game Over Overlay - Moved outside main-card */}
        {gameStatus !== 'playing' && (
          <div className="game-over-overlay">
            <div className="game-over-content">
              <div className="game-over-message">
                {getStatusMessage()}
              </div>
              <div className="game-over-buttons">
                <button className="btn btn-play-again" onClick={resetGame}>
                  🔄 Play Again
                </button>
                <button className="btn btn-results" onClick={goToResults}>
                  📊 View Results
                </button>
              </div>
            </div>
          </div>
        )}
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
          <div className="opponent-card">
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
          </div>
        </div>

        {/* AI Difficulty Slider - Full Width */}
        {selectedOpponent === 'ai' && (
          <div className="difficulty-slider-container">
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
        )}

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
