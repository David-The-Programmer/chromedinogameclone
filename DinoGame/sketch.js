// Width of the canvas
const CANVAS_WIDTH = 800;

// Height of the canvas
const CANVAS_HEIGHT = 300;

// Width of the dino
const DINO_WIDTH = 36;

// Height of the Dino
const DINO_HEIGHT = 42;

// width of the dino when ducking
const DINO_DUCK_WIDTH = 50;

// height of the dino when ducking
const DINO_DUCK_HEIGHT = 26;

// x position of the dino
const X_OF_DINO = 100;

// y coordinate of the ground level
const Y_OF_GROUND = CANVAS_HEIGHT * (3/4);

// starting y postion of the dino
const Y_OF_DINO = Y_OF_GROUND - DINO_HEIGHT;

// starting upward force
const LIFT = -1.1;

// downward force
const GRAVITY = 0.4;

// minimum width of the obstacle
const MIN_CACTUS_WIDTH = 15;

// minimum HEIGHT of the obstacle
const MIN_CACTUS_HEIGHT = 30;

// mid width of the obstacle
const MID_CACTUS_WIDTH = 30;

// mid HEIGHT of the obstacle
const MID_CACTUS_HEIGHT = 20;

// maximum width of the obstacle
const MAX_CACTUS_WIDTH = 20;

// maximum HEIGHT of the obstacle
const MAX_CACTUS_HEIGHT = 40;

const BIRD_WIDTH = 40;

const BIRD_HEIGHT = 34;

// y coordinate of the line above the ground
const Y_OF_GROUND_LINE = Y_OF_GROUND - 5;

// diameter of the dirt
const DIRT_DIAMETER = 0.5;

// minimum width between each obstacles
const MIN_DIST_BTWN_OBS = DINO_WIDTH * 8;

function preload() {
  dinoRunImg1 = loadImage('data/dinorun0000.png');
  dinoRunImg2 = loadImage('data/dinorun0001.png');
  dinoJumpImg = loadImage('data/dino0000.png');
  smallCactusImg = loadImage('data/cactusSmall0000.png');
  manySmallCactusImg = loadImage('data/cactusSmallMany0000.png');
  largeCactusImg = loadImage('data/cactusBig0000.png');
  dinoDeadImg = loadImage('data/dinoDead0000.png');
  dinoDuckImg1 = loadImage('data/dinoduck0000.png');
  dinoDuckImg2 = loadImage('data/dinoduck0001.png');
  birdImg1 = loadImage('data/berd.png');
  birdImg2 = loadImage('data/berd2.png');
}

function setup() {
  canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.position((windowWidth / 2) - (CANVAS_WIDTH / 2),  (windowHeight / 2) - CANVAS_HEIGHT);
  instructions = createP('Press on the up arrow key to make the dino jump, down arrow key to make the dino duck');
  instructions.position(canvas.x, canvas.y + CANVAS_HEIGHT);

  dino = new Dino(X_OF_DINO, Y_OF_DINO, DINO_WIDTH, DINO_HEIGHT, 0);
  obstacle.push(new Obstacle(CANVAS_WIDTH, Y_OF_GROUND - MID_CACTUS_HEIGHT, MID_CACTUS_WIDTH, MID_CACTUS_HEIGHT));
}

function draw() {
  background(255);
  stroke(0);
  line(0, Y_OF_GROUND_LINE, CANVAS_WIDTH, Y_OF_GROUND_LINE);
  dinoMovement();
  checkForCollision();



  // since the game (i assume) run at 60 fps, thus for every 1/6 second, check if the space between the previous obstacle
  // and the new obstacle is >= than the min distance to prevent the obstacles for being too close
  if(frameCount % 10 == 0) {
    if(obstacle.length != 0) {
      if(CANVAS_WIDTH - (obstacle[obstacle.length - 1].x + obstacleWidth)  >= MIN_DIST_BTWN_OBS) {
        createObstacle();
      }
    }

  }

  obstacleSpeed -= 0.0002;

 // every 5 seconds, increase both the lift and gravity to allow to player to adapt to increasing speed of the obstacles
  if(frameCount % 300 == 0) {
    downwardForce += 0.002;
    startingUpwardForce -= 0.002;

  }

  obstacleMovement();
  removeObstacles();

  timer++;

  fill(0);
  text("Score: " + score, CANVAS_WIDTH * 9/10, CANVAS_HEIGHT / 3);
  text("High Score: " + highScore, CANVAS_WIDTH * 7/10, CANVAS_HEIGHT / 3);

  // previous score is needed to ensure that highScore would reflect the correct high score
  previousScore = score;
  score++;





}
 // function for just resetting the game
