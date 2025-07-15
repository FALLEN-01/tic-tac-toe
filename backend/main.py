from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
import random
from models import *
from game.util import *


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://127.0.0.1:5000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/new_game", response_model=NewGameResponse)
def new_game(req: NewGameRequest):
    board = [""]*9
    player_symbol = random.choice(["X", "O"])
    your_turn = player_symbol == "X"
    
    ai_move = None
    if not your_turn and req.ai_mode:
        depth = req.depth if req.depth is not None else 5
        ai_move = best_move(board, "X", depth, turn=True)
        board[ai_move] = "X"
        
    result = check_winner(board) or "in progress"
    
    return NewGameResponse(
        player_symbol = player_symbol,
        your_turn = your_turn,
        board = board,
        ai_move = ai_move,
        result = result,
        depth = req.depth,
        ai_enabled = req.ai_mode,
        mode = req.mode
    )
        

@app.post("/make_move", response_model=NewGameResponse)
def make_move(req: MoveRequest):
    board = req.board
    if board[req.player_move] != "":
        return {"error": "invalid move"}
    
    board[req.player_move] = req.player_symbol
    result = check_winner(board)
    ai_move = None
    
    if result is None and req.ai_enabled:
        ai_symbol = "O" if req.player_symbol=="X" else "X"
        ai_move = best_move(board, ai_symbol, req.depth, True)
        if ai_move != -1:
            board[ai_move] = ai_symbol
        result = check_winner(board)
        
    if result is None:
        result = "in_progress"
        
        
    return NewGameResponse(
        player_symbol = req.player_symbol,
        your_turn = ((result == "in_progress")),
        board = board,
        ai_move = ai_move,
        result = result,
        depth = req.depth,
        ai_enabled = req.ai_enabled,
        mode = req.mode
    )
        