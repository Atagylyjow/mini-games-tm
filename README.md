# 🎮 Mini Games TM - Telegram Web App

Modern ve eğlenceli mini oyunlar koleksiyonu Telegram Web App olarak tasarlanmıştır. Çoklu dil desteği, global skor sistemi ve responsive tasarım ile kullanıcı dostu bir deneyim sunar.

## 🚀 Özellikler

### 🎯 Oyunlar
- **Snake** 🐍 - Klasik yılan oyunu
- **Tetris** 🧩 - Blok düzenleme oyunu
- **Memory Game** 🧠 - Kart eşleştirme oyunu
- **Tic Tac Toe** ⭕ - Klasik XOX oyunu

### 🌍 Çoklu Dil Desteği
- 🇹🇷 Türkçe
- 🇺🇸 İngilizce
- 🇩🇪 Almanca

### 🏆 Skor Sistemi
- Global skor sıralaması
- Oyun bazlı skor takibi
- Yerel depolama ile skor kaydetme
- En yüksek 50 skor saklama

### 📱 Telegram Web App Entegrasyonu
- Telegram kullanıcı bilgileri entegrasyonu
- Telegram tema desteği (Açık/Koyu)
- Telegram paylaşım özelliği
- Telegram bildirim sistemi

### 🎨 Modern Tasarım
- Responsive tasarım (mobil uyumlu)
- Gradient arka plan
- Smooth animasyonlar
- Modern UI/UX

## 🛠️ Teknik Özellikler

### Kontroller
- **Klavye**: Ok tuşları, Space bar
- **Dokunmatik**: Swipe hareketleri
- **Mouse**: Tıklama

### Oyun Özellikleri
- Pause/Resume fonksiyonu
- Otomatik oyun duraklatma (arka plana geçince)
- Skor sistemi
- Seviye artışı (Tetris)
- Hız artışı (Snake)

## 📁 Dosya Yapısı

```
Mini Games TM/
├── index.html          # Ana HTML dosyası
├── styles.css          # CSS stilleri
├── translations.js     # Çoklu dil desteği
├── app.js             # Ana uygulama mantığı
├── games/
│   ├── snake.js       # Snake oyunu
│   ├── tetris.js      # Tetris oyunu
│   ├── memory.js      # Memory Game
│   └── tictactoe.js   # Tic Tac Toe
└── README.md          # Bu dosya
```

## 🚀 Kurulum ve Kullanım

### Yerel Geliştirme
1. Dosyaları bir web sunucusuna yükleyin
2. `index.html` dosyasını tarayıcıda açın
3. Oyunları test edin

### Telegram Web App Olarak
1. Telegram Bot API ile bot oluşturun
2. Web App URL'sini bot ayarlarına ekleyin
3. Kullanıcılar bot üzerinden erişebilir

## 🎮 Oyun Kuralları

### Snake
- Yılanı yönlendirerek yemi yiyin
- Duvarlara veya kendinize çarpmayın
- Her yem +10 puan
- Hız giderek artar

### Tetris
- Blokları düzenleyerek satırları tamamlayın
- Her satır +100 puan
- Seviye her 10 satırda artar
- Hız seviye ile artar

### Memory Game
- Kartları eşleştirin
- Her eşleşme +100 puan
- Az hamle ile bitirme bonusu
- Tüm kartları eşleştirin

### Tic Tac Toe
- X veya O ile oynayın
- Kazanan X: +100 puan
- Kazanan O: +50 puan
- Beraberlik: +25 puan

## 🔧 Özelleştirme

### Yeni Oyun Ekleme
1. `games/` klasörüne yeni oyun dosyası ekleyin
2. Oyun sınıfını standart interface'e uygun yapın
3. `app.js`'de oyun tipini ekleyin
4. HTML'de oyun kartını ekleyin
5. Çevirileri ekleyin

### Yeni Dil Ekleme
1. `translations.js`'de yeni dil objesi ekleyin
2. Tüm metinleri çevirin
3. HTML'de dil seçeneğini ekleyin

## 📱 Mobil Uyumluluk

- Responsive tasarım
- Touch kontrolleri
- Swipe hareketleri
- Mobil optimizasyonu

## 🌐 Tarayıcı Desteği

- Chrome (önerilen)
- Firefox
- Safari
- Edge
- Mobile browsers

## 📊 Performans

- Canvas tabanlı oyunlar
- Optimize edilmiş render döngüsü
- Minimal DOM manipülasyonu
- Efficient memory usage

## 🔒 Güvenlik

- LocalStorage kullanımı
- XSS koruması
- Input validation
- Safe DOM manipulation

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Sorularınız için issue açabilir veya iletişime geçebilirsiniz.

---

**Mini Games TM** - Eğlenceli oyunlar, sınırsız eğlence! 🎮✨ 