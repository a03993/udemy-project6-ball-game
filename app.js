const timerContainer = document.getElementById("timer");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ball properties
let ball_radius = 15;
let ball_x, ball_y, ball_x_speed, ball_y_speed, ballMoving;

// Bar properties
let bar_x, bar_y, barHeight, barWidth;

// Brick properties
let brick_x, brick_y, brick_unit, bricksArray, brickCount, brickTouched;

// Timer properties
let elapsedTime;
let intervalId;
let timerStarted = false;

// Initialize game variables
function initGame() {
  // Bar setting
  barHeight = ball_radius / 1.2;
  barWidth = ball_radius * 20;
  bar_x = (canvas.width - barWidth) / 2;
  bar_y = canvas.height - barHeight * 5;

  // Ball setting
  ball_x = bar_x + barWidth / 2;
  ball_y = bar_y - barHeight;
  ball_x_speed = 20;
  ball_y_speed = -20;
  ballMoving = false; // Ball starts stationary

  // Brick setting
  brickCount = 6;
  brick_unit = 40;
  bricksArray = [];
  brickTouched = false;
  generateBricksArray();

  //Timer setting
  elapsedTime = 0;
  timerStarted = false;
  if (intervalId) {
    clearInterval(intervalId);
  }
}

// Draw the ball on the canvas
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball_x, ball_y, ball_radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "yellow";
  ctx.fill();
}

// Draw the bar on the canvas
function drawBar() {
  ctx.fillStyle = "white";
  ctx.fillRect(bar_x, bar_y, barWidth, barHeight);
}

// Draw all bricks on the canvas
function drawBrick() {
  for (i = 0; i < bricksArray.length; i++) {
    ctx.fillStyle = "lightgreen";
    ctx.fillRect(bricksArray[i].x, bricksArray[i].y, brick_unit, brick_unit);
  }
}

// Check if the new brick overlaps with any existing bricks
function isBrickOverlapping(newBrick) {
  for (let i = 0; i < bricksArray.length; i++) {
    let existingBrick = bricksArray[i];
    if (
      newBrick.x < existingBrick.x + brick_unit &&
      newBrick.x + brick_unit > existingBrick.x &&
      newBrick.y < existingBrick.y + brick_unit &&
      newBrick.y + brick_unit > existingBrick.y
    ) {
      return true; // Overlapping
    }
  }
  return false; // No overlap
}

// Generate a random array of bricks while avoiding overlap
function generateBricksArray() {
  for (let i = 0; i < brickCount; i++) {
    let newBrick;
    do {
      let brick_x = Math.floor(Math.random() * (canvas.width - brick_unit * 2));
      let brick_y = Math.floor(Math.random() * (canvas.height - barWidth));
      newBrick = { x: brick_x, y: brick_y };
    } while (isBrickOverlapping(newBrick));

    bricksArray.push(newBrick);
  }
  return bricksArray;
}

// Check if the ball is touching a specific brick
function checkIsBrickTouched(brick) {
  if (
    ball_x >= brick.x - ball_radius &&
    ball_x <= brick.x + brick_unit &&
    ball_y >= brick.y - ball_radius &&
    ball_y <= brick.y + brick_unit
  ) {
    brickTouched = true;
  } else {
    brickTouched = false;
  }
}

// Update the timer display on the page
function updateTimerDisplay() {
  timerContainer.innerText = "Elapsed time: " + elapsedTime + "s";
}

// Start the game timer
function startTimer() {
  intervalId = setInterval(function () {
    elapsedTime++;
    updateTimerDisplay();
  }, 1000);
}

// Move the ball based on its speed
function moveBall() {
  ball_x += ball_x_speed;
  ball_y += ball_y_speed;
}

// Check if the ball collides with any bricks and handle the collision
function checkBrickCollision() {
  bricksArray.forEach((brick, index) => {
    checkIsBrickTouched(brick);

    if (brickTouched) {
      // Ball rebounds when touching the brick
      if (ball_x < brick.x || ball_x > brick.x) {
        ball_x_speed *= -1;
      }
      if (ball_y < brick.y || ball_y > brick.y) {
        ball_y_speed *= -1;
      }

      // Remove the brick from the array
      bricksArray.splice(index, 1);
      brickCount--;
    }
  });
}

// Check if the ball collides with the bar and handle the collision
function checkBarCollision() {
  if (
    ball_x >= bar_x - ball_radius &&
    ball_x <= bar_x + barWidth + ball_radius &&
    ball_y >= bar_y - ball_radius &&
    ball_y <= bar_y + ball_radius
  ) {
    // Ball rebounds vertically after touching the bar
    if (ball_y_speed > 0) {
      ball_y -= 50;
    } else {
      ball_y += 50;
    }
    ball_y_speed *= -1;
  }
}

// Check if the ball collides with the canvas walls and handle the collision
function checkWallCollision() {
  // Ball rebounds off the left and right walls
  if (ball_x >= canvas.width - ball_radius || ball_x <= ball_radius) {
    ball_x_speed *= -1;
  }

  // Ball rebounds off the top and bottom walls
  if (ball_y >= canvas.height - ball_radius || ball_y <= ball_radius) {
    ball_y_speed *= -1;
  }
}

// Main function that updates the ball's position and checks for all collisions
function ballUpdated() {
  moveBall(); // Update the ball's position
  checkBrickCollision(); // Check and handle brick collisions
  checkBarCollision(); // Check and handle bar collisions
  checkWallCollision(); // Check and handle wall collisions
}

// Start the game
function start() {
  // Check if the game is over (all bricks are removed)
  if (brickCount == 0) {
    alert("Game Over! You played for " + elapsedTime + " seconds!");
    updateTimerDisplay(0);
    initGame();
    updateTimerDisplay(elapsedTime);
  }

  // Clear the canvas and redraw game elements
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawBar();
  drawBrick();

  // Move the ball if the game has started
  if (ballMoving) {
    ballUpdated();
  }
}

// Handle mouse movement to control the bar
canvas.addEventListener("mousemove", (e) => {
  if (ballMoving) {
    bar_x = e.clientX - barWidth;
  }
});

// Handle mouse click to start the game
canvas.addEventListener("click", () => {
  if (!ballMoving) {
    ballMoving = true;
    if (!timerStarted) {
      startTimer();
      timerStarted = true;
    }
  }
});

// Initialize the game and start the rendering loop
initGame();
setInterval(start, 25);
