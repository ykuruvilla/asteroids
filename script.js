const FPS = 30; // frames per second
const SHIP_SIZE = 30;
const TURN_SPEED = 360; // turn speed in degrees per second
const SHIP_THRUST = 5; // acceleration of the ship
const FRICTION = 0.7;

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  r: SHIP_SIZE / 2,
  a: (90 / 180) * Math.PI,
  rotation: 0,
  isThrusting: false,
  thrust: {
    x: 0,
    y: 0,
  },
};

//setup event listeners

const onKeyDown = (event) => {
  switch (event.keyCode) {
    case 37: //left arrow -rotate ship left
      ship.rotation = ((TURN_SPEED / 180) * Math.PI) / FPS;
      break;
    case 38: //up arrow
      ship.isThrusting = true;
      break;
    case 39: //right arrow
      ship.rotation = -((TURN_SPEED / 180) * Math.PI) / FPS;
      break;
  }
};

const onKeyUp = (event) => {
  switch (event.keyCode) {
    case 37:
      ship.rotation = 0;
      break;
    case 38:
      ship.isThrusting = false;
      break;
    case 39:
      ship.rotation = 0;
      break;
  }
};

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

//setup game loop
const update = () => {
  //draw space
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // thrust the ship

  if (ship.isThrusting) {
    ctx.fillStyle = "red";
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = SHIP_SIZE / 10;
    ctx.beginPath();
    ctx.moveTo(
      // rear left
      ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
      ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
    );
    ctx.lineTo(
      //rear centre behind the ship
      ship.x - ship.r * (5 / 3) * Math.cos(ship.a),
      ship.y + ship.r * (5 / 3) * Math.sin(ship.a)
    );
    ctx.lineTo(
      //rear right
      ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
      ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ship.thrust.x += (SHIP_THRUST * Math.cos(ship.a)) / FPS;
    ship.thrust.y -= (SHIP_THRUST * Math.sin(ship.a)) / FPS;
  } else {
    ship.thrust.x -= (FRICTION * ship.thrust.x) / FPS;
    ship.thrust.y -= (FRICTION * ship.thrust.y) / FPS;
  }

  // draw the thruster

  //draw triangular ship
  ctx.strokeStyle = "white";
  ctx.lineWidth = SHIP_SIZE / 20;
  ctx.beginPath();
  ctx.moveTo(
    // nose of the ship
    ship.x + (4 / 3) * ship.r * Math.cos(ship.a),
    ship.y - (4 / 3) * ship.r * Math.sin(ship.a)
  );
  ctx.lineTo(
    //rear left
    ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) + Math.sin(ship.a)),
    ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) - Math.cos(ship.a))
  );
  ctx.lineTo(
    //rear right
    ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) - Math.sin(ship.a)),
    ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) + Math.cos(ship.a))
  );
  ctx.closePath();
  ctx.stroke();

  //rotate ship
  ship.a += ship.rotation;

  // move the ship
  ship.x += ship.thrust.x;
  ship.y += ship.thrust.y;

  //handle edge of screen
  if (ship.x < 0 - ship.r) {
    ship.x = canvas.width + ship.r;
  } else if (ship.x > canvas.width + ship.r) {
    ship.x = 0 - ship.r;
  }
  if (ship.y < 0 - ship.r) {
    ship.y = canvas.height + ship.r;
  } else if (ship.y > canvas.height + ship.r) {
    ship.y = 0 - ship.r;
  }

  //center dot
  ctx.fillStyle = "red";
  ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
};

setInterval(update, 1000 / FPS);
