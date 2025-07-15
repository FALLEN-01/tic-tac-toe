from typing import List, Optional
from pydantic import BaseModel

class NewGameRequest(BaseModel):
    mode: str
    ai_mode: bool
    depth: Optional[int] = 5


class NewGameResponse(BaseModel):
    board: List[str]
    player_symbol: str
    player_move: int
    max_depth: Optional[int]
    ai_move: Optional[int] = None
    