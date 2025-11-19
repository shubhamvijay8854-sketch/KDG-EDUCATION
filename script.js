console.log("Math Game Loaded!");

// Game State
let currentScore = 0;
let correctAnswer = 0;
let draggedItem = null;
let gameMode = 'addition'; // 'addition' or 'subtraction'

// DOM Elements
const scoreElement = document.getElementById('score');
const num1Element = document.getElementById('num1');
const num2Element = document.getElementById('num2');
const operatorElement = document.getElementById('operator');
const visualAidElement = document.getElementById('visual-aid');
const numberLineAidElement = document.getElementById('number-line-aid');
const optionsElement = document.getElementById('options');
const messageElement = document.getElementById('message');
const dropZone = document.getElementById('drop-zone');
const btnAdd = document.getElementById('btn-add');
const btnSub = document.getElementById('btn-sub');

function setMode(mode) {
    gameMode = mode;

    // Update Buttons
    if (mode === 'addition') {
        btnAdd.classList.add('active');
        btnSub.classList.remove('active');
        operatorElement.textContent = '+';
        visualAidElement.style.display = 'flex';
        numberLineAidElement.style.display = 'none';
    } else {
        btnAdd.classList.remove('active');
        btnSub.classList.add('active');
        operatorElement.textContent = '-';
        visualAidElement.style.display = 'none';
        numberLineAidElement.style.display = 'flex';
    }

    generateProblem();
}

