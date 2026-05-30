// Game variables
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');

// Paddle properties
const paddleWidth = 10;
const paddleHeight = 80;
const paddleSpeed = 6;

// Ball properties
const ballSize = 8;
const ballSpeedX = 5;
const ballSpeedY = 5;

// Game objects
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: ballSpeedX,
    dy: ballSpeedY,
    radius: ballSize
};

// Game state
let gameRunning = false;
let mouseY = canvas.height / 2;

// Event listeners
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
    if (e.key === 'ArrowUp') {
        player.dy = -paddleSpeed;
    }
    if (e.key === 'ArrowDown') {
        player.dy = paddleSpeed;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        player.dy = 0;
    }
});

// Game functions
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ballSpeedX;
    ball.dy = (Math.random() - 0.5) * 2 * ballSpeedY;
}

function updatePlayer() {
    // Mouse control
    if (mouseY - paddleHeight / 2 > 0 && mouseY + paddleHeight / 2 < canvas.height) {
        player.y = mouseY - paddleHeight / 2;
    } else if (mouseY - paddleHeight / 2 <= 0) {
        player.y = 0;
    } else {
        player.y = canvas.height - paddleHeight;
    }

    // Keyboard control
    if (player.dy !== 0) {
        player.y += player.dy;
        if (player.y < 0) {
            player.y = 0;
        }
        if (player.y + paddleHeight > canvas.height) {
            player.y = canvas.height - paddleHeight;
        }
    }
}

function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;

    // Simple AI - paddle follows the ball
    if (computerCenter < ballCenter - 35) {
        computer.y += paddleSpeed * 0.8;
    } else if (computerCenter > ballCenter + 35) {
        computer.y -= paddleSpeed * 0.8;
    }

    // Keep paddle in bounds
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + paddleHeight > canvas.height) {
        computer.y = canvas.height - paddleHeight;
    }
}

function updateBall() {
    if (!gameRunning) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
    }

    // Player paddle collision
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius;
        
        // Add spin based on where the ball hits the paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy += hitPos * 3;
    }

    // Computer paddle collision
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;
        
        // Add spin based on where the ball hits the paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy += hitPos * 3;
    }

    // Scoring
    if (ball.x - ball.radius < 0) {
        computer.score++;
        computerScoreEl.textContent = computer.score;
        resetBall();
        gameRunning = false;
    }

    if (ball.x + ball.radius > canvas.width) {
        player.score++;
        playerScoreEl.textContent = player.score;
        resetBall();
        gameRunning = false;
    }
}

function drawPaddle(paddle) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Add glow effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add glow effect
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGameStatus() {
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to Start/Pause', canvas.width / 2, canvas.height / 2);
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw elements
    drawCenterLine();
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
    drawGameStatus();
}

function update() {
    updatePlayer();
    updateComputer();
    updateBall();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();