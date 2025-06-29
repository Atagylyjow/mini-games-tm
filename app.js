class MiniGamesApp {
    constructor() {
        this.currentGame = null;
        this.currentGameType = null;
        this.telegram = null;
        this.leaderboard = [];
        this.playerName = 'Player';
        this.currentLanguage = 'tk'; // Varsayılan dil
        this.currentTheme = 'light'; // Varsayılan tema
        
        // Can sistemi
        this.maxLives = 5;
        this.lives = this.maxLives;
        this.lifeRegenerationTime = 30 * 60 * 1000; // 30 dakika (milisaniye)
        this.lastLifeLossTime = null;
        this.lifeTimer = null;
        
        // Game over kontrolü için flag
        this.gameOverHandled = false;
        
        // Coin sistemi
        this.coins = 0;
        
        this.init();
    }
    
    init() {
        this.initTelegram();
        this.loadSettings();
        this.loadLives();
        this.loadCoins();
        this.bindEvents();
        this.loadLeaderboard();
        this.updateLeaderboard();
        this.updateLanguage();
        this.startLifeTimer();
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
                this.updateUsernameDisplay();
            }
            
            // Set theme based on Telegram theme
            if (this.telegram.colorScheme === 'dark') {
                this.setTheme('dark');
            }
        }
    }
    
    loadSettings() {
        // Load saved settings from localStorage
        const savedLanguage = localStorage.getItem('miniGamesLanguage');
        const savedTheme = localStorage.getItem('miniGamesTheme');
        
        if (savedLanguage) {
            this.currentLanguage = savedLanguage;
        }
        if (savedTheme) {
            this.currentTheme = savedTheme;
        }
        
        // Update UI elements
        document.getElementById('languageSelect').value = this.currentLanguage;
        this.updateThemeButtons();
    }
    
    saveSettings() {
        localStorage.setItem('miniGamesLanguage', this.currentLanguage);
        localStorage.setItem('miniGamesTheme', this.currentTheme);
    }
    
    loadLives() {
        // Load lives from localStorage
        const savedLives = localStorage.getItem('miniGamesLives');
        const savedLastLifeLoss = localStorage.getItem('miniGamesLastLifeLoss');
        
        if (savedLives !== null) {
            this.lives = parseInt(savedLives);
        }
        
        if (savedLastLifeLoss) {
            this.lastLifeLossTime = parseInt(savedLastLifeLoss);
        }
        
        this.updateLivesDisplay();
    }
    
    saveLives() {
        localStorage.setItem('miniGamesLives', this.lives.toString());
        if (this.lastLifeLossTime) {
            localStorage.setItem('miniGamesLastLifeLoss', this.lastLifeLossTime.toString());
        }
    }
    
    loadCoins() {
        // Load coins from localStorage
        const savedCoins = localStorage.getItem('miniGamesCoins');
        if (savedCoins !== null) {
            this.coins = parseInt(savedCoins);
        }
        this.updateCoinDisplay();
    }
    
    saveCoins() {
        localStorage.setItem('miniGamesCoins', this.coins.toString());
    }
    
    addCoins(amount) {
        this.coins += amount;
        this.saveCoins();
        this.updateCoinDisplay();
        
        // Show notification
        this.showNotification(this.getTranslation('coinsEarned').replace('{amount}', amount), 'success');
    }
    
    updateCoinDisplay() {
        document.getElementById('coinCount').textContent = this.coins;
        document.getElementById('currentCoinCount').textContent = this.coins;
    }
    
    startLifeTimer() {
        // Check for life regeneration every second
        this.lifeTimer = setInterval(() => {
            this.checkLifeRegeneration();
        }, 1000);
    }
    
    checkLifeRegeneration() {
        if (this.lives >= this.maxLives) {
            this.updateLivesDisplay();
            return;
        }
        
        if (!this.lastLifeLossTime) {
            this.lastLifeLossTime = Date.now();
            this.saveLives();
        }
        
        const timeSinceLastLoss = Date.now() - this.lastLifeLossTime;
        const timeUntilNextLife = this.lifeRegenerationTime - timeSinceLastLoss;
        
        if (timeUntilNextLife <= 0) {
            // Add a life
            this.lives = Math.min(this.lives + 1, this.maxLives);
            this.lastLifeLossTime = Date.now();
            this.saveLives();
            this.updateLivesDisplay();
            
            // Show notification
            this.showNotification(this.getTranslation('lifeRegenerated'), 'success');
        } else {
            // Update timer display
            this.updateLifeTimer(timeUntilNextLife);
        }
    }
    
    updateLifeTimer(timeRemaining) {
        const minutes = Math.floor(timeRemaining / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        const timerText = `${this.getTranslation('nextLife')}: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timerText').textContent = timerText;
    }
    
    updateLivesDisplay() {
        const livesCount = document.getElementById('livesCount');
        const livesText = document.getElementById('livesText');
        const nextLifeTimer = document.getElementById('nextLifeTimer');
        const livesBarFill = document.getElementById('livesBarFill');
        
        // Update can barı animasyonu
        const fillPercentage = (this.lives / this.maxLives) * 100;
        livesBarFill.style.width = `${fillPercentage}%`;
        
        // Update can sayısı
        livesCount.textContent = `${this.lives}/${this.maxLives}`;
        
        if (this.lives >= this.maxLives) {
            livesText.textContent = this.getTranslation('livesFull');
            nextLifeTimer.style.display = 'none';
        } else {
            livesText.textContent = this.getTranslation('livesRemaining');
            nextLifeTimer.style.display = 'block';
        }
    }
    
    loseLife() {
        if (this.lives > 0) {
            this.lives--;
            this.lastLifeLossTime = Date.now();
            this.saveLives();
            this.updateLivesDisplay();
            
            // Show notification
            this.showNotification(this.getTranslation('lifeLost'), 'error');
            
            return true;
        }
        return false;
    }
    
    canPlayGame() {
        return this.lives > 0;
    }
    
    bindEvents() {
        // Game card clicks
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!this.canPlayGame()) {
                    this.showNotification(this.getTranslation('noLivesLeft'), 'error');
                    return;
                }
                
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
            if (!this.canPlayGame()) {
                this.showNotification(this.getTranslation('noLivesLeft'), 'error');
                this.showHomeScreen();
                return;
            }
            this.restartCurrentGame();
        });
        
        document.getElementById('homeBtn').addEventListener('click', () => {
            this.showHomeScreen();
        });
        
        // Settings modal events
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });
        
        document.getElementById('closeSettings').addEventListener('click', () => {
            this.closeSettings();
        });
        
        // Close modal when clicking outside
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.closeSettings();
            }
        });
        
        // Coin modal events
        document.getElementById('addCoinBtn').addEventListener('click', () => {
            this.openCoinModal();
        });
        
        document.getElementById('closeCoinModal').addEventListener('click', () => {
            this.closeCoinModal();
        });
        
        // Close coin modal when clicking outside
        document.getElementById('coinModal').addEventListener('click', (e) => {
            if (e.target.id === 'coinModal') {
                this.closeCoinModal();
            }
        });
        
        // Watch ad button
        document.getElementById('watchAdBtn').addEventListener('click', () => {
            this.watchAd();
        });
        
        // Language change
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });
        
        // Theme buttons
        document.getElementById('lightTheme').addEventListener('click', () => {
            this.setTheme('light');
        });
        
        document.getElementById('darkTheme').addEventListener('click', () => {
            this.setTheme('dark');
        });
        
        // Check for game over
        setInterval(() => {
            if (this.currentGame && this.currentGame.isGameOver() && !this.gameOverHandled) {
                this.handleGameOver();
                this.gameOverHandled = true;
            }
        }, 100);
        
        // Update score display
        setInterval(() => {
            if (this.currentGame) {
                this.updateScoreDisplay();
            }
        }, 100);
    }
    
    openSettings() {
        document.getElementById('settingsModal').classList.add('active');
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }
    
    closeSettings() {
        document.getElementById('settingsModal').classList.remove('active');
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    openCoinModal() {
        document.getElementById('coinModal').classList.add('active');
        this.updateCoinDisplay();
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }
    
    closeCoinModal() {
        document.getElementById('coinModal').classList.remove('active');
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    watchAd() {
        // Reklam izleme simülasyonu
        const watchAdBtn = document.getElementById('watchAdBtn');
        watchAdBtn.disabled = true;
        watchAdBtn.textContent = this.getTranslation('watchingAd');
        
        // 3 saniye sonra coin ver
        setTimeout(() => {
            this.addCoins(1);
            watchAdBtn.disabled = false;
            watchAdBtn.textContent = this.getTranslation('watchAdButton');
            this.closeCoinModal();
        }, 3000);
    }
    
    changeLanguage(language) {
        this.currentLanguage = language;
        this.saveSettings();
        this.updateLanguage();
        
        // Show notification
        this.showNotification(this.getTranslation('languageChanged'), 'success');
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        this.saveSettings();
        
        // Remove existing theme classes
        document.body.classList.remove('light-theme', 'dark-theme');
        
        // Add new theme class
        document.body.classList.add(`${theme}-theme`);
        
        // Update theme buttons
        this.updateThemeButtons();
        
        // Show notification
        this.showNotification(this.getTranslation('themeChanged'), 'success');
    }
    
    updateThemeButtons() {
        const lightBtn = document.getElementById('lightTheme');
        const darkBtn = document.getElementById('darkTheme');
        
        lightBtn.classList.toggle('active', this.currentTheme === 'light');
        darkBtn.classList.toggle('active', this.currentTheme === 'dark');
    }
    
    updateUsernameDisplay() {
        document.getElementById('usernameDisplay').textContent = this.playerName;
    }
    
    updateLanguage() {
        // Update all translatable elements
        const elements = {
            'welcomeTitle': 'welcomeTitle',
            'welcomeText': 'welcomeText',
            'snakeTitle': 'snakeTitle',
            'snakeDesc': 'snakeDesc',
            'tetrisTitle': 'tetrisTitle',
            'tetrisDesc': 'tetrisDesc',
            'memoryTitle': 'memoryTitle',
            'memoryDesc': 'memoryDesc',
            'tictactoeTitle': 'tictactoeTitle',
            'tictactoeDesc': 'tictactoeDesc',
            'leaderboardTitle': 'leaderboardTitle',
            'currentGameTitle': 'currentGameTitle',
            'gameOverTitle': 'gameOverTitle',
            'playAgainBtn': 'playAgainBtn',
            'homeBtn': 'homeBtn',
            'settingsTitle': 'settingsTitle',
            'languageLabel': 'languageLabel',
            'usernameLabel': 'usernameLabel',
            'themeLabel': 'themeLabel',
            'coinModalTitle': 'coinModalTitle',
            'coinModalText': 'coinModalText',
            'watchAdButton': 'watchAdButton',
            'adInfoText': 'adInfoText'
        };
        
        for (const [elementId, translationKey] of Object.entries(elements)) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = this.getTranslation(translationKey);
            }
        }
        
        // Update theme button texts
        document.getElementById('lightTheme').textContent = this.getTranslation('lightTheme');
        document.getElementById('darkTheme').textContent = this.getTranslation('darkTheme');
        
        // Update lives display
        this.updateLivesDisplay();
    }
    
    getTranslation(key) {
        const translations = window.translations[this.currentLanguage];
        return translations && translations[key] ? translations[key] : key;
    }
    
    startGame(gameType) {
        if (!this.canPlayGame()) {
            this.showNotification(this.getTranslation('noLivesLeft'), 'error');
            return;
        }
        
        this.currentGameType = gameType;
        this.gameOverHandled = false;
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
        
        this.gameOverHandled = false;
    }
    
    showGameOverScreen() {
        document.getElementById('homeScreen').classList.remove('active');
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('gameOverScreen').classList.add('active');
    }
    
    updateGameTitle() {
        const titles = {
            snake: this.getTranslation('snakeTitle'),
            tetris: this.getTranslation('tetrisTitle'),
            memory: this.getTranslation('memoryTitle'),
            tictactoe: this.getTranslation('tictactoeTitle')
        };
        
        document.getElementById('currentGameTitle').textContent = titles[this.currentGameType] || this.getTranslation('gameTitle');
    }
    
    updateScoreDisplay() {
        if (this.currentGame) {
            const score = this.currentGame.getScore();
            document.getElementById('scoreDisplay').textContent = `${this.getTranslation('score')}: ${score}`;
        }
    }
    
    handleGameOver() {
        if (this.currentGame) {
            const finalScore = this.currentGame.getScore();
            document.getElementById('finalScoreText').textContent = `${this.getTranslation('finalScore')}: ${finalScore}`;
            
            // Add to leaderboard
            this.addToLeaderboard(finalScore);
            
            // Lose a life
            this.loseLife();
            
            this.showGameOverScreen();
        }
    }
    
    restartCurrentGame() {
        if (!this.canPlayGame()) {
            this.showNotification(this.getTranslation('noLivesLeft'), 'error');
            this.showHomeScreen();
            return;
        }
        
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
        
        this.saveLeaderboard();
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
        
        // Get top 10 scores
        const topScores = this.leaderboard.slice(0, 10);
        
        if (topScores.length === 0) {
            leaderboardList.innerHTML = `<div class="leaderboard-item">
                <span>${this.getTranslation('noScoresYet')}</span>
            </div>`;
            return;
        }
        
        topScores.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            const rank = index + 1;
            const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}️⃣`;
            
            const gameNames = {
                snake: this.getTranslation('snakeTitle'),
                tetris: this.getTranslation('tetrisTitle'),
                memory: this.getTranslation('memoryTitle'),
                tictactoe: this.getTranslation('tictactoeTitle')
            };
            
            item.innerHTML = `
                <span class="rank">${rankEmoji}</span>
                <div class="player-info">
                    <div class="player-name">${entry.player}</div>
                    <div class="game-type">${gameNames[entry.game] || entry.game}</div>
                </div>
                <span class="score">${entry.score}</span>
            `;
            
            leaderboardList.appendChild(item);
        });
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#667eea'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    shareScore(score) {
        if (this.telegram) {
            const gameName = this.getTranslation(`${this.currentGameType}Title`);
            const message = `${this.getTranslation('shareScoreMessage')} ${gameName}: ${score}! 🎮`;
            this.telegram.sendData(JSON.stringify({
                action: 'share',
                score: score,
                game: this.currentGameType,
                message: message
            }));
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MiniGamesApp();
});

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .light-theme {
        --bg-color: #ffffff;
        --text-color: #333333;
        --card-bg: rgba(255, 255, 255, 0.95);
    }
    
    .dark-theme {
        --bg-color: #1a1a1a;
        --text-color: #ffffff;
        --card-bg: rgba(30, 30, 30, 0.95);
    }
    
    .dark-theme .header {
        background: rgba(30, 30, 30, 0.95);
        border-bottom-color: rgba(255, 255, 255, 0.1);
    }
    
    .dark-theme .app-title {
        color: #ffffff;
    }
    
    .dark-theme .game-card {
        background: rgba(30, 30, 30, 0.95);
        color: #ffffff;
    }
    
    .dark-theme .game-card h3 {
        color: #ffffff;
    }
    
    .dark-theme .game-card p {
        color: #cccccc;
    }
    
    .dark-theme .leaderboard-section {
        background: rgba(30, 30, 30, 0.95);
        color: #ffffff;
    }
    
    .dark-theme .leaderboard-section h3 {
        color: #ffffff;
    }
    
    .dark-theme .leaderboard-item {
        border-bottom-color: rgba(255, 255, 255, 0.1);
    }
    
    .dark-theme .leaderboard-item:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }
`;
document.head.appendChild(style);

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