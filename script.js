// Initialize the canvas and context
const canvas = document.getElementById('eikon-canvas');
const ctx = canvas.getContext('2d');

// Placeholder for the eikon sprite
let eikon = {
    x: 200,
    y: 200,
    size: 50,
    frameIndex: 0, // Current frame index
    frameWidth: 32, // Width of each frame
    frameHeight: 32, // Height of each frame
    health: 100,
    cleanliness: 100,
    happiness: 100, // New happiness attribute
    frameInterval: 100 // Added frameInterval attribute
};

// Load the eikon sprite
const eikonSprite = new Image();

// Load the heart image
const heartImage = new Image();
heartImage.src = 'assets/heart.png';

// Load the cross image
const crossImage = new Image();
crossImage.src = 'assets/cross.png';

let frameInterval; // Declare a variable to store the interval ID

fetch('dex.json')
    .then(response => response.json())
    .then(data => {
        const eikonSelect = document.getElementById('eikon-select');
        data.forEach(eikon => {
            const option = document.createElement('option');
            option.value = eikon.name;
            option.textContent = eikon.name;
            eikonSelect.appendChild(option);
        });

        // Set initial eikon
        selectEikon(data[0].name);
    })
    .catch(error => console.error('Error loading JSON:', error));

function selectEikon(eikonName) {
    fetch('dex.json')
        .then(response => response.json())
        .then(data => {
            const eikonData = data.find(eikon => eikon.name === eikonName);
            eikon.frameCount = eikonData.frameCount;
            eikon.frameWidth = eikonData.frameWidth;
            eikon.frameHeight = eikonData.frameHeight;
            eikon.size = eikonData.frameWidth; // Set size to match frameWidth
            eikon.frameIndex = 0; // Reset frame index to 0
            eikon.frameInterval = eikonData.frameInterval; // Set frameInterval from JSON
            eikonSprite.src = eikonData.sprite;
            eikonSprite.onload = function() {
                drawEikon();
                clearInterval(frameInterval);
                frameInterval = setInterval(updateFrame, eikonData.frameInterval);
            };
        })
        .catch(error => console.error('Error loading JSON:', error));
}

// Function to draw the eikon
function drawEikon() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate the x position of the current frame
    const frameX = eikon.frameIndex * eikon.frameWidth;
    ctx.drawImage(
        eikonSprite,
        frameX, 0, eikon.frameWidth, eikon.frameHeight, // Source rectangle
        eikon.x - eikon.size / 2, eikon.y - eikon.size / 2, eikon.size, eikon.size // Destination rectangle
    );
    updateStatusBars();
}

// Function to update the frame index
function updateFrame() {
    eikon.frameIndex = (eikon.frameIndex + 1) % eikon.frameCount;
    drawEikon();
}

// Function to decay cleanliness
function decayCleanliness() {
    eikon.cleanliness = Math.max(0, eikon.cleanliness - 1);
    updateStatusBars();
}

// Function to decay happiness
function decayHappiness() {
    eikon.happiness = Math.max(0, eikon.happiness - 5);
    updateStatusBars();
}

// Function to update the status bars
function updateStatusBars() {
    document.getElementById('health-fill').style.width = eikon.health + '%';
    document.getElementById('cleanliness-fill').style.width = eikon.cleanliness + '%';
    document.getElementById('happiness-fill').style.width = eikon.happiness + '%'; // Update happiness bar
}

// Functions for button actions
// Add a variable to store the correct choice
let correctChoice;

// Modify the playWithEikon function
function playWithEikon() {
    console.log('Playing with the eikon...');
    // Randomly choose left or right
    correctChoice = Math.random() < 0.5 ? 'left' : 'right';

    // Create and display the left and right buttons
    const leftButton = document.createElement('button');
    leftButton.textContent = 'Left';
    leftButton.onclick = () => makeGuess('left');

    const rightButton = document.createElement('button');
    rightButton.textContent = 'Right';
    rightButton.onclick = () => makeGuess('right');

    // Append buttons to the menu
    const menu = document.getElementById('menu');
    menu.innerHTML = ''; // Clear existing buttons
    menu.appendChild(leftButton);
    menu.appendChild(rightButton);
}

// Function to handle the player's guess
function makeGuess(guess) {
    clearInterval(frameInterval); // Stop frame updates
    if (guess === correctChoice) {
        eikon.happiness = Math.min(100, eikon.happiness + 25);
        drawEikonPosition(true); // Pass true to indicate a win
        showResult('YAY!');
    } else {
        eikon.happiness = Math.min(100, eikon.happiness + 5);
        drawEikonPosition(false); // Pass false to indicate a loss
        showResult('AWW');
    }
    updateStatusBars();
}

// Function to draw the eikon on the correct side and optionally show the heart or cross
function drawEikonPosition(showHeart) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const frameX = eikon.frameIndex * eikon.frameWidth;
    const xPos = correctChoice === 'left' ? canvas.width / 4 : (3 * canvas.width) / 4;
    ctx.drawImage(
        eikonSprite,
        frameX, 0, eikon.frameWidth, eikon.frameHeight,
        xPos - eikon.size / 2, eikon.y - eikon.size / 2, eikon.size, eikon.size
    );
    // Draw the heart or cross image above the eikon
    if (showHeart) {
        ctx.drawImage(
            heartImage,
            xPos - heartImage.width / 2, eikon.y - eikon.size - heartImage.height, heartImage.width, heartImage.height
        );
    } else {
        ctx.drawImage(
            crossImage,
            xPos - crossImage.width / 2, eikon.y - eikon.size - crossImage.height, crossImage.width, crossImage.height
        );
    }
}

// Function to show the result and wait for the player to click a button
function showResult(resultText) {
    const menu = document.getElementById('menu');
    menu.innerHTML = ''; // Clear existing buttons

    const resultButton = document.createElement('button');
    resultButton.textContent = resultText;
    resultButton.onclick = () => {
        // Restore the original buttons after the result
        menu.innerHTML = `
            <button onclick="feedEikon()">Feed</button>
            <button onclick="playWithEikon()">Play</button>
            <button onclick="cleanEikon()">Clean</button>
        `;
        frameInterval = setInterval(updateFrame, eikon.frameInterval); // Use frameInterval from JSON
    };

    menu.appendChild(resultButton);
}

function cleanEikon() {
    console.log('Cleaning the eikon...');
    eikon.cleanliness = Math.min(100, eikon.cleanliness + 10);
    updateStatusBars();
}

// Function to get a random interval between min and max milliseconds
function getRandomInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
