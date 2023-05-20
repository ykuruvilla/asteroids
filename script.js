const FPS = 30; // frames per second
const SHIP_SIZE = 30; // ship height
const TURN_SPEED = 360; // turn speed in degrees per second
const SHIP_THRUST = 5; // acceleration of the ship
const FRICTION = 0.7; // friction coefficient
const ASTEROID_NUM = 10; // starting number of asteroids
const ASTEROID_SIZE = 100; //starting size of asteroids
const ASTEROID_SPEED = 50; // max starting speed of asteroids
const ASTEROID_VERTICES = 10; //average number of vertices on each asteroid
const ASTEROID_JAG = 0.4; //jaggedness of the asteroids

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

let asteroids = [];

const createAsteroidBelt = () => {
  asteroids = [];
  let x, y;
  for (let i = 0; i < ASTEROID_NUM; i++) {
    do {
      x = Math.floor(Math.random() * canvas.width);
      y = Math.floor(Math.random() * canvas.height);
    } while (
      distBetweenPoints(ship.x, ship.y, x, y) <
      (ASTEROID_SIZE / 2 + SHIP_SIZE / 2) * 2
    );
    asteroids.push(newAsteroid(x, y));
  }
};
const distBetweenPoints = (x1, y1, x2, y2) =>
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

const newAsteroid = (x, y) => {
  const asteroid = {
    x: x,
    y: y,
    xVelocity:
      ((Math.random() * ASTEROID_SPEED) / FPS) * (Math.random() < 0.5 ? 1 : -1),
    yVelocity:
      ((Math.random() * ASTEROID_SPEED) / FPS) * (Math.random() < 0.5 ? 1 : -1),
    radius: ASTEROID_SIZE / 2,
    a: Math.random() * Math.PI * 2,
    vertices: Math.floor(
      Math.random() * (ASTEROID_VERTICES + 1) + ASTEROID_VERTICES / 2
    ),
    offset: [],
  };
  //create the vertex offsets array

  for (let i = 0; i < asteroid.vertices; i++) {
    asteroid.offset.push(Math.random() * ASTEROID_JAG * 2 + 1 - ASTEROID_JAG);
  }

  return asteroid;
};
createAsteroidBelt();

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

  //draw the asteroids
  ctx.strokeStyle = "slategrey";
  ctx.lineWidth = SHIP_SIZE / 20;
  let x, y, radius, a, vertices, offset;
  for (let i = 0; i < asteroids.length; i++) {
    x = asteroids[i].x;
    y = asteroids[i].y;
    radius = asteroids[i].radius;
    a = asteroids[i].a;
    vertices = asteroids[i].vertices;
    offset = asteroids[i].offset;

    ctx.beginPath();
    ctx.moveTo(
      x + radius * offset[0] * Math.cos(a),
      y + radius * offset[0] * Math.sin(a)
    );

    for (let j = 1; j < vertices; j++) {
      ctx.lineTo(
        x + radius * offset[j] * Math.cos(a + (j * Math.PI * 2) / vertices),
        y + radius * offset[j] * Math.sin(a + (j * Math.PI * 2) / vertices)
      );
    }
    ctx.closePath();
    ctx.stroke();

    //move the asteroids
    asteroids[i].x += asteroids[i].xVelocity;
    asteroids[i].y += asteroids[i].yVelocity;

    //handle edge of screen
    if (asteroids[i].x < 0 - asteroids[i].radius) {
      asteroids[i].x = canvas.width + asteroids[i].radius;
    } else if (asteroids[i].x > canvas.width + asteroids[i].radius) {
      asteroids[i].x = 0 - asteroids[i].radius;
    }

    if (asteroids[i].y < 0 - asteroids[i].radius) {
      asteroids[i].y = canvas.height + asteroids[i].radius;
    } else if (asteroids[i].y > canvas.height + asteroids[i].radius) {
      asteroids[i].y = 0 - asteroids[i].radius;
    }
  }

  //center dot
  ctx.fillStyle = "red";
  ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
};

setInterval(update, 1000 / FPS);
