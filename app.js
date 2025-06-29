class MiniGamesApp {
    constructor() {
        this.currentGame = null;
        this.currentGameType = null;
        this.telegram = null;
        this.leaderboard = {};
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
        
        // Reklam sistemi
        this.adZoneId = '9505533'; // index.html'den gelen ana zone ID
        this.adReady = false;
        this.isAdPreloading = false;
        
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
        this.setupInAppAds(); // In-App reklamları kur
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
        // Timer artık lives modal'da gösteriliyor, bu fonksiyon kullanılmıyor
        // Sadece checkLifeRegeneration'da çağrılıyor ama modal açık değilse gerek yok
    }
    
    updateLivesDisplay() {
        const livesCount = document.getElementById('livesCount');
        const livesBarFill = document.getElementById('livesBarFill');
        
        if (livesCount && livesBarFill) {
            const fillPercentage = (this.lives / this.maxLives) * 100;
            livesBarFill.style.width = `${fillPercentage}%`;
            livesCount.textContent = `${this.lives}/${this.maxLives}`;
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
        console.log('Binding events...');
        
        // Alt menü butonları
        const singlePlayerBtn = document.getElementById('singlePlayerBtn');
        const multiPlayerBtn = document.getElementById('multiPlayerBtn');
        const shopBtn = document.getElementById('shopBtn');
        const leaderboardBtn = document.getElementById('leaderboardBtn');
        
        console.log('Buttons found:', { singlePlayerBtn, multiPlayerBtn, shopBtn, leaderboardBtn });
        
        if (singlePlayerBtn) {
            singlePlayerBtn.addEventListener('click', () => {
                console.log('Single player clicked');
                this.showScreen('singlePlayerScreen');
            });
        }
        
        if (multiPlayerBtn) {
            multiPlayerBtn.addEventListener('click', () => {
                console.log('Multi player clicked');
                this.showScreen('multiPlayerScreen');
            });
        }
        
        if (shopBtn) {
            shopBtn.addEventListener('click', () => {
                console.log('Shop clicked');
                this.showScreen('shopScreen');
            });
        }
        
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => {
                console.log('Leaderboard clicked');
                this.showScreen('leaderboardScreen');
            });
        }
        
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
        const gameCard = document.querySelector('.game-card[data-game="geometry-dash"]');
        if (gameCard) {
            gameCard.addEventListener('click', () => {
                console.log('Geometry Dash game card clicked');
                this.showGameInstructions('geometry-dash');
            });
        }
        document.querySelector('.game-card[data-game="taptap-shots"]').addEventListener('click', () => {
            this.showGameInstructions('taptap-shots');
        });

        // Talimatlardan oyunu başlat
        const startGameBtn = document.getElementById('startGameFromInstructionsBtn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                console.log('Start game from instructions clicked');
                const gameType = startGameBtn.dataset.game;
                this.startGame(gameType);
            });
        }

        // Talimatlardan geri dön
        const backToGamesBtn = document.getElementById('backToGamesFromInstructions');
        if (backToGamesBtn) {
            backToGamesBtn.addEventListener('click', () => {
                console.log('Back to games from instructions clicked');
                this.showScreen('singlePlayerScreen');
            });
        }

        // Çok oyunculu ekranındaki buton
        const trySinglePlayerBtn = document.getElementById('trySinglePlayer');
        if (trySinglePlayerBtn) {
            trySinglePlayerBtn.addEventListener('click', () => {
                console.log('Try single player clicked');
                this.showScreen('singlePlayerScreen');
            });
        }

        // Game over butonları
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                console.log('Play again clicked');
                if (!this.canPlayGame()) {
                    this.showNotification(this.getTranslation('noLivesLeft'), 'error');
                    this.showScreen('mainMenuScreen');
                    return;
                }
                this.restartCurrentGame();
            });
        }
        
        const homeBtn = document.getElementById('homeBtn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                console.log('Home clicked');
                this.setGameMode(false);
                this.showScreen('mainMenuScreen');
            });
        }

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

        // Lives modal event listeners
        const livesDisplay = document.querySelector('.lives-display');
        if (livesDisplay) {
            livesDisplay.addEventListener('click', () => {
                console.log('Lives display clicked');
                this.openLivesModal();
            });
        }
        
        const livesModal = document.getElementById('livesModal');
        if (livesModal) {
            livesModal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.closeLivesModal();
                }
            });
        }
        
        const closeLivesModalBtn = document.getElementById('closeLivesModal');
        if (closeLivesModalBtn) {
            closeLivesModalBtn.addEventListener('click', () => this.closeLivesModal());
        }
        
        // Shop event listeners
        const buyBtns = document.querySelectorAll('.buy-btn');
        console.log('Buy buttons found:', buyBtns.length);
        buyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('Buy button clicked');
                const item = btn.closest('.shop-item');
                const itemType = item.dataset.type || 'lives';
                const amount = parseInt(btn.dataset.lives) || 0;
                const cost = parseInt(btn.dataset.cost) || 0;
                
                if (item.classList.contains('coming-soon-item')) {
                    this.showNotification(this.getTranslation('comingSoon'), 'info');
                    return;
                }
                
                this.buyItem(itemType, amount, cost);
            });
        });
        
        // Leaderboard tab event listeners
        document.querySelectorAll('.leaderboard-tabs .tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Aktif tab'ı değiştir
                document.querySelectorAll('.leaderboard-tabs .tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Leaderboard'u güncelle
                this.updateLeaderboard();
            });
        });
        
        console.log('Events bound successfully');
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
        document.getElementById('visitOfferBtn').addEventListener('click', () => this.visitOffer());
        
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
                case 'geometry-dash':
                    this.currentGame = new GeometryDash(canvas);
                    break;
                case 'taptap-shots':
                    this.currentGame = new TapTapShots(canvas);
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
        // Sadece oyun kazanıldığında leaderboard'a ekle
        if (this.currentGame && this.currentGame.hasWon()) {
            this.addWinToLeaderboard(this.playerName, this.currentGameType);
        }
        
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
        this.preloadAd(); // Reklamı önceden yükle
    }
    
    closeCoinModal() {
        document.getElementById('coinModal').classList.remove('active');
        document.body.style.overflow = '';
    }
    
    preloadAd() {
        if (this.adReady || this.isAdPreloading || typeof show_9505533 === 'undefined') {
            return; // Zaten hazır, yükleniyor veya SDK yok
        }

        this.isAdPreloading = true;
        const watchAdBtn = document.getElementById('watchAdBtn');
        watchAdBtn.disabled = true;
        watchAdBtn.innerHTML = `
            <span class="spinner"></span>
            ${this.getTranslation('loadingAd')}
        `;
        
        console.log('Preloading Monetag ad...');
        
        show_9505533({ type: 'preload' })
            .then(() => {
                console.log('Ad preloaded successfully.');
                this.adReady = true;
                this.isAdPreloading = false;
                watchAdBtn.disabled = false;
                watchAdBtn.innerHTML = `📺 ${this.getTranslation('watchAdButton')}`;
            })
            .catch(() => {
                console.error('Ad preload failed.');
                this.isAdPreloading = false;
                this.adReady = false;
                watchAdBtn.disabled = true;
                watchAdBtn.textContent = this.getTranslation('adFailed');
            });
    }

    watchAd() {
        const watchAdBtn = document.getElementById('watchAdBtn');
        
        if (!this.adReady) {
            this.showNotification(this.getTranslation('adNotReady'), 'error');
            // Tekrar yüklemeyi dene
            this.adReady = false;
            this.preloadAd();
            return;
        }

        watchAdBtn.disabled = true;
        watchAdBtn.innerHTML = `
            <span class="spinner"></span>
            ${this.getTranslation('watchingAd')}
        `;

        console.log('Showing Monetag ad...');
        
        show_9505533()
            .then(() => {
                console.log('User watched the ad.');
                this.showNotification(this.getTranslation('coinsEarned').replace('{amount}', 1), 'success');
                this.addCoins(1);
                this.closeCoinModal();
            })
            .catch(() => {
                console.log('Ad was skipped or failed to show.');
                this.showNotification(this.getTranslation('adSkipped'), 'info');
            })
            .finally(() => {
                // Reklam izlendikten veya kapatıldıktan sonra butonları sıfırla ve yeni reklam yükle
                this.adReady = false;
                watchAdBtn.disabled = false;
                watchAdBtn.innerHTML = `📺 ${this.getTranslation('watchAdButton')}`;
                this.preloadAd();
            });
    }

    visitOffer() {
        const visitOfferBtn = document.getElementById('visitOfferBtn');
        visitOfferBtn.disabled = true;

        console.log('Showing Monetag popup ad...');

        show_9505533({ type: 'pop' })
            .then(() => {
                console.log('Popup attempt completed. Rewarding user.');
                this.addCoins(2);
                this.showNotification(this.getTranslation('offerVisited'), 'success');
                this.closeCoinModal();
            })
            .catch(() => {
                console.log('Popup ad failed to open.');
                this.showNotification(this.getTranslation('offerFailed'), 'error');
            })
            .finally(() => {
                visitOfferBtn.disabled = false;
            });
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
        } else {
            // Yeni format: her oyun için ayrı liste
            this.leaderboard = {
                'geometry-dash': [],
                'taptap-shots': [],
                'global': []
            };
        }
    }
    
    saveLeaderboard() {
        localStorage.setItem('miniGamesLeaderboard', JSON.stringify(this.leaderboard));
    }
    
    addWinToLeaderboard(player, game) {
        // Oyun kazanma sayısını ekle
        if (!this.leaderboard[game]) {
            this.leaderboard[game] = [];
        }
        
        // Oyuncuyu bul veya ekle
        let playerEntry = this.leaderboard[game].find(entry => entry.player === player);
        
        if (playerEntry) {
            playerEntry.wins++;
            playerEntry.lastWin = Date.now();
        } else {
            playerEntry = {
                player: player,
                wins: 1,
                lastWin: Date.now()
            };
            this.leaderboard[game].push(playerEntry);
        }
        
        // Global listeye de ekle
        let globalEntry = this.leaderboard.global.find(entry => entry.player === player);
        if (globalEntry) {
            globalEntry.wins++;
            globalEntry.lastWin = Date.now();
        } else {
            globalEntry = {
                player: player,
                wins: 1,
                lastWin: Date.now()
            };
            this.leaderboard.global.push(globalEntry);
        }
        
        // Kazanma sayısına göre sırala
        this.leaderboard[game].sort((a, b) => b.wins - a.wins);
        this.leaderboard.global.sort((a, b) => b.wins - a.wins);
        
        // Her listede sadece ilk 10'u tut
        this.leaderboard[game] = this.leaderboard[game].slice(0, 10);
        this.leaderboard.global = this.leaderboard.global.slice(0, 10);
        
        this.saveLeaderboard();
        this.updateLeaderboard();
    }
    
    updateLeaderboard() {
        const list = document.getElementById('leaderboardList');
        const activeTab = document.querySelector('.leaderboard-tabs .tab.active');
        const gameType = activeTab ? activeTab.dataset.game : 'geometry-dash';
        
        list.innerHTML = '';
        
        const gameLeaderboard = this.leaderboard[gameType] || [];
        
        if (gameLeaderboard.length === 0) {
            list.innerHTML = `<div class="no-scores">${this.getTranslation('noScoresYet')}</div>`;
            return;
        }
        
        gameLeaderboard.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            let rankClass = `rank-${index + 1}`;
            if (index > 2) rankClass = '';
            
            const lastWinDate = new Date(entry.lastWin);
            const timeAgo = this.getTimeAgo(lastWinDate);
            
            item.innerHTML = `
                <div class="rank ${rankClass}">${index + 1}</div>
                <div class="player-info">
                    <div class="player-name">${entry.player}</div>
                    <div class="player-stats">
                        <span class="wins-count">🏆 ${entry.wins} kazanma</span>
                        <span class="last-win">Son: ${timeAgo}</span>
                    </div>
                </div>
            `;
            list.appendChild(item);
        });
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return `${diffInSeconds} saniye önce`;
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} dakika önce`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} saat önce`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} gün önce`;
        }
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

    // Lives Modal Functions
    openLivesModal() {
        const modal = document.getElementById('livesModal');
        const currentLivesInfo = document.getElementById('currentLivesInfo');
        const nextLifeInfo = document.getElementById('nextLifeInfo');
        
        // Update modal content
        currentLivesInfo.textContent = `${this.getTranslation('lives')}: ${this.lives}/${this.maxLives}`;
        
        if (this.lives < this.maxLives) {
            const nextLifeTime = new Date(this.lastLifeLossTime + this.lifeRegenerationTime);
            const timeUntilNext = nextLifeTime - Date.now();
            const minutes = Math.floor(timeUntilNext / 60000);
            const seconds = Math.floor((timeUntilNext % 60000) / 1000);
            nextLifeInfo.textContent = `${this.getTranslation('nextLifeIn')}: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            nextLifeInfo.textContent = this.getTranslation('livesFull');
        }
        
        modal.style.display = 'flex';
    }

    closeLivesModal() {
        document.getElementById('livesModal').style.display = 'none';
    }

    // Shop Functions
    buyItem(itemType, amount, cost) {
        if (this.coins < cost) {
            this.showNotification(this.getTranslation('insufficientCoins'), 'error');
            return;
        }
        
        this.coins -= cost;
        this.updateCoinDisplay();
        this.saveCoins();
        
        if (itemType === 'lives') {
            this.lives = Math.min(this.lives + amount, this.maxLives);
            this.updateLivesDisplay();
            this.saveLives();
            this.showNotification(`${this.getTranslation('livesPurchased')}: +${amount}`, 'success');
        } else if (itemType === 'unlimited') {
            // 30 minutes unlimited lives
            const unlimitedEndTime = Date.now() + (30 * 60 * 1000);
            localStorage.setItem('unlimitedLivesEnd', unlimitedEndTime);
            this.showNotification(this.getTranslation('unlimitedLivesActivated'), 'success');
        }
    }

    checkUnlimitedLives() {
        const unlimitedEnd = localStorage.getItem('unlimitedLivesEnd');
        if (unlimitedEnd && Date.now() < parseInt(unlimitedEnd)) {
            return true;
        }
        localStorage.removeItem('unlimitedLivesEnd');
        return false;
    }

    setupInAppAds() {
        if (typeof show_9505533 === 'undefined') {
            console.log('Monetag SDK not found, skipping In-App ads.');
            return;
        }

        console.log('Setting up In-App Interstitial ads...');
        
        // Kullanıcının istediği ayarlar: 30 dakikada 8 reklam, 3 dakika timeout
        show_9505533({
            type: 'inApp',
            inAppSettings: {
                frequency: 8,     // 30 dakikada en fazla 8 reklam göster
                capping: 0.5,     // Oturum süresini 30 dakika (0.5 saat) olarak ayarla
                interval: 60,     // Reklamlar arasında en az 60 saniye beklesin
                timeout: 180,     // Uygulama açıldıktan 3 dakika (180 saniye) sonra ilk reklamı göstermeye başla
                everyPage: false  // Oturum, uygulama kapatılana kadar devam etsin
            }
        });
        
        console.log('In-App Interstitial ads configured successfully.');
    }
} 