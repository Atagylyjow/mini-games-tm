import os
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from telegram.constants import ParseMode

# Logging ayarları
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Bot token'ı
BOT_TOKEN = "7870032876:AAHwvao_2fzRSGNPagXqpK9yaA3rDTJKGu0"

# Web App URL'si (GitHub Pages için)
WEBAPP_URL = "https://atagylyjow.github.io/mini-games-tm/"

# Kullanıcı dil tercihlerini saklamak için
user_languages = {}

# Bot mesajları - çoklu dil desteği
bot_messages = {
    'tk': {
        'welcome': """
🎮 *Mini Games TM*'e Hoş Geldiňiz!

Salam {name}! 🎉

Bu bot arkaly gyzykly mini oýunlary oýnap, dostlaryňyz bilen ýaryşyp bilersiňiz.

*Möýjer Oýunlar:*
🐍 Ýylan - Klassik ýylan oýuny
🧩 Tetris - Blok düzüş oýuny  
🧠 Ýat - Kart gabatlaşdyrma oýuny
⭕ XOX - Klassik XOX oýuny

*Aýratynlyklar:*
🏆 Global hasapla reýtingi
🌍 Köp dilli goldaw
📱 Mobil uýgun dizaýn
🎯 Hakyky wagtynda oýun

Aşakdaky düwmä basyp oýunlary başladyň!
        """,
        'help': """
🎮 *Mini Games TM - Kömek*

*Buýruklar:*
/start - Boty başlat we oýunlary aç
/help - Bu kömek habaryny görkez
/leaderboard - Iň ýokary hasaplalary görkez
/about - Bot hakda maglumat

*Oýun Dolandyryşy:*
• Ýylan: Ok düwmeleri arkaly ýöneltme
• Tetris: Ok düwmeleri + Space (öwürme)
• Ýat: Kartlara basma
• XOX: Sırasy bilen X we O goýma

*Aýratynlyklar:*
• Köp dilli goldaw (TM/RU/TR)
• Global hasapla reýtingi
• Mobil uýgun dizaýn
• Telegram tema goldawy

Islegiňiz bar bolsa /start buýrugyny ulanyp oýunlary başladyp bilersiňiz!
        """,
        'leaderboard': """
🏆 *Global Hasapla Reýtingi*

*Iň Ýokary Hasaplalar:*

🥇 **Ýylan:** Iň ýokary hasapla
🥈 **Tetris:** Iň ýokary hasapla  
🥉 **Ýat:** Iň ýokary hasapla
4️⃣ **XOX:** Iň ýokary hasapla

*Hasapla Nädip Alnyar:*
• Ýylan: Her iýmit +10 hasapla
• Tetris: Her setir +100 hasapla
• Ýat: Her gabatlaşma +100 hasapla
• XOX: Ýeňiji +100 hasapla

Öz hasaplaňyzy etmek üçin /start buýrugyny ulanyň!
        """,
        'about': """
🎮 *Mini Games TM - Hakda*

*Öndürijisi:* Mini Games TM Topary
*Wersiýa:* 1.0.0
*Dil:* Python + JavaScript
*Platforma:* Telegram Web App

*Tehnologiýalar:*
• HTML5 Canvas
• CSS3 Animasiýalar
• JavaScript ES6+
• Python Telegram Bot API

*Aýratynlyklar:*
✅ 4 dürli mini oýun
✅ Köp dilli goldaw
✅ Global hasapla ulgamy
✅ Responsive dizaýn
✅ Telegram integratsiýasy
✅ Mobil uýgun

*Lisenziýa:* MIT License
*GitHub:* https://github.com/Atagylyjow/mini-games-tm

Bu bot açyk çeşme kody we jemgyýetçilik goşantlaryna açyk!
        """,
        'language_select': "🌍 *Dil saýlaň:*",
        'language_changed': "✅ Dil üýtgedildi: Türkmen",
        'play_games': "🎮 Oýunlary Başlat",
        'change_language': "🌍 Dil Üýtget",
        'back_to_menu': "⬅️ Yza"
    },
    'ru': {
        'welcome': """
🎮 *Mini Games TM* - Добро пожаловать!

Привет {name}! 🎉

С этим ботом вы можете играть в веселые мини-игры и соревноваться с друзьями.

*Доступные игры:*
🐍 Змейка - Классическая игра змейка
🧩 Тетрис - Игра с блоками  
🧠 Память - Игра на запоминание карт
⭕ Крестики-нолики - Классическая игра XOX

*Особенности:*
🏆 Глобальный рейтинг очков
🌍 Многоязычная поддержка
📱 Мобильный дизайн
🎯 Игра в реальном времени

Нажмите кнопку ниже, чтобы начать игры!
        """,
        'help': """
🎮 *Mini Games TM - Помощь*

*Команды:*
/start - Запустить бота и открыть игры
/help - Показать это сообщение помощи
/leaderboard - Показать лучшие счета
/about - Информация о боте

*Управление играми:*
• Змейка: Направление стрелками
• Тетрис: Стрелки + Space (поворот)
• Память: Нажатие на карты
• Крестики-нолики: Поочередно X и O

*Особенности:*
• Многоязычная поддержка (TM/RU/TR)
• Глобальный рейтинг очков
• Мобильный дизайн
• Поддержка тем Telegram

Если у вас есть вопросы, используйте команду /start для запуска игр!
        """,
        'leaderboard': """
🏆 *Глобальный рейтинг очков*

*Лучшие счета:*

🥇 **Змейка:** Лучший счет
🥈 **Тетрис:** Лучший счет  
🥉 **Память:** Лучший счет
4️⃣ **Крестики-нолики:** Лучший счет

*Как набрать очки:*
• Змейка: Каждая еда +10 очков
• Тетрис: Каждая линия +100 очков
• Память: Каждое совпадение +100 очков
• Крестики-нолики: Победитель +100 очков

Используйте команду /start, чтобы набрать свои очки!
        """,
        'about': """
🎮 *Mini Games TM - О боте*

*Разработчик:* Команда Mini Games TM
*Версия:* 1.0.0
*Язык:* Python + JavaScript
*Платформа:* Telegram Web App

*Технологии:*
• HTML5 Canvas
• CSS3 Анимации
• JavaScript ES6+
• Python Telegram Bot API

*Особенности:*
✅ 4 разные мини-игры
✅ Многоязычная поддержка
✅ Глобальная система очков
✅ Адаптивный дизайн
✅ Интеграция с Telegram
✅ Мобильная совместимость

*Лицензия:* MIT License
*GitHub:* https://github.com/Atagylyjow/mini-games-tm

Этот бот с открытым исходным кодом и открыт для вклада сообщества!
        """,
        'language_select': "🌍 *Выберите язык:*",
        'language_changed': "✅ Язык изменен: Русский",
        'play_games': "🎮 Начать игры",
        'change_language': "🌍 Изменить язык",
        'back_to_menu': "⬅️ Назад"
    },
    'tr': {
        'welcome': """
🎮 *Mini Games TM*'ye Hoş Geldiniz!

Merhaba {name}! 🎉

Bu bot ile eğlenceli mini oyunları oynayabilir, arkadaşlarınızla yarışabilirsiniz.

*Mevcut Oyunlar:*
🐍 Snake - Klasik yılan oyunu
🧩 Tetris - Blok düzenleme oyunu  
🧠 Memory Game - Kart eşleştirme oyunu
⭕ Tic Tac Toe - Klasik XOX oyunu

*Özellikler:*
🏆 Global skor sıralaması
🌍 Çoklu dil desteği
📱 Mobil uyumlu tasarım
🎯 Gerçek zamanlı oyun

Aşağıdaki butona tıklayarak oyunları başlatın!
        """,
        'help': """
🎮 *Mini Games TM - Yardım*

*Komutlar:*
/start - Botu başlat ve oyunları aç
/help - Bu yardım mesajını göster
/leaderboard - En yüksek skorları göster
/about - Bot hakkında bilgi

*Oyun Kontrolleri:*
• Snake: Ok tuşları ile yönlendirme
• Tetris: Ok tuşları + Space (döndürme)
• Memory: Kartlara tıklama
• Tic Tac Toe: Sırayla X ve O koyma

*Özellikler:*
• Çoklu dil desteği (TM/RU/TR)
• Global skor sıralaması
• Mobil uyumlu tasarım
• Telegram tema desteği

Herhangi bir sorunuz varsa /start komutunu kullanarak oyunları başlatabilirsiniz!
        """,
        'leaderboard': """
🏆 *Global Skor Sıralaması*

*En Yüksek Skorlar:*

🥇 **Snake:** En yüksek skor
🥈 **Tetris:** En yüksek skor  
🥉 **Memory:** En yüksek skor
4️⃣ **Tic Tac Toe:** En yüksek skor

*Nasıl Skor Yapılır:*
• Snake: Her yem +10 puan
• Tetris: Her satır +100 puan
• Memory: Her eşleşme +100 puan
• Tic Tac Toe: Kazanan +100 puan

Kendi skorunuzu yapmak için /start komutunu kullanın!
        """,
        'about': """
🎮 *Mini Games TM - Hakkında*

*Geliştirici:* Mini Games TM Team
*Versiyon:* 1.0.0
*Dil:* Python + JavaScript
*Platform:* Telegram Web App

*Teknolojiler:*
• HTML5 Canvas
• CSS3 Animations
• JavaScript ES6+
• Python Telegram Bot API

*Özellikler:*
✅ 4 farklı mini oyun
✅ Çoklu dil desteği
✅ Global skor sistemi
✅ Responsive tasarım
✅ Telegram entegrasyonu
✅ Mobil uyumlu

*Lisans:* MIT License
*GitHub:* https://github.com/Atagylyjow/mini-games-tm

Bu bot açık kaynak kodludur ve topluluk katkılarına açıktır!
        """,
        'language_select': "🌍 *Dil seçin:*",
        'language_changed': "✅ Dil değiştirildi: Türkçe",
        'play_games': "🎮 Oyunları Başlat",
        'change_language': "🌍 Dil Değiştir",
        'back_to_menu': "⬅️ Geri"
    }
}

