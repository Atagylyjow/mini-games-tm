class MemoryGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 4;
        this.cardSize = 80;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.score = 0;
        this.moves = 0;
        this.gameOver = false;
        this.paused = false;
        this.lastTime = 0;
        
        this.symbols = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎯'];
        this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
        
        this.setupCanvas();
        this.bindEvents();
        this.initializeCards();
    }
    
    setupCanvas() {
        this.canvas.width = this.gridSize * this.cardSize;
        this.canvas.height = this.gridSize * this.cardSize;
    }
    
    bindEvents() {
        this.canvas.addEventListener('click', (e) => {
            if (this.gameOver || this.paused) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const cardX = Math.floor(x / this.cardSize);
            const cardY = Math.floor(y / this.cardSize);
            
            this.flipCard(cardX, cardY);
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameOver || this.paused) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left;
            const y = e.touches[0].clientY - rect.top;
            
            const cardX = Math.floor(x / this.cardSize);
            const cardY = Math.floor(y / this.cardSize);
            
            this.flipCard(cardX, cardY);
        });
    }
    
    initializeCards() {
        this.cards = [];
        const symbols = [...this.symbols, ...this.symbols]; // Duplicate for pairs
        const colors = [...this.colors, ...this.colors];
        
        // Shuffle
        for (let i = symbols.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
            [colors[i], colors[j]] = [colors[j], colors[i]];
        }
        
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const index = y * this.gridSize + x;
                this.cards.push({
                    x: x,
                    y: y,
                    symbol: symbols[index],
                    color: colors[index],
                    flipped: false,
                    matched: false
                });
            }
        }
    }
    
    flipCard(x, y) {
        const card = this.cards.find(c => c.x === x && c.y === y);
        
        if (!card || card.flipped || card.matched || this.flippedCards.length >= 2) {
            return;
        }
        
        card.flipped = true;
        this.flippedCards.push(card);
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.checkMatch();
        }
    }
    
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.symbol === card2.symbol) {
            // Match found
            card1.matched = true;
            card2.matched = true;
            this.matchedPairs++;
            this.score += 100;
            
            this.flippedCards = [];
            
            if (this.matchedPairs === this.symbols.length) {
                this.gameOver = true;
                this.score += Math.max(0, 1000 - this.moves * 10); // Bonus for fewer moves
            }
        } else {
            // No match, flip back after delay
            setTimeout(() => {
                card1.flipped = false;
                card2.flipped = false;
                this.flippedCards = [];
            }, 1000);
        }
    }
    
    update() {
        // Game logic updates if needed
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw cards
        this.cards.forEach(card => {
            this.drawCard(card);
        });
        
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
    
    drawCard(card) {
        const x = card.x * this.cardSize;
        const y = card.y * this.cardSize;
        
        // Card background
        if (card.matched) {
            this.ctx.fillStyle = '#2ecc71';
        } else if (card.flipped) {
            this.ctx.fillStyle = card.color;
        } else {
            this.ctx.fillStyle = '#34495e';
        }
        
        this.ctx.fillRect(x + 2, y + 2, this.cardSize - 4, this.cardSize - 4);
        
        // Card border
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x + 2, y + 2, this.cardSize - 4, this.cardSize - 4);
        
        if (card.flipped || card.matched) {
            // Draw symbol
            this.ctx.fillStyle = 'white';
            this.ctx.font = '32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                card.symbol,
                x + this.cardSize / 2,
                y + this.cardSize / 2
            );
        } else {
            // Draw card back pattern
            this.ctx.fillStyle = '#95a5a6';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('?', x + this.cardSize / 2, y + this.cardSize / 2);
        }
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
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.score = 0;
        this.moves = 0;
        this.initializeCards();
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