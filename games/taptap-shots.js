class TapTapShots {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Oyun durumu
        this.isRunning = false;
        this.isGameOver = false;
        this.score = 0;
        this.timer = 15; // Her atış için süre

        // Top özellikleri
        this.ball = {
            x: 0,
            y: 0,
            radius: 20,
            velocityY: 0,
            color: '#ff7f50' // Basketbol topu rengi
        };

        // Fizik
        this.gravity = 0.5;
        this.jumpPower = -10;

        // Pota özellikleri
        this.hoop = {
            x: 0,
            y: 0,
            width: 100,
            height: 10,
            color: '#e74c3c'
        };
        
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.bindEvents();
        this.resetGame();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    bindEvents() {
        this.canvas.addEventListener('click', () => this.jump());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.jump();
        });
    }

    jump() {
        if (!this.isRunning || this.isGameOver) return;
        this.ball.velocityY = this.jumpPower;
    }
    
    resetGame() {
        this.score = 0;
        this.isGameOver = false;
        this.resetBall();
        this.resetHoop();
        this.timer = 15;
    }

    resetHoop() {
        this.hoop.x = this.width - 200;
        this.hoop.y = Math.random() * (this.height - 400) + 200; // Rastgele yükseklik
    }
    
    resetBall() {
        this.ball.x = this.width / 4;
        this.ball.y = this.height / 2;
        this.ball.velocityY = 0;
    }

    update() {
        if (!this.isRunning || this.isGameOver) return;
        
        // Zamanlayıcıyı güncelle
        this.timer -= 1/60; // 60fps varsayımı
        if (this.timer <= 0) {
            this.gameOver();
            return;
        }

        // Topa yerçekimi uygula
        this.ball.velocityY += this.gravity;
        this.ball.y += this.ball.velocityY;

        // Pota ile çarpışmayı kontrol et
        this.checkHoopCollision();
        
        // Ekran dışına çıkarsa oyunu bitir
        if (this.ball.y - this.ball.radius > this.height) {
            this.gameOver();
        }
    }

    checkHoopCollision() {
        const ball = this.ball;
        const hoop = this.hoop;
        
        const prevY = ball.y - ball.velocityY;

        // Topun pota aralığında olup olmadığını kontrol et
        if (ball.x > hoop.x && ball.x < hoop.x + hoop.width) {
            // Topun pota seviyesinden aşağı doğru geçip geçmediğini kontrol et
            if (prevY < hoop.y && ball.y >= hoop.y && ball.velocityY > 0) {
                this.score++;
                this.resetHoop();
                this.resetBall();
                this.timer = 15; // Sonraki atış için zamanlayıcıyı sıfırla
            }
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.isRunning = false;
    }

    draw() {
        // Canvas'ı temizle
        this.ctx.fillStyle = '#87ceeb'; // Gökyüzü mavisi
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Topu çiz
        this.ctx.fillStyle = this.ball.color;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Potayı çiz (direk ve çember)
        this.ctx.fillStyle = '#654321'; // Direk için kahverengi
        this.ctx.fillRect(this.hoop.x + this.hoop.width / 2 - 5, this.hoop.y, 10, this.height - this.hoop.y);
        
        this.ctx.fillStyle = this.hoop.color;
        this.ctx.fillRect(this.hoop.x, this.hoop.y, this.hoop.width, this.hoop.height);

        // Skoru ve zamanlayıcıyı çiz
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Skor: ${this.score}`, 20, 50);
        this.ctx.fillText(`Süre: ${Math.ceil(this.timer)}`, this.width - 150, 50);

        // Oyun Bitti ekranını çiz
        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '50px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Oyun Bitti', this.width / 2, this.height / 2 - 40);
            
            this.ctx.font = '30px Arial';
            this.ctx.fillText(`Final Skoru: ${this.score}`, this.width / 2, this.height / 2 + 20);
        }
    }

    start() {
        this.isRunning = true;
        this.isGameOver = false;
        this.resetGame();
        this.gameLoop();
    }
    
    restart() {
        this.start();
    }
    
    pause() {
        this.isRunning = false;
    }
    
    resume() {
        if (!this.isGameOver) {
            this.isRunning = true;
            this.gameLoop();
        }
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
        // Kazanma koşulu: Tek seferde 10 sayı yapmak
        return this.score >= 10;
    }
} 