import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./Game.css";

export default function Game() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'classic';
  
  // Game selection state - mode comes from URL, only need opponent selection
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState('local'); // 'local' or 'api'
  
  // Game state
  const [board, setBoard] = useState(Array(9).fill(''));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [playerSymbol, setPlayerSymbol] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'draw'
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [isAiTurn, setIsAiTurn] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);

  const difficultyNames = ['', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Expert'];
  const difficultyColors = ['', 'blue', 'green', 'orange', 'red', 'purple'];

  // Local game logic for friend play (using same logic as backend util.py)
  const checkLocalWinner = (board) => {
    const winConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],  // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8],  // columns
      [0, 4, 8], [2, 4, 6]              // diagonals
    ];
    
    for (let condition of winConditions) {
      const [a, b, c] = condition;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    
    if (!board.includes('')) {
      return 'draw';
    }
    
    return null;
  };

  const makeLocalMove = (index) => {
    const newBoard = [...board];
    const newMoveHistory = [...moveHistory];
    
    // Make the move
    newBoard[index] = currentPlayer;
    newMoveHistory.push(index);
    
    // Handle decay mode
    if (mode === 'decay' && newMoveHistory.length > 6) {
      const oldMove = newMoveHistory.shift();
      newBoard[oldMove] = '';
    }
    
    setBoard(newBoard);
    setMoveHistory(newMoveHistory);
    
    // Check for winner
    const result = checkLocalWinner(newBoard);
    if (result) {
      if (result === 'draw') {
        setGameStatus('draw');
        setWinner('draw');
      } else {
        setGameStatus('won');
        setWinner(result);
      }
      setWinningCells([]);
    } else {
      // Switch player
      const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
      setCurrentPlayer(nextPlayer);
      
      // If playing against AI in local mode and it's AI's turn
      if (selectedOpponent === 'ai' && gameMode === 'local' && nextPlayer === 'O') {
        setTimeout(() => makeLocalAiMove(newBoard), 500);
      }
    }
  };

  const makeLocalAiMove = (currentBoard) => {
    const availableMoves = currentBoard.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    if (availableMoves.length === 0) return;
    
    // Simple AI: random move for now
    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    
    const newBoard = [...currentBoard];
    newBoard[randomMove] = 'O';
    setBoard(newBoard);
    
    // Check for winner
    const result = checkLocalWinner(newBoard);
    if (result) {
      if (result === 'draw') {
        setGameStatus('draw');
        setWinner('draw');
      } else {
        setGameStatus('won');
        setWinner(result);
      }
      setWinningCells([]);
    } else {
      setCurrentPlayer('X');
    }
  };

  const selectOpponent = (opponent) => {
    setSelectedOpponent(opponent);
  };

  const updateDifficulty = (value) => {
    setCurrentDifficulty(parseInt(value));
  };

  const startGame = () => {
    if (!selectedOpponent) return;
    setGameStarted(true);
    
    if (selectedOpponent === 'friends') {
      // Always use local mode for friends
      setGameMode('local');
      setPlayerSymbol('X');
      resetGameState();
    } else if (selectedOpponent === 'ai') {
      // Try API first, fallback to local if unavailable
      tryStartApiGame();
    }
  };

  const tryStartApiGame = async () => {
    try {
      setGameMode('api');
      await startNewGame();
    } catch (error) {
      console.log('API unavailable, falling back to local AI:', error);
      setGameMode('local');
      setPlayerSymbol('X');
      resetGameState();
    }
  };

  const resetGameState = () => {
    setBoard(Array(9).fill(''));
    setCurrentPlayer('X');
    setGameStatus('playing');
    setWinner(null);
    setWinningCells([]);
    setIsAiTurn(false);
    setMoveHistory([]);
  };

  // Handle cell click in game
  const handleCellClick = (index) => {
    if (board[index] !== '' || gameStatus !== 'playing' || isAiTurn) return;

    if (gameMode === 'api' && selectedOpponent === 'ai') {
      makeMove(index);
    } else if (gameMode === 'local') {
      makeLocalMove(index);
    }
  };

  // Reset game
  const resetGame = () => {
    if (gameMode === 'api' && selectedOpponent === 'ai') {
      startNewGame();
    } else {
      resetGameState();
    }
  };

  // Go back to opponent selection
  const goBackToSelection = () => {
    setGameStarted(false);
    setBoard(Array(9).fill(''));
    setCurrentPlayer('X');
    setPlayerSymbol('');
    setGameStatus('playing');
    setWinner(null);
    setWinningCells([]);
    setIsAiTurn(false);
    setMoveHistory([]);
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
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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
    throw error; // Re-throw the error so tryStartApiGame can handle fallback
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
      } else {
        // Local multiplayer
        return `🎉 Player ${winner} Won!`;
      }
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
                  {gameMode === 'api' ? `AI Difficulty: ${difficultyNames[currentDifficulty]}` : 'Local AI (Fallback)'}
                </div>
              )}
              {selectedOpponent === 'friends' && (
                <div className="ai-difficulty">
                  Local Multiplayer
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

  // Show game setup
  return (
    <div className="container">
      {/* Main Card Container */}
      <div className="main-card">
        {/* Title */}
        <div className="title-container">
          <h1 className="main-title">Choose Your Opponent</h1>
          <p className="game-mode-display">
            Playing: <span className="selected-mode">{mode === 'classic' ? 'Tic Tac Toe' : mode === 'decay' ? 'Decay Tac Toe' : 'Tic Tac Toe'}</span>
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="decorative-x decorative-x-1">X</div>
        <div className="decorative-o decorative-o-1">O</div>
        <div className="decorative-x decorative-x-2">X</div>
        <div className="decorative-o decorative-o-2">O</div>

        {/* Opponent Selection */}
        <div className="selection-section">
          <div className="option-cards-container">
            <div className="option-card">
              <button 
                className={`option-button ${selectedOpponent === 'friends' ? 'selected' : ''}`}
                onClick={() => selectOpponent('friends')}
              >
                <div className="option-content">
                  <div className="option-icon">👥</div>
                  <div className="option-text">
                    <h3 className="option-title">Play with Friend</h3>
                    <p className="option-description">Local multiplayer</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="option-card">
              <button 
                className={`option-button ${selectedOpponent === 'ai' ? 'selected' : ''}`}
                onClick={() => selectOpponent('ai')}
              >
                <div className="option-content">
                  <div className="option-icon">🤖</div>
                  <div className="option-text">
                    <h3 className="option-title">Play with AI</h3>
                    <p className="option-description">Challenge the computer</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* AI Difficulty Slider */}
        {selectedOpponent === 'ai' && (
          <div className="selection-section">
            <h2 className="section-title">AI Difficulty</h2>
            <div className="difficulty-slider-container">
              <div className="difficulty-display">
                <span className="difficulty-label">Level:</span>
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
