// ================================
// script.js
// Front-end logic for Tic‑Tac‑Toe UI
// Communicates with Python backend via REST API
// ================================

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5000';     // Python backend
    const boardEl       = document.getElementById('board');
    const statusEl      = document.getElementById('game-status');
    const resetBtn      = document.getElementById('reset-button');
  
    // Initial load
    loadGameState();
  
    // Handle cell clicks
    boardEl.addEventListener('click', async (e) => {
      const cell = e.target;
      if (!cell.classList.contains('cell')) return;
      const idx = parseInt(cell.dataset.index, 10);
      await makeMove(idx);
    });
  
    // Handle reset
    resetBtn.addEventListener('click', resetGame);
  
    // ----------------------------
    // Fetch current game state
    // ----------------------------
    async function loadGameState() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/game/state`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const state = await res.json();
        updateBoard(state);
        updateStatus(state);
      } catch (err) {
        console.error('loadGameState error:', err);
        statusEl.textContent = 'Error loading game state.';
      }
    }
  
    // ----------------------------
    // Send a move to backend
    // ----------------------------
    async function makeMove(position) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/game/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ position })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || res.status);
        updateBoard(result);
        updateStatus(result);
      } catch (err) {
        console.error('makeMove error:', err);
        statusEl.textContent = 'Invalid move or server error.';
      }
    }
  
    // ----------------------------
    // Reset the game via backend
    // ----------------------------
    async function resetGame() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/game/reset`, {
          method: 'POST'
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const state = await res.json();
        updateBoard(state);
        updateStatus(state);
      } catch (err) {
        console.error('resetGame error:', err);
        statusEl.textContent = 'Error resetting game.';
      }
    }
  
    // ----------------------------
    // Update UI board from state
    // ----------------------------
    function updateBoard({ board }) {
      document.querySelectorAll('.cell').forEach((cell, i) => {
        cell.textContent = board[i] || '';
      });
    }
  
    // ----------------------------
    // Update status message
    // ----------------------------
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
  