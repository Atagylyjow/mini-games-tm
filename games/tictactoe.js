class TicTacToeGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winner = null;
        this.score = 0;
        this.paused = false;
        this.moves = 0;
        
        this.setupCanvas();
        this.bindEvents();
    }
    
    setupCanvas() {
        this.canvas.width = 300;
        this.canvas.height = 300;
    }
    
    bindEvents() {
        this.canvas.addEventListener('click', (e) => {
            if (this.gameOver || this.paused) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const cellX = Math.floor(x / 100);
            const cellY = Math.floor(y / 100);
            const index = cellY * 3 + cellX;
            
            this.makeMove(index);
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameOver || this.paused) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left;
            const y = e.touches[0].clientY - rect.top;
            
            const cellX = Math.floor(x / 100);
            const cellY = Math.floor(y / 100);
            const index = cellY * 3 + cellX;
            
            this.makeMove(index);
        });
    }
    
    makeMove(index) {
        if (this.board[index] === '' && !this.gameOver) {
            this.board[index] = this.currentPlayer;
            this.moves++;
            
            if (this.checkWinner()) {
                this.gameOver = true;
                this.winner = this.currentPlayer;
                this.score = this.currentPlayer === 'X' ? 100 : 50; // X gets more points
            } else if (this.moves === 9) {
                this.gameOver = true;
                this.winner = 'tie';
                this.score = 25; // Tie game gets some points
            } else {
                this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            }
        }
    }
    
    checkWinner() {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        return winConditions.some(condition => {
            const [a, b, c] = condition;
            return this.board[a] && 
                   this.board[a] === this.board[b] && 
                   this.board[a] === this.board[c];
        });
    }
    
    update() {
        // Game logic updates if needed
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 3;
        
        // Vertical lines
        this.ctx.beginPath();
        this.ctx.moveTo(100, 0);
        this.ctx.lineTo(100, 300);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(200, 0);
        this.ctx.lineTo(200, 300);
        this.ctx.stroke();
        
        // Horizontal lines
        this.ctx.beginPath();
        this.ctx.moveTo(0, 100);
        this.ctx.lineTo(300, 100);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, 200);
        this.ctx.lineTo(300, 200);
        this.ctx.stroke();
        
        // Draw X's and O's
        this.board.forEach((cell, index) => {
            if (cell) {
                const x = (index % 3) * 100 + 50;
                const y = Math.floor(index / 3) * 100 + 50;
                
                if (cell === 'X') {
                    this.drawX(x, y);
                } else {
                    this.drawO(x, y);
                }
            }
        });
        
        // Draw current player indicator
        if (!this.gameOver) {
            this.ctx.fillStyle = '#333';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Current Player: ${this.currentPlayer}`, 150, 20);
        }
        
        // Draw winner or tie
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            
            if (this.winner === 'tie') {
                this.ctx.fillText('It\'s a Tie!', 150, 140);
            } else {
                this.ctx.fillText(`Winner: ${this.winner}!`, 150, 140);
            }
            
            this.ctx.font = '16px Arial';
            this.ctx.fillText('Click to restart', 150, 170);
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
    
    drawX(x, y) {
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(x - 25, y - 25);
        this.ctx.lineTo(x + 25, y + 25);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + 25, y - 25);
        this.ctx.lineTo(x - 25, y + 25);
        this.ctx.stroke();
    }
    
    drawO(x, y) {
        this.ctx.strokeStyle = '#3498db';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, 25, 0, 2 * Math.PI);
        this.ctx.stroke();
    }
    
    gameLoop(currentTime) {
        this.update();
        this.draw();
        
        if (!this.gameOver) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
    
    start() {
        this.gameOver = false;
        this.paused = false;
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.winner = null;
        this.score = 0;
        this.moves = 0;
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