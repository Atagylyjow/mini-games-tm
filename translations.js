window.translations = {
    'tk': {
        // Ana sayfa
        'welcomeTitle': 'Hoş Geldiňiz!',
        'welcomeText': 'Gyzykly mini oýunlary oýnaň we global reýtingde ýeriňizi alyň!',
        
        // Oyunlar
        'snakeTitle': 'Ýylan',
        'snakeDesc': 'Klassik ýylan oýuny',
        'tetrisTitle': 'Tetris',
        'tetrisDesc': 'Bloklary düzüň',
        'memoryTitle': 'Ýat',
        'memoryDesc': 'Kartlary gabatlaşdyryň',
        'tictactoeTitle': 'XOX',
        'tictactoeDesc': 'Klassik XOX oýuny',
        
        // Reytin
        'leaderboardTitle': '🏆 Global Reýting',
        'noScoresYet': 'Heniz hasapla ýok',
        
        // Oyun ekranı
        'gameTitle': 'Oýun',
        'score': 'Hasapla',
        'finalScore': 'Jemi Hasapla',
        'gameOverTitle': 'Oýun Gutardy!',
        'playAgainBtn': 'Ýene Oýna',
        'homeBtn': 'Baş Sahypa',
        
        // Ayarlar
        'settingsTitle': '⚙️ Sazlamalar',
        'languageLabel': '🌍 Dil:',
        'usernameLabel': '👤 Ulanyjy ady:',
        'themeLabel': '🎨 Tema:',
        'lightTheme': '☀️ Ýagty',
        'darkTheme': '🌙 Garaňky',
        'languageChanged': '✅ Dil üýtgedildi!',
        'themeChanged': '✅ Tema üýtgedildi!'
    },
    'ru': {
        // Главная страница
        'welcomeTitle': 'Добро пожаловать!',
        'welcomeText': 'Играйте в веселые мини-игры и займите свое место в глобальном рейтинге!',
        
        // Игры
        'snakeTitle': 'Змейка',
        'snakeDesc': 'Классическая игра змейка',
        'tetrisTitle': 'Тетрис',
        'tetrisDesc': 'Складывайте блоки',
        'memoryTitle': 'Память',
        'memoryDesc': 'Найдите пары карт',
        'tictactoeTitle': 'Крестики-нолики',
        'tictactoeDesc': 'Классическая игра XOX',
        
        // Рейтинг
        'leaderboardTitle': '🏆 Глобальный рейтинг',
        'noScoresYet': 'Пока нет результатов',
        
        // Игровой экран
        'gameTitle': 'Игра',
        'score': 'Счет',
        'finalScore': 'Финальный счет',
        'gameOverTitle': 'Игра окончена!',
        'playAgainBtn': 'Играть снова',
        'homeBtn': 'Главная',
        
        // Настройки
        'settingsTitle': '⚙️ Настройки',
        'languageLabel': '🌍 Язык:',
        'usernameLabel': '👤 Имя пользователя:',
        'themeLabel': '🎨 Тема:',
        'lightTheme': '☀️ Светлая',
        'darkTheme': '🌙 Темная',
        'languageChanged': '✅ Язык изменен!',
        'themeChanged': '✅ Тема изменена!'
    },
    'tr': {
        // Ana sayfa
        'welcomeTitle': 'Hoş Geldiniz!',
        'welcomeText': 'Eğlenceli mini oyunları oynayın ve global sıralamada yerinizi alın!',
        
        // Oyunlar
        'snakeTitle': 'Snake',
        'snakeDesc': 'Klasik yılan oyunu',
        'tetrisTitle': 'Tetris',
        'tetrisDesc': 'Blokları düzenleyin',
        'memoryTitle': 'Hafıza',
        'memoryDesc': 'Kartları eşleştirin',
        'tictactoeTitle': 'Tic Tac Toe',
        'tictactoeDesc': 'Klasik XOX oyunu',
        
        // Sıralama
        'leaderboardTitle': '🏆 Global Sıralama',
        'noScoresYet': 'Henüz skor yok',
        
        // Oyun ekranı
        'gameTitle': 'Oyun',
        'score': 'Skor',
        'finalScore': 'Final Skor',
        'gameOverTitle': 'Oyun Bitti!',
        'playAgainBtn': 'Tekrar Oyna',
        'homeBtn': 'Ana Sayfa',
        
        // Ayarlar
        'settingsTitle': '⚙️ Ayarlar',
        'languageLabel': '🌍 Dil:',
        'usernameLabel': '👤 Kullanıcı Adı:',
        'themeLabel': '🎨 Tema:',
        'lightTheme': '☀️ Açık',
        'darkTheme': '🌙 Koyu',
        'languageChanged': '✅ Dil değiştirildi!',
        'themeChanged': '✅ Tema değiştirildi!'
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