def get_user_language(user_id):
    """Kullanıcının dil tercihini al"""
    return user_languages.get(user_id, 'tk')  # Varsayılan: Türkmen

def get_message(user_id, message_key):
    """Kullanıcının diline göre mesaj al"""
    lang = get_user_language(user_id)
    return bot_messages[lang][message_key]

def get_main_menu_keyboard(user_id):
    """Ana menü klavyesi"""
    return InlineKeyboardMarkup([
        [InlineKeyboardButton(get_message(user_id, 'play_games'), web_app=WebAppInfo(url=WEBAPP_URL))],
        [InlineKeyboardButton(get_message(user_id, 'change_language'), callback_data="change_lang")]
    ])

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Bot başlatma komutu"""
    if not update.effective_user:
        return
    
    user = update.effective_user
    user_id = user.id
    
    # Karşılama mesajı
    welcome_text = get_message(user_id, 'welcome').format(
        name=user.first_name or 'Oyuncu'
    )
    
    # Ana menü klavyesi
    reply_markup = get_main_menu_keyboard(user_id)
    
    if update.message:
        await update.message.reply_text(
            welcome_text,
            reply_markup=reply_markup,
            parse_mode=ParseMode.MARKDOWN
        )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Yardım komutu"""
    if not update.effective_user:
        return
    
    user_id = update.effective_user.id
    help_text = get_message(user_id, 'help')
    
    # Ana menüye geri dön butonu
    keyboard = [
        [InlineKeyboardButton(get_message(user_id, 'back_to_menu'), callback_data="back_to_menu")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if update.message:
        await update.message.reply_text(
            help_text,
            reply_markup=reply_markup,
            parse_mode=ParseMode.MARKDOWN
        )

async def leaderboard_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Skor sıralaması komutu"""
    if not update.effective_user:
        return
    
    user_id = update.effective_user.id
    leaderboard_text = get_message(user_id, 'leaderboard')
    
    # Ana menüye geri dön butonu
    keyboard = [
        [InlineKeyboardButton(get_message(user_id, 'back_to_menu'), callback_data="back_to_menu")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if update.message:
        await update.message.reply_text(
            leaderboard_text,
            reply_markup=reply_markup,
            parse_mode=ParseMode.MARKDOWN
        )

async def about_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Bot hakkında bilgi"""
    if not update.effective_user:
        return
    
    user_id = update.effective_user.id
    about_text = get_message(user_id, 'about')
    
    # Ana menüye geri dön butonu
    keyboard = [
        [InlineKeyboardButton(get_message(user_id, 'back_to_menu'), callback_data="back_to_menu")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if update.message:
        await update.message.reply_text(
            about_text,
            reply_markup=reply_markup,
            parse_mode=ParseMode.MARKDOWN
        )

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Buton callback'leri"""
    if not update.callback_query or not update.effective_user:
        return
        
    query = update.callback_query
    user_id = update.effective_user.id
    
    await query.answer()
    
    if query.data == "play_games":
        await query.edit_message_text(
            "🎮 Oyunlar açılıyor...\n\nWeb App yükleniyor, lütfen bekleyin...",
            parse_mode=ParseMode.MARKDOWN
        )
    elif query.data == "change_lang":
        # Dil seçme menüsü
        language_text = get_message(user_id, 'language_select')
        keyboard = [
            [
                InlineKeyboardButton("🇹🇲 Türkmen", callback_data="lang_tk"),
                InlineKeyboardButton("🇷🇺 Русский", callback_data="lang_ru")
            ],
            [
                InlineKeyboardButton("🇹🇷 Türkçe", callback_data="lang_tr")
            ],
            [
                InlineKeyboardButton(get_message(user_id, 'back_to_menu'), callback_data="back_to_menu")
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            language_text,
            reply_markup=reply_markup,
            parse_mode=ParseMode.MARKDOWN
        )
    elif query.data == "back_to_menu":
        # Ana menüye geri dön
        welcome_text = get_message(user_id, 'welcome').format(
            name=update.effective_user.first_name or 'Oyuncu'
        )
        reply_markup = get_main_menu_keyboard(user_id)
        
        await query.edit_message_text(
            welcome_text,
            reply_markup=reply_markup,
            parse_mode=ParseMode.MARKDOWN
        )
    elif query.data and query.data.startswith("lang_"):
        # Dil değiştirme
        lang = query.data.split("_")[1]
        user_languages[user_id] = lang
        
        # Dil değiştirildi mesajı ve ana menüye geri dön
        welcome_text = get_message(user_id, 'welcome').format(
            name=update.effective_user.first_name or 'Oyuncu'
        )
        reply_markup = get_main_menu_keyboard(user_id)
        
        await query.edit_message_text(
            welcome_text,
            reply_markup=reply_markup,
            parse_mode=ParseMode.MARKDOWN
        )

def main() -> None:
    """Bot'u başlat"""
    # Bot uygulamasını oluştur
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Komut handler'ları
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("leaderboard", leaderboard_command))
    application.add_handler(CommandHandler("about", about_command))
    
    # Callback query handler
    application.add_handler(CallbackQueryHandler(button_callback))
    
    # Bot'u başlat
    print("🤖 Mini Games TM Bot başlatılıyor...")
    print(f"🌐 Web App URL: {WEBAPP_URL}")
    print("✅ Bot hazır! /start komutunu kullanın.")
    print("🌍 Desteklenen diller: Türkmen, Rus, Türk")
    print("🎮 Ana menüde dil değiştirme butonu mevcut!")
    
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main() 