function initGame() {
    setupDropZone();
    // Expose setMode to global scope for HTML buttons
    window.setMode = setMode;
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
    let num1, num2;

    if (gameMode === 'addition') {
        // Sum up to 20
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        correctAnswer = num1 + num2;
    } else {
        // Subtraction: Result >= 0
        num1 = Math.floor(Math.random() * 19) + 1; // 1 to 19 (keep it simple)
        // Ensure num2 is not greater than num1
        num2 = Math.floor(Math.random() * num1) + 1;
        correctAnswer = num1 - num2;
    }

    // Update Display
    num1Element.textContent = num1;
    num2Element.textContent = num2;

    // Reset Drop Zone
    dropZone.textContent = "?";
    dropZone.className = "drop-zone";

    // Update Visuals
    if (gameMode === 'addition') {
        updateStarVisuals(num1, num2);
    } else {
        updateNumberLineVisuals(num1, num2);
    }

    // Generate Options
    generateOptions(correctAnswer);

    messageElement.textContent = "";

    function updateStarVisuals(n1, n2) {
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

    function updateNumberLineVisuals(start, subtract) {
        numberLineAidElement.innerHTML = '';

        const width = 550;
        const height = 120;
        const padding = 30;
        const lineY = 80;
        const maxVal = 20;
        const step = (width - 2 * padding) / maxVal;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "number-line-svg");
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

        // Draw Line
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", padding);
        line.setAttribute("y1", lineY);
        line.setAttribute("x2", width - padding);
        line.setAttribute("y2", lineY);
        line.setAttribute("class", "nl-line");
        svg.appendChild(line);

        // Draw Ticks and Numbers
        for (let i = 0; i <= maxVal; i++) {
            const x = padding + i * step;

            const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
            tick.setAttribute("x1", x);
            tick.setAttribute("y1", lineY - 5);
            tick.setAttribute("x2", x);
            tick.setAttribute("y2", lineY + 5);
            tick.setAttribute("class", "nl-tick");
            svg.appendChild(tick);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x);
            text.setAttribute("y", lineY + 25);
            text.setAttribute("class", "nl-text");
            text.textContent = i;
            svg.appendChild(text);
        }

        // Draw Jumps
        let currentX = padding + start * step;

        // Draw Start Dot
        const startDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        startDot.setAttribute("cx", currentX);
        startDot.setAttribute("cy", lineY);
        startDot.setAttribute("r", 5);
        startDot.setAttribute("class", "nl-dot");
        svg.appendChild(startDot);

        // Animate Jumps
        for (let i = 0; i < subtract; i++) {
            const nextX = currentX - step;
            const midX = (currentX + nextX) / 2;
            const midY = lineY - 40; // Height of jump

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            // Quadratic Bezier curve: M startX startY Q controlX controlY endX endY
            const d = `M ${currentX} ${lineY} Q ${midX} ${midY} ${nextX} ${lineY}`;

            path.setAttribute("d", d);
            path.setAttribute("class", "nl-jump");
            // Stagger animations
            path.style.animationDelay = `${i * 0.5}s`;

            svg.appendChild(path);
            currentX = nextX;
        }

        numberLineAidElement.appendChild(svg);
    }

    function generateOptions(correct) {
        optionsElement.innerHTML = '';

        // Create an array of 3 options including the correct one
        let options = [correct];

        while (options.length < 3) {
            let wrong = Math.floor(Math.random() * 20); // Random 0-20
            if (!options.includes(wrong) && wrong !== correct && wrong >= 0) {
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

            // Touch Events
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                draggedItem = btn;
                btn.classList.add('dragging');

                const touch = e.touches[0];
                const rect = btn.getBoundingClientRect();

                btn.dataset.offsetX = touch.clientX - rect.left;
                btn.dataset.offsetY = touch.clientY - rect.top;

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

    // Generate Options
    generateOptions(correctAnswer);

    messageElement.textContent = "";
}

function updateStarVisuals(n1, n2) {
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

function updateNumberLineVisuals(start, subtract) {
    numberLineAidElement.innerHTML = '';

    const width = 550;
    const height = 120;
    const padding = 30;
    const lineY = 80;
    const maxVal = 20;
    const step = (width - 2 * padding) / maxVal;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "number-line-svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    // Draw Line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", padding);
    line.setAttribute("y1", lineY);
    line.setAttribute("x2", width - padding);
    line.setAttribute("y2", lineY);
    line.setAttribute("class", "nl-line");
    svg.appendChild(line);

    // Draw Ticks and Numbers
    for (let i = 0; i <= maxVal; i++) {
        const x = padding + i * step;

        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        tick.setAttribute("x1", x);
        tick.setAttribute("y1", lineY - 5);
        tick.setAttribute("x2", x);
        tick.setAttribute("y2", lineY + 5);
        tick.setAttribute("class", "nl-tick");
        svg.appendChild(tick);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", lineY + 25);
        text.setAttribute("class", "nl-text");
        text.textContent = i;
        svg.appendChild(text);
    }

    // Draw Jumps
    let currentX = padding + start * step;

    // Draw Start Dot
    const startDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    startDot.setAttribute("cx", currentX);
    startDot.setAttribute("cy", lineY);
    startDot.setAttribute("r", 5);
    startDot.setAttribute("class", "nl-dot");
    svg.appendChild(startDot);

    // Animate Jumps
    for (let i = 0; i < subtract; i++) {
        const nextX = currentX - step;
        const midX = (currentX + nextX) / 2;
        const midY = lineY - 40; // Height of jump

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        // Quadratic Bezier curve: M startX startY Q controlX controlY endX endY
        const d = `M ${currentX} ${lineY} Q ${midX} ${midY} ${nextX} ${lineY}`;

        path.setAttribute("d", d);
        path.setAttribute("class", "nl-jump");
        // Stagger animations
        path.style.animationDelay = `${i * 0.5}s`;

        svg.appendChild(path);
        currentX = nextX;
    }

    numberLineAidElement.appendChild(svg);
}

function generateOptions(correct) {
    optionsElement.innerHTML = '';

    // Create an array of 3 options including the correct one
    let options = [correct];

    while (options.length < 3) {
        let wrong = Math.floor(Math.random() * 20); // Random 0-20
        if (!options.includes(wrong) && wrong !== correct && wrong >= 0) {
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

        // Touch Events
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            draggedItem = btn;
            btn.classList.add('dragging');

            const touch = e.touches[0];
            const rect = btn.getBoundingClientRect();

            btn.dataset.offsetX = touch.clientX - rect.left;
            btn.dataset.offsetY = touch.clientY - rect.top;

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
        playSuccessSound();
        dropZone.textContent = selected;
        dropZone.classList.add('correct');

        messageElement.textContent = "Great Job! 🎉";
        messageElement.style.color = "#27ae60";
        currentScore++;
        scoreElement.textContent = currentScore;

        celebrate();

        setTimeout(generateProblem, 2000);
    } else {
        // Wrong
        playErrorSound();
        messageElement.textContent = "Try Again! 💪";
        messageElement.style.color = "#e74c3c";

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

        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Sound Effects
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSuccessSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Happy "Ding" (High C to High E)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
}

function playErrorSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Sad "Buzz" (Low frequency sawtooth)
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
}

// Start the game
initGame();
