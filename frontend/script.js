// script.js
// UI logic with Dark‑Mode & AI‑Opponent support
// — state uses GET, others use POST with JSON

document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'http://localhost:5000/api/game';
  const boardEl    = document.getElementById('board');
  const statusEl   = document.getElementById('game-status');
  const resetBtn   = document.getElementById('reset-button');
  const aiToggle   = document.getElementById('ai-toggle');
  const darkToggle = document.getElementById('dark-toggle');

  // Apply saved theme
  if (localStorage.getItem('dark') === 'true') {
    document.body.classList.add('dark');
    darkToggle.checked = true;
  }

  darkToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('dark', document.body.classList.contains('dark'));
  });

  // Initial load uses GET for state
  loadGameState();

  resetBtn.addEventListener('click', async () => {
    aiToggle.checked = false;
    await resetGame();
  });

  boardEl.addEventListener('click', async e => {
    if (!e.target.classList.contains('cell')) return;
    const pos = +e.target.dataset.index;

    // Human move
    const human = await makeMove(pos);
    if (!human) return;

    // AI move if enabled and game still ongoing
    if (aiToggle.checked && !human.game_over) {
      await makeAIMove();
    }
  });

  // ─── API FUNCTIONS ────────────────────────────────────

  async function loadGameState() {
    try {
      const res  = await fetch(`${API_BASE}/state`, { method: 'GET' });
      const data = await res.json();
      render(data);
    } catch (err) {
      console.error('loadGameState error:', err);
      statusEl.textContent = 'Error loading game state.';
    }
  }

  async function makeMove(position) {
    try {
      const res = await fetch(`${API_BASE}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.status);
      render(data);
      return data;
    } catch (err) {
      console.error('makeMove error:', err);
      statusEl.textContent = 'Invalid move or server error.';
      return null;
    }
  }

  async function makeAIMove() {
    try {
      const res = await fetch(`${API_BASE}/ai_move`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.status);
      render(data);
      return data;
    } catch (err) {
      console.error('makeAIMove error:', err);
      statusEl.textContent = 'AI move failed.';
      return null;
    }
  }

  async function resetGame() {
    try {
      const res  = await fetch(`${API_BASE}/reset`, { method: 'POST' });
      const data = await res.json();
      render(data);
    } catch (err) {
      console.error('resetGame error:', err);
      statusEl.textContent = 'Error resetting game.';
    }
  }

  // ─── RENDERING ─────────────────────────────────────────

  function render({ board, current_player, game_over, winner, winning_line }) {
    // clear old highlights
    document.querySelectorAll('.cell').forEach(c => {
      c.classList.remove('win');
      c.textContent = '';
    });

    // draw new board
    board.forEach((mark, i) => {
      const cell = boardEl.children[i];
      cell.textContent = mark !== ' ' ? mark : '';
    });

    // highlight winning line if any
    if (game_over && Array.isArray(winning_line)) {
      winning_line.forEach(i =>
        boardEl.children[i].classList.add('win')
      );
    }

    // update status
    if (game_over) {
      statusEl.textContent = winner
        ? `Game Over! Player ${winner} wins!`
        : `Game Over! It's a tie!`;
    } else {
      statusEl.textContent = `Current turn: Player ${current_player}`;
    }
  }
});
