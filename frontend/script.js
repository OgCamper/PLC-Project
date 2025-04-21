// script.js
// Front-end logic for Tic‑Tac‑Toe UI with optional AI opponent

document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = 'http://localhost:5000';
  const boardEl       = document.getElementById('board');
  const statusEl      = document.getElementById('game-status');
  const resetBtn      = document.getElementById('reset-button');
  const aiToggle      = document.getElementById('ai-toggle');

  // Load initial game state
  loadGameState();

  // Handle cell clicks for human moves
  boardEl.addEventListener('click', async (e) => {
    const cell = e.target;
    if (!cell.classList.contains('cell')) return;
    const pos = parseInt(cell.dataset.index, 10);

    // Make the human move
    const humanResult = await makeMove(pos);
    if (!humanResult) return;

    // If playing vs AI and game not over, trigger AI move
    if (aiToggle.checked && !humanResult.game_over) {
      await makeAIMove();
    }
  });

  // Reset button handler
  resetBtn.addEventListener('click', async () => {
    aiToggle.checked = false;  // reset to two‑player by default
    await resetGame();
  });

  // ─── API CALLS ─────────────────────────────────────────────────────────────

  async function loadGameState() {
    try {
      const res   = await fetch(`${API_BASE_URL}/api/game/state`);
      const state = await res.json();
      updateBoard(state);
      updateStatus(state);
    } catch (err) {
      console.error('loadGameState error:', err);
      statusEl.textContent = 'Error loading game state.';
    }
  }

  async function makeMove(position) {
    try {
      const res    = await fetch(`${API_BASE_URL}/api/game/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || res.status);
      updateBoard(result);
      updateStatus(result);
      return result;
    } catch (err) {
      console.error('makeMove error:', err);
      statusEl.textContent = 'Invalid move or server error.';
      return null;
    }
  }

  async function makeAIMove() {
    try {
      const res    = await fetch(`${API_BASE_URL}/api/game/ai_move`, {
        method: 'POST'
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || res.status);
      updateBoard(result);
      updateStatus(result);
      return result;
    } catch (err) {
      console.error('makeAIMove error:', err);
      statusEl.textContent = 'AI move failed.';
      return null;
    }
  }

  async function resetGame() {
    try {
      const res   = await fetch(`${API_BASE_URL}/api/game/reset`, { method: 'POST' });
      const state = await res.json();
      updateBoard(state);
      updateStatus(state);
    } catch (err) {
      console.error('resetGame error:', err);
      statusEl.textContent = 'Error resetting game.';
    }
  }

  // ─── UI UPDATES ────────────────────────────────────────────────────────────

  function updateBoard({ board }) {
    document.querySelectorAll('.cell').forEach((cell, i) => {
      cell.textContent = board[i] || '';
    });
  }

  function updateStatus({ game_over, current_player, winner }) {
    if (game_over) {
      statusEl.textContent = winner
        ? `Game Over! Player ${winner} wins!`
        : `Game Over! It's a tie!`;
    } else {
      statusEl.textContent = `Current turn: Player ${current_player}`;
    }
  }
});
