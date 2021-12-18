// Select Canvas
const canvas = document.createElement("canvas");
canvas.width = 600;
canvas.height = 400;
const ctx = canvas.getContext("2d");

//Get body and append canvas to it
var body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);

//gamer1 Object
const gamer1 = JSON.parse(localStorage.getItem("game"))?.gamer1 || {
  x: 0,
  y: (canvas.height - 85) / 2,
  width: 12,
  height: 85,
  color: "WHITE",
  score: 0,
};

//gamer2 Object
const gamer2 = JSON.parse(localStorage.getItem("game"))?.gamer2 || {
  x: canvas.width - 12,
  y: (canvas.height - 85) / 2,
  width: 12,
  height: 85,
  color: "WHITE",
  score: 0,
};

//Ball object
const balls = [
  {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 15,
    height: 15,
    speed: 6,
    velocityX: 6,
    velocityY: -6,
    color: "WHITE",
  },
];

//Net Object
const net = {
  x: canvas.width / 2 - 1,
  y: 0,
  width: 2,
  height: 10,
  color: "WHITE",
};

//Return game state to save on localstorage
const gameState = () => {
  const gameState = {
    gamer1,
    gamer2,
  };
  return JSON.stringify(gameState);
};
// Draw rectangle function
const drawRect = (x, y, w, h, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
};

//Draw the net function
const drawNet = () => {
  for (let i = 0; i < canvas.height; i += 15) {
    drawRect(net.x, net.y + i, net.width, net.height, net.color);
  }
};

//Draw text function
const drawText = (text, x, y, color) => {
  ctx.fillStyle = color;
  ctx.font = "45px fantasy";
  ctx.fillText(text, x, y);
};

//Render the game
const render = () => {
  //Clear the canvas
  drawRect(0, 0, canvas.width, canvas.height, "BLACK");

  //Draw the net
  drawNet();

  //Draw score
  drawText(gamer1.score, canvas.width / 4, canvas.height / 5, "WHITE");
  drawText(gamer2.score, (3 * canvas.width) / 4, canvas.height / 5, "WHITE");

  //Draw the gamer1 and gamer2 paddles
  drawRect(gamer1.x, gamer1.y, gamer1.width, gamer1.height, gamer1.color);
  drawRect(gamer2.x, gamer2.y, gamer2.width, gamer2.height, gamer2.color);

  //Draw the balls
  balls.map((ball) => {
    drawRect(ball.x, ball.y, ball.width, ball.height, ball.color);
  });
};

//Function that moves paddle
const movePaddle = (event) => {
  if (event.code == "KeyW") {
    gamer1.y -= 50;
  } else if (event.code == "KeyS") {
    gamer1.y += 50;
  } else if (event.code == "ArrowUp") {
    gamer2.y -= 50;
  } else if (event.code == "ArrowDown") {
    gamer2.y += 50;
  } else if (event.code == "Space") {
    const newBall = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      width: 15,
      height: 15,
      speed: 6,
      velocityX: 6,
      velocityY: -6,
      color: "WHITE",
    };
    balls.push(newBall);
  }
};

//Control the gamer paddles
document.addEventListener("keyup", movePaddle);

//Detect horizontal collision
const isCollidedHorizontaly = (ball) =>
  ball.y + ball.height > canvas.height || ball.y < 0;

//Detect vertical collision
const isCollidedVertically = (b, p) => {
  b.top = b.y;
  b.bottom = b.y + b.height;
  b.right = b.x + b.width;
  b.left = b.x;

  p.top = p.y;
  p.bottom = p.y + p.height;
  p.right = p.x + p.width;
  p.left = p.x;

  //Check if the ball hits the paddles
  return (
    b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom
  );
};

//Reset ball
const resetBall = (ball) => {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  const random = Math.floor(Math.random() * (150 - 30 + 1) + 30);
  ball.speed = 6;
  ball.velocityX = ball.speed * Math.cos(random);
  ball.velocityY = ball.speed * Math.sin(random);
};

//Update game function
const update = () => {
  balls.map((ball) => {
    ball.x = ball.x + ball.velocityX;
    ball.y = ball.y + ball.velocityY;

    //Check if ball hits the upper and lower bounds
    if (isCollidedHorizontaly(ball)) ball.velocityY = -ball.velocityY;

    //Decide wich player's hit
    let player = ball.x < canvas.width / 2 ? gamer1 : gamer2;
    //Change to velocity if hits the paddle
    if (isCollidedVertically(ball, player)) {
      //Where the ball hit paddle
      let collidePoint = ball.y - (player.y + player.height / 2);

      //Normalization
      collidePoint = collidePoint / (player.height / 2);

      //Calculate the angle in Radian
      let angleRad = (collidePoint * Math.PI) / 4;

      //Direction of the ball when hit a paddle
      let direction = ball.x < canvas.width / 2 ? 1 : -1;

      //Change the velocity of X and Y
      ball.velocityX = direction * ball.speed * Math.cos(angleRad);
      ball.velocityY = ball.speed * Math.sin(angleRad);
    }
    //Decide who scored based on ball location
    if (ball.x < 0) {
      gamer2.score++;
      resetBall(ball);
    } else if (ball.x + ball.width > canvas.width) {
      gamer1.score++;
      resetBall(ball);
    }
  });

  localStorage.setItem("game", gameState());
};

//End of the game
const finishGame = () => {
  const winner = gamer1.score == 5 ? "gamer1" : "gamer2";

  drawRect(0, 0, canvas.width, canvas.height, "BLACK");
  drawText(winner, canvas.width / 2 - 30, canvas.height / 2 - 30, "WHITE");
  localStorage.removeItem("game");
};

//Game initialization function
const game = () => {
  if (gamer1.score == 5 || gamer2.score == 5) {
    clearInterval(gameInterval);
    finishGame();
    return;
  }

  update();
  render();
};

//Game loop
const framePerSecond = 50;
const gameInterval = setInterval(game, 1000 / framePerSecond);
