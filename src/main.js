const player = document.getElementById("player");
const startPage = document.querySelector(".intro");
const hidePage = document.querySelector(".hide");
const startButton = document.querySelector(".intro > button");
const timer = document.querySelector(".time");
const starttimer = document.querySelector(".starttimer");
let countAudio = new Audio('blop-sound.mp3');
let backgroundMusic = new Audio('background_bgm.mp3');

backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

let wallElements;
let isCollision = false;
let isSpace = false;

let maze;
let timerInterval;
let seconds = 0;
let mazeSize;
let time = 5000;
let sec = 5;

let currentX, currentY, targetX, targetY;

function animate(maze) {
    currentX += (targetX - currentX) * 1;
    currentY += (targetY - currentY) * 1;
    player.style.transform = `translate(${currentX}px, ${currentY}px)`;
    const playerRect = player.getBoundingClientRect();
    hidePage.style.background = `radial-gradient(circle at ${currentX + 35}px ${currentY + 35}px, transparent 0, transparent 150px, black 50px)`;
    if (isSpace) {
        const restart = document.querySelector(".start");
        const startRect = restart.getBoundingClientRect();
        player.style.transform = `translate(${startRect.left + 5}px, ${startRect.top + 5}px)`;
        isSpace = false;
        currentX = 0;
        currentY = 0;
        targetX = 0;
        targetY = 0;
    }
    
    adjustScroll(currentX, currentY);
    
    requestAnimationFrame(animate);
    if (targetX >= (mazeSize - 3) * 30 && targetY >= (mazeSize - 3) * 30) {
        finish();
        targetX = 0;
    }
}

function adjustScroll(playerX, playerY) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const scrollX = playerX - screenWidth / 2;
    const scrollY = playerY - screenHeight / 2;

    window.scrollTo(scrollX, scrollY);
}

document.addEventListener("keydown", (event) => {
    let playerRect = player.getBoundingClientRect();

    switch (event.key) {
        case "ArrowUp":
            if (checkCollision(playerRect, 0)) {
                break;
            }
            targetY -= 10;
            break;
        case "ArrowDown":
            if (checkCollision(playerRect, 1)) {
                break;
            }
            targetY += 10;
            break;
        case "ArrowLeft":
            if (checkCollision(playerRect, 2)) {
                break;
            }
            targetX -= 10;
            break;
        case "ArrowRight":
            if (checkCollision(playerRect, 3)) {
                break;
            }
            targetX += 10;
            break;
        case " ":
            isSpace = true;
            break;
    }

    targetX = Math.max(0, Math.min(targetX, (mazeSize - 3) * 30));
    targetY = Math.max(0, Math.min(targetY, (mazeSize - 3) * 30));
});

function createMaze(size) {
    maze = new Array(size);
    let visited = new Array(size);
    for (let i = 0; i < size; i++) {
        maze[i] = new Array(size);
        visited[i] = new Array(size);
    }

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            maze[i][j] = -1;
            visited[i][j] = false;
        }
    }

    DFS(maze, visited, 1, 1);
    return maze;
}

function DFS(maze, visited, x, y) {
    maze[x][y] = 0;
    visited[x][y] = true;
    subDFS(maze, visited, x, y);
    maze[maze.length - 2][maze.length - 2] = 1;
}

function subDFS(maze, visited, x, y) {
    const temp = new Array(4);
    const size = maze.length;
    const dx = [-2, 2, 0, 0],
        dy = [0, 0, -2, 2],
        wx = [-1, 1, 0, 0],
        wy = [0, 0, -1, 1];
    for (let i = 0; i < 4; i++) {
        const num = Math.floor(Math.random() * 4);
        if (temp.indexOf(num) == -1) {
            temp[i] = num;
        } else {
            i--;
        }
    }
    for (let i = 0; i < 4; i++) {
        if (
            x + dx[temp[i]] >= 1 &&
            x + dx[temp[i]] < size - 1 &&
            y + dy[temp[i]] >= 1 &&
            y + dy[temp[i]] < size - 1 &&
            visited[x + dx[temp[i]]][y + dy[temp[i]]] == false
        ) {
            maze[x + dx[temp[i]]][y + dy[temp[i]]] = 2;
            maze[x + wx[temp[i]]][y + wy[temp[i]]] = 2;
            visited[x + dx[temp[i]]][y + dy[temp[i]]] = true;
            visited[x + wx[temp[i]]][y + wy[temp[i]]] = true;
            subDFS(maze, visited, x + dx[temp[i]], y + dy[temp[i]]);
        }
    }
}

