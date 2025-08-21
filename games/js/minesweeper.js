const boardElement = document.getElementById("board");
const scoreElement = document.getElementById("score");
const finalScoreElement = document.getElementById("finalScore");
const gameOverModal = document.getElementById("gameOverModal");

let boardSize = 8;
let minesCount = 10;
let board = [];
let revealedCount = 0;
let score = 0;
let gameOver = false;

// Initialize Game
function initGame() {
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 50px)`;
    boardElement.style.gridTemplateRows = `repeat(${boardSize}, 50px)`;
    boardElement.innerHTML = "";
    board = [];
    revealedCount = 0;
    score = 0;
    gameOver = false;
    scoreElement.textContent = score;

    // Create board
    for (let r = 0; r < boardSize; r++) {
        let row = [];
        for (let c = 0; c < boardSize; c++) {
            const cell = document.createElement("div");
            cell.classList.add(
                "w-12", "h-12", "flex", "items-center", "justify-center",
                "border", "border-gray-600", "bg-gray-800", "cursor-pointer",
                "text-lg", "font-bold", "rounded"
            );
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener("click", handleClick);
            boardElement.appendChild(cell);
            row.push({ cell, isMine: false, revealed: false, adjacent: 0 });
        }
        board.push(row);
    }

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < minesCount) {
        let r = Math.floor(Math.random() * boardSize);
        let c = Math.floor(Math.random() * boardSize);
        if (!board[r][c].isMine) {
            board[r][c].isMine = true;
            minesPlaced++;
        }
    }

    // Count adjacent mines
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c].isMine) continue;
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (r + dr >= 0 && r + dr < boardSize && c + dc >= 0 && c + dc < boardSize) {
                        if (board[r + dr][c + dc].isMine) count++;
                    }
                }
            }
            board[r][c].adjacent = count;
        }
    }
}

// Handle cell click
function handleClick(e) {
    if (gameOver) return;
    const r = parseInt(e.target.dataset.row);
    const c = parseInt(e.target.dataset.col);
    revealCell(r, c);
}

// Reveal cell
function revealCell(r, c) {
    let tile = board[r][c];
    if (tile.revealed) return;
    tile.revealed = true;
    revealedCount++;

    if (tile.isMine) {
        tile.cell.textContent = "💣";
        tile.cell.classList.add("bg-red-600");
        endGame();
        return;
    }

    score += 10;
    scoreElement.textContent = score;

    if (tile.adjacent > 0) {
        tile.cell.textContent = tile.adjacent;
        tile.cell.classList.add("bg-blue-600", "text-white");
    } else {
        tile.cell.classList.add("bg-green-600");
        // flood fill
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (r + dr >= 0 && r + dr < boardSize && c + dc >= 0 && c + dc < boardSize) {
                    revealCell(r + dr, c + dc);
                }
            }
        }
    }
}

// End game
function endGame() {
    gameOver = true;
    finalScoreElement.textContent = score;
    gameOverModal.classList.remove("hidden");
}

// Reset
function resetGame() {
    gameOverModal.classList.add("hidden");
    initGame();
}

initGame();
