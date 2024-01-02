const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
let isFallingAllowed = false;


let intervalId; // Interval ID'si

const player = {
    x: 10,
    y: 385,
    width: 40,
    height: 40,
    velX: 0,
    velY: 0,
    jumping: false,
    score: 0,
    lives: 3, // Can sayısı
};

const platformList = [];
const coinList = [];

const playerImg = new Image();
playerImg.src = 'player.png';

const platformImg = new Image();
platformImg.src = 'platform.png';

const coinImg = new Image();
coinImg.src = 'coin.png';

const backgroundImages = ['background.png', 'background2.jpg','background3.jpg']; // Liste halinde arka plan resimleri
let currentBackgroundIndex = 0; // Başlangıçta ilk resim kullanılacak
let level = 1; // Seviye başlangıcı

const backgroundImage = new Image();
backgroundImage.src = backgroundImages[currentBackgroundIndex];

let yOffset = 0;

class Platform {
    constructor(x, y, width, speed, direction) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 18;
        this.speed =  direction;
        this.direction = direction;
    }

    move() {
        this.x += this.speed;

        if ((this.speed > 0 && this.x >= WIDTH) || (this.speed < 0 && this.x + this.width < 0)) {
            this.x = this.speed > 0 ? -this.width : WIDTH;
        }
    }

    draw() {
        ctx.drawImage(platformImg, this.x, this.y + yOffset, this.width, this.height);
    }
}

class Coin {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isTaken = false;
    }

    draw() {
        if (!this.isTaken) {
            ctx.drawImage(coinImg, this.x, this.y, this.width, this.height);
        }
    }
}



function checkLifeStatus() {
    if (player.jumping && player.y > HEIGHT) {
        player.lives--; // Canı azalt
        player.y = HEIGHT - player.height; // Oyuncuyu en altta tut
        player.velY = 0;
    }

    if (player.lives <= 0) {
        player.lives = 0; // Can sıfır olmamalı, ekranda sadece sıfır görünecek

        // Ekranı kırmızı yap
        ctx.fillStyle = "red";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "white";
        ctx.font = "55px Arial";
        ctx.fillText('GAME OVER ',40, 210);
    }
    else if (player.lives > 0 && player.score>=5){
        ctx.fillStyle = "green";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "white";
        ctx.font = "55px Arial";
        ctx.fillText('WİNNER ',100, 210);
    
    }
}
function jump() {
    if (!player.jumping) {
        player.jumping = true;
        player.velY = -9;
        isFallingAllowed = true; // Zıplama olduğunda düşmeye izin ver
    }
}
function checkFall() {
    let onAPlatform = false;

    platformList.forEach((platform) => {
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height < platform.y + platform.height &&
            player.y + player.height > platform.y
        ) {
            onAPlatform = true;
        }
    });

    if (!onAPlatform && isFallingAllowed) {
        if (player.y + player.height >= HEIGHT) {
            player.lives--;
            isFallingAllowed = false; // Yere değdiğinde tekrar düşmeye izin verme
        }
    }
}



function createPlatforms() {
    const platform1 = new Platform(50, 350, 100, 1, 1);
    const platform2 = new Platform(100, 290, 100, 1, -1);
    const platform3 = new Platform(150, 230, 100, 1, 1);
    const platform4 = new Platform(200, 160, 100, 1, -1);
    const platform5 = new Platform(250, 115, 100, 1, 1);
    const platform6 = new Platform(300, 80, 100, 1, -1);
    const platform7 = new Platform(330, 30, 100, 1, 1);
    platformList.push(platform1, platform2, platform3, platform4, platform5,platform6,platform7);
}

function createCoins() {
    for (let i = 0; i < 5; i++) {
        const coinX = Math.random() * (WIDTH - 20);
        const coinY = Math.random() * (HEIGHT - 20);
        const coinWidth = 20;
        const coinHeight = 20;

        const newCoin = new Coin(coinX, coinY, coinWidth, coinHeight);
        coinList.push(newCoin);
    }
}

function removeTakenCoins() {
    coinList.forEach((coin, index) => {
        if (
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y
        ) {
            if (!coin.isTaken) {
                coin.isTaken = true;
                player.score++;
            }
        }
    });
}

function changeBackground() {
    isFallingAllowed=false;
    currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundImages.length;
    backgroundImage.src = backgroundImages[currentBackgroundIndex];
}

function checkLevelCompletion() {
    if (player.y <= 0) {
        level++;
        changeBackground();
        platformList.pop();
        platformList.pop();
        platformList.pop();
        platformList.pop();
        platformList.pop();
        platformList.pop();
        yOffset = 0;
        player.y = HEIGHT - player.height;

    }
}



function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.drawImage(backgroundImage, -15, 0, WIDTH+30, HEIGHT+40);
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    platformList.forEach((platform) => {
        platform.move();
        platform.draw();
    });

    coinList.forEach((coin) => {
        coin.draw();
    });

    ctx.fillStyle = "green";
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + player.score, WIDTH-80 , 30);
    ctx.fillStyle = "green";
    ctx.font = "20px Arial";
    ctx.fillText('Level: ' + level, 10, 30);
    ctx.fillStyle = "black";
    ctx.font = "17px Arial";
    ctx.fillText('Lives: ' + player.lives, 10, 60);

    movePlayer();
    applyGravity();
    checkCollisionWithPlatforms();
    checkFall();
    removeTakenCoins(); // Sikke-oyuncu çarpışmasını kontrol et
    checkLevelCompletion(); // Seviye tamamlanmasını kontrol et

    requestAnimationFrame(gameLoop);
    checkLifeStatus(); // Can durumunu kontrol et
    drawLives(); // Can sayısını ekrana çiz

    // Oyun devam ediyorsa döngüyü tekrar çağır
    if (player.lives > 0) {
        requestAnimationFrame(gameLoop);
    }

}

function movePlayer() {
    player.x += player.velX;

    if (player.x < 0) {
        player.x = WIDTH;
    } else if (player.x > WIDTH) {
        player.x = 0;
    }

    if (player.jumping) {
        player.y += player.velY;
        player.velY += 0.5;

        if (player.y + player.height >= HEIGHT) {
            player.y = HEIGHT - player.height;
            player.jumping = false;
            player.velY = 0;

            // Ekranın altına düşme durumu
            player.lives--; // Can sayısını azalt
        }
    }
}


function applyGravity() {
    if (!player.jumping && player.y + player.height < HEIGHT) {
        player.y += 2;
    }
}

function checkCollisionWithPlatforms() {
    platformList.forEach((platform) => {
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height < platform.y + platform.height &&
            player.y + player.height > platform.y
        ) {
            player.y = platform.y - player.height;
            player.jumping = false;
            player.velY = 0;
        }
    });
}

document.addEventListener("keydown", function(event) {
    if (event.code === "ArrowLeft") {
        player.velX = -3;
    } else if (event.code === "ArrowRight") {
        player.velX = 3;
    } else if (event.code === "Space" && !player.jumping) {
        jump();
        player.jumping = true;
        player.velY = -9;
    }
});

document.addEventListener("keyup", function(event) {
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
        player.velX = 0;
    }
});

backgroundImage.onload = function() {
    createPlatforms();
    createCoins();
    gameLoop();
};