function makeFrame(maze) {
    const frame = document.querySelector(".maze > ul");

    for (let i = 0; i < maze.length; i++) {
        const li = document.createElement("li");
        const ul = document.createElement("ul");
        for (let j = 0; j < maze.length; j++) {
            const route = document.createElement("li");
            if (maze[i][j] == -1) {
                route.classList.add("wall");
                route.style.background = "black";
            } else if (maze[i][j] == 1) {
                route.classList.add("start");
                route.style.background = "red";
            } else if (maze[i][j] == 0) {
                route.style.background = "blue";
            }
            ul.prepend(route);
        }
        li.prepend(ul);
        frame.prepend(li);
    }
    wallElements = document.querySelectorAll(".wall");
    currentX = 0;
    currentY = 0;
    targetX = 0;
    targetY = 0;
}

startButton.addEventListener("click", startButtonClickHandler);

function startButtonClickHandler() {
    mazeSize = prompt("미로의 사이즈를 입력 하세요.(5 이상 홀수)");
    while (mazeSize % 2 == 0 || mazeSize < 5) {
        mazeSize = prompt("5 이상의 홀수를 입력 하세요.");
    }

    maze = createMaze(mazeSize);
    makeFrame(maze);

    startPage.style.display = "none"; 
    starttimer.style.display = "block";
    TIMER();
    setTimeout(function () {
        clearInterval(PlAYTIME);
        hidePage.style.display = "flex";
        starttimer.style.display = "none";
        player.style.display = "flex";
        animate(maze);
        
        backgroundMusic.play();
        document.querySelector(".time").style.display = "block";
        if (timerInterval) {
            clearInterval(timerInterval);
            seconds = 0;
        }
        
        timerInterval = setInterval(() => {
            seconds++;
            timer.textContent = seconds;
        }, 1000);
    }, 5900);
    
    startButton.removeEventListener("click", startButtonClickHandler);
}

function finish() {
    Math.seedrandom(new Date().getTime());
    const frame = document.querySelector(".maze");
    const del = document.querySelector(".maze > ul");
    del.remove();
    frame.prepend(document.createElement("ul"));
    document.querySelector(".time").style.display = "none";
    document.querySelector(".time").textContent = 0;
    hidePage.style.display = "none";
    player.style.display = "none";
    time = 5000;
    sec = 5;
    startPage.style.display = "flex";
    let text = seconds;
    const xx = document.querySelector(".intro > p");
    xx.textContent = `Your time is ${text}`;

    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;

    clearInterval(timerInterval);

    startButton.addEventListener("click", startButtonClickHandler);
}

function setTime() {
    let date = new Date();
}

function checkCollision(playerRect, dir) {
    let coll = false;
    const direction = [0, 0, 0, 0]
    direction[dir] = 10;
    wallElements.forEach((wall) => {
        const wallRect = wall.getBoundingClientRect();
        if (
            playerRect.top - direction[0] <= wallRect.bottom &&
            playerRect.bottom + direction[1] >= wallRect.top &&
            playerRect.left - direction[2] <= wallRect.right &&
            playerRect.right + direction[3] >= wallRect.left
        ) {
            coll = true;
        }
    });
    return coll;
}

function TIMER() {
    PlAYTIME = setInterval(function () {
        countAudio.play();
        sec = time / (1000);
        time = time - 1000;
        starttimer.textContent = sec;
    }, 1000);
}