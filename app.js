class MiniGamesApp {
    constructor() {
        this.currentGame = null;
        this.currentGameType = null;
        this.telegram = null;
        this.leaderboard = [];
        this.playerName = 'Player';
        this.currentLanguage = 'tk'; // Varsayılan dil
        this.currentTheme = 'light'; // Varsayılan tema
        this.activeScreen = 'mainMenuScreen'; // Aktif ekran
        
        // Can sistemi
        this.maxLives = 5;
        this.lives = this.maxLives;
        this.lifeRegenerationTime = 30 * 60 * 1000; // 30 dakika
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
        this.showScreen('mainMenuScreen');
    }
    
    initTelegram() {
        if (window.Telegram && window.Telegram.WebApp) {
            this.telegram = window.Telegram.WebApp;
            this.telegram.ready();
            this.telegram.expand();
            
            if (this.telegram.initDataUnsafe && this.telegram.initDataUnsafe.user) {
                const user = this.telegram.initDataUnsafe.user;
                this.playerName = user.first_name || 'Player';
                if (user.last_name) {
                    this.playerName += ' ' + user.last_name;
                }
                this.updateUsernameDisplay();
            }
            
            if (this.telegram.colorScheme === 'dark') {
                this.setTheme('dark');
            }
        }
    }
    
    loadSettings() {
        const savedLanguage = localStorage.getItem('miniGamesLanguage');
        const savedTheme = localStorage.getItem('miniGamesTheme');
        
        if (savedLanguage) this.currentLanguage = savedLanguage;
        if (savedTheme) this.currentTheme = savedTheme;
        
        document.getElementById('languageSelect').value = this.currentLanguage;
        this.updateThemeButtons();
    }
    
    saveSettings() {
        localStorage.setItem('miniGamesLanguage', this.currentLanguage);
        localStorage.setItem('miniGamesTheme', this.currentTheme);
    }
    
    loadLives() {
        const savedLives = localStorage.getItem('miniGamesLives');
        const savedLastLifeLoss = localStorage.getItem('miniGamesLastLifeLoss');
        
        if (savedLives !== null) this.lives = parseInt(savedLives);
        if (savedLastLifeLoss) this.lastLifeLossTime = parseInt(savedLastLifeLoss);
        
        this.updateLivesDisplay();
    }
    
    saveLives() {
        localStorage.setItem('miniGamesLives', this.lives.toString());
        if (this.lastLifeLossTime) {
            localStorage.setItem('miniGamesLastLifeLoss', this.lastLifeLossTime.toString());
        }
    }
    
    loadCoins() {
        const savedCoins = localStorage.getItem('miniGamesCoins');
        if (savedCoins !== null) this.coins = parseInt(savedCoins);
        this.updateCoinDisplay();
    }
    
    saveCoins() {
        localStorage.setItem('miniGamesCoins', this.coins.toString());
    }
    
    addCoins(amount) {
        this.coins += amount;
        this.saveCoins();
        this.updateCoinDisplay();
        this.showNotification(this.getTranslation('coinsEarned').replace('{amount}', amount), 'success');
    }
    
    updateCoinDisplay() {
        document.getElementById('coinCount').textContent = this.coins;
        document.getElementById('currentCoinCount').textContent = this.coins;
    }
    
    startLifeTimer() {
        this.lifeTimer = setInterval(() => this.checkLifeRegeneration(), 1000);
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
            this.lives = Math.min(this.lives + 1, this.maxLives);
            this.lastLifeLossTime = Date.now();
            this.saveLives();
            this.updateLivesDisplay();
            this.showNotification(this.getTranslation('lifeRegenerated'), 'success');
        } else {
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
        
        const fillPercentage = (this.lives / this.maxLives) * 100;
        livesBarFill.style.width = `${fillPercentage}%`;
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
            this.showNotification(this.getTranslation('lifeLost'), 'error');
            return true;
        }
        return false;
    }
    
    canPlayGame() {
        return this.lives > 0;
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        this.activeScreen = screenId;

        // Aktif menü butonunu güncelle
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        if (screenId === 'shopScreen') {
            document.getElementById('shopBtn').classList.add('active');
        } else if (screenId === 'singlePlayerScreen') {
            document.getElementById('singlePlayerBtn').classList.add('active');
        } else if (screenId === 'multiPlayerScreen') {
            document.getElementById('multiPlayerBtn').classList.add('active');
        } else if (screenId === 'leaderboardScreen') {
            document.getElementById('leaderboardBtn').classList.add('active');
        }
    }
    
    bindEvents() {
        // Alt menü butonları
        document.getElementById('singlePlayerBtn').addEventListener('click', () => this.showScreen('singlePlayerScreen'));
        document.getElementById('multiPlayerBtn').addEventListener('click', () => this.showScreen('multiPlayerScreen'));
        document.getElementById('shopBtn').addEventListener('click', () => this.showScreen('shopScreen'));
        document.getElementById('leaderboardBtn').addEventListener('click', () => this.showScreen('leaderboardScreen'));
        
        // Geri butonları
        document.getElementById('backToMain').addEventListener('click', () => this.showScreen('mainMenuScreen'));
        document.getElementById('backToMain2').addEventListener('click', () => this.showScreen('mainMenuScreen'));
        document.getElementById('backToMain3').addEventListener('click', () => this.showScreen('mainMenuScreen'));
        document.getElementById('backToMain4').addEventListener('click', () => this.showScreen('mainMenuScreen'));
        document.getElementById('backToGames').addEventListener('click', () => {
            this.setGameMode(false);
            this.showScreen('singlePlayerScreen');
            if(this.currentGame) {
                this.currentGame.pause();
                this.currentGame = null;
            }
        });
        
        // Oyun kartı -> Talimatları göster
        document.querySelector('.game-card[data-game="bubble-shooter"]').addEventListener('click', () => {
            this.showGameInstructions('bubble-shooter');
        });

        // Talimatlardan oyunu başlat
        document.getElementById('startGameFromInstructionsBtn').addEventListener('click', () => {
            const gameType = document.getElementById('startGameFromInstructionsBtn').dataset.game;
            this.startGame(gameType);
        });

        // Talimatlardan geri dön
        document.getElementById('backToGamesFromInstructions').addEventListener('click', () => {
            this.showScreen('singlePlayerScreen');
        });

        // Çok oyunculu ekranındaki buton
        document.getElementById('trySinglePlayer').addEventListener('click', () => this.showScreen('singlePlayerScreen'));

        // Game over butonları
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            if (!this.canPlayGame()) {
                this.showNotification(this.getTranslation('noLivesLeft'), 'error');
                this.showScreen('mainMenuScreen');
                return;
            }
            this.restartCurrentGame();
        });
        
        document.getElementById('homeBtn').addEventListener('click', () => {
            this.setGameMode(false);
            this.showScreen('mainMenuScreen');
        });

        // Ayarlar ve Coin Modalları
        this.bindModalEvents();
        
        // Periyodik kontroller
        setInterval(() => {
            if (this.currentGame && this.currentGame.isGameOver() && !this.gameOverHandled) {
                this.handleGameOver(this.currentGame.getScore());
                this.gameOverHandled = true;
            }
        }, 100);
        
        setInterval(() => {
            if (this.currentGame && !this.currentGame.isGameOver()) {
                this.updateScoreDisplay();
            }
        }, 100);
    }
    
    bindModalEvents() {
        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettings').addEventListener('click', () => this.closeSettings());
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') this.closeSettings();
        });
        
        // Coin modal
        document.getElementById('addCoinBtn').addEventListener('click', () => this.openCoinModal());
        document.getElementById('closeCoinModal').addEventListener('click', () => this.closeCoinModal());
        document.getElementById('coinModal').addEventListener('click', (e) => {
            if (e.target.id === 'coinModal') this.closeCoinModal();
        });
        
        // Ad watch
        document.getElementById('watchAdBtn').addEventListener('click', () => this.watchAd());
        
        // Language & Theme
        document.getElementById('languageSelect').addEventListener('change', (e) => this.changeLanguage(e.target.value));
        document.getElementById('lightTheme').addEventListener('click', () => this.setTheme('light'));
        document.getElementById('darkTheme').addEventListener('click', () => this.setTheme('dark'));
    }

    startGame(gameType) {
        if (!this.canPlayGame()) {
            this.showNotification(this.getTranslation('noLivesLeft'), 'error');
            return;
        }
        
        if (this.loseLife()) {
            this.gameOverHandled = false;
            this.currentGameType = gameType;
            this.setGameMode(true);
            this.showScreen('gameScreen');
            
            const canvas = document.getElementById('gameCanvas');
            
            switch (gameType) {
                case 'bubble-shooter':
                    this.currentGame = new BubbleShooter(canvas);
                    break;
                // Diğer oyunlar buraya eklenebilir
            }
            
            if (this.currentGame) {
                this.currentGame.start();
                this.updateScoreDisplay();
            }
        }
    }
    
    restartCurrentGame() {
        if (this.currentGame) {
            if (!this.canPlayGame()) {
                this.showNotification(this.getTranslation('noLivesLeft'), 'error');
                this.setGameMode(false);
                this.showScreen('mainMenuScreen');
                return;
            }
            if (this.loseLife()) {
                this.gameOverHandled = false;
                this.currentGame.restart();
            } else {
                this.setGameMode(false);
                this.showScreen('mainMenuScreen');
            }
        }
    }
    
    handleGameOver(score) {
        this.addScoreToLeaderboard(this.playerName, score, this.currentGameType);
        document.getElementById('finalScoreText').textContent = `${this.getTranslation('finalScore')}: ${score}`;
        this.setGameMode(false);
        this.showScreen('gameOverScreen');
    }
    
    updateScoreDisplay() {
        if (this.currentGame) {
            const score = this.currentGame.getScore();
            document.getElementById('scoreDisplay').textContent = `${this.getTranslation('score')}: ${score}`;
        }
    }
    
    // Diğer fonksiyonlar (leaderboard, modals, theme, language vb.)
    // ... (önceki koddan büyük ölçüde aynı kalacak)
    
    openSettings() {
        document.getElementById('settingsModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeSettings() {
        document.getElementById('settingsModal').classList.remove('active');
        document.body.style.overflow = '';
    }
    
    openCoinModal() {
        document.getElementById('coinModal').classList.add('active');
        this.updateCoinDisplay();
        document.body.style.overflow = 'hidden';
    }
    
    closeCoinModal() {
        document.getElementById('coinModal').classList.remove('active');
        document.body.style.overflow = '';
    }
    
    watchAd() {
        const watchAdBtn = document.getElementById('watchAdBtn');
        watchAdBtn.disabled = true;
        watchAdBtn.textContent = this.getTranslation('watchingAd');
        
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
        this.showNotification(this.getTranslation('languageChanged'), 'success');
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        this.saveSettings();
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
        this.updateThemeButtons();
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
    
    getTranslation(key) {
        const translations = window.translations[this.currentLanguage];
        return (translations && translations[key]) ? translations[key] : key;
    }

    updateLanguage() {
        const elements = {
            // Ana Menü
            'logo-title': 'logoTitle',
            'logo-subtitle': 'logoSubtitle',
            'totalGamesLabel': 'totalGames',
            'bestScoreLabel': 'bestScore',

            // Tek Oyunculu
            'singlePlayerTitle': 'singlePlayerTitle',
            'bubbleShooterTitle': 'bubbleShooterTitle',
            'bubbleShooterDesc': 'bubbleShooterDesc',

            // Çok Oyunculu
            'multiPlayerTitle': 'multiPlayerTitle',
            'comingSoonTitle': 'comingSoonTitle',
            'comingSoonText': 'comingSoonText',
            'trySinglePlayer': 'trySinglePlayer',

            // Mağaza
            'shopTitle': 'shopTitle',

            // Leaderboard
            'leaderboardTitle': 'leaderboardTitle',

            // Oyun
            'currentGameTitle': 'gameTitle',
            'gameOverTitle': 'gameOverTitle',
            'playAgainBtn': 'playAgainBtn',
            'homeBtn': 'homeBtn',
            'instructionsTitle': 'instructionsTitle',
            'startGameFromInstructionsBtn': 'startGameBtn',
            'backToGamesFromInstructions': 'backBtn',
            
            // Ayarlar
            'settingsTitle': 'settingsTitle',
            'languageLabel': 'languageLabel',
            'usernameLabel': 'usernameLabel',
            'themeLabel': 'themeLabel',
            
            // Coin Modal
            'coinModalTitle': 'coinModalTitle',
            'coinModalText': 'coinModalText',
            'watchAdButton': 'watchAdButton',
            'adInfoText': 'adInfoText',

            // Alt Menü
            'shopBtnLabel': 'shopLabel',
            'singlePlayerBtnLabel': 'singlePlayerLabel',
            'multiPlayerBtnLabel': 'multiPlayerLabel',
            'leaderboardBtnLabel': 'leaderboardLabel'
        };

        for (const [elementId, translationKey] of Object.entries(elements)) {
            // Bazı ID'ler etiketlere ait, bu yüzden try-catch kullanmak daha güvenli
            try {
                // Eğer ID sonunda 'Label' varsa, bu bir etiket olabilir
                if (elementId.endsWith('Label')) {
                    const btnId = elementId.replace('Label', '');
                    document.querySelector(`#${btnId} .nav-label`).textContent = this.getTranslation(translationKey);
                } else if (document.getElementById(elementId)) {
                    document.getElementById(elementId).textContent = this.getTranslation(translationKey);
                }
            } catch (e) {
                // Element bulunamazsa hata vermemesi için
                // console.warn(`Translation element not found: ${elementId}`);
            }
        }
        
        this.updateThemeButtons();
        this.updateLivesDisplay();
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    loadLeaderboard() {
        const savedLeaderboard = localStorage.getItem('miniGamesLeaderboard');
        if (savedLeaderboard) {
            this.leaderboard = JSON.parse(savedLeaderboard);
        }
    }
    
    saveLeaderboard() {
        localStorage.setItem('miniGamesLeaderboard', JSON.stringify(this.leaderboard));
    }
    
    addScoreToLeaderboard(player, score, game) {
        this.leaderboard.push({ player, score, game });
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 50); // En iyi 50 skoru tut
        this.saveLeaderboard();
        this.updateLeaderboard();
    }
    
    updateLeaderboard() {
        const list = document.getElementById('leaderboardList');
        list.innerHTML = '';
        
        if (this.leaderboard.length === 0) {
            list.innerHTML = `<div class="no-scores">${this.getTranslation('noScoresYet')}</div>`;
            return;
        }
        
        this.leaderboard.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            let rankClass = `rank-${index + 1}`;
            if (index > 2) rankClass = '';
            
            item.innerHTML = `
                <div class="rank ${rankClass}">${index + 1}</div>
                <div class="player-info">
                    <div class="player-name">${entry.player}</div>
                    <div class="player-score">${this.getTranslation('score')}: ${entry.score} (${entry.game})</div>
                </div>
            `;
            list.appendChild(item);
        });
    }

    setGameMode(active) {
        document.body.classList.toggle('game-mode-active', active);
    }

    showGameInstructions(gameType) {
        const title = document.getElementById('instructionsTitle');
        const text = document.getElementById('instructionsText');
        const startBtn = document.getElementById('startGameFromInstructionsBtn');

        title.textContent = this.getTranslation(`${gameType}Title`);
        text.innerHTML = this.getTranslation(`${gameType}Instructions`);
        startBtn.dataset.game = gameType;

        this.showScreen('gameInstructionsScreen');
    }
}

// Uygulamayı başlat
window.addEventListener('load', () => {
    window.app = new MiniGamesApp();
}); 