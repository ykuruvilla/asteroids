const FPS = 30; // frames per second
const SHIP_SIZE = 30; // ship height
const TURN_SPEED = 360; // turn speed in degrees per second
const SHIP_THRUST = 5; // acceleration of the ship
const SHIP_EXPLODE_DURATION = 0.3; //duration of the ship's explosion
const SHIP_INV_DURATION = 3; //duration of the ship's invulnerability
const SHIP_BLINK_DURATION = 0.1;
const FRICTION = 0.7; // friction coefficient
const ASTEROID_NUM = 4; // starting number of asteroids
const ASTEROID_SIZE = 100; //starting size of asteroids
const ASTEROID_SPEED = 50; // max starting speed of asteroids
const ASTEROID_VERTICES = 10; //average number of vertices on each asteroid
const ASTEROID_JAG = 0.4; //jaggedness of the asteroids
const LASER_DIST = 0.5; //max dist laser can travel

const LASER_MAX = 10; //max number of lasers on the screen at once
const LASER_SPEED = 500; //laser speed in px/s
const LASER_EXPLODE_DUR = 0.1; //duration of the laser's explosion

const SHOW_CENTRE_DOT = false;
const SHOW_BOUNDING = false; //show or hide collision bounding

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const newShip = () => {
  return {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: SHIP_SIZE / 2,
    a: (90 / 180) * Math.PI,
    rotation: 0,
    isThrusting: false,
    explodeTime: 0,
    thrust: {
      x: 0,
      y: 0,
    },
    blinkTime: Math.ceil(SHIP_BLINK_DURATION * FPS),
    blinkNumber: Math.ceil(SHIP_INV_DURATION / SHIP_BLINK_DURATION),
    canShoot: true,
    lasers: [],
  };
};
let ship = newShip();

const shootLaser = () => {
  //create laser object
  if (ship.canShoot && ship.lasers.length < LASER_MAX) {
    ship.lasers.push({
      x: ship.x + (4 / 3) * ship.r * Math.cos(ship.a),
      y: ship.y - (4 / 3) * ship.r * Math.sin(ship.a),
      xVelocity: (LASER_SPEED * Math.cos(ship.a)) / FPS,
      yVelocity: -(LASER_SPEED * Math.sin(ship.a)) / FPS,
      distanceTravelled: 0,
      explodeTime: 0,
    });
  }
  //prevent further shooting
  ship.canShoot = false;
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
    asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 2)));
  }
};
const distBetweenPoints = (x1, y1, x2, y2) =>
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

