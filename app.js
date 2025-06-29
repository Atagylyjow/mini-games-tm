class MiniGamesApp {
    constructor() {
        this.currentGame = null;
        this.currentGameType = null;
        this.telegram = null;
        this.leaderboard = [];
        this.playerName = 'Player';
        
        this.init();
    }
    
    init() {
        this.initTelegram();
        this.bindEvents();
        this.loadLeaderboard();
        this.updateLeaderboard();
    }
    
    initTelegram() {
        // Initialize Telegram Web App
        if (window.Telegram && window.Telegram.WebApp) {
            this.telegram = window.Telegram.WebApp;
            this.telegram.ready();
            this.telegram.expand();
            
            // Get user info
            if (this.telegram.initDataUnsafe && this.telegram.initDataUnsafe.user) {
                const user = this.telegram.initDataUnsafe.user;
                this.playerName = user.first_name || 'Player';
                if (user.last_name) {
                    this.playerName += ' ' + user.last_name;
                }
            }
            
            // Set theme
            if (this.telegram.colorScheme === 'dark') {
                document.body.classList.add('dark-theme');
            }
        }
    }
    
    bindEvents() {
        // Game card clicks
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const gameType = card.dataset.game;
                this.startGame(gameType);
            });
        });
        
        // Back button
        document.getElementById('backToHome').addEventListener('click', () => {
            this.showHomeScreen();
        });
        
        // Pause button
        document.getElementById('pauseBtn').addEventListener('click', () => {
            if (this.currentGame) {
                this.currentGame.pause();
            }
        });
        
        // Restart button
        document.getElementById('restartBtn').addEventListener('click', () => {
            if (this.currentGame) {
                this.currentGame.restart();
            }
        });
        
        // Game over buttons
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.restartCurrentGame();
        });
        
        document.getElementById('homeBtn').addEventListener('click', () => {
            this.showHomeScreen();
        });
        
        // Check for game over
        setInterval(() => {
            if (this.currentGame && this.currentGame.isGameOver()) {
                this.handleGameOver();
            }
        }, 100);
        
        // Update score display
        setInterval(() => {
            if (this.currentGame) {
                this.updateScoreDisplay();
            }
        }, 100);
    }
    
    startGame(gameType) {
        this.currentGameType = gameType;
        this.showGameScreen();
        
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Initialize game based on type
        switch (gameType) {
            case 'snake':
                this.currentGame = new SnakeGame(canvas);
                break;
            case 'tetris':
                this.currentGame = new TetrisGame(canvas);
                break;
            case 'memory':
                this.currentGame = new MemoryGame(canvas);
                break;
            case 'tictactoe':
                this.currentGame = new TicTacToeGame(canvas);
                break;
        }
        
        if (this.currentGame) {
            this.currentGame.start();
            this.updateGameTitle();
        }
    }
    
    showGameScreen() {
        document.getElementById('homeScreen').classList.remove('active');
        document.getElementById('gameOverScreen').classList.remove('active');
        document.getElementById('gameScreen').classList.add('active');
    }
    
    showHomeScreen() {
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('gameOverScreen').classList.remove('active');
        document.getElementById('homeScreen').classList.add('active');
        
        if (this.currentGame) {
            this.currentGame = null;
        }
    }
    
    showGameOverScreen() {
        document.getElementById('homeScreen').classList.remove('active');
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('gameOverScreen').classList.add('active');
    }
    
    updateGameTitle() {
        const titles = {
            snake: 'Snake',
            tetris: 'Tetris',
            memory: 'Memory Game',
            tictactoe: 'Tic Tac Toe'
        };
        
        document.getElementById('currentGameTitle').textContent = titles[this.currentGameType] || 'Game';
    }
    
    updateScoreDisplay() {
        if (this.currentGame) {
            const score = this.currentGame.getScore();
            document.getElementById('scoreDisplay').textContent = `Skor: ${score}`;
        }
    }
    
    handleGameOver() {
        if (this.currentGame) {
            const finalScore = this.currentGame.getScore();
            document.getElementById('finalScoreText').textContent = `Final Skor: ${finalScore}`;
            
            // Add to leaderboard
            this.addToLeaderboard(finalScore);
            
            this.showGameOverScreen();
        }
    }
    
    restartCurrentGame() {
        if (this.currentGame) {
            this.currentGame.restart();
            this.showGameScreen();
        }
    }
    
    addToLeaderboard(score) {
        const entry = {
            player: this.playerName,
            game: this.currentGameType,
            score: score,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        this.leaderboard.push(entry);
        
        // Sort by score (descending)
        this.leaderboard.sort((a, b) => b.score - a.score);
        
        // Keep only top 50 entries
        this.leaderboard = this.leaderboard.slice(0, 50);
        
        // Save to localStorage
        this.saveLeaderboard();
        
        // Update display
        this.updateLeaderboard();
    }
    
    loadLeaderboard() {
        const saved = localStorage.getItem('miniGamesLeaderboard');
        if (saved) {
            try {
                this.leaderboard = JSON.parse(saved);
            } catch (e) {
                this.leaderboard = [];
            }
        }
    }
    
    saveLeaderboard() {
        localStorage.setItem('miniGamesLeaderboard', JSON.stringify(this.leaderboard));
    }
    
    updateLeaderboard() {
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';
        
        // Get top 10 entries
        const topEntries = this.leaderboard.slice(0, 10);
        
        if (topEntries.length === 0) {
            leaderboardList.innerHTML = '<div class="leaderboard-item"><div class="player-info">Henüz skor yok</div></div>';
            return;
        }
        
        topEntries.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            const gameNames = {
                snake: 'Snake',
                tetris: 'Tetris',
                memory: 'Memory',
                tictactoe: 'XOX'
            };
            
            item.innerHTML = `
                <div class="rank">#${index + 1}</div>
                <div class="player-info">
                    <div class="player-name">${entry.player}</div>
                    <div class="game-type">${gameNames[entry.game] || entry.game}</div>
                </div>
                <div class="score">${entry.score}</div>
            `;
            
            leaderboardList.appendChild(item);
        });
    }
    
    // Utility function to show notifications
    showNotification(message, type = 'info') {
        if (this.telegram && this.telegram.showAlert) {
            this.telegram.showAlert(message);
        } else {
            // Fallback for non-Telegram environment
            alert(message);
        }
    }
    
    // Share score function
    shareScore(score) {
        if (this.telegram && this.telegram.share) {
            const gameNames = {
                snake: 'Snake',
                tetris: 'Tetris',
                memory: 'Memory Game',
                tictactoe: 'Tic Tac Toe'
            };
            
            const message = `🎮 ${gameNames[this.currentGameType]} oyununda ${score} puan aldım! Mini Games TM'de oyna ve beni geç!`;
            
            this.telegram.share(message);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.miniGamesApp = new MiniGamesApp();
});

// Handle visibility change (pause when app is not visible)
document.addEventListener('visibilitychange', () => {
    if (window.miniGamesApp && window.miniGamesApp.currentGame) {
        if (document.hidden) {
            // App is hidden, pause the game
            if (!window.miniGamesApp.currentGame.paused) {
                window.miniGamesApp.currentGame.pause();
            }
        }
    }
});

// Handle beforeunload (save state)
window.addEventListener('beforeunload', () => {
    if (window.miniGamesApp) {
        window.miniGamesApp.saveLeaderboard();
    }
}); 