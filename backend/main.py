from fastapi import FastAPI, HTTPException # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
import random
from models import *
from game.util import *


app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Tic Tac Toe API is running!", "status": "ok"}

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tic-tac-toe-umber-ten.vercel.app", 
        "http://127.0.0.1:5000",
        "http://localhost:5000",
        "http://localhost:5173",
        "http://localhost:3000",
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/new_game", response_model=NewGameResponse)
def new_game(req: NewGameRequest):
    board = [""]*9
    player_symbol = random.choice(["X", "O"])
    your_turn = player_symbol == "X"
    move_history = []
    
    ai_move = None
    if not your_turn and req.ai_mode:
        depth = req.depth if req.depth is not None else 5
        ai_move = best_move(board, "X", depth, turn=True)
        if ai_move is not None and ai_move != -1:
            board[ai_move] = "X"
            move_history.append(ai_move)
        
    result = check_winner(board)
    if result is None:
        result = "in_progress"
    
    return NewGameResponse(
        player_symbol=player_symbol,
        your_turn=your_turn,
        board=board,
        ai_move=ai_move,
        result=result,
        depth=req.depth or 5,
        ai_enabled=req.ai_mode,
        mode=req.mode,
        move_history=move_history if req.mode == "decay" else [],
    )

@app.post("/make_move", response_model=NewGameResponse)
def make_move(req: MoveRequest):
    board = req.board[:]  # Create a copy to avoid modifying the original
    if board[req.player_move] != "":
        raise HTTPException(status_code=400, detail="Invalid move: Cell already occupied")

    if req.mode == "decay":
        move_history = req.move_history.copy()
    else:
        move_history = []

    # Player move
    board[req.player_move] = req.player_symbol
    if req.mode == "decay":
        move_history.append(req.player_move)
        if len(move_history) > 6:
            old_move = move_history.pop(0)
            board[old_move] = ""

    result = check_winner(board)
    ai_move = None

    # AI move if game not finished
    if result is None and req.ai_enabled:
        ai_symbol = "O" if req.player_symbol == "X" else "X"
        ai_move = best_move(board, ai_symbol, req.depth, True)
        if ai_move != -1:
            board[ai_move] = ai_symbol
            if req.mode == "decay":
                move_history.append(ai_move)
                if len(move_history) > 6:
                    old_move = move_history.pop(0)
                    board[old_move] = ""
        result = check_winner(board)

    if result is None:
        result = "in_progress"

    return NewGameResponse(
        player_symbol=req.player_symbol,
        your_turn=(result == "in_progress"),
        board=board,
        ai_move=ai_move,
        result=result,
        depth=req.depth,
        ai_enabled=req.ai_enabled,
        mode=req.mode,
        move_history=move_history if req.mode == "decay" else []
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
