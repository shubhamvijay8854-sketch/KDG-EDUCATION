console.log("Addition Game Loaded!");

// Game State
let currentScore = 0;
let correctAnswer = 0;
let draggedItem = null;

// DOM Elements
const scoreElement = document.getElementById('score');
const num1Element = document.getElementById('num1');
const num2Element = document.getElementById('num2');
const visualAidElement = document.getElementById('visual-aid');
const optionsElement = document.getElementById('options');
const messageElement = document.getElementById('message');
const dropZone = document.getElementById('drop-zone');

function initGame() {
    setupDropZone();
    generateProblem();
}

function setupDropZone() {
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (draggedItem) {
            const val = parseInt(draggedItem.dataset.value);
            checkAnswer(val);
        }
    });
}

function generateProblem() {
    // Generate two random numbers (sum <= 20)
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;

    correctAnswer = num1 + num2;

    // Update Display
    num1Element.textContent = num1;
    num2Element.textContent = num2;

    // Reset Drop Zone
    dropZone.textContent = "?";
    dropZone.className = "drop-zone"; // Reset classes

    // Update Visuals
    updateVisuals(num1, num2);

    // Generate Options
    generateOptions(correctAnswer);

    messageElement.textContent = "";
}

function updateVisuals(n1, n2) {
    visualAidElement.innerHTML = '';

    const group1 = document.createElement('div');
    group1.className = 'star-group';
    for (let i = 0; i < n1; i++) {
        group1.innerHTML += '<div class="visual-star" style="color: #FF6B6B">★</div>';
    }

    const group2 = document.createElement('div');
    group2.className = 'star-group';
    for (let i = 0; i < n2; i++) {
        group2.innerHTML += '<div class="visual-star" style="color: #4ECDC4">★</div>';
    }

    visualAidElement.appendChild(group1);
    visualAidElement.appendChild(group2);
}

function generateOptions(correct) {
    optionsElement.innerHTML = '';

    // Create an array of 3 options including the correct one
    let options = [correct];

    while (options.length < 3) {
        let wrong = Math.floor(Math.random() * 20) + 1; // Random 1-20
        if (!options.includes(wrong) && wrong !== correct) {
            options.push(wrong);
        }
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    options.forEach(opt => {
        const btn = document.createElement('div');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.draggable = true;
        btn.dataset.value = opt;

        // Mouse Drag Events
        btn.addEventListener('dragstart', (e) => {
            draggedItem = btn;
            btn.classList.add('dragging');
        });

        btn.addEventListener('dragend', () => {
            btn.classList.remove('dragging');
            draggedItem = null;
        });

        // Touch Events for immediate drag (no long press)
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling and long-press menu
            draggedItem = btn;
            btn.classList.add('dragging');

            const touch = e.touches[0];
            const rect = btn.getBoundingClientRect();

            // Calculate offset to keep finger relative to element
            btn.dataset.offsetX = touch.clientX - rect.left;
            btn.dataset.offsetY = touch.clientY - rect.top;

            // Set initial position for absolute movement
            btn.style.position = 'fixed';
            btn.style.left = (touch.clientX - btn.dataset.offsetX) + 'px';
            btn.style.top = (touch.clientY - btn.dataset.offsetY) + 'px';
            btn.style.zIndex = '1000';
        }, { passive: false });

        btn.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!draggedItem) return;

            const touch = e.touches[0];
            btn.style.left = (touch.clientX - btn.dataset.offsetX) + 'px';
            btn.style.top = (touch.clientY - btn.dataset.offsetY) + 'px';

            // Check overlap for visual feedback
            const dropRect = dropZone.getBoundingClientRect();
            const btnRect = btn.getBoundingClientRect();

            if (isOverlapping(btnRect, dropRect)) {
                dropZone.classList.add('drag-over');
            } else {
                dropZone.classList.remove('drag-over');
            }
        }, { passive: false });

        btn.addEventListener('touchend', (e) => {
            if (!draggedItem) return;

            const dropRect = dropZone.getBoundingClientRect();
            const btnRect = btn.getBoundingClientRect();

            // Reset styles
            btn.style.position = '';
            btn.style.left = '';
            btn.style.top = '';
            btn.style.zIndex = '';
            btn.classList.remove('dragging');
            dropZone.classList.remove('drag-over');

            if (isOverlapping(btnRect, dropRect)) {
                checkAnswer(opt);
            }

            draggedItem = null;
        });

        optionsElement.appendChild(btn);
    });
}

function checkAnswer(selected) {
    if (selected === correctAnswer) {
        // Correct!
        dropZone.textContent = selected;
        dropZone.classList.add('correct');

        messageElement.textContent = "Great Job! 🎉";
        messageElement.style.color = "#27ae60";
        currentScore++;
        scoreElement.textContent = currentScore;

        // Confetti celebration
        celebrate();

        setTimeout(generateProblem, 2000);
    } else {
        // Wrong
        messageElement.textContent = "Try Again! 💪";
        messageElement.style.color = "#e74c3c";

        // Shake animation on the game container or options
        const container = document.querySelector('.game-container');
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 400);
    }
}

function isOverlapping(rect1, rect2) {
    return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
}

function celebrate() {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43', '#54A0FF'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = -10 + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';

        document.body.appendChild(confetti);

        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Start the game
initGame();
