// ---- Elements ----
const gameArea = document.getElementById('gameArea');
const magnet = document.getElementById('magnet');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const replayBtn = document.getElementById('replayBtn');
const exitBtn = document.getElementById('exitBtn');

// ---- State ----
let score = 0;
let lives = 3;
let particles = [];
let spawnIntervalId = null;
let rafId = null;
let gameRunning = false;

// Config
const SPAWN_MS = 1100; // spawn rate
const BASE_SPEED = 1.2; // falling speed

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// Magnet reset
function resetMagnetPosition() {
    const areaW = gameArea.clientWidth;
    const magW = magnet.clientWidth || 48;
    magnet.style.left = (areaW / 2 - magW / 2) + 'px';
}

// HUD update
function updateHUD() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
}

// Create a particle
function spawnParticle() {
    if (!gameRunning) return;

    const el = document.createElement('div');
    el.className = 'particle';
    const isGood = Math.random() < 0.72;
    el.textContent = isGood ? '⚛️' : '💣';

    const spawnX = Math.random() * Math.max(1, gameArea.clientWidth - 36);
    const speed = BASE_SPEED + Math.random() * 1.8;
    el.style.left = spawnX + 'px';
    el.style.top = '-40px';

    gameArea.appendChild(el);

    particles.push({ el, x: spawnX, y: -40, speed, isGood, disguised: false });
}

// Game loop
function loop() {
    if (!gameRunning) return;

    const magnetRect = magnet.getBoundingClientRect();

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y += p.speed;
        p.el.style.top = p.y + 'px';

        // disguise chance
        if (!p.disguised && p.y > gameArea.clientHeight / 2) {
            if (Math.random() < 0.5) {
                p.isGood = !p.isGood;
                p.el.textContent = p.isGood ? '⚛️' : '💣';
                p.el.classList.add('disguised');
                setTimeout(() => p.el.classList.remove('disguised'), 350);
            }
            p.disguised = true;
        }

        // Collision
        const pr = p.el.getBoundingClientRect();
        const caught = !(pr.right < magnetRect.left || pr.left > magnetRect.right || pr.bottom < magnetRect.top || pr.top > magnetRect.bottom);
        if (caught) {
            if (p.isGood) {
                score++;
            } else {
                lives--;
                score = Math.max(0, score - 1);
            }
            updateHUD();
            p.el.remove();
            particles.splice(i, 1);
            if (lives <= 0) return endGame();
            continue;
        }

        // Missed
        if (p.y > gameArea.clientHeight + 40) {
            if (p.isGood) {
                lives--;
                updateHUD();
                if (lives <= 0) return endGame();
            }
            p.el.remove();
            particles.splice(i, 1);
        }
    }

    rafId = requestAnimationFrame(loop);
}

// Start game
function startGame() {
    // Reset state
    score = 0;
    lives = 3;
    particles.forEach(p => p.el.remove());
    particles = [];
    updateHUD();
    resetMagnetPosition();

    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameRunning = true;

    // clear old loops
    clearInterval(spawnIntervalId);
    cancelAnimationFrame(rafId);

    // restart loops
    spawnIntervalId = setInterval(spawnParticle, SPAWN_MS);
    rafId = requestAnimationFrame(loop);
}

// End game
function endGame() {
    gameRunning = false;
    clearInterval(spawnIntervalId);
    cancelAnimationFrame(rafId);
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Exit back to start
function resetToStart() {
    startScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    particles.forEach(p => p.el.remove());
    particles = [];
    score = 0;
    lives = 3;
    updateHUD();
    resetMagnetPosition();
    gameRunning = false;
    clearInterval(spawnIntervalId);
    cancelAnimationFrame(rafId);
}

// ---- Controls ----
window.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    const step = 36;
    let cur = parseFloat(magnet.style.left || 0);
    if (e.key === 'ArrowLeft') {
        magnet.style.left = clamp(cur - step, 0, gameArea.clientWidth - magnet.clientWidth) + 'px';
    } else if (e.key === 'ArrowRight') {
        magnet.style.left = clamp(cur + step, 0, gameArea.clientWidth - magnet.clientWidth) + 'px';
    }
});

gameArea.addEventListener('mousemove', (e) => {
    if (!gameRunning) return;
    const rect = gameArea.getBoundingClientRect();
    const mx = e.clientX - rect.left - magnet.clientWidth / 2;
    magnet.style.left = clamp(mx, 0, gameArea.clientWidth - magnet.clientWidth) + 'px';
});

// Drag controls
let dragging = false;
magnet.addEventListener('pointerdown', (e) => {
    if (!gameRunning) return;
    dragging = true;
    magnet.setPointerCapture(e.pointerId);
    magnet.style.cursor = 'grabbing';
});
window.addEventListener('pointermove', (e) => {
    if (!gameRunning || !dragging) return;
    const rect = gameArea.getBoundingClientRect();
    const mx = e.clientX - rect.left - magnet.clientWidth / 2;
    magnet.style.left = clamp(mx, 0, gameArea.clientWidth - magnet.clientWidth) + 'px';
});
window.addEventListener('pointerup', (e) => {
    if (dragging) {
        dragging = false;
        magnet.style.cursor = 'grab';
        try { magnet.releasePointerCapture(e.pointerId); } catch (err) { }
    }
});

// ---- Buttons ----
startBtn.addEventListener('click', startGame);
replayBtn.addEventListener('click', startGame);
exitBtn.addEventListener('click', resetToStart);

// ---- Init ----
window.addEventListener('load', resetMagnetPosition);
window.addEventListener('resize', () => {
    resetMagnetPosition();
    let cur = parseFloat(magnet.style.left || 0);
    magnet.style.left = clamp(cur, 0, Math.max(0, gameArea.clientWidth - magnet.clientWidth)) + 'px';
});
updateHUD();
