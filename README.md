# Job Tracker Application

Job/Internship başvuru takip uygulaması - Frontend (HTML/CSS/JS) + Backend (Node.js/Express)

## 🚀 Özellikler

### Frontend
- ✅ CRUD işlemleri (Create, Read, Update, Delete)
- ✅ Gelişmiş filtreleme (arama, lokasyon, tarih aralığı, çoklu durum)
- ✅ Kanban Board görünümü (Sürükle-bırak)
- ✅ List görünümü
- ✅ Favoriler/Bookmark
- ✅ Export/Import JSON
- ✅ Dark/Light Mode
- ✅ Duplicate Detection
- ✅ İstatistikler

### Backend (Node.js + Express)
- ✅ RESTful API
- ✅ JSON file-based storage (data/applications.json)
- ✅ CORS desteği
- ✅ CRUD endpoints
- ✅ Error handling

## 📁 Proje Yapısı

```
job-tracker/
├── server.js              # Express server
├── package.json           # Node.js dependencies
├── data/
│   └── applications.json  # Veri dosyası (otomatik oluşur)
├── index.html
├── app.js                 # Frontend (API'ye bağlı)
├── styles.css
└── README.md
```

## 🔧 Kurulum ve Çalıştırma

### 1. Backend'i Başlat

```bash
# Dependencies yükle
npm install

# Server'ı başlat
npm start

# Veya development mode (nodemon ile otomatik restart)
npm run dev
```

Backend şu adreste çalışacak: **http://localhost:3000**

### 2. Frontend'i Aç

`index.html` dosyasını tarayıcıda açın veya bir local server kullanın:

```bash
# Python ile
python -m http.server 5500

# Node.js ile (http-server)
npx http-server -p 5500
```

Frontend: **http://localhost:5500**

## 📡 API Endpoints

### Applications
- `GET /api/applications` - Tüm başvuruları listele
- `GET /api/applications/:id` - ID'ye göre başvuru getir
- `POST /api/applications` - Yeni başvuru oluştur
- `PUT /api/applications/:id` - Başvuru güncelle
- `DELETE /api/applications/:id` - Başvuru sil
- `GET /api/applications/status/:status` - Duruma göre listele
- `GET /api/applications/favorites` - Favorileri listele
- `GET /api/health` - Health check

### Örnek Request/Response

**POST /api/applications**
```json
{
  "company": "Google",
  "position": "Software Engineer",
  "status": "Applied",
  "dateApplied": "2024-12-19",
  "location": "Remote",
  "link": "https://careers.google.com",
  "notes": "Technical interview scheduled",
  "favorite": true
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "company": "Google",
  "position": "Software Engineer",
  "status": "Applied",
  "dateApplied": "2024-12-19",
  "location": "Remote",
  "link": "https://careers.google.com",
  "notes": "Technical interview scheduled",
  "favorite": true,
  "createdAt": "2024-12-19T10:00:00.000Z",
  "updatedAt": "2024-12-19T10:00:00.000Z"
}
```

## 🔄 Frontend-Backend Entegrasyonu

Frontend artık API'ye bağlı! `app.js` dosyasında:
- `loadItems()` → `GET /api/applications`
- `createApplication()` → `POST /api/applications`
- `updateApplication()` → `PUT /api/applications/:id`
- `deleteApplication()` → `DELETE /api/applications/:id`

API çalışmazsa localStorage'a fallback yapıyor.

## 🗄️ Veri Depolama

Veriler `data/applications.json` dosyasında saklanıyor. Bu dosya otomatik oluşturulur.

## 📝 Notlar

- Backend port: 3000
- CORS tüm origin'lere açık (development için)
- Production'da CORS ayarlarını sınırlandırın
- Veriler JSON dosyasında saklanıyor (production'da database kullanılabilir)

## 🛠️ Geliştirme

### Yeni Özellik Ekleme
1. Backend'de endpoint ekle (`server.js`)
2. Frontend'de API fonksiyonu ekle (`app.js`)
3. UI'da kullan

### Database'e Geçiş
JSON dosyası yerine MongoDB, PostgreSQL gibi bir database kullanmak için:
- `server.js` içindeki `readApplications()` ve `writeApplications()` fonksiyonlarını database çağrılarıyla değiştirin
- Mongoose (MongoDB) veya Sequelize (PostgreSQL) gibi bir ORM kullanabilirsiniz

