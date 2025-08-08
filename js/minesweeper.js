// js/minesweeper.js
// Minesweeper game logic for index.html
// Exposes startGame('minesweeper'), backToGrid(), reset button behavior via DOM bindings.

(() => {
    // --- Config/defaults
    const DIFFS = {
        easy: { r: 8, c: 8, m: 10 },
        medium: { r: 12, c: 12, m: 24 },
        hard: { r: 16, c: 16, m: 40 }
    };
    const LONG_PRESS_MS = 600;
    const FACTS = [
        "Light travels at ~3×10⁸ m/s in vacuum.",
        "An atom is mostly empty space.",
        "Gravity on Earth is ~9.8 m/s².",
        "One mole ≈ 6.022×10²³ particles.",
        "E = mc² links mass and energy.",
        "Black holes warp spacetime around them."
    ];

    // --- DOM refs
    const gamesGrid = document.getElementById('games-grid');
    const gameScreen = document.getElementById('game-screen');
    const boardEl = document.getElementById('board');
    const minesLeftEl = document.getElementById('minesLeft');
    const timerEl = document.getElementById('timer');
    const scoreEl = document.getElementById('score');
    const difficultySelect = document.getElementById('difficulty');
    const resetBtn = document.getElementById('resetBtn');
    const toast = document.getElementById('toast');
    const backBtn = document.getElementById('backBtn');

    // state
    let rows = 12, cols = 12, totalMines = 24;
    let board = []; // 2D cells
    let firstClick = true;
    let revealedCount = 0;
    let flagsPlaced = 0;
    let score = 0;
    let timerId = null;
    let timeElapsed = 0;
    let longPressTimer = null;
    let gameOver = false;

    // helpers
    function showToast(msg, ms = 2200) {
        if (!toast) return;
        toast.style.display = 'block';
        toast.textContent = msg;
        toast.style.transform = 'translateY(0)';
        clearTimeout(toast._t);
        toast._t = setTimeout(() => {
            toast.style.display = 'none';
        }, ms);
    }

    function updateStatsUI() {
        minesLeftEl.textContent = Math.max(0, totalMines - flagsPlaced);
        timerEl.textContent = timeElapsed;
        scoreEl.textContent = score;
    }

    function startTimer() {
        clearInterval(timerId);
        timeElapsed = 0;
        timerId = setInterval(() => {
            timeElapsed++;
            updateStatsUI();
        }, 1000);
    }
    function stopTimer() { clearInterval(timerId); timerId = null; }

    function createEmptyBoard(r, c) {
        const b = [];
        for (let i = 0; i < r; i++) {
            const row = [];
            for (let j = 0; j < c; j++) {
                row.push({
                    row: i,
                    col: j,
                    mine: false,
                    adjacent: 0,
                    revealed: false,
                    flagged: false,
                    el: null
                });
            }
            b.push(row);
        }
        return b;
    }

    function placeMinesAvoiding(safeR, safeC) {
        let placed = 0;
        while (placed < totalMines) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            // no duplicates
            if (board[r][c].mine) continue;
            // avoid safe cell and its neighbors
            if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
            board[r][c].mine = true;
            placed++;
        }
        // compute adjacent counts
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].mine) { board[r][c].adjacent = -1; continue; }
                let cnt = 0;
                for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) cnt++;
                }
                board[r][c].adjacent = cnt;
            }
        }
    }

    function buildBoardDOM() {
        boardEl.innerHTML = '';
        // pick tile size responsive
        const tileSize = Math.max(34, Math.floor(Math.min(48, 520 / Math.max(cols, rows))));
        boardEl.style.gridTemplateColumns = `repeat(${cols}, ${tileSize}px)`;
        boardEl.style.gridTemplateRows = `repeat(${rows}, ${tileSize}px)`;
        boardEl.style.gap = '8px';
        boardEl.style.maxWidth = `${(tileSize + 8) * cols}px`;
        boardEl.style.width = '100%';
        boardEl.classList.add('mx-auto');

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = board[r][c];
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'bg-slate-800 border border-slate-700 rounded-md text-white flex items-center justify-center select-none focus:outline-none';
                btn.style.width = `${tileSize}px`;
                btn.style.height = `${tileSize}px`;
                btn.dataset.r = r; btn.dataset.c = c;
                btn.title = 'Hidden — click to reveal, right-click to flag';

                // events
                btn.addEventListener('click', (e) => {
                    onTileClick(r, c);
                });
                btn.addEventListener('contextmenu', (e) => {
                    e.preventDefault(); toggleFlag(r, c);
                });

                // touch long-press for flag
                btn.addEventListener('touchstart', () => {
                    longPressTimer = setTimeout(() => toggleFlag(r, c), LONG_PRESS_MS);
                }, { passive: true });
                btn.addEventListener('touchend', () => {
                    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
                });

                // keyboard support
                btn.addEventListener('keydown', (ev) => {
                    if (gameOver) return;
                    if (ev.key === 'Enter') onTileClick(r, c);
                    if (ev.key.toLowerCase() === 'f') toggleFlag(r, c);
                });

                cell.el = btn;
                boardEl.appendChild(btn);
            }
        }
        updateStatsUI();
    }

    function onTileClick(r, c) {
        if (gameOver) return;
        const cell = board[r][c];
        if (cell.revealed || cell.flagged) return;

        if (firstClick) {
            placeMinesAvoiding(r, c);
            firstClick = false;
            startTimer();
            showToast('First click safe — go explore!');
        }
        revealCell(r, c);
    }

    function revealCell(r, c) {
        const cell = board[r][c];
        if (!cell || cell.revealed || cell.flagged) return;
        cell.revealed = true;
        revealedCount++;
        // animate
        cell.el.classList.add('tile-reveal');
        setTimeout(() => cell.el.classList.add('show'), 10);

        if (cell.mine) {
            cell.el.innerHTML = '<span class="text-2xl">🌀</span>';
            cell.el.classList.add('bg-red-600');
            endGame(false);
            return;
        }

        if (cell.adjacent > 0) {
            cell.el.textContent = cell.adjacent;
            // color-coded numbers
            const colorMap = ['transparent', 'text-sky-300', 'text-green-300', 'text-yellow-300', 'text-orange-300', 'text-pink-300', 'text-indigo-300', 'text-neutral-200', 'text-neutral-200'];
            cell.el.classList.add(...(colorMap[cell.adjacent]?.split(' ') || ['text-white']));
        } else {
            cell.el.innerHTML = '<span style="font-size:18px">⚛️</span>';
            floodReveal(r, c);
        }

        score++;
        updateStatsUI();
        showToast(FACTS[Math.floor(Math.random() * FACTS.length)]);

        // Win check
        if (revealedCount === rows * cols - totalMines) {
            endGame(true);
        }
    }

    function floodReveal(sr, sc) {
        const stack = [[sr, sc]];
        while (stack.length) {
            const [r, c] = stack.pop();
            for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                const n = board[nr][nc];
                if (!n.revealed && !n.flagged && !n.mine) {
                    n.revealed = true;
                    revealedCount++;
                    n.el.classList.add('tile-reveal');
                    setTimeout(() => n.el.classList.add('show'), 10);
                    if (n.adjacent > 0) n.el.textContent = n.adjacent;
                    else {
                        n.el.innerHTML = '<span style="font-size:16px">⚛️</span>';
                        stack.push([nr, nc]);
                    }
                    score++;
                }
            }
        }
        updateStatsUI();
    }

    function toggleFlag(r, c) {
        if (gameOver) return;
        const cell = board[r][c];
        if (cell.revealed) return;
        cell.flagged = !cell.flagged;
        if (cell.flagged) {
            cell.el.innerHTML = '<span class="text-xl">🧪</span>';
            flagsPlaced++;
        } else {
            cell.el.innerHTML = '';
            flagsPlaced = Math.max(0, flagsPlaced - 1);
        }
        updateStatsUI();
    }

    function revealAllMines() {
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
            const cell = board[r][c];
            if (cell.mine) {
                cell.el.innerHTML = '<span class="text-2xl">🌀</span>';
                cell.el.classList.add('bg-red-600');
            }
        }
    }

    function endGame(win) {
        gameOver = true;
        stopTimer();
        if (win) {
            // auto-flag mines
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
                const cell = board[r][c];
                if (cell.mine) {
                    cell.el.innerHTML = '<span class="text-xl">🧪</span>';
                    cell.el.classList.add('bg-green-700');
                }
            }
            showToast(`🎉 Victory! Time: ${timeElapsed}s — Score: ${score}`, 4000);
        } else {
            revealAllMines();
            showToast('💥 You fell into a black hole! Try again.', 3000);
        }
    }

    // Public/UI functions
    window.startGame = function (name) {
        if (name !== 'minesweeper') return;
        // set difficulty defaults
        const d = difficultySelect.value || 'medium';
        const cfg = DIFFS[d] || DIFFS.medium;
        rows = cfg.r; cols = cfg.c; totalMines = cfg.m;
        // show screen
        gamesGrid.style.display = 'none';
        gameScreen.style.display = 'block';
        // init game
        resetGame();
        // focus board for keyboard
        setTimeout(() => {
            const firstBtn = boardEl.querySelector('button');
            if (firstBtn) firstBtn.focus();
        }, 200);
    };

    window.backToGrid = function () {
        // cleanup
        stopTimer();
        gameOver = true;
        gameScreen.style.display = 'none';
        gamesGrid.style.display = 'block';
        // small cleanup
        boardEl.innerHTML = '';
        showToast('Back to games');
    };

    window.resetGame = resetGame;
    function resetGame() {
        // reset state
        firstClick = true;
        revealedCount = 0;
        flagsPlaced = 0;
        score = 0;
        timeElapsed = 0;
        gameOver = false;
        stopTimer();
        // set from difficulty UI
        const d = difficultySelect.value || 'medium';
        const cfg = DIFFS[d] || DIFFS.medium;
        rows = cfg.r; cols = cfg.c; totalMines = cfg.m;
        board = createEmptyBoard(rows, cols);
        buildBoardDOM();
        showToast('New board ready — first click is safe.');
    }

    // attach listeners
    resetBtn?.addEventListener('click', resetGame);
    difficultySelect?.addEventListener('change', resetGame);
    backBtn?.addEventListener('click', backToGrid);

    // Keyboard helpers for convenience: F keys for flag globally
    document.addEventListener('keydown', (ev) => {
        if (ev.key.toLowerCase() === 'f' && !gameOver) {
            // try to toggle flag on focused tile
            const el = document.activeElement;
            if (el && el.dataset && el.dataset.r) {
                const r = parseInt(el.dataset.r), c = parseInt(el.dataset.c);
                toggleFlag(r, c);
            }
        }
    });

})();
