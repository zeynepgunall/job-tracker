# 🚨 Render Deploy Sorunu Çözümü

## Sorun: "Cannot GET /" hatası

Render Static Site çalışmıyor. **ÇÖZÜM:** Backend'den hem API hem frontend serve edin!

## ✅ Doğru Çözüm: Tek Servis (Backend + Frontend)

Render Static Site yerine, backend servisinden hem API hem frontend'i serve edin.

### Adımlar:

1. **Render Dashboard'da:**
   - Frontend Static Site'i **SİLİN** (varsa)
   - Sadece **Backend Web Service** kalsın

2. **Backend Servis Ayarları:**
   - Backend servisiniz zaten çalışıyor
   - `server.js` artık production'da frontend'i de serve ediyor
   - `NODE_ENV=production` environment variable'ı ekli olmalı

3. **Test:**
   - Backend URL'inizi açın: `https://job-tracker-spck.onrender.com`
   - Artık hem frontend hem API çalışmalı!

## 📝 Environment Variables Kontrol

Backend servisinizde şunlar olmalı:
- ✅ `NODE_ENV` = `production`
- ✅ `JWT_SECRET` = (güçlü bir secret key)
- ✅ `PORT` = (Render otomatik atar, boş bırakabilirsiniz)

## 🔧 Nasıl Çalışıyor?

Production'da (`NODE_ENV=production`):
- Backend `/api/*` route'larını serve eder (API)
- Backend static dosyaları serve eder (CSS, JS, HTML)
- Backend tüm diğer route'ları `index.html`'e yönlendirir (SPA routing)

Böylece tek bir URL'den her şey çalışır!

## ⚠️ ÖNEMLİ

- **Frontend Static Site'i silin** - Artık gerekli değil
- **Backend URL'inizi kullanın** - Hem frontend hem API için
- **config.js** dosyasındaki API URL'i backend URL'inizle eşleşmeli

