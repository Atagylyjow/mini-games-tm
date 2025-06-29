const translations = {
    tr: {
        // Ana sayfa
        welcomeTitle: "Hoş Geldiniz!",
        welcomeText: "Eğlenceli mini oyunları oynayın ve global sıralamada yerinizi alın!",
        
        // Oyun başlıkları
        snakeTitle: "Snake",
        snakeDesc: "Klasik yılan oyunu",
        tetrisTitle: "Tetris",
        tetrisDesc: "Blokları düzenleyin",
        memoryTitle: "Hafıza",
        memoryDesc: "Kartları eşleştirin",
        tictactoeTitle: "XOX",
        tictactoeDesc: "Klasik XOX oyunu",
        
        // Sıralama
        leaderboardTitle: "🏆 Global Sıralama",
        
        // Oyun ekranı
        currentGameTitle: "Oyun",
        scoreDisplay: "Skor: {score}",
        
        // Oyun sonu
        gameOverTitle: "Oyun Bitti!",
        finalScoreText: "Final Skor: {score}",
        playAgainBtn: "Tekrar Oyna",
        homeBtn: "Ana Menü",
        
        // Genel
        back: "Geri",
        pause: "Duraklat",
        resume: "Devam Et",
        restart: "Yeniden Başlat",
        
        // Mesajlar
        newHighScore: "Yeni Yüksek Skor!",
        gamePaused: "Oyun Duraklatıldı",
        gameResumed: "Oyun Devam Ediyor"
    },
    
    en: {
        // Home page
        welcomeTitle: "Welcome!",
        welcomeText: "Play fun mini games and compete in the global leaderboard!",
        
        // Game titles
        snakeTitle: "Snake",
        snakeDesc: "Classic snake game",
        tetrisTitle: "Tetris",
        tetrisDesc: "Arrange the blocks",
        memoryTitle: "Memory",
        memoryDesc: "Match the cards",
        tictactoeTitle: "Tic Tac Toe",
        tictactoeDesc: "Classic tic tac toe game",
        
        // Leaderboard
        leaderboardTitle: "🏆 Global Leaderboard",
        
        // Game screen
        currentGameTitle: "Game",
        scoreDisplay: "Score: {score}",
        
        // Game over
        gameOverTitle: "Game Over!",
        finalScoreText: "Final Score: {score}",
        playAgainBtn: "Play Again",
        homeBtn: "Main Menu",
        
        // General
        back: "Back",
        pause: "Pause",
        resume: "Resume",
        restart: "Restart",
        
        // Messages
        newHighScore: "New High Score!",
        gamePaused: "Game Paused",
        gameResumed: "Game Resumed"
    },
    
    de: {
        // Startseite
        welcomeTitle: "Willkommen!",
        welcomeText: "Spiele lustige Mini-Spiele und konkurriere in der globalen Rangliste!",
        
        // Spieltitel
        snakeTitle: "Schlange",
        snakeDesc: "Klassisches Schlangenspiel",
        tetrisTitle: "Tetris",
        tetrisDesc: "Ordne die Blöcke",
        memoryTitle: "Gedächtnis",
        memoryDesc: "Finde die Paare",
        tictactoeTitle: "Tic Tac Toe",
        tictactoeDesc: "Klassisches Tic Tac Toe Spiel",
        
        // Rangliste
        leaderboardTitle: "🏆 Globale Rangliste",
        
        // Spielbildschirm
        currentGameTitle: "Spiel",
        scoreDisplay: "Punktzahl: {score}",
        
        // Spielende
        gameOverTitle: "Spiel Vorbei!",
        finalScoreText: "Endpunktzahl: {score}",
        playAgainBtn: "Nochmal Spielen",
        homeBtn: "Hauptmenü",
        
        // Allgemein
        back: "Zurück",
        pause: "Pause",
        resume: "Fortsetzen",
        restart: "Neustart",
        
        // Nachrichten
        newHighScore: "Neuer Highscore!",
        gamePaused: "Spiel Pausiert",
        gameResumed: "Spiel Fortgesetzt"
    }
};

// Dil değiştirme fonksiyonu
function changeLanguage(lang) {
    const elements = document.querySelectorAll('[id]');
    elements.forEach(element => {
        const key = element.id;
        if (translations[lang] && translations[lang][key]) {
            let text = translations[lang][key];
            
            // Skor placeholder'ını değiştir
            if (text.includes('{score}')) {
                const currentScore = element.textContent.match(/\d+/);
                if (currentScore) {
                    text = text.replace('{score}', currentScore[0]);
                }
            }
            
            element.textContent = text;
        }
    });
    
    // Dil seçiciyi güncelle
    document.getElementById('languageSelect').value = lang;
    
    // Local storage'a kaydet
    localStorage.setItem('selectedLanguage', lang);
}

// Sayfa yüklendiğinde dil ayarını yükle
document.addEventListener('DOMContentLoaded', () => {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'tr';
    changeLanguage(savedLanguage);
    
    // Dil seçici event listener
    document.getElementById('languageSelect').addEventListener('change', (e) => {
        changeLanguage(e.target.value);
    });
}); 