const board = document.getElementById('board');
const statusDiv = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const modeRadios = document.querySelectorAll('input[name="mode"]');
let cells = Array.from(document.querySelectorAll('.cell'));

let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp'; // 'pvp' or 'ai'
let boardState = Array(9).fill('');

const WIN_COMBOS = [
  [0,1,2], [3,4,5], [6,7,8], // rows
  [0,3,6], [1,4,7], [2,5,8], // cols
  [0,4,8], [2,4,6]           // diags
];

function handleCellClick(e) {
  const idx = +e.target.dataset.index;
  if (!gameActive || boardState[idx]) return;

  makeMove(idx, currentPlayer);

  if (checkWin(currentPlayer)) {
    endGame(`${currentPlayer} wins!`, getWinningCombo(currentPlayer));
    return;
  }
  if (boardState.every(cell => cell)) {
    endGame("It's a draw!");
    return;
  }

  if (gameMode === 'ai' && currentPlayer === 'X') {
    currentPlayer = 'O';
    statusDiv.textContent = "Computer's Turn";
    setTimeout(computerMove, 500);
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDiv.textContent = `Player ${currentPlayer}'s Turn`;
  }
}

function makeMove(idx, player) {
  boardState[idx] = player;
  cells[idx].textContent = player;
  cells[idx].classList.add('disabled');
}

function computerMove() {
  // Simple AI: pick random empty cell
  let emptyCells = boardState.map((v, i) => v === '' ? i : null).filter(v => v !== null);
  // For unbeatable AI, use minimax algorithm (see sources)
  let move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  makeMove(move, 'O');
  if (checkWin('O')) {
    endGame('Computer wins!', getWinningCombo('O'));
    return;
  }
  if (boardState.every(cell => cell)) {
    endGame("It's a draw!");
    return;
  }
  currentPlayer = 'X';
  statusDiv.textContent = `Player X's Turn`;
}

function checkWin(player) {
  return WIN_COMBOS.some(combo => combo.every(idx => boardState[idx] === player));
}

function getWinningCombo(player) {
  return WIN_COMBOS.find(combo => combo.every(idx => boardState[idx] === player));
}

function endGame(message, winCombo) {
  gameActive = false;
  statusDiv.textContent = message;
  if (winCombo) {
    winCombo.forEach(idx => cells[idx].classList.add('winner'));
  }
}

function resetGame() {
  boardState = Array(9).fill('');
  currentPlayer = 'X';
  gameActive = true;
  statusDiv.textContent = `Player X's Turn`;
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('disabled', 'winner');
  });
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);

modeRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    gameMode = e.target.value;
    resetGame();
  });
});

// Initial state
resetGame();
