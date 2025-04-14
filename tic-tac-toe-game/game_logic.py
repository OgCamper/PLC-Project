class TicTacToe:
    """Main game class that handles all rules and state"""
    
    # All possible winning combinations (rows, columns, diagonals)
    WINNING_LINES = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  # Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  # Columns
        [0, 4, 8], [2, 4, 6]              # Diagonals
    ]

    def __init__(self):
        """Initialize a new game"""
        self.reset_game()

    def reset_game(self):
        """Reset the game board and state"""
        self.board = [' '] * 9  # 3x3 grid
        self.current_player = 'X'  # X goes first
        self.game_over = False
        self.winner = None

    def make_move(self, position):
        """
        Attempt to make a move
        Returns: (success, message)
        """
        # Validate move
        if self.game_over:
            return False, "Game is already over"
        if not 0 <= position <= 8:
            return False, "Invalid position (0-8 only)"
        if self.board[position] != ' ':
            return False, "Position already taken"

        # Make the move
        self.board[position] = self.current_player

        # Check for win
        if self._check_winner():
            self.game_over = True
            self.winner = self.current_player
            return True, f"Player {self.current_player} wins!"

        # Check for tie
        if ' ' not in self.board:
            self.game_over = True
            return True, "It's a tie!"

        # Switch players
        self.current_player = 'O' if self.current_player == 'X' else 'X'
        return True, None

    def _check_winner(self):
        """Check if current player has won"""
        for line in self.WINNING_LINES:
            if all(self.board[pos] == self.current_player for pos in line):
                return True
        return False

    def get_available_moves(self):
        """Return list of empty board positions"""
        return [i for i, spot in enumerate(self.board) if spot == ' ']

    def make_ai_move(self):
        """
        Simple AI that makes random valid moves
        Returns same (success, message) as make_move
        """
        available = self.get_available_moves()
        if not available:
            return False, "No moves available"
        return self.make_move(random.choice(available))
