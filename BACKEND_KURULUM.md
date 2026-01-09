# Backend Kurulum ve Çalıştırma

## Sorun: "Bağlantı hatası" alıyorsanız

Bu hata genellikle backend server'ın çalışmamasından kaynaklanır.

## Çözüm Adımları

### 1. Node.js Yüklü mü?

Terminal'de şu komutu çalıştırın:
```bash
node --version
```

Eğer hata alıyorsanız, Node.js'i yükleyin:
- https://nodejs.org/ adresinden LTS sürümünü indirin
- Kurulumu tamamlayın
- Terminal'i yeniden başlatın

### 2. Backend Bağımlılıklarını Yükleyin

Proje klasöründe (job-tracker) şu komutu çalıştırın:
```bash
npm install
```

Bu komut şu paketleri yükleyecek:
- express
- cors
- body-parser
- uuid
- jsonwebtoken
- bcryptjs

### 3. Backend Server'ı Başlatın

```bash
npm start
```

Başarılı olduğunda şunu göreceksiniz:
```
🚀 Job Tracker API server running on http://localhost:3000
📡 API endpoints available at http://localhost:3000/api/applications
```

### 4. Backend Çalışırken Terminal'i Açık Tutun

Backend server çalışırken terminal penceresini kapatmayın. Kapatırsanız server durur.

### 5. Frontend'i Açın

Backend çalışırken, `login.html` dosyasını tarayıcıda açın.

## Development Mode (Otomatik Restart)

Kod değişikliklerinde otomatik restart için:
```bash
npm run dev
```

## Sorun Giderme

### Port 3000 zaten kullanılıyor
Başka bir uygulama port 3000'i kullanıyorsa, `server.js` dosyasındaki `PORT` değişkenini değiştirin.

### "Cannot find module" hatası
```bash
npm install
```
komutunu tekrar çalıştırın.

### CORS hatası
`server.js` dosyasında CORS zaten yapılandırılmış. Eğer hala sorun varsa, tarayıcı konsolunu kontrol edin.

## Test

Backend çalışıyorsa, tarayıcıda şu adresi açın:
```
http://localhost:3000/api/health
```

Şunu görmelisiniz:
```json
{
  "status": "ok",
  "message": "Job Tracker API is running"
}
```

