const translations = {
    tk: {
        // Ana sayfa
        welcomeTitle: "Hoş Geldiňiz!",
        welcomeText: "Gyzykly mini oýunlary oýnaň we global reýtingde ýeriňizi alyň!",
        
        // Oyun başlıkları
        snakeTitle: "Ýylan",
        snakeDesc: "Klassik ýylan oýuny",
        tetrisTitle: "Tetris",
        tetrisDesc: "Bloklary düzüň",
        memoryTitle: "Ýat",
        memoryDesc: "Kartlary gabatlaşdyryň",
        tictactoeTitle: "XOX",
        tictactoeDesc: "Klassik XOX oýuny",
        
        // Sıralama
        leaderboardTitle: "🏆 Global Reýting",
        
        // Oyun ekranı
        currentGameTitle: "Oýun",
        scoreDisplay: "Hasapla: {score}",
        
        // Oyun sonu
        gameOverTitle: "Oýun Gutardy!",
        finalScoreText: "Jemi Hasapla: {score}",
        playAgainBtn: "Ýene Oýna",
        homeBtn: "Baş Sahypa",
        
        // Genel
        back: "Yza",
        pause: "Duraklat",
        resume: "Dowam Et",
        restart: "Täzeden Başlat",
        
        // Mesajlar
        newHighScore: "Täze Ýokary Hasapla!",
        gamePaused: "Oýun Duraklatdy",
        gameResumed: "Oýun Dowam Edýär"
    },
    
    ru: {
        // Главная страница
        welcomeTitle: "Добро пожаловать!",
        welcomeText: "Играйте в веселые мини-игры и соревнуйтесь в глобальном рейтинге!",
        
        // Названия игр
        snakeTitle: "Змейка",
        snakeDesc: "Классическая игра змейка",
        tetrisTitle: "Тетрис",
        tetrisDesc: "Расположите блоки",
        memoryTitle: "Память",
        memoryDesc: "Найдите пары карт",
        tictactoeTitle: "Крестики-нолики",
        tictactoeDesc: "Классическая игра крестики-нолики",
        
        // Рейтинг
        leaderboardTitle: "🏆 Глобальный рейтинг",
        
        // Игровой экран
        currentGameTitle: "Игра",
        scoreDisplay: "Счет: {score}",
        
        // Конец игры
        gameOverTitle: "Игра окончена!",
        finalScoreText: "Финальный счет: {score}",
        playAgainBtn: "Играть снова",
        homeBtn: "Главное меню",
        
        // Общее
        back: "Назад",
        pause: "Пауза",
        resume: "Продолжить",
        restart: "Перезапуск",
        
        // Сообщения
        newHighScore: "Новый рекорд!",
        gamePaused: "Игра приостановлена",
        gameResumed: "Игра продолжается"
    },
    
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
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'tk';
    changeLanguage(savedLanguage);
    
    // Dil seçici event listener
    document.getElementById('languageSelect').addEventListener('change', (e) => {
        changeLanguage(e.target.value);
    });
}); 