// Configuration file - Tek bir yerden tüm ayarları yönet

// API Base URL - Otomatik olarak production veya development seçer
// Backend'den hem API hem frontend serve edildiği için, production'da sadece path kullanıyoruz
export const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? "http://localhost:3000/api"
  : "/api"; // Production'da aynı origin'den serve ediliyor

// App Settings
export const STORAGE_KEY = "job_tracker_items_v1";
export const THEME_KEY = "job_tracker_theme";
export const VIEW_KEY = "job_tracker_view";
export const TOKEN_KEY = "job_tracker_token";

