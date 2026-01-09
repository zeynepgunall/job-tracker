# 🗄️ Veritabanı (Database) Yapısı

Bu proje **JSON dosya tabanlı** bir veri saklama sistemi kullanıyor. Gerçek bir veritabanı (MySQL, PostgreSQL, MongoDB) kullanılmıyor, bunun yerine dosya sistemi üzerinde JSON dosyaları kullanılıyor.

## 📁 Dosya Yapısı

```
data/
├── users.json                    # Tüm kullanıcılar (herkes için ortak)
└── applications_{userId}.json    # Her kullanıcı için ayrı başvuru dosyası
```

## 👥 Kullanıcı Verileri: `data/users.json`

**Kullanıcılar kayıt olduğunda bu dosyaya kaydediliyor:**

```json
[
  {
    "id": "6fbbad95-f517-461f-9f99-57baf2e24728",
    "username": "zeynepgunall",
    "email": "zeynepgunall@outlook.com",
    "password": "$2a$10$cNnvvTcB0TyyiifhTCnfbOLB/HFExaI/1oRZ7UOpksnUYPGqt3Cs.",
    "createdAt": "2026-01-09T17:58:45.923Z"
  }
]
```

**Önemli Notlar:**
- ✅ Şifreler **bcrypt** ile hash'leniyor (düz metin değil!)
- ✅ Her kullanıcının benzersiz bir `id`'si var
- ✅ Email ve username kontrolü yapılıyor (aynı kayıt olamaz)

## 📋 Başvuru Verileri: `data/applications_{userId}.json`

**Her kullanıcı için ayrı dosya oluşturuluyor:**

Örnek: `data/applications_6fbbad95-f517-461f-9f99-57baf2e24728.json`

```json
[
  {
    "id": "abc123",
    "company": "Google",
    "position": "Software Engineer",
    "status": "Applied",
    "dateApplied": "2024-12-19",
    "location": "Remote",
    "favorite": false,
    "followUpDate": "2024-12-25",
    "followUpNote": "Remember to follow up"
  }
]
```

**Önemli:**
- Her kullanıcı **sadece kendi başvurularını** görebilir
- Dosya adı kullanıcı ID'sine göre oluşturuluyor
- Kullanıcılar birbirinin verilerini göremez (güvenlik)

## 🔒 Güvenlik

1. **Şifre Hash'leme:** Şifreler asla düz metin olarak saklanmıyor, bcrypt ile hash'leniyor
2. **JWT Token:** Kullanıcılar token ile kimlik doğrulaması yapıyor
3. **User Isolation:** Her kullanıcı sadece kendi verilerine erişebiliyor

## 🔄 Nasıl Çalışıyor?

### Kayıt Ol (Register):
1. Kullanıcı formu doldurur (username, email, password)
2. Backend şifreyi hash'ler (`bcrypt.hash()`)
3. Yeni kullanıcı `data/users.json` dosyasına eklenir
4. JWT token oluşturulur ve kullanıcıya döndürülür

### Giriş Yap (Login):
1. Kullanıcı username ve password gönderir
2. Backend `data/users.json` dosyasından kullanıcıyı bulur
3. Şifreyi karşılaştırır (`bcrypt.compare()`)
4. Doğruysa JWT token döndürür

### Başvuru Ekleme:
1. Kullanıcı token ile istek gönderir
2. Backend token'dan `userId`'yi alır
3. `data/applications_{userId}.json` dosyasına başvuruyu ekler
4. Eğer dosya yoksa oluşturulur

## ⚠️ Önemli Notlar

- `data/` klasörü **.gitignore**'da - GitHub'a yüklenmiyor (güvenlik)
- Production'da (Render'da) bu dosyalar server'ın dosya sisteminde saklanıyor
- **Gerçek bir veritabanı kullanmak isterseniz:** PostgreSQL, MongoDB, MySQL gibi sistemlere kolayca migrate edilebilir

## 🚀 Gerçek Veritabanına Geçiş

Eğer ileride gerçek bir veritabanı kullanmak isterseniz:
- **PostgreSQL** (ücretsiz): Render, Railway, Supabase
- **MongoDB** (ücretsiz): MongoDB Atlas
- **MySQL** (ücretsiz): PlanetScale, Railway

Kod yapısı zaten hazır, sadece `readUsers()`, `writeUsers()`, `getUserApplications()` fonksiyonlarını veritabanı sorgularıyla değiştirmeniz yeterli!

