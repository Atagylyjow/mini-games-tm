import os
import logging
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from telegram.constants import ParseMode

# Load environment variables
load_dotenv()

# Logging ayarları
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Bot token'ınızı buraya ekleyin
BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")

# Web App URL'si (GitHub Pages için)
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://yourusername.github.io/mini-games-tm/")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Bot başlatma komutu"""
    if not update.effective_user:
        return
    
    user = update.effective_user
    
    # Karşılama mesajı
    welcome_text = f"""
🎮 *Mini Games TM*'ye Hoş Geldiniz!

Merhaba {user.first_name or 'Oyuncu'}! 🎉

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
    """
    
    # Web App butonu
    keyboard = [
        [InlineKeyboardButton("🎮 Oyunları Başlat", web_app=WebAppInfo(url=WEBAPP_URL))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if update.message:
        await update.message.reply_text(
            welcome_text,
            reply_markup=reply_markup,
            parse_mode=ParseMode.MARKDOWN
        )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Yardım komutu"""
    help_text = """
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
• Çoklu dil desteği (TR/EN/DE)
• Global skor sıralaması
• Mobil uyumlu tasarım
• Telegram tema desteği

Herhangi bir sorunuz varsa /start komutunu kullanarak oyunları başlatabilirsiniz!
    """
    
    if update.message:
        await update.message.reply_text(
            help_text,
            parse_mode=ParseMode.MARKDOWN
        )

async def leaderboard_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Skor sıralaması komutu"""
    leaderboard_text = """
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
    """
    
    keyboard = [
        [InlineKeyboardButton("🎮 Oyunları Aç", web_app=WebAppInfo(url=WEBAPP_URL))]
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
    about_text = """
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
*GitHub:* https://github.com/yourusername/mini-games-tm

Bu bot açık kaynak kodludur ve topluluk katkılarına açıktır!
    """
    
    if update.message:
        await update.message.reply_text(
            about_text,
            parse_mode=ParseMode.MARKDOWN
        )

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Buton callback'leri"""
    if not update.callback_query:
        return
        
    query = update.callback_query
    await query.answer()
    
    if query.data == "play_games":
        await query.edit_message_text(
            "🎮 Oyunlar açılıyor...\n\nWeb App yükleniyor, lütfen bekleyin...",
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
    
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main() 