const newAsteroid = (x, y, r) => {
  const asteroid = {
    x: x,
    y: y,
    xVelocity:
      ((Math.random() * ASTEROID_SPEED) / FPS) * (Math.random() < 0.5 ? 1 : -1),
    yVelocity:
      ((Math.random() * ASTEROID_SPEED) / FPS) * (Math.random() < 0.5 ? 1 : -1),
    radius: r,
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

const explodeShip = () => {
  ship.explodeTime = Math.ceil(SHIP_EXPLODE_DURATION * FPS);
};

const destroyAsteroid = (index) => {
  const x = asteroids[index].x;
  const y = asteroids[index].y;
  const r = asteroids[index].radius;

  console.log(r === Math.ceil(ASTEROID_SIZE / 2));

  //split the asteroid in two (if necessary)
  if (r === Math.ceil(ASTEROID_SIZE / 2)) {
    asteroids.push(newAsteroid(x, y, ASTEROID_SIZE / 4));
    asteroids.push(newAsteroid(x, y, ASTEROID_SIZE / 4));
  } else if (r === Math.ceil(ASTEROID_SIZE / 4)) {
    asteroids.push(newAsteroid(x, y, ASTEROID_SIZE / 8));
    asteroids.push(newAsteroid(x, y, ASTEROID_SIZE / 8));
  }

  //destroy the original asteroid that was hit
  asteroids.splice(index, 1);
};

//setup event listeners

const onKeyDown = (event) => {
  switch (event.keyCode) {
    case 32: //spacebar
      shootLaser();
      break;
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
    case 32: //spacebar
      ship.canShoot = true;
      break;
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
  const blinkOn = ship.blinkNumber % 2 === 0;
  let shipIsExploding = ship.explodeTime > 0;

  //draw space
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //draw triangular ship
  if (!shipIsExploding) {
    if (blinkOn) {
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
    }

    //handle blinking
    if (ship.blinkNumber > 0) {
      ship.blinkTime--;
      if (ship.blinkTime === 0) {
        ship.blinkTime = Math.ceil(SHIP_BLINK_DURATION * FPS);
        ship.blinkNumber--;
      }
    }
  } else {
    //draw the explosion
    ctx.fillStyle = "darkred";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
    ctx.fill();
  }

  if (SHOW_BOUNDING) {
    ctx.strokeStyle = "lime";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
    ctx.stroke();
  }

  //center dot
  if (SHOW_CENTRE_DOT) {
    ctx.fillStyle = "red";
    ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
  }

  //draw lasers
  for (let i = 0; i < ship.lasers.length; i++) {
    if (ship.lasers[i].explodeTime === 0) {
      ctx.fillStyle = "salmon";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        SHIP_SIZE / 15,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
    } else {
      //draw the explosion
      ctx.fillStyle = "orangered";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.75,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();

      ctx.fillStyle = "salmon";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.5,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();

      ctx.fillStyle = "pink";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.25,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
    }
  }

  //detect laser hitting asteroid
  let asteroidX, asteroidY, asteroidR, laserX, laserY;
  for (let i = asteroids.length - 1; i >= 0; i--) {
    asteroidX = asteroids[i].x;
    asteroidY = asteroids[i].y;
    asteroidR = asteroids[i].radius;

    //loop over lasers
    for (let j = ship.lasers.length - 1; j >= 0; j--) {
      laserX = ship.lasers[j].x;
      laserY = ship.lasers[j].y;

      //detect hits
      if (
        ship.lasers[j].explodeTime === 0 &&
        distBetweenPoints(asteroidX, asteroidY, laserX, laserY) < asteroidR
      ) {
        //destroy the asteroid and active laser explosion
        ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
        destroyAsteroid(i);

        break;
      }
    }
  }

  if (!shipIsExploding) {
    //check for collisions
    if (ship.blinkNumber === 0) {
      for (let i = 0; i < asteroids.length; i++) {
        if (
          distBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) <
          ship.r + asteroids[i].radius
        ) {
          explodeShip();
          destroyAsteroid(i);
          break;
        }
      }
    }

    //rotate ship
    ship.a += ship.rotation;

    // move the ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;
  } else {
    ship.explodeTime--;
    if (ship.explodeTime === 0) {
      ship = newShip();
    }
  }

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

  // thrust the ship

  if (ship.isThrusting) {
    ship.thrust.x += (SHIP_THRUST * Math.cos(ship.a)) / FPS;
    ship.thrust.y -= (SHIP_THRUST * Math.sin(ship.a)) / FPS;
    if (!shipIsExploding && blinkOn) {
      // draw the thruster
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
    }
  } else {
    ship.thrust.x -= (FRICTION * ship.thrust.x) / FPS;
    ship.thrust.y -= (FRICTION * ship.thrust.y) / FPS;
  }

  //move the lasers

  for (let i = ship.lasers.length - 1; i >= 0; i--) {
    //check distance travelled
    if (ship.lasers[i].distanceTravelled > LASER_DIST * canvas.width) {
      ship.lasers.splice(i, 1);
      continue;
    }
    //handle the explosion
    if (ship.lasers[i].explodeTime > 0) {
      ship.lasers[i].explodeTime--;

      //destory the laser after the duration is up
      if (ship.lasers[i].explodeTime === 0) {
        ship.lasers.splice(i, 1);
        continue;
      }
    } else {
      ship.lasers[i].x += ship.lasers[i].xVelocity;
      ship.lasers[i].y += ship.lasers[i].yVelocity;

      //calculate distance the laser has travelled
      ship.lasers[i].distanceTravelled += Math.sqrt(
        Math.pow(ship.lasers[i].xVelocity, 2) +
          Math.pow(ship.lasers[i].yVelocity, 2)
      );
    }

    //handle edge of screen (lasers)
    if (ship.lasers[i].x < 0) {
      ship.lasers[i].x = canvas.width;
    } else if (ship.lasers[i].x > canvas.width) {
      ship.lasers[i].x = 0;
    }

    if (ship.lasers[i].y < 0) {
      ship.lasers[i].x = canvas.height;
    } else if (ship.lasers[i].y > canvas.height) {
      ship.lasers[i].y = 0;
    }
  }

  //draw the asteroids

  let x, y, radius, a, vertices, offset;
  for (let i = 0; i < asteroids.length; i++) {
    ctx.strokeStyle = "slategrey";
    ctx.lineWidth = SHIP_SIZE / 20;
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

    if (SHOW_BOUNDING) {
      ctx.strokeStyle = "lime";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2, false);
      ctx.stroke();
    }
  }
  //move the asteroids
  for (let i = 0; i < asteroids.length; i++) {
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
};

setInterval(update, 1000 / FPS);
