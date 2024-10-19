const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highestScoreElement = document.getElementById('highestScoreValue');

let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let food = { x: 15, y: 15 };
let score = 0;
let speed = 100;
let gameInterval;

const snakeColor = 'green';
const snakeHeadColor = 'yellow';

let foodSize = 10;
let growing = true;
const minSize = 10;
const maxSize = 15;
const sizeChangeRate = 0.4;

document.addEventListener('touchstart', (event) => {
    event.preventDefault();
    handleTouch(event);
}, { passive: false });

function startGame() {
    document.addEventListener('keydown', changeDirection);
    createFood();
    displayHighestScore();
    gameInterval = setInterval(updateGame, speed);
}

function changeDirection(event) {
    switch (event.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction = { x: 1, y: 0 };
            break;
    }
}

function createFood() {
    food.x = Math.floor(Math.random() * (canvas.width / 10));
    food.y = Math.floor(Math.random() * (canvas.height / 10));
}

function drawFood() {
    ctx.fillStyle = 'red';
    const adjustedX = food.x * 10 - (foodSize - 10) / 2;
    const adjustedY = food.y * 10 - (foodSize - 10) / 2;
    ctx.fillRect(adjustedX, adjustedY, foodSize, foodSize);
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    moveSnake();
    drawSnake();
    updateFoodSize();
    drawFood();
    checkCollision();
}

function updateFoodSize() {
    if (growing) {
        foodSize += sizeChangeRate;
        if (foodSize >= maxSize) {
            growing = false;
        }
    } else {
        foodSize -= sizeChangeRate;
        if (foodSize <= minSize) {
            growing = true;
            foodSize = minSize;
        }
    }
}

function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;
        createFood();
        increaseSpeed();
    } else {
        snake.pop();
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = (index === 0) ? snakeHeadColor : snakeColor;
        ctx.fillRect(segment.x * 10, segment.y * 10, 10, 10);
    });
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= canvas.width / 10 || head.y < 0 || head.y >= canvas.height / 10 || snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        clearInterval(gameInterval);
        displayGameOver();
    }
}

function displayGameOver() {
    const finalScoreElement = document.getElementById('finalScore');
    finalScoreElement.textContent = 'Your score: ' + score;
    document.getElementById('gameOverScreen').style.display = 'flex';
    checkHighestScore();
}

function checkHighestScore() {
    const highestScore = getHighestScore();
    if (score > highestScore) {
        setHighestScore(score);
        highestScoreElement.textContent = score;
    }
}

function setHighestScore(currentScore) {
    const highestScore = getHighestScore();
    if (currentScore > highestScore) {
        document.cookie = `highestScore=${currentScore}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    }
}

function getHighestScore() {
    const cookieString = document.cookie;
    const highestScoreCookie = cookieString.match(/highestScore=([^;]*)/);
    return highestScoreCookie ? parseInt(highestScoreCookie[1], 10) : 0;
}

function displayHighestScore() {
    const highestScore = getHighestScore();
    highestScoreElement.textContent = highestScore;
}

document.getElementById('restartButton').addEventListener('click', () => {
    document.location.reload();
});

document.getElementById('restartButton').addEventListener('touchstart', function() {
    document.location.reload(true);
});

function increaseSpeed() {
    speed *= 0.95;
    clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, speed);
}

let touchStartX = 0;
let touchStartY = 0;

function handleTouch(event) {
    const touch = event.touches[0];
    const canvasRect = canvas.getBoundingClientRect();
    const touchX = Math.floor((touch.clientX - canvasRect.left) / 10);
    const touchY = Math.floor((touch.clientY - canvasRect.top) / 10);

    if (event.touches.length === 1) {
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;

        document.addEventListener('touchmove', handleSwipe);
    }

    document.addEventListener('touchend', () => {
        document.removeEventListener('touchmove', handleSwipe);
    }, { once: true });
}

function handleSwipe(event) {
    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0 && direction.x !== -1) direction = { x: 1, y: 0 };
        else if (deltaX < 0 && direction.x !== 1) direction = { x: -1, y: 0 };
    } else {
        if (deltaY > 0 && direction.y !== -1) direction = { x: 0, y: 1 };
        else if (deltaY < 0 && direction.y !== 1) direction = { x: 0, y: -1 };
    }
}

startGame();
