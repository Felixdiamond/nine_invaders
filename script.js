import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyCpraJx7F3MlhEiq0mSm0Zy20CBJCxaGqE",
  authDomain: "nine-invaders.firebaseapp.com",
  projectId: "nine-invaders",
  storageBucket: "nine-invaders.appspot.com",
  messagingSenderId: "234584173436",
  appId: "1:234584173436:web:e4640932abf8235b9692f9",
};
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const leaderboardRef = collection(db, "leaderboard");

// Function to write player data to Firestore
async function writePlayerData(playerName, score) {
  try {
    // Query for documents with the given playerName
    const q = query(leaderboardRef, where("name", "==", playerName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.size > 0) {
      // Name already exists
      alert("Player name already exists. Please choose a different name.");
      return; // Exit the function without adding data
    }

    // If name doesn't exist, proceed with adding the new document
    const newPlayerDoc = await addDoc(leaderboardRef, {
      name: playerName,
      score: score,
    });
    console.log("Document written with ID:", newPlayerDoc.id);

    // Refresh the leaderboard (adapt based on your existing readData function)
    readData();
  } catch (error) {
    console.error("Error adding document:", error);
  }
}

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.querySelector("#score");
const modal = document.getElementById("myModal");
const leaderboardBtn = document.querySelector(".leaderboard-button");
const closeBtn = document.querySelector(".close");

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0,
    };

    this.rotation = 0;
    this.opacity = 1;

    const image = new Image();
    image.src = "./assets/spaceship.png";
    image.onload = () => {
      let scale = 0.15;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 30,
      };
    };
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(
      player.position.x + player.width / 2,
      player.position.y + player.height / 2
    );
    ctx.rotate(this.rotation);
    ctx.translate(
      -player.position.x - player.width / 2,
      -player.position.y - player.height / 2
    );
    if (this.image) {
      ctx.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }
    ctx.restore();
  }

  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
    }
  }
}

class Projectile {
  constructor({ position, velocity, radius }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Particle {
  constructor({ position, velocity, radius, color, fades }) {
    this.position = position;
    this.velocity = velocity;

    this.radius = radius;
    this.color = color;
    this.opacity = 1;
    this.faades = fades;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      Math.PI * 2,
      false
    );
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.faades) {
      this.opacity -= 0.01;
    }
  }
}

class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.width = 3;
    this.height = 10;
  }

  draw() {
    ctx.fillStyle = "#BAA0DE";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Invader {
  constructor({ position }) {
    this.velocity = {
      x: 0,
      y: 0,
    };

    const image = new Image();
    image.src = "./assets/invader.png";
    image.onload = () => {
      let scale = 1;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }

  draw() {
    if (this.image) {
      ctx.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }
    ctx.restore();
  }

  update({ velocity }) {
    if (this.image) {
      this.draw();
      this.position.x += velocity.x;
      this.position.y += velocity.y;
    }
  }

  shoot(InvaderProjectiles) {
    InvaderProjectiles.push(
      new InvaderProjectile({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: {
          x: 0,
          y: 3,
        },
      })
    );
  }
}

class PowerUp {
  constructor({ position, image, type }) {
    this.position = position;
    this.image = new Image();
    this.image.src = image;
    this.width = 30;
    this.height = 30;
    this.type = type;
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    this.draw();
    this.position.y += 3;
  }
}

class Grid {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    };

    this.velocity = {
      x: 3,
      y: 0,
    };

    this.invaders = [];

    const columns = Math.floor(Math.random() * 10 + 5);
    const rows = Math.floor(Math.random() * 5 + 3);

    this.width = columns * 30;

    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        this.invaders.push(new Invader({ position: { x: i * 30, y: j * 30 } }));
      }
    }
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity.y = 0;

    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 30;
    }
  }
}

const player = new Player();
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const particles = [];
const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  space: {
    pressed: false,
  },
};

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500);
let spawnInterval = Math.floor(Math.random() * 1000 + 600);
let game = {
  over: false,
  active: true,
};
let score = 0;
let bulletSizeEffectDuration = 0;
let slowmoEffectDuration = 0;
let bulletSizePowerUpActive = false;

let gamepowerups = [];

for (let i = 0; i < 100; i++) {
  particles.push(
    new Particle({
      position: {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
      },
      velocity: {
        x: 0,
        y: 1,
      },
      radius: Math.random() * 2,
      color: "white",
    })
  );
}

function createParticles({ object, color, fades }) {
  for (let i = 0; i < 10; i++) {
    particles.push(
      new Particle({
        position: {
          x: object.position.x + object.width / 2,
          y: object.position.y + object.height / 2,
        },
        velocity: {
          x: Math.random() * 4 - 2,
          y: Math.random() * 4 - 2,
        },
        radius: Math.random() * 3,
        color: color || "#BAA0DE",
        fades,
      })
    );
  }
}

/**
 * Animates the game by updating the game state and rendering the game elements.
 */
function animate() {
  if (!game.active) return;
  requestAnimationFrame(animate);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  particles.forEach((particle, index) => {
    if (particle.position.y - particle.radius >= canvas.height) {
      setTimeout(() => {
        particle.position.x = Math.random() * canvas.width;
        particle.position.y = -particle.radius;
      }, 0);
    }
    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(index, 1);
      }, 0);
    } else {
      particle.update();
    }
  });

  invaderProjectiles.forEach((projectile, index) => {
    if (projectile.position.y + projectile.height >= canvas.height) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
      }, 0);
    } else {
      projectile.update();
    }

    if (
      projectile.position.y + projectile.height >= player.position.y &&
      projectile.position.x + projectile.width >= player.position.x &&
      projectile.position.x <= player.position.x + player.width
    ) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
        player.opacity = 0;
        game.over = true;
      }, 0);
      setTimeout(() => {
        game.active = false;
      }, 1000);
      console.log("Game Over");
      createParticles({
        object: player,
        color: "white",
        fades: true,
      });
      modal.style.display = "block";
    }
  });
  gamepowerups.forEach((powerup, index) => {
    if (powerup.position.y + powerup.height >= canvas.height) {
      setTimeout(() => {
        gamepowerups.splice(index, 1);
      }, 0);
    } else {
      powerup.update();
    }
  });
  projectiles.forEach((projectile) => {
    projectile.position.y + projectile.radius < 0
      ? setTimeout(() => {
          projectiles.shift();
        }, 0)
      : projectile.update();
  });
  grids.forEach((grid, gridIndex) => {
    grid.update();
    if (frames % 100 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
        invaderProjectiles
      );
    }
    grid.invaders.forEach((invader, i) => {
      invader.update({ velocity: grid.velocity });
      projectiles.forEach((projectile, j) => {
        if (
          projectile.position.y - projectile.radius <=
            invader.position.y + invader.height &&
          projectile.position.x + projectile.radius >= invader.position.x &&
          projectile.position.x - projectile.radius <=
            invader.position.x + invader.width &&
          projectile.position.y + projectile.radius >= invader.position.y
        ) {
          setTimeout(() => {
            const invaderFound = grid.invaders.find((invader2) => {
              return invader2 === invader;
            });
            const projectileFound = projectiles.find((projectile2) => {
              return projectile2 === projectile;
            });

            if (invaderFound && projectileFound) {
              score += 10;
              scoreElement.innerText = score;
              createParticles({
                object: invader,
                fades: true,
              });
              grid.invaders.splice(i, 1);
              projectiles.splice(j, 1);
            }

            if (grid.invaders.length > 0) {
              const firstInvader = grid.invaders[0];
              const lastInvader = grid.invaders[grid.invaders.length - 1];

              grid.width =
                lastInvader.position.x -
                firstInvader.position.x +
                lastInvader.width;
              grid.position.x = firstInvader.position.x;
            } else {
              grids.splice(gridIndex, 1);
            }
          }, 0);
        }
        gamepowerups.forEach((powerup, index) => {
          if (
            projectile.position.y - projectile.radius <=
              powerup.position.y + powerup.height &&
            projectile.position.x + projectile.radius >= powerup.position.x &&
            projectile.position.x - projectile.radius <=
              powerup.position.x + powerup.width &&
            projectile.position.y + projectile.radius >= powerup.position.y
          ) {
            setTimeout(() => {
              createParticles({
                object: powerup,
                fades: true,
                color: "green",
              });
              gamepowerups.splice(index, 1);
              projectiles.splice(j, 1); // Remove the projectile that hit the power-up

              if (powerup.type === "bulletsize") {
                console.log("Collected bulletsize power-up");
                projectiles.forEach((projectile) => {
                  projectile.radius = 20;
                });
                bulletSizeEffectDuration = 600; // 10 seconds
                bulletSizePowerUpActive = true; // Set the flag to true
              } else if (powerup.type === "slowmo") {
                grids.forEach((grid) => {
                  grid.velocity.x = 1;
                });
                slowmoEffectDuration = 300; // 5 seconds
              }
            }, 0);
          }
        });
      });
    });
  });

  if (keys.a.pressed && player.position.x >= 0) {
    player.velocity.x = -5;
    player.rotation = -0.15;
  } else if (
    keys.d.pressed &&
    player.position.x + player.width <= canvas.width
  ) {
    player.velocity.x = 5;
    player.rotation = 0.15;
  } else {
    player.velocity.x = 0;
    player.rotation = 0;
  }

  if (frames % randomInterval === 0) {
    grids.push(new Grid());
    frames = 0;
    randomInterval = Math.floor(Math.random() * 500 + 500);
  }

  if (frames % spawnInterval === 0 && frames > 0) {
    let powerups = [
      new PowerUp({
        position: {
          x: Math.random() * canvas.width,
          y: 0,
        },
        image: "./assets/bulletsize.png",
        type: "bulletsize",
      }),
      new PowerUp({
        position: {
          x: Math.random() * canvas.width,
          y: 0,
        },
        image: "./assets/hourglass.png",
        type: "slowmo",
      }),
    ];
    gamepowerups.push(powerups[Math.floor(Math.random() * powerups.length)]);
  }

  if (bulletSizeEffectDuration > 0) {
    bulletSizeEffectDuration--;
    if (bulletSizeEffectDuration === 0) {
      console.log("Resetting bullet size");
      projectiles.forEach((projectile) => {
        projectile.radius = 3;
      });
      bulletSizePowerUpActive = false; // Reset the flag
    }
  }

  // Reset "slowmo" effect
  if (slowmoEffectDuration > 0) {
    slowmoEffectDuration--;
    if (slowmoEffectDuration === 0) {
      grids.forEach((grid) => {
        grid.velocity.x = 3;
      });
    }
  }

  console.log(gamepowerups, frames);
  frames++;
}

animate();

addEventListener("keydown", ({ key }) => {
  if (game.over) return;
  switch (key) {
    case "a":
    case "ArrowLeft":
      keys.a.pressed = true;
      break;
    case "d":
    case "ArrowRight":
      keys.d.pressed = true;
      break;
    case " ":
      const projectileRadius = bulletSizePowerUpActive ? 20 : 3; // Determine the radius based on the power-up state
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + player.width / 2,
            y: player.position.y,
          },
          velocity: {
            x: 0,
            y: -10,
          },
          radius: projectileRadius, // Pass the radius as a parameter
        })
      );
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "a":
    case "ArrowLeft":
      keys.a.pressed = false;
      break;
    case "d":
    case "ArrowRight":
      keys.d.pressed = false;
      break;
    case " ":
      console.log("pew pew");
      break;
  }
});


leaderboardBtn.addEventListener("click", () => {
  let nameInput = document.querySelector(".name-input");
  let name = nameInput.value;
  writePlayerData(name, score);
  modal.style.display = "none";
  nameInput.value = "";
  setTimeout(() => {
  window.location.href = "leaderboard.html";
  }
  , 2000);
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});