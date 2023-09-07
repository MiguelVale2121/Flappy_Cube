const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Background
const loader = new THREE.TextureLoader();
const backgroundTexture = loader.load('path/to/your/background_texture.jpg');
const backgroundMaterial = new THREE.MeshBasicMaterial({ map: backgroundTexture });
const backgroundPlane = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), backgroundMaterial);
backgroundPlane.position.set(0, 0, -10); // Place the background behind everything
scene.add(backgroundPlane);

// Score element
const scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '10px';
scoreElement.style.left = '10px';
scoreElement.style.fontSize = '24px';
scoreElement.style.color = 'white';
document.body.appendChild(scoreElement);

// Highscores element
const highscoresElement = document.createElement('div');
highscoresElement.style.position = 'absolute';
highscoresElement.style.top = '10px';
highscoresElement.style.right = '10px';
highscoresElement.style.fontSize = '24px';
highscoresElement.style.color = 'white';
document.body.appendChild(highscoresElement);

const birdWidth = 0.7;
const birdHeight = 0.7;
const birdDepth = 0.7;

const birdGeometry = new THREE.BoxGeometry(birdWidth, birdHeight, birdDepth);
const birdMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const bird = new THREE.Mesh(birdGeometry, birdMaterial);
bird.position.set(0, 0, 0);
scene.add(bird);

const pipeGeometry = new THREE.BoxGeometry(1, 8, 1);
const pipeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const pipes = [];

let pipeDistance = 6;
const holeSize = 2.5;

let score = 0; // Score counter

// Function to update highscores
function updateHighscores(name, score) {
  const highscores = JSON.parse(localStorage.getItem('highscores')) || [];
  highscores.push({ name, score });
  highscores.sort((a, b) => b.score - a.score);
  highscores.splice(5);
  localStorage.setItem('highscores', JSON.stringify(highscores));
  updateHighscoresDisplay();
}

// Function to update highscores display
function updateHighscoresDisplay() {
  const highscores = JSON.parse(localStorage.getItem('highscores')) || [];
  highscoresElement.innerHTML = 'Highscores:<br>' + highscores.map(score => `${score.name}: ${score.score}`).join('<br>');
}

function addPipe() {
  const holeCenter = Math.random() * 6 - 3;

  const upperPipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
  upperPipe.position.set(10, holeCenter + holeSize / 2 + pipeGeometry.parameters.height / 2, 0);
  scene.add(upperPipe);
  pipes.push(upperPipe);

  const lowerPipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
  lowerPipe.position.set(10, holeCenter - holeSize / 2 - pipeGeometry.parameters.height / 2, 0);
  scene.add(lowerPipe);
  pipes.push(lowerPipe);
}

function resetGame() {
  // Get player's name and update highscores before resetting the score
  const name = prompt('What is your name?');
  updateHighscores(name, score);

  gameStarted = false;
  bird.position.y = 0;
  birdVelocity = 0;

  for (const pipe of pipes) {
    scene.remove(pipe);
  }
  pipes.length = 0;

  clearInterval(pipeInterval);

  score = 0; // Reset score when game is reset
  scoreElement.innerText = "Score: " + score;

  highscoresElement.style.display = 'block'; // Show highscores
}

let gameStarted = false;

const minY = -3;
const maxY = 3;


function update() {
  if (gameStarted) {
    bird.position.y = Math.max(minY, Math.min(maxY, bird.position.y + birdVelocity));
    birdVelocity -= 0.01;

    scoreElement.innerText = "Score: " + score;

    for (let i = 0; i < pipes.length; i++) {
      pipes[i].position.x -= 0.05;

      if (pipes[i].position.x < bird.position.x && !pipes[i].passed && pipes[i].position.y > 0) {
        pipes[i].passed = true;
        score++;
        scoreElement.innerText = "Score: " + score;
      }

      const birdBox = new THREE.Box3().setFromObject(bird);
      const pipeBox = new THREE.Box3().setFromObject(pipes[i]);
      if (birdBox.intersectsBox(pipeBox)) {
        resetGame();
        break;
      }
    }

    if (bird.position.y < minY || bird.position.y > maxY) {
      resetGame();
    }
  }

}

let pipeInterval;

function startGame() {
  gameStarted = true;
  highscoresElement.style.display = 'none'; // Hide highscores
  pipeInterval = setInterval(addPipe, 1500);
}

function gameOver() {
  gameStarted = false;
}

function animate() {
  requestAnimationFrame(animate);
  update();
  renderer.render(scene, camera);
}
animate();
updateHighscoresDisplay();
// Change the event listener to listen to keydown events
window.addEventListener('keydown', (event) => {
  if (event.keyCode === 32) {
    if (!gameStarted) {
      startGame();
    }
    birdVelocity = 0.2;
  }

  if (event.keyCode === 81) { // The keyCode for 'Q' is 81
    localStorage.removeItem('highscores'); // Remove the highscores from localStorage
    updateHighscoresDisplay(); // Update the highscores display
  }
});

camera.position.z = 5;

