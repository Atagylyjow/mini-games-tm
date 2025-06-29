class GeometryDash {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Oyun durumu
        this.isRunning = false;
        this.isGameOver = false;
        this.score = 0;
        this.gameTime = 0;
        this.startTime = Date.now();
        
        // Oyuncu
        this.player = {
            x: 100,
            y: this.height - 100,
            width: 30,
            height: 30,
            velocityY: 0,
            isJumping: false,
            color: '#ff6b6b'
        };
        
        // Fizik
        this.gravity = 0.8;
        this.jumpPower = -15;
        this.groundY = this.height - 100;
        
        // Engeller
        this.obstacles = [];
        this.obstacleSpeed = 3;
        this.obstacleTimer = 0;
        this.obstacleInterval = 120; // Her 120 frame'de bir engel
        
        // Coinler
        this.coins = [];
        this.coinTimer = 0;
        this.coinInterval = 60; // Her 60 frame'de bir coin
        
        // Arka plan
        this.backgroundX = 0;
        
        // Ses efektleri (basit)
        this.sounds = {
            jump: null,
            coin: null,
            gameOver: null
        };
        
        this.init();
    }
    
    init() {
        // Canvas boyutunu ayarla
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.groundY = this.height - 100;
        this.player.y = this.groundY - this.player.height;
        
        // Event listener'ları ekle
        this.bindEvents();
        
        // İlk engelleri oluştur
        this.createInitialObstacles();
    }
    
    bindEvents() {
        // Jump için tıklama/touch
        this.canvas.addEventListener('click', () => this.jump());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.jump();
        });
        
        // Klavye kontrolü
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.jump();
            }
        });
    }
    
    jump() {
        if (!this.isRunning || this.isGameOver) return;
        
        if (!this.player.isJumping) {
            this.player.velocityY = this.jumpPower;
            this.player.isJumping = true;
        }
    }
    
    createObstacle() {
        const types = ['spike', 'block', 'triangle'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let obstacle = {
            x: this.width + 50,
            y: this.groundY,
            width: 40,
            height: 40,
            type: type,
            color: '#e74c3c'
        };
        
        if (type === 'spike') {
            obstacle.height = 30;
            obstacle.y = this.groundY - obstacle.height;
        } else if (type === 'triangle') {
            obstacle.height = 40;
            obstacle.y = this.groundY - obstacle.height;
        }
        
        this.obstacles.push(obstacle);
    }
    
    createCoin() {
        const coin = {
            x: this.width + 50,
            y: this.groundY - 80 + Math.random() * 60,
            radius: 10,
            collected: false
        };
        this.coins.push(coin);
    }
    
    createInitialObstacles() {
        // İlk birkaç engeli oluştur
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.createObstacle();
            }, i * 2000);
        }
    }
    
    update() {
        if (!this.isRunning || this.isGameOver) return;
        
        this.gameTime = (Date.now() - this.startTime) / 1000;
        
        // Oyuncu fiziği
        this.player.velocityY += this.gravity;
        this.player.y += this.player.velocityY;
        
        // Yere çarpma kontrolü
        if (this.player.y >= this.groundY - this.player.height) {
            this.player.y = this.groundY - this.player.height;
            this.player.velocityY = 0;
            this.player.isJumping = false;
        }
        
        // Engelleri güncelle
        this.obstacleTimer++;
        if (this.obstacleTimer >= this.obstacleInterval) {
            this.createObstacle();
            this.obstacleTimer = 0;
            // Hızı artır
            this.obstacleSpeed += 0.1;
        }
        
        this.obstacles.forEach((obstacle, index) => {
            obstacle.x -= this.obstacleSpeed;
            
            // Ekrandan çıkan engelleri sil
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(index, 1);
                this.score += 10;
            }
            
            // Çarpışma kontrolü
            if (this.checkCollision(this.player, obstacle)) {
                this.gameOver();
            }
        });
        
        // Coinleri güncelle
        this.coinTimer++;
        if (this.coinTimer >= this.coinInterval) {
            this.createCoin();
            this.coinTimer = 0;
        }
        
        this.coins.forEach((coin, index) => {
            coin.x -= this.obstacleSpeed;
            
            // Ekrandan çıkan coinleri sil
            if (coin.x + coin.radius < 0) {
                this.coins.splice(index, 1);
            }
            
            // Coin toplama kontrolü
            if (!coin.collected && this.checkCoinCollision(this.player, coin)) {
                coin.collected = true;
                this.coins.splice(index, 1);
                this.score += 50;
            }
        });
        
        // Arka plan hareketi
        this.backgroundX -= this.obstacleSpeed * 0.5;
        if (this.backgroundX <= -this.width) {
            this.backgroundX = 0;
        }
        
        // Kazanma kontrolü
        if (this.score >= 1000 && this.gameTime <= 60) {
            this.gameWin();
        }
    }
    
    checkCollision(player, obstacle) {
        return player.x < obstacle.x + obstacle.width &&
               player.x + player.width > obstacle.x &&
               player.y < obstacle.y + obstacle.height &&
               player.y + player.height > obstacle.y;
    }
    
    checkCoinCollision(player, coin) {
        const dx = (player.x + player.width/2) - coin.x;
        const dy = (player.y + player.height/2) - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < coin.radius + Math.min(player.width, player.height) / 2;
    }
    
    gameOver() {
        this.isGameOver = true;
        this.isRunning = false;
    }
    
    gameWin() {
        this.isGameOver = true;
        this.isRunning = false;
        // Kazanma durumu için özel flag
        this.gameWon = true;
    }
    
    draw() {
        // Arka planı temizle
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Arka plan deseni
        this.ctx.fillStyle = '#34495e';
        for (let i = 0; i < 20; i++) {
            this.ctx.fillRect(this.backgroundX + i * 100, this.groundY + 20, 80, 20);
        }
        
        // Yeri çiz
        this.ctx.fillStyle = '#95a5a6';
        this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
        
        // Oyuncuyu çiz
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Oyuncu gözleri
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.player.x + 5, this.player.y + 5, 5, 5);
        this.ctx.fillRect(this.player.x + 20, this.player.y + 5, 5, 5);
        
        // Engelleri çiz
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = obstacle.color;
            
            if (obstacle.type === 'triangle') {
                this.ctx.beginPath();
                this.ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
                this.ctx.lineTo(obstacle.x + obstacle.width/2, obstacle.y);
                this.ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
                this.ctx.closePath();
                this.ctx.fill();
            } else {
                this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        });
        
        // Coinleri çiz
        this.coins.forEach(coin => {
            this.ctx.fillStyle = '#f1c40f';
            this.ctx.beginPath();
            this.ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // "C" harfi
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('C', coin.x, coin.y);
        });
        
        // Skor ve süre
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Skor: ${this.score}`, 20, 40);
        this.ctx.fillText(`Süre: ${this.gameTime.toFixed(1)}s`, 20, 70);
        
        // Kazanma hedefi
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillText(`Hedef: 1000 puan (60s içinde)`, 20, 100);
        
        // Game over ekranı
        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            
            if (this.gameWon) {
                this.ctx.fillStyle = '#27ae60';
                this.ctx.fillText('🎉 TEBRİKLER! 🎉', this.width/2, this.height/2 - 50);
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '24px Arial';
                this.ctx.fillText('Oyunu kazandınız!', this.width/2, this.height/2);
                this.ctx.fillText(`Skor: ${this.score}`, this.width/2, this.height/2 + 30);
                this.ctx.fillText(`Süre: ${this.gameTime.toFixed(1)}s`, this.width/2, this.height/2 + 60);
            } else {
                this.ctx.fillStyle = '#e74c3c';
                this.ctx.fillText('OYUN BİTTİ', this.width/2, this.height/2 - 50);
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '24px Arial';
                this.ctx.fillText(`Skor: ${this.score}`, this.width/2, this.height/2);
                this.ctx.fillText(`Süre: ${this.gameTime.toFixed(1)}s`, this.width/2, this.height/2 + 30);
            }
            
            this.ctx.textAlign = 'left';
        }
    }
    
    start() {
        this.isRunning = true;
        this.isGameOver = false;
        this.gameWon = false;
        this.score = 0;
        this.gameTime = 0;
        this.startTime = Date.now();
        this.obstacleSpeed = 3;
        this.obstacles = [];
        this.coins = [];
        this.obstacleTimer = 0;
        this.coinTimer = 0;
        
        this.player.x = 100;
        this.player.y = this.groundY - this.player.height;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        
        this.createInitialObstacles();
        this.gameLoop();
    }
    
    restart() {
        this.start();
    }
    
    pause() {
        this.isRunning = false;
    }
    
    resume() {
        this.isRunning = true;
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    getScore() {
        return this.score;
    }
    
    isGameOver() {
        return this.isGameOver;
    }
    
    hasWon() {
        return this.gameWon;
    }
    
    getGameTime() {
        return this.gameTime;
    }
} 