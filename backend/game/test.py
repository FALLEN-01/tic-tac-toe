from util import *

""""
board = ["X", "X", "",
         "O", "O", "",
         "", "", ""]

print(best_move(board, ai_symbol="X", depth=4))  # Should return 2 (winning move)

board = ["O", "O", "",
         "X", "X", "",
         "", "", ""]

print(best_move(board, ai_symbol="X", depth=4))  # Should return 2 (block O)

board = ["X", "X", "X",
         "O", "O", "",
         "", "", ""]

print(best_move(board, ai_symbol="X", depth=5))  # Should return -1 (no move; game over)
 """
 
 
test_board = [
    "X", "O", "X",
    "", "O", "",
    "", "", ""
]


for depth in range(1, 10):
    move = best_move(test_board.copy(), "X", depth, True)
    print(f"Depth {depth} => AI chooses move: {move}")
