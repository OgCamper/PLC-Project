# app.py
"""
Flask server “glue” between the browser-based UI and the Python TicTacToe game logic,
dynamically loading the module from 'tic-tac-toe-game' directory.
"""

import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import importlib.util

# ─── Setup Logging ─────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Dynamically import TicTacToe from tic‑tac‑toe‑game/game_logic.py ─────────
BASE_DIR  = os.path.dirname(__file__)
GAME_DIR  = os.path.join(BASE_DIR, 'tic-tac-toe-game')
GAME_FILE = os.path.join(GAME_DIR, 'game_logic.py')

spec       = importlib.util.spec_from_file_location('game_logic', GAME_FILE)
game_logic = importlib.util.module_from_spec(spec)
try:
    spec.loader.exec_module(game_logic)
    logger.info("Loaded game_logic module from '%s'.", GAME_FILE)
except FileNotFoundError:
    logger.error("Cannot find game_logic.py under '%s'.", GAME_DIR)
    raise
except Exception as e:
    logger.error("Error loading game_logic module: %s", e)
    raise

TicTacToe = getattr(game_logic, 'TicTacToe', None)
if TicTacToe is None:
    logger.error("TicTacToe class not found in game_logic module.")
    raise ImportError("TicTacToe class not found")

# ─── Initialize Flask App & Game Instance ────────────────────────────────────
app  = Flask(__name__)
CORS(app)  # Allow cross-origin requests from your frontend
game = TicTacToe()

# ─── REST Endpoints ────────────────────────────────────────────────────────────
@app.route('/api/game/state', methods=['GET'])
def get_game_state():
    """Return the current game state as JSON."""
    logger.info("GET /api/game/state")
    return jsonify({
        'board': game.board,
        'current_player': game.current_player,
        'game_over': game.game_over,
        'winner': game.winner
    }), 200

@app.route('/api/game/move', methods=['POST'])
def post_make_move():
    """
    Expect JSON { "position": <int 0–8> }.
    On invalid or missing data, returns HTTP 400 with { "error": "<message>" }.
    """
    logger.info("POST /api/game/move")
    try:
        data = request.get_json(force=True)
    except Exception as e:
        logger.warning("Invalid JSON payload: %s", e)
        return jsonify({'error': 'Invalid JSON payload'}), 400

    position = data.get('position')
    if position is None:
        logger.warning("Position not provided")
        return jsonify({'error': 'Position not provided'}), 400

    try:
        position = int(position)
    except (ValueError, TypeError):
        logger.warning("Non-integer position: %s", position)
        return jsonify({'error': 'Position must be an integer 0–8'}), 400

    success, message = game.make_move(position)
    if not success:
        logger.info("Move rejected: %s", message)
        return jsonify({'error': message}), 400

    logger.info("Move accepted at %d", position)
    return jsonify({
        'board': game.board,
        'current_player': game.current_player,
        'game_over': game.game_over,
        'winner': game.winner
    }), 200

@app.route('/api/game/ai_move', methods=['POST'])
def post_ai_move():
    """
    Trigger the AI to make its move.
    Returns updated game state, or 400 + error if no move possible.
    """
    logger.info("POST /api/game/ai_move")
    success, message = game.make_ai_move()
    if not success:
        logger.warning("AI move failed: %s", message)
        return jsonify({'error': message}), 400

    logger.info("AI move made")
    return jsonify({
        'board': game.board,
        'current_player': game.current_player,
        'game_over': game.game_over,
        'winner': game.winner
    }), 200

@app.route('/api/game/reset', methods=['POST'])
def post_reset_game():
    """Reset the game to its initial state and return that state."""
    logger.info("POST /api/game/reset")
    game.reset_game()
    return jsonify({
        'board': game.board,
        'current_player': game.current_player,
        'game_over': game.game_over,
        'winner': game.winner
    }), 200

# ─── App Entry Point ──────────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
