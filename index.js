const canvas = document.getElementById("play-board");
const cnvsObject = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highestScoreElement = document.getElementById('top-score');

let snake = [{ x: 10, y: 10 }];
let dir = { x: 0, y: 0 };
let food = { x: 15, y: 15 }; 
let score = 0;
let speed = 100;
let gameInterval;

const snakeColor = 'green';
const snakeHeadColor = 'yellow';

const startGame = () => {
    document.addEventListener('keydown', changeDirection);
    createFood();
    displayHighestScore();
    gameInterval = setInterval(frameByFrame, speed);
}

const frameByFrame = () => {
    cnvsObject.clearRect(0, 0, canvas.width, canvas.height);
    moveSnake();
    drawSnake();
    toggleFoodSize();
    drawFood();
    checkCollison();
}

const checkCollison = () => {
    const head = snake[0];
    if (head.x < 0 || head.x >= canvas.width / 10 || head.y < 0 || head.y >= canvas.height / 10 ||
        snake.slice(1).some(bodyPart => bodyPart.x === head.x && bodyPart.y === head.y)) {
        clearInterval(gameInterval);
        displayGameOver();
    }
}

let foodSize = 10;
let growing = true;
const minSize = 10;
const maxSize = 15;
const sizeChangeRate = 0.4;

const toggleFoodSize = () => {
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

const drawFood = () => {
    cnvsObject.fillStyle = 'red';
    const newX = food.x * 10 - (foodSize - 10) / 2;
    const newY = food.y * 10 - (foodSize - 10) / 2;
    cnvsObject.fillRect(newX, newY, foodSize, foodSize);
}

const drawSnake = () => {
    snake.forEach((obj, index) => {
        cnvsObject.fillStyle = (index === 0) ? snakeHeadColor : snakeColor;
        cnvsObject.fillRect(obj.x * 10, obj.y * 10, 10, 10);
    });
}

const moveSnake = () => {
    const head = {
        x: snake[0].x + dir.x,
        y: snake[0].y + dir.y 
    }
    snake.unshift(head);
    
    // if snake eats food
    if (head.x === food.x && head.y === food.y) { 
        score++;
        scoreElement.textContent = score;
        createFood();
        if (score % 2 === 0) {
            increaseSpeed();
        }
    } else {
        snake.pop();
    }
}

const increaseSpeed = () => {
    speed *= 0.95;
    clearInterval(gameInterval);
    gameInterval = setInterval(frameByFrame, speed);
}

const createFood = () => {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / 10)),
            y: Math.floor(Math.random() * (canvas.height / 10))
        };
    } while (snake.some(part => part.x === newFood.x && part.y === newFood.y)); // Ensure food does not spawn on snake
    food = newFood;
}

const changeDirection = (e) => {
    switch (e.key) {
        case 'ArrowUp':
            if (dir.y === 0) {
                dir = { x: 0, y: -1 };
            }
            break;
        case 'ArrowDown':
            if (dir.y === 0) {
                dir = { x: 0, y: 1 };
            }
            break;
        case 'ArrowLeft':
            if (dir.x === 0) {
                dir = { x: -1, y: 0 };
            }
            break;
        case 'ArrowRight':
            if (dir.x === 0) {
                dir = { x: 1, y: 0 };
            }
            break;
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

const setHighestScore = (currentScore) => {
    const highestScore = getHighestScore();
    if (currentScore > highestScore) {
        document.cookie = `highestScore=${currentScore}; expires= 3days`;
    }
}

const displayHighestScore = () => {
    const highestScore = getHighestScore();
    highestScoreElement.textContent = highestScore;
}

const getHighestScore = () => {
    const cookieString = document.cookie;
    const highestScoreCookie = cookieString.match(/highestScore=([^;]*)/);
    return highestScoreCookie ? parseInt(highestScoreCookie[1], 10) : 0;
}

document.getElementById('restartButton').addEventListener('click', () => {
    document.location.reload();
});

document.getElementById('restartButton').addEventListener('touchstart', function () {
    document.location.reload(true);
});

// mobile touch

// prevent reload
document.addEventListener('touchstart', (event) => {
    event.preventDefault();
    handleTouch(event);
}, { passive: false });

let touchStartX = 0;
let touchStartY = 0;

function handleTouch(event) {
    const touch = event.touches[0];
    console.log(event.touches);
    
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
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && dir.x !== -1) dir = { x: 1, y: 0 };
        else if (dx < 0 && dir.x !== 1) dir = { x: -1, y: 0 };
    } else {
        if (dy > 0 && dir.y !== -1) dir = { x: 0, y: 1 };
        else if (dy < 0 && dir.y !== 1) dir = { x: 0, y: -1 };
    }
}

startGame();