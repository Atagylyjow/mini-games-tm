class BubbleShooter {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Oyun durumu
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        
        // Balon özellikleri
        this.bubbleRadius = 25;
        this.bubbleColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        this.bubbles = [];
        this.shootingBubble = null;
        this.nextBubble = null;
        
        // Grid özellikleri
        this.gridWidth = Math.floor(this.width / (this.bubbleRadius * 2));
        this.gridHeight = 12;
        this.grid = [];
        
        // Mouse/Touch kontrolü
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseDown = false;
        
        // Animasyon
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.createGrid();
        this.createShootingBubble();
        this.createNextBubble();
        this.bindEvents();
        this.start();
    }
    
    setupCanvas() {
        // Canvas boyutunu ayarla
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Retina display için
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    createGrid() {
        this.grid = [];
        for (let row = 0; row < this.gridHeight; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridWidth; col++) {
                if (row < 3) { // İlk 3 satır balonlarla dolu
                    const color = this.bubbleColors[Math.floor(Math.random() * this.bubbleColors.length)];
                    this.grid[row][col] = {
                        x: col * this.bubbleRadius * 2 + this.bubbleRadius,
                        y: row * this.bubbleRadius * 2 + this.bubbleRadius,
                        color: color,
                        active: true
                    };
                } else {
                    this.grid[row][col] = null;
                }
            }
        }
    }
    
    createShootingBubble() {
        const color = this.bubbleColors[Math.floor(Math.random() * this.bubbleColors.length)];
        this.shootingBubble = {
            x: this.width / 2,
            y: this.height - this.bubbleRadius - 20,
            color: color,
            velocityX: 0,
            velocityY: 0,
            speed: 8
        };
    }
    
    createNextBubble() {
        const color = this.bubbleColors[Math.floor(Math.random() * this.bubbleColors.length)];
        this.nextBubble = {
            x: this.width - this.bubbleRadius - 20,
            y: this.height - this.bubbleRadius - 20,
            color: color
        };
    }
    
    bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.handleMouseMove(e);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isMouseDown) {
                this.handleMouseMove(e);
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            if (this.isMouseDown) {
                this.shootBubble();
                this.isMouseDown = false;
            }
        });
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isMouseDown = true;
            this.handleTouchMove(e);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isMouseDown) {
                this.handleTouchMove(e);
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.isMouseDown) {
                this.shootBubble();
                this.isMouseDown = false;
            }
        });
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }
    
    handleTouchMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.touches[0].clientX - rect.left;
        this.mouseY = e.touches[0].clientY - rect.top;
    }
    
    shootBubble() {
        if (!this.shootingBubble || this.shootingBubble.velocityX !== 0) return;
        
        const dx = this.mouseX - this.shootingBubble.x;
        const dy = this.mouseY - this.shootingBubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.shootingBubble.velocityX = (dx / distance) * this.shootingBubble.speed;
            this.shootingBubble.velocityY = (dy / distance) * this.shootingBubble.speed;
        }
    }
    
    update() {
        if (!this.isRunning || this.isPaused) return;
        
        this.updateShootingBubble();
        this.checkCollisions();
        this.checkGameOver();
    }
    
    updateShootingBubble() {
        if (!this.shootingBubble) return;
        
        this.shootingBubble.x += this.shootingBubble.velocityX;
        this.shootingBubble.y += this.shootingBubble.velocityY;
        
        // Duvar çarpışması
        if (this.shootingBubble.x - this.bubbleRadius <= 0 || 
            this.shootingBubble.x + this.bubbleRadius >= this.width) {
            this.shootingBubble.velocityX *= -1;
        }
        
        // Tavan çarpışması
        if (this.shootingBubble.y - this.bubbleRadius <= 0) {
            this.snapBubbleToGrid();
        }
    }
    
    snapBubbleToGrid() {
        const gridX = Math.round((this.shootingBubble.x - this.bubbleRadius) / (this.bubbleRadius * 2));
        const gridY = Math.round((this.shootingBubble.y - this.bubbleRadius) / (this.bubbleRadius * 2));
        
        // Grid sınırları kontrolü
        if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
            if (!this.grid[gridY][gridX]) {
                this.grid[gridY][gridX] = {
                    x: gridX * this.bubbleRadius * 2 + this.bubbleRadius,
                    y: gridY * this.bubbleRadius * 2 + this.bubbleRadius,
                    color: this.shootingBubble.color,
                    active: true
                };
                
                this.checkMatches(gridX, gridY);
                this.createShootingBubble();
                this.createNextBubble();
            } else {
                // Eğer pozisyon doluysa, en yakın boş pozisyonu bul
                this.findNearestEmptyPosition();
            }
        } else {
            this.findNearestEmptyPosition();
        }
    }
    
    findNearestEmptyPosition() {
        let nearestX = 0;
        let nearestY = 0;
        let minDistance = Infinity;
        
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                if (!this.grid[row][col]) {
                    const distance = Math.sqrt(
                        Math.pow(this.shootingBubble.x - (col * this.bubbleRadius * 2 + this.bubbleRadius), 2) +
                        Math.pow(this.shootingBubble.y - (row * this.bubbleRadius * 2 + this.bubbleRadius), 2)
                    );
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestX = col;
                        nearestY = row;
                    }
                }
            }
        }
        
        this.grid[nearestY][nearestX] = {
            x: nearestX * this.bubbleRadius * 2 + this.bubbleRadius,
            y: nearestY * this.bubbleRadius * 2 + this.bubbleRadius,
            color: this.shootingBubble.color,
            active: true
        };
        
        this.checkMatches(nearestX, nearestY);
        this.createShootingBubble();
        this.createNextBubble();
    }
    
    checkMatches(startX, startY) {
        const color = this.grid[startY][startX].color;
        const visited = new Set();
        const matches = [];
        
        this.dfs(startX, startY, color, visited, matches);
        
        if (matches.length >= 3) {
            // Eşleşen balonları patlat
            matches.forEach(([x, y]) => {
                this.grid[y][x] = null;
            });
            
            this.score += matches.length * 10;
            this.dropFloatingBubbles();
        }
    }
    
    dfs(x, y, color, visited, matches) {
        const key = `${x},${y}`;
        if (visited.has(key)) return;
        visited.add(key);
        
        if (y < 0 || y >= this.gridHeight || x < 0 || x >= this.gridWidth) return;
        if (!this.grid[y][x] || this.grid[y][x].color !== color) return;
        
        matches.push([x, y]);
        
        // Komşu balonları kontrol et
        const neighbors = [
            [x-1, y], [x+1, y], // Yatay
            [x, y-1], [x, y+1], // Dikey
            [x-1, y-1], [x+1, y-1], // Çapraz (üst)
            [x-1, y+1], [x+1, y+1]  // Çapraz (alt)
        ];
        
        neighbors.forEach(([nx, ny]) => {
            this.dfs(nx, ny, color, visited, matches);
        });
    }
    
    dropFloatingBubbles() {
        const connected = new Set();
        
        // Üst satırdaki bağlı balonları bul
        for (let col = 0; col < this.gridWidth; col++) {
            if (this.grid[0][col]) {
                this.findConnectedBubbles(0, col, connected);
            }
        }
        
        // Bağlı olmayan balonları düşür
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                if (this.grid[row][col] && !connected.has(`${col},${row}`)) {
                    this.grid[row][col] = null;
                    this.score += 5;
                }
            }
        }
    }
    
    findConnectedBubbles(x, y, connected) {
        const key = `${x},${y}`;
        if (connected.has(key)) return;
        connected.add(key);
        
        const neighbors = [
            [x-1, y], [x+1, y],
            [x, y-1], [x, y+1],
            [x-1, y-1], [x+1, y-1],
            [x-1, y+1], [x+1, y+1]
        ];
        
        neighbors.forEach(([nx, ny]) => {
            if (ny >= 0 && ny < this.gridHeight && nx >= 0 && nx < this.gridWidth) {
                if (this.grid[ny][nx]) {
                    this.findConnectedBubbles(nx, ny, connected);
                }
            }
        });
    }
    
    checkCollisions() {
        if (!this.shootingBubble) return;
        
        // Grid balonlarıyla çarpışma kontrolü
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                if (this.grid[row][col]) {
                    const bubble = this.grid[row][col];
                    const distance = Math.sqrt(
                        Math.pow(this.shootingBubble.x - bubble.x, 2) +
                        Math.pow(this.shootingBubble.y - bubble.y, 2)
                    );
                    
                    if (distance < this.bubbleRadius * 2) {
                        this.snapBubbleToGrid();
                        return;
                    }
                }
            }
        }
    }
    
    checkGameOver() {
        // Alt satıra balon gelirse oyun biter
        for (let col = 0; col < this.gridWidth; col++) {
            if (this.grid[this.gridHeight - 1][col]) {
                this.gameOver();
                return;
            }
        }
        
        // Tüm balonlar patlatıldıysa seviye tamamlandı
        let hasBubbles = false;
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                if (this.grid[row][col]) {
                    hasBubbles = true;
                    break;
                }
            }
        }
        
        if (!hasBubbles) {
            this.levelComplete();
        }
    }
    
    levelComplete() {
        this.level++;
        this.score += 100;
        this.createGrid();
        this.createShootingBubble();
        this.createNextBubble();
    }
    
    gameOver() {
        this.isRunning = false;
        if (window.app) {
            window.app.handleGameOver(this.score);
        }
    }
    
    render() {
        // Arka planı temizle
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Grid balonlarını çiz
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                if (this.grid[row][col]) {
                    this.drawBubble(this.grid[row][col].x, this.grid[row][col].y, this.grid[row][col].color);
                }
            }
        }
        
        // Atış balonunu çiz
        if (this.shootingBubble) {
            this.drawBubble(this.shootingBubble.x, this.shootingBubble.y, this.shootingBubble.color);
        }
        
        // Sonraki balonu çiz
        if (this.nextBubble) {
            this.drawBubble(this.nextBubble.x, this.nextBubble.y, this.nextBubble.color);
        }
        
        // UI bilgilerini çiz
        this.drawUI();
    }
    
    drawBubble(x, y, color) {
        // Balon gölgesi
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(x + 2, y + 2, this.bubbleRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Balon
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.bubbleRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Balon parlaması
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(x - this.bubbleRadius * 0.3, y - this.bubbleRadius * 0.3, this.bubbleRadius * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Balon kenarlığı
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.bubbleRadius, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawUI() {
        // Skor
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px Inter';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Skor: ${this.score}`, 20, 30);
        
        // Seviye
        this.ctx.fillText(`Seviye: ${this.level}`, 20, 60);
        
        // Sonraki balon etiketi
        this.ctx.fillText('Sonraki:', this.width - 120, 30);
    }
    
    gameLoop() {
        this.update();
        this.render();
        
        if (this.isRunning) {
            this.animationId = requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    start() {
        this.isRunning = true;
        this.gameLoop();
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        this.isPaused = false;
    }
    
    restart() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.grid = [];
        this.shootingBubble = null;
        this.nextBubble = null;
        
        this.createGrid();
        this.createShootingBubble();
        this.createNextBubble();
        this.start();
    }
    
    isGameOver() {
        return !this.isRunning;
    }
    
    getScore() {
        return this.score;
    }
} 