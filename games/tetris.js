class TetrisGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 30;
        this.cols = 10;
        this.rows = 20;
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.currentPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        this.dropTime = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        
        this.pieces = [
            // I piece
            [[1, 1, 1, 1]],
            // O piece
            [[1, 1], [1, 1]],
            // T piece
            [[0, 1, 0], [1, 1, 1]],
            // S piece
            [[0, 1, 1], [1, 1, 0]],
            // Z piece
            [[1, 1, 0], [0, 1, 1]],
            // J piece
            [[1, 0, 0], [1, 1, 1]],
            // L piece
            [[0, 0, 1], [1, 1, 1]]
        ];
        
        this.colors = [
            '#00f5ff', // I - Cyan
            '#ffff00', // O - Yellow
            '#a000f0', // T - Purple
            '#00f000', // S - Green
            '#f00000', // Z - Red
            '#0000f0', // J - Blue
            '#ffa500'  // L - Orange
        ];
        
        this.setupCanvas();
        this.bindEvents();
        this.spawnPiece();
    }
    
    setupCanvas() {
        this.canvas.width = this.cols * this.gridSize;
        this.canvas.height = this.rows * this.gridSize;
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver || this.paused) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                case ' ':
                    this.rotatePiece();
                    break;
            }
        });
        
        // Touch controls
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
                if (deltaX > 0) {
                    this.movePiece(1, 0);
                } else {
                    this.movePiece(-1, 0);
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    this.movePiece(0, 1);
                } else {
                    this.rotatePiece();
                }
            }
        });
    }
    
    spawnPiece() {
        const pieceIndex = Math.floor(Math.random() * this.pieces.length);
        this.currentPiece = {
            shape: this.pieces[pieceIndex],
            color: this.colors[pieceIndex],
            x: Math.floor(this.cols / 2) - Math.floor(this.pieces[pieceIndex][0].length / 2),
            y: 0
        };
        
        if (this.checkCollision()) {
            this.gameOver = true;
        }
    }
    
    checkCollision() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (boardX < 0 || boardX >= this.cols || 
                        boardY >= this.rows || 
                        (boardY >= 0 && this.board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    movePiece(dx, dy) {
        this.currentPiece.x += dx;
        this.currentPiece.y += dy;
        
        if (this.checkCollision()) {
            this.currentPiece.x -= dx;
            this.currentPiece.y -= dy;
            
            if (dy > 0) {
                this.placePiece();
                this.clearLines();
                this.spawnPiece();
            }
        }
    }
    
    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, i) => 
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (this.checkCollision()) {
            this.currentPiece.shape = originalShape;
        }
    }
    
    placePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++; // Check the same line again
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        }
    }
    
    update(currentTime) {
        if (this.gameOver || this.paused) return;
        
        if (currentTime - this.dropTime > this.dropInterval) {
            this.movePiece(0, 1);
            this.dropTime = currentTime;
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(x, y, this.board[y][x]);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.drawBlock(
                            this.currentPiece.x + x,
                            this.currentPiece.y + y,
                            this.currentPiece.color
                        );
                    }
                }
            }
        }
        
        // Draw grid
        this.ctx.strokeStyle = '#ccc';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.cols; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.rows; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.canvas.width, y * this.gridSize);
            this.ctx.stroke();
        }
        
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
    
    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * this.gridSize + 1,
            y * this.gridSize + 1,
            this.gridSize - 2,
            this.gridSize - 2
        );
        
        // Add highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(
            x * this.gridSize + 1,
            y * this.gridSize + 1,
            this.gridSize - 2,
            4
        );
    }
    
    gameLoop(currentTime) {
        this.update(currentTime);
        this.draw();
        
        if (!this.gameOver) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
    
    start() {
        this.gameOver = false;
        this.paused = false;
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropInterval = 1000;
        this.spawnPiece();
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