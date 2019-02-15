// Width of the canvas
const CANVAS_WIDTH = 800;

// Height of the canvas
const CANVAS_HEIGHT = 300;

// Width of the dino
const DINO_WIDTH = 36;

// Height of the Dino
const DINO_HEIGHT = 42;

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
const MIN_OBS_WIDTH = 15;

// minimum HEIGHT of the obstacle
const MIN_OBS_HEIGHT = 30;

// mid width of the obstacle
const MID_OBS_WIDTH = 30;

// mid HEIGHT of the obstacle
const MID_OBS_HEIGHT = 20;

// maximum width of the obstacle
const MAX_OBS_WIDTH = 20;

// maximum HEIGHT of the obstacle
const MAX_OBS_HEIGHT = 40;


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
}

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  dino = new Dino(X_OF_DINO, Y_OF_DINO, DINO_WIDTH, DINO_HEIGHT, 0);
  obstacle.push(new Obstacle(CANVAS_WIDTH, Y_OF_GROUND - MID_OBS_HEIGHT, MID_OBS_WIDTH, MID_OBS_HEIGHT));
}

function draw() {
  background(255);
  stroke(0);
  line(0, Y_OF_GROUND, CANVAS_WIDTH, Y_OF_GROUND);
  dinoMovement();
  checkForCollision();



  // since the game (i assume) run at 30 fps, thus for every 1/6 second, check if the space between the previous obstacle
  // and the new obstacle is >= than the min distance to prevent the obstacles for being too close
  if(frameCount % 10 == 0) {
    if(obstacle.length != 0) {
      if(CANVAS_WIDTH - (obstacle[obstacle.length - 1].x + obstacleWidth)  >= MIN_DIST_BTWN_OBS) {
        createObstacle();
      }
    }

  }

  obstacleSpeed -= 0.002;

 // every 10 seconds, increase both the lift and gravity to allow to player to adapt to increasing speed of the obstacles
  if(frameCount % 600 == 0) {
    downwardForce += 0.01;
    startingUpwardForce -= 0.01;

  }

  obstacleMovement();
  removeObstacles();

  text("Score: " + score, CANVAS_WIDTH * 9/10, CANVAS_HEIGHT / 3);
  score++;





}

function dinoMovement() {
  if(collide) {
    dino.draw(dinoDeadImg);
    noLoop();
  } else {
    if(timer >= 0 && timer < 5 ) {
      dino.draw(dinoRunImg1);
    } else if(timer >= 5 && timer < 10) {
      dino.draw(dinoRunImg2);
    } else {
      timer = 0;
      dino.draw(dinoRunImg1);
    }

    // if the player has pressed the key and jumpSequence == 0, set it to 1 to indicate that the dino goes upwards
    if(keyIsPressed && jumpSequence == 0) {
      jumpSequence = 1;
    } else if(jumpSequence == 1) {
      // while the dino has not reached the maximum height, continue to lift dino
      if(dino.y > CANVAS_HEIGHT / 3) {
        dino.draw(dinoJumpImg);
        dino.lift(upwardForce);
        dino.y += dino.velocity;
        checkJumpSequence();
        upwardForce += 0.05;
      }
    }

    // if jumpSequence == 2, the dino has reached the max height and now should fall
    if(jumpSequence == 2 && dino.y + DINO_HEIGHT < Y_OF_GROUND) {
      dino.draw(dinoJumpImg);
      dino.fall(downwardForce);
      dino.y += dino.velocity;
      checkJumpSequence();
    }
    timer++;
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

// function to check for collision between dino and obstacle
function checkForCollision() {
  for(let i = 0; i < obstacle.length; i++) {
    if(dino.x + DINO_WIDTH > obstacle[i].x + (obstacle[i].width / 4) && dino.x < obstacle[i].x + (obstacle[i].width * (3/4)) ) {
      if(dino.y + DINO_HEIGHT > obstacle[i].y + (obstacle[i].height / 4)) {
        collide = true;
      }
    }
  }


}

// function for the movement of the obstacles
function obstacleMovement() {
  for(let i = 0; i < obstacle.length; i++) {
    if(obstacle[i].height == MIN_OBS_HEIGHT) {
      obstacle[i].draw(smallCactusImg);
    } else if(obstacle[i].height == MID_OBS_HEIGHT) {
      obstacle[i].draw(manySmallCactusImg);
    } else if(obstacle[i].height == MAX_OBS_HEIGHT){
      obstacle[i].draw(largeCactusImg);
    }
    obstacle[i].move(obstacleSpeed);

  }

}

// function for creating more obstacles
function createObstacle() {
  pickObstacleDimensions();
  obstacle.push(new Obstacle(CANVAS_WIDTH + Math.floor(random(0, 120)), Y_OF_GROUND - obstacleHeight, obstacleWidth, obstacleHeight));
}

// function to determine the width and height of the obstacle
function pickObstacleDimensions() {
  // variable to decide which of the three dimensions to use for creating the obstacle
  let dimensionIndex = Math.floor(random(0, 3));

  if(dimensionIndex == 0) {
    obstacleWidth = MIN_OBS_WIDTH;
    obstacleHeight = MIN_OBS_HEIGHT;

  } else if(dimensionIndex == 1) {
    obstacleWidth = MID_OBS_WIDTH;
    obstacleHeight = MID_OBS_HEIGHT;

  } else {
    obstacleWidth = MAX_OBS_WIDTH;
    obstacleHeight = MAX_OBS_HEIGHT;
  }
}

// function for removing the obstacles
function removeObstacles() {
  if(obstacle[0] != null) {
    if(obstacle[0].x + obstacle[0].width <= 0) {
      obstacle.splice(0, 1);
    }
  }

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

let smallCactusImg;

let manySmallCactusImg;

let largeCactusImg;

// obstacle objects
let obstacle = [];

let jumpSequence = 0;

// obstacleWidth
let obstacleWidth = MID_OBS_WIDTH;

// obstacleHeight
let obstacleHeight;

// obstacle speed
let obstacleSpeed = -5;

let upwardForce = LIFT;

let startingUpwardForce = LIFT;

let downwardForce = GRAVITY;

let timer = 0;

// boolean to determine if the dino has collided with the obstacles
let collide = false;

let score = 0;
