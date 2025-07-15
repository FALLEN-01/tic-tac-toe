from pydantic import BaseModel
from typing import List, Optional

class NewGameRequest(BaseModel):
    ai_mode: bool
    depth: Optional[int] = 5
    mode: str = "regular"

class NewGameResponse(BaseModel):
    player_symbol: str
    your_turn: bool
    board: List[str]
    ai_move: Optional[int] = None
    result: str
    depth: int
    ai_enabled: bool
    mode: str = "regular"
    move_history: List[int] = []

class MoveRequest(BaseModel):
    board: List[str]
    player_move: int
    player_symbol: str
    depth: int
    ai_enabled: bool
    mode: str = "regular"
    move_history: List[int] = []
