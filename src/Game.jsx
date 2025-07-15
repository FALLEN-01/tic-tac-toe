import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Game.css";

export default function Game() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'draw'
  const [winner, setWinner] = useState(null);

  const winningCombinations = useMemo(() => [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ], []);

  useEffect(() => {
    const checkWinner = (boardToCheck) => {
      for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (boardToCheck[a] && boardToCheck[a] === boardToCheck[b] && boardToCheck[a] === boardToCheck[c]) {
          return boardToCheck[a];
        }
      }
      return null;
    };

    const checkDraw = (boardToCheck) => {
      return boardToCheck.every(cell => cell !== null);
    };

    const gameWinner = checkWinner(board);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameStatus('won');
      // Auto-navigate to result after 2 seconds
      setTimeout(() => {
        navigate(`/result/${gameId}?winner=${gameWinner}`);
      }, 2000);
    } else if (checkDraw(board)) {
      setGameStatus('draw');
      // Auto-navigate to result after 2 seconds
      setTimeout(() => {
        navigate(`/result/${gameId}?result=draw`);
      }, 2000);
    }
  }, [board, gameId, navigate, winningCombinations]);

  const handleCellClick = (index) => {
    if (board[index] || gameStatus !== 'playing') return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setGameStatus('playing');
    setWinner(null);
  };

  const goHome = () => {
    navigate('/');
  };

  const renderCell = (index) => {
    const value = board[index];
    let cellClass = 'game-cell';
    
    if (value === 'X') {
      cellClass += ' cell-x';
    } else if (value === 'O') {
      cellClass += ' cell-o';
    }

    return (
      <button
        key={index}
        className={cellClass}
        onClick={() => handleCellClick(index)}
        disabled={gameStatus !== 'playing'}
      >
        {value === 'X' && '❌'}
        {value === 'O' && '⭕'}
      </button>
    );
  };

  return (
    <div className="game-container">
      <div className="game-background">
        {/* Header */}
        <div className="game-header">
          <h1 className="game-title">🎯 TWIST TAC TOE</h1>
          <button onClick={goHome} className="home-button">🏠 Home</button>
        </div>

        {/* Game Status */}
        <div className="game-status">
          {gameStatus === 'playing' && (
            <p className="status-text">
              Current Player: <span className={`player ${currentPlayer.toLowerCase()}`}>
                {currentPlayer === 'X' ? '❌' : '⭕'} {currentPlayer}
              </span>
            </p>
          )}
          {gameStatus === 'won' && (
            <p className="status-text winner">
              🎉 Player {winner === 'X' ? '❌' : '⭕'} {winner} Wins! 🎉
            </p>
          )}
          {gameStatus === 'draw' && (
            <p className="status-text draw">
              🤝 It's a Draw! 🤝
            </p>
          )}
        </div>

        {/* Game Board */}
        <div className="game-board">
          {Array(9).fill(null).map((_, index) => renderCell(index))}
        </div>

        {/* Game Controls */}
        <div className="game-controls">
          <button onClick={resetGame} className="control-button reset">
            🔄 Reset Game
          </button>
          <button 
            onClick={() => navigate(`/result/${gameId}`)} 
            className="control-button finish"
          >
            🏁 Finish Game
          </button>
        </div>

        {/* Game Info */}
        <div className="game-info">
          <p>Game ID: {gameId}</p>
        </div>
      </div>
    </div>
  );
}
