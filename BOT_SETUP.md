# 🤖 Telegram Bot Kurulum Rehberi

Bu rehber, Mini Games TM Telegram botunu kurmanız için adım adım talimatları içerir.

## 📋 Gereksinimler

- Python 3.8 veya üzeri
- Telegram hesabı
- GitHub hesabı (GitHub Pages için)

## 🚀 Adım 1: Telegram Bot Oluşturma

### 1.1 BotFather ile Bot Oluşturma

1. Telegram'da [@BotFather](https://t.me/BotFather) ile konuşun
2. `/newbot` komutunu gönderin
3. Bot için bir isim verin: `Mini Games TM`
4. Bot için bir kullanıcı adı verin: `your_bot_username_bot`
5. BotFather size bir **Bot Token** verecek, bunu kaydedin

### 1.2 Bot Ayarları

BotFather'da şu komutları kullanarak bot ayarlarını yapın:

```
/setdescription - Bot açıklamasını ayarlayın
/setabouttext - Bot hakkında bilgi ekleyin
/setuserpic - Bot profil resmi ekleyin
/setcommands - Bot komutlarını ayarlayın
```

### 1.3 Web App Ayarları

BotFather'da `/setmenubutton` komutunu kullanarak Web App butonunu ayarlayın:

```
/setmenubutton
@your_bot_username_bot
🎮 Oyunları Başlat
https://yourusername.github.io/mini-games-tm/
```

## 🚀 Adım 2: GitHub Repository Oluşturma

### 2.1 Repository Oluşturma

1. GitHub'da yeni bir repository oluşturun: `mini-games-tm`
2. Repository'yi public yapın
3. README dosyası ekleyin

### 2.2 GitHub Pages Ayarları

1. Repository Settings > Pages
2. Source: Deploy from a branch
3. Branch: gh-pages
4. Save

## 🚀 Adım 3: Kod Yükleme

### 3.1 Local Kurulum

```bash
# Repository'yi klonlayın
git clone https://github.com/yourusername/mini-games-tm.git
cd mini-games-tm

# Virtual environment oluşturun
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Gerekli paketleri yükleyin
pip install -r requirements.txt
```

### 3.2 Environment Variables

`.env` dosyası oluşturun:

```env
BOT_TOKEN=your_bot_token_here
WEBAPP_URL=https://yourusername.github.io/mini-games-tm/
```

### 3.3 Kod Değişiklikleri

`bot.py` dosyasında URL'yi güncelleyin:

```python
WEBAPP_URL = "https://yourusername.github.io/mini-games-tm/"
```

## 🚀 Adım 4: Deployment

### 4.1 GitHub'a Push

```bash
git add .
git commit -m "Initial commit: Mini Games TM"
git push origin main
```

### 4.2 GitHub Actions

GitHub Actions otomatik olarak GitHub Pages'e deploy edecek.

### 4.3 Manuel Deploy (Alternatif)

Eğer GitHub Actions çalışmazsa:

1. Repository Settings > Pages
2. Source: Deploy from a branch
3. Branch: main
4. Folder: / (root)
5. Save

## 🚀 Adım 5: Bot Testi

### 5.1 Bot'u Başlatma

```bash
python bot.py
```

### 5.2 Test Etme

1. Telegram'da botunuzu bulun: `@your_bot_username_bot`
2. `/start` komutunu gönderin
3. "🎮 Oyunları Başlat" butonuna tıklayın
4. Web App açılmalı ve oyunlar çalışmalı

## 🔧 Sorun Giderme

### Bot Çalışmıyor
- Bot token'ını kontrol edin
- `.env` dosyasının doğru olduğundan emin olun
- Python sürümünü kontrol edin (3.8+)

### Web App Açılmıyor
- GitHub Pages URL'sini kontrol edin
- Repository'nin public olduğundan emin olun
- GitHub Pages'in aktif olduğunu kontrol edin

### Oyunlar Çalışmıyor
- Tarayıcı konsolunu kontrol edin (F12)
- JavaScript hatalarını kontrol edin
- HTTPS bağlantısını kontrol edin

## 📱 Bot Komutları

- `/start` - Botu başlat ve oyunları aç
- `/help` - Yardım mesajını göster
- `/leaderboard` - Skor sıralamasını göster
- `/about` - Bot hakkında bilgi

## 🌐 Web App URL Formatı

GitHub Pages URL formatı:
```
https://username.github.io/repository-name/
```

Örnek:
```
https://johndoe.github.io/mini-games-tm/
```

## 🔒 Güvenlik

- Bot token'ınızı asla paylaşmayın
- `.env` dosyasını `.gitignore`'a eklediğinizden emin olun
- Repository'yi public yapmadan önce hassas bilgileri kaldırın

## 📞 Destek

Sorunlarınız için:
1. GitHub Issues açın
2. Telegram'da @yourusername ile iletişime geçin
3. README.md dosyasını kontrol edin

---

**Mini Games TM Bot** - Başarıyla kuruldu! 🎉 