function keyPressed() {
  if(collide && (keyCode == UP_ARROW || keyCode == DOWN_ARROW)) {
    removeAllObstacles();
    dino.draw(dinoRunImg1);
    collide = false;
    if(previousScore > highScore) {
      highScore = previousScore;
    }

    resetVariables();
    createObstacle();
    loop();
  }

}

function dinoMovement() {
  if(collide) {
    // if the dino is in ducking mode while colliding with any obstacle, reset its dimensions and y coordinate to default
    if(dino.width == DINO_DUCK_WIDTH) {
      dino.width = DINO_WIDTH;
      dino.height = DINO_HEIGHT;
      dino.y = Y_OF_DINO;
    }
    dino.draw(dinoDeadImg);
    text("Game Over", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    noLoop();
  } else if(keyIsPressed && keyCode == DOWN_ARROW && jumpSequence == 0) {
    dino.width = DINO_DUCK_WIDTH;
    dino.height = DINO_DUCK_HEIGHT;
    dino.y = Y_OF_DINO + (DINO_HEIGHT - DINO_DUCK_HEIGHT);
    if(timer >= 0 && timer < 5 ) {
      dino.draw(dinoDuckImg1);
    } else if(timer >= 5 && timer < 10) {
      dino.draw(dinoDuckImg2);
    } else {
      timer = 0;
      dino.draw(dinoDuckImg1);
    }

    // if the player has pressed the down key and jumpSequence == 0, set it to 1 to indicate that the dino goes upwards
  } else if(keyIsPressed && jumpSequence == 0 && keyCode == UP_ARROW) {
    jumpSequence = 1;
    // extremely impt to do this to prevent the flickering problem of the program not drawing the dino for one frame
    dino.draw(dinoJumpImg);

  } else if(jumpSequence == 1) {
    // while the dino has not reached the maximum height, continue to lift dino
    if(dino.y > CANVAS_HEIGHT / 3) {
      dino.draw(dinoJumpImg);
      dino.lift(upwardForce);
      dino.y += dino.velocity;
      checkJumpSequence();
      upwardForce += 0.05;
    }
  } else if(jumpSequence == 2 && dino.y + DINO_HEIGHT < Y_OF_GROUND) {
    dino.draw(dinoJumpImg);
    dino.fall(downwardForce);
    dino.y += dino.velocity;
    checkJumpSequence();
  } else {
    dino.width = DINO_WIDTH;
    dino.height = DINO_HEIGHT;
    dino.y = Y_OF_DINO;
    if(timer >= 0 && timer < 5 ) {
      dino.draw(dinoRunImg1);
    } else if(timer >= 5 && timer < 10) {
      dino.draw(dinoRunImg2);
    } else {
      timer = 0;
      dino.draw(dinoRunImg1);
    }

  }
}


// function to check the sequences of the jump sequence
function checkJumpSequence() {
  if(dino.y < CANVAS_HEIGHT / 3) {
    // after dino reaches the max height, set numKeyPrsd to 2 to indicate that the dino should drop
    dino.y = CANVAS_HEIGHT / 3;
    if(jumpSequence == 1) {
      jumpSequence = 2;
    }
    dino.velocity = 0;


  } else if(dino.y + DINO_HEIGHT >= Y_OF_GROUND) {
    // after the dino reaches the ground again, set the numKeyPrsd to 0 such that the sequence can start again
    dino.y = Y_OF_GROUND - DINO_HEIGHT;
    jumpSequence = 0;
    dino.velocity = 0;
    upwardForce = startingUpwardForce;
  }
}

// function to check for collision between dino and obstacles
function checkForCollision() {
  for(let i = 0; i < obstacle.length; i++) {
    if(obstacle[i].width == BIRD_WIDTH && obstacle[i].height == BIRD_HEIGHT) {
      if(dino.x + dino.width > obstacle[i].x + (obstacle[i].width / 3) && dino.x < obstacle[i].x + (obstacle[i].width * (2/3)) ) {
        if(dino.y < obstacle[i].y + (obstacle[i].height * (2/3)) && dino.y + dino.height > obstacle[i].y + (obstacle[i].width / 3)) {
          collide = true;
        }
      }
    } else {
      if(dino.x + dino.width > obstacle[i].x + (obstacle[i].width / 3) && dino.x < obstacle[i].x + (obstacle[i].width * (2/3)) ) {
        if(dino.y + dino.height > obstacle[i].y + (obstacle[i].height / 3)) {
          collide = true;
        }
      }
    }

  }


}

// function for the movement of the obstacles
function obstacleMovement() {
  for(let i = 0; i < obstacle.length; i++) {
    if(obstacle[i].width == MIN_CACTUS_WIDTH && obstacle[i].height == MIN_CACTUS_HEIGHT) {
      obstacle[i].draw(smallCactusImg);

    } else if(obstacle[i].width == MID_CACTUS_WIDTH && obstacle[i].height == MID_CACTUS_HEIGHT) {
      obstacle[i].draw(manySmallCactusImg);

    } else if(obstacle[i].width == MAX_CACTUS_WIDTH && obstacle[i].height == MAX_CACTUS_HEIGHT){
      obstacle[i].draw(largeCactusImg);

    } else if(obstacle[i].width == BIRD_WIDTH && obstacle[i].height == BIRD_HEIGHT) {
      if(timer >= 0 && timer < 5 ) {
        obstacle[i].draw(birdImg1);
      } else if(timer >= 5 && timer < 10) {
        obstacle[i].draw(birdImg2);
      } else {
        timer = 0;
        obstacle[i].draw(birdImg1);
      }
    }
    obstacle[i].move(obstacleSpeed);

  }

}

// function for creating more obstacles
function createObstacle() {
  pickObstacleDimensions();
  obstacle.push(new Obstacle(CANVAS_WIDTH + Math.floor(random(0, 120)), yOfObstacles, obstacleWidth, obstacleHeight));
}

// function to determine the width and height of the obstacle
function pickObstacleDimensions() {
  // variable to decide which of the four dimensions to use for creating the obstacle
  let dimensionOfIndex = Math.floor(random(0, 4));

  if(dimensionOfIndex == 0) {
    obstacleWidth = MIN_CACTUS_WIDTH;
    obstacleHeight = MIN_CACTUS_HEIGHT;
    yOfObstacles = Y_OF_GROUND - obstacleHeight;

  } else if(dimensionOfIndex == 1) {
    obstacleWidth = MID_CACTUS_WIDTH;
    obstacleHeight = MID_CACTUS_HEIGHT;
    yOfObstacles = Y_OF_GROUND - obstacleHeight;

  } else if(dimensionOfIndex == 2) {
    obstacleWidth = MAX_CACTUS_WIDTH;
    obstacleHeight = MAX_CACTUS_HEIGHT;
    yOfObstacles = Y_OF_GROUND - obstacleHeight;

  } else if(dimensionOfIndex == 3) {
    obstacleWidth = BIRD_WIDTH;
    obstacleHeight = BIRD_HEIGHT;
    pickYOfBird();

  }
}

 // function to pick the y coordinates of the birds
 function pickYOfBird() {
   let yOfBird = Math.floor(random(0, 3));
   // zero being the lowest height the bird is placed at, let the bird be just above the ground
   if(yOfBird == 0) {
     yOfObstacles = Y_OF_GROUND - obstacleHeight;

   } else if(yOfBird == 1) {
     yOfObstacles = Y_OF_GROUND - DINO_DUCK_HEIGHT - obstacleHeight;

   } else {
     yOfObstacles = Y_OF_GROUND - DINO_HEIGHT - obstacleHeight;
   }
 }

// function for removing the obstacles from the screen
function removeObstacles() {
  if(obstacle[0] != null) {
    if(obstacle[0].x + obstacle[0].width <= 0) {
      obstacle.splice(0, 1);
    }
  }

}

// function to remove all obstacles
function removeAllObstacles() {
  for(let i = obstacle.length; i >= 0; i--) {
    obstacle.splice(i, 1);
  }
}

// function to reset variables invloved with the movement of the dino and obstacles
function resetVariables() {
  score = 0;
  jumpSequence = 0;
  obstacleSpeed = -8
  upwardForce = LIFT;
  startingUpwardForce = LIFT;
  downwardForce = GRAVITY;
  timer = 0;
}



// dino object
let dino;

// dino running img 1
let dinoRunImg1;

// dino running img 2
let dinoRunImg2;

// dino jump img
let dinoJumpImg;

// dino dead img
let dinoDeadImg;

let dinoDuckImg1;

let dinoDuckImg2;

let smallCactusImg;

let manySmallCactusImg;

let largeCactusImg;

let birdImg1;

let birdImg2;

// obstacle objects
let obstacle = [];

let jumpSequence = 0;

// y coordinate of the obstacles
let yOfObstacles;

// obstacleWidth
let obstacleWidth = MID_CACTUS_WIDTH;

// obstacleHeight
let obstacleHeight;

// obstacle speed
let obstacleSpeed = -8;

let upwardForce = LIFT;

let startingUpwardForce = LIFT;

let downwardForce = GRAVITY;

let timer = 0;

// boolean to determine if the dino has collided with the obstacles
let collide = false;

let score = 0;

// canvas object
let canvas;

let previousScore;

let highScore = 0;

let instructions;
