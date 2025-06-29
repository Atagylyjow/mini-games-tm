class SnakeGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.direction = {x: 1, y: 0};
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
        this.paused = false;
        this.speed = 150;
        this.lastTime = 0;
        
        this.setupCanvas();
        this.bindEvents();
    }
    
    setupCanvas() {
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.canvas.style.border = '2px solid #333';
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver || this.paused) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction.y === 0) {
                        this.direction = {x: 0, y: -1};
                    }
                    break;
                case 'ArrowDown':
                    if (this.direction.y === 0) {
                        this.direction = {x: 0, y: 1};
                    }
                    break;
                case 'ArrowLeft':
                    if (this.direction.x === 0) {
                        this.direction = {x: -1, y: 0};
                    }
                    break;
                case 'ArrowRight':
                    if (this.direction.x === 0) {
                        this.direction = {x: 1, y: 0};
                    }
                    break;
            }
        });
        
        // Touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.gameOver || this.paused) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0 && this.direction.x === 0) {
                    this.direction = {x: 1, y: 0};
                } else if (deltaX < 0 && this.direction.x === 0) {
                    this.direction = {x: -1, y: 0};
                }
            } else {
                // Vertical swipe
                if (deltaY > 0 && this.direction.y === 0) {
                    this.direction = {x: 0, y: 1};
                } else if (deltaY < 0 && this.direction.y === 0) {
                    this.direction = {x: 0, y: -1};
                }
            }
        });
    }
    
    generateFood() {
        const maxX = this.canvas.width / this.gridSize - 1;
        const maxY = this.canvas.height / this.gridSize - 1;
        
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * maxX),
                y: Math.floor(Math.random() * maxY)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }
    
    update() {
        if (this.gameOver || this.paused) return;
        
        const head = {...this.snake[0]};
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            this.gameOver = true;
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver = true;
            return;
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
            // Increase speed
            this.speed = Math.max(50, this.speed - 2);
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head
                this.ctx.fillStyle = '#2ecc71';
            } else {
                // Body
                this.ctx.fillStyle = '#27ae60';
            }
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        
        // Draw food
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(
            this.food.x * this.gridSize + 2,
            this.food.y * this.gridSize + 2,
            this.gridSize - 4,
            this.gridSize - 4
        );
        
        // Draw pause overlay
        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    gameLoop(currentTime) {
        if (currentTime - this.lastTime > this.speed) {
            this.update();
            this.draw();
            this.lastTime = currentTime;
        }
        
        if (!this.gameOver) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
    
    start() {
        this.gameOver = false;
        this.paused = false;
        this.snake = [{x: 5, y: 5}];
        this.direction = {x: 1, y: 0};
        this.food = this.generateFood();
        this.score = 0;
        this.speed = 150;
        this.gameLoop(0);
    }
    
    pause() {
        this.paused = !this.paused;
    }
    
    restart() {
        this.start();
    }
    
    getScore() {
        return this.score;
    }
    
    isGameOver() {
        return this.gameOver;
    }
} 