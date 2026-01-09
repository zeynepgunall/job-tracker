// Configuration file - Tek bir yerden tüm ayarları yönet
const CONFIG = {
  // API Base URL - Otomatik olarak production veya development seçer
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:3000/api"
    : "https://job-tracker-spck.onrender.com/api",
  
  // App Settings
  STORAGE_KEY: "job_tracker_items_v1",
  THEME_KEY: "job_tracker_theme",
  VIEW_KEY: "job_tracker_view",
  TOKEN_KEY: "job_tracker_token"
};

// Global olarak erişilebilir yap
window.CONFIG = CONFIG;

