# 📋 Job Tracker

<div align="center">

**A modern, full-stack job application tracking system with authentication, Kanban board, and follow-up reminders.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

</div>

---

## ✨ Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 📊 **Dual Views** - List and Kanban board with drag-and-drop
- 🔔 **Follow-up Reminders** - Smart reminders for overdue, today, and upcoming
- 🔍 **Advanced Filtering** - Search, location, date range, multi-status filter
- ⭐ **Favorites** - Bookmark important applications
- 📤 **Export/Import** - Backup and restore your data
- 🎨 **Dark/Light Mode** - Beautiful UI with theme toggle
- 📱 **Responsive Design** - Works on all devices

---

## 🌐 Live Demo

**🎯 Try it now:** [https://job-tracker-spck.onrender.com](https://job-tracker-spck.onrender.com)


---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/zeynepgunall/job-tracker.git
cd job-tracker

# Install dependencies
npm install

# Start the backend server
npm start
```

Backend runs on **http://localhost:3000**

### Open Frontend

Open `login.html` in your browser or use a local server:

```bash
# Python
python -m http.server 5500

# Node.js
npx http-server -p 5500
```

Then open **http://localhost:5500**

---

## 📖 Usage

1. **Register/Login** - Create an account or login
2. **Add Applications** - Fill the form and save
3. **Manage** - Edit, delete, or favorite applications
4. **Filter** - Use search, location, date, and status filters
5. **Follow-ups** - Set follow-up dates and get reminders
6. **Export/Import** - Backup your data anytime

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Applications
- `GET /api/applications` - Get all applications
- `GET /api/applications/:id` - Get application by ID
- `POST /api/applications` - Create application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application
- `GET /api/applications/follow-ups` - Get follow-up reminders
- `GET /api/applications/export` - Export data
- `POST /api/applications/import` - Import data

**All endpoints require authentication** (Bearer token in Authorization header)

### Example Request

```http
POST /api/applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "company": "Google",
  "position": "Software Engineer",
  "status": "Applied",
  "dateApplied": "2024-12-19",
  "location": "Remote",
  "followUpDate": "2024-12-25"
}
```

---

## 🏗️ Project Structure

```
job-tracker/
├── server.js          # Express backend
├── package.json       # Dependencies
├── index.html         # Main app page
├── login.html         # Login/Register page
├── app.js             # Frontend logic
├── styles.css         # Styling
└── data/              # User data (auto-generated)
```

---

## 🛠️ Technologies

**Frontend:** HTML5, CSS3, Vanilla JavaScript  
**Backend:** Node.js, Express.js  
**Auth:** JWT, bcryptjs  
**Storage:** JSON files (easily migratable to database)

---

## 📝 Development

```bash
# Development mode (auto-reload)
npm run dev
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🚀 Deployment

**Live Demo:** [https://job-tracker-spck.onrender.com](https://job-tracker-spck.onrender.com)

Deployment instructions can be found in `DEPLOY.md`

> **Backend:** Deployed on Render (Node.js/Express)  
> **Frontend:** Served from backend (Static files)

---

## 📄 License

ISC License

---

