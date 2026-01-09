# 🚀 Deployment Guide

Bu projeyi production'a deploy etmek için adım adım talimatlar.

## 📋 Seçenekler

### 1. Render (Önerilen - Ücretsiz ve Kolay) ⭐
### 2. Railway (Ücretsiz)
### 3. Vercel (Serverless)

---

## 🎯 Seçenek 1: Render (Önerilen)

Render, full-stack uygulamalar için mükemmel ve ücretsiz bir seçenektir.

### Adımlar:

#### 1. Render Hesabı Oluştur
- https://render.com adresine gidin
- "Get Started for Free" ile GitHub hesabınızla giriş yapın

#### 2. Backend Deploy

1. **Dashboard'da "New +" → "Web Service" seçin**
2. **GitHub repository'nizi bağlayın**
   - Repository: `zeynepgunall/job-tracker`
   - Branch: `main`
3. **Ayarları yapın:**
   - **Name:** `job-tracker-backend` (veya istediğiniz isim)
   - **Environment:** `Node`
   - **Root Directory:** (BOŞ BIRAKIN veya `.` yazın) ⚠️ ÖNEMLİ!
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Environment Variables ekleyin:**
   - `JWT_SECRET` → Güçlü bir secret key (örn: `openssl rand -hex 32` ile oluşturun)
   - `NODE_ENV` → `production`
   - `PORT` → `3000` (Render otomatik atar ama belirtebilirsiniz)

5. **Deploy** butonuna tıklayın

Backend URL'iniz: `https://job-tracker-backend.onrender.com` (veya belirlediğiniz isim)

#### 3. Frontend Deploy

1. **Dashboard'da "New +" → "Static Site" seçin**
2. **GitHub repository'nizi bağlayın**
3. **Ayarları yapın:**
   - **Name:** `job-tracker-frontend`
   - **Root Directory:** (BOŞ BIRAKIN) ⚠️ ÖNEMLİ!
   - **Build Command:** (boş bırakın)
   - **Publish Directory:** `/` (root) veya boş bırakın
   - **Headers:** (boş bırakın - varsayılan yeterli)

4. **Deploy** butonuna tıklayın

Frontend URL'iniz: `https://job-tracker-frontend.onrender.com`

#### 4. Frontend'de API URL'i Güncelle

`app.js` dosyasında `API_BASE_URL`'i production URL'e çevirin:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:3000/api"
  : "https://job-tracker-backend.onrender.com/api";
```

Sonra commit ve push yapın:
```bash
git add app.js
git commit -m "Update API URL for production"
git push origin main
```

Render otomatik olarak yeniden deploy edecektir.

---

## 🚂 Seçenek 2: Railway

Railway da ücretsiz ve kolay bir seçenektir.

### Adımlar:

1. **https://railway.app** adresine gidin
2. **GitHub ile giriş yapın**
3. **"New Project" → "Deploy from GitHub repo"**
4. **Repository'nizi seçin**
5. **Otomatik olarak deploy edilir**

**Environment Variables:**
- `JWT_SECRET` → Güçlü bir secret key
- `PORT` → Railway otomatik atar

**Not:** Railway hem backend hem frontend'i aynı projede deploy edebilir.

---

## ▲ Seçenek 3: Vercel

Vercel serverless functions kullanır.

### Adımlar:

1. **https://vercel.com** adresine gidin
2. **GitHub ile giriş yapın**
3. **"Add New Project"**
4. **Repository'nizi import edin**
5. **Framework Preset:** Other
6. **Build Command:** (boş)
7. **Output Directory:** (boş)
8. **Deploy**

**Not:** Vercel için backend'i ayrı deploy etmeniz gerekebilir.

---

## 🔧 Production Hazırlığı

### 1. Environment Variables

Production'da mutlaka ayarlayın:

```bash
JWT_SECRET=your-very-strong-secret-key-here
NODE_ENV=production
PORT=3000  # (Render/Railway otomatik atar)
```

### 2. CORS Ayarları (Opsiyonel)

Eğer CORS hatası alırsanız, `server.js` dosyasında:

```javascript
const allowedOrigins = [
  'https://your-frontend-url.onrender.com',
  'http://localhost:5500' // Development için
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

### 3. Frontend API URL

`app.js` dosyasında production URL'i güncelleyin:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : 'https://your-backend-url.onrender.com/api';
```

---

## 📝 Render Deployment Checklist

- [ ] Render hesabı oluşturuldu
- [ ] Backend Web Service oluşturuldu
- [ ] `JWT_SECRET` environment variable eklendi
- [ ] Backend deploy edildi ve çalışıyor
- [ ] Backend URL test edildi (`/api/health`)
- [ ] Frontend Static Site oluşturuldu
- [ ] Frontend'de API URL güncellendi
- [ ] Frontend deploy edildi
- [ ] Test edildi (register, login, CRUD işlemleri)

---

## 🐛 Sorun Giderme

### Backend çalışmıyor

#### "Root directory 'backend' does not exist" hatası
- ⚠️ **ÇÖZÜM:** Render dashboard'da "Settings" → "Root Directory" alanını **BOŞ** bırakın veya `.` yazın
- Proje yapınızda `backend/` klasörü yok, dosyalar root'ta
- Root Directory'yi boş bırakıp tekrar deploy edin

#### Diğer sorunlar
- Environment variables kontrol edin
- Logs'u kontrol edin (Render dashboard'da)
- Port'un doğru olduğundan emin olun

### CORS hatası
- Frontend URL'ini backend CORS ayarlarına ekleyin
- `cors()` middleware'inin doğru yapılandırıldığından emin olun

### 404 Not Found
- API endpoint'lerinin doğru olduğundan emin olun
- Base URL'in sonunda `/api` olduğundan emin olun

### Authentication hatası
- JWT_SECRET'ın production'da ayarlandığından emin olun
- Token'ların doğru gönderildiğinden emin olun

---

## 🔗 Örnek URL'ler

Deploy sonrası:
- **Backend:** `https://job-tracker-backend.onrender.com`
- **Frontend:** `https://job-tracker-frontend.onrender.com`
- **API Health:** `https://job-tracker-backend.onrender.com/api/health`

---

## 💡 İpuçları

1. **Ücretsiz tier'lerde** ilk request yavaş olabilir (cold start)
2. **JWT_SECRET**'ı asla GitHub'a commit etmeyin
3. **Data dosyaları** Render'da kalıcı olarak saklanır
4. **Backup** için export/import özelliğini kullanın
5. **Monitoring** için Render dashboard'u kullanın

---

## 📚 Daha Fazla Bilgi

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)

