// Config dosyasından ayarları import et
import { API_BASE_URL, STORAGE_KEY, THEME_KEY, VIEW_KEY, TOKEN_KEY } from './config.js';

// Check authentication on page load
const token = localStorage.getItem(TOKEN_KEY);
if (!token) {
  window.location.href = 'login.html';
} else {
  // Verify token
  fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(res => {
    if (!res.ok) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = 'login.html';
    }
  })
  .catch(() => {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = 'login.html';
  });
}

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

const form = document.getElementById("jobForm");
const jobIdEl = document.getElementById("jobId");
const companyEl = document.getElementById("company");
const positionEl = document.getElementById("position");
const statusEl = document.getElementById("status");
const dateAppliedEl = document.getElementById("dateApplied");
const locationEl = document.getElementById("location");
const linkEl = document.getElementById("link");
const notesEl = document.getElementById("notes");
const followUpDateEl = document.getElementById("followUpDate");
const followUpNoteEl = document.getElementById("followUpNote");
const followUpsPanel = document.getElementById("followUpsPanel");
const followUpsContent = document.getElementById("followUpsContent");

const listEl = document.getElementById("list");
const emptyStateEl = document.getElementById("emptyState");
const statsEl = document.getElementById("stats");

const searchEl = document.getElementById("search");
const filterLocationEl = document.getElementById("filterLocation");
const filterDateFromEl = document.getElementById("filterDateFrom");
const filterDateToEl = document.getElementById("filterDateTo");
const statusFilterCheckboxes = document.querySelectorAll(".status-filter");
const selectAllStatusBtn = document.getElementById("selectAllStatus");
const clearAllStatusBtn = document.getElementById("clearAllStatus");
const sortByEl = document.getElementById("sortBy");
const filterFavoritesBtn = document.getElementById("filterFavorites");
const viewToggle = document.getElementById("viewToggle");
const viewIcon = document.getElementById("viewIcon");
const viewText = document.getElementById("viewText");
const kanbanEl = document.getElementById("kanban");
const resetBtn = document.getElementById("resetBtn");
const saveBtn = document.getElementById("saveBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

dateAppliedEl.value = todayISO();

// Theme management
function getTheme() {
  return localStorage.getItem(THEME_KEY) || "dark";
}

function setTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  const currentTheme = getTheme();
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme);
}

// Initialize theme
setTheme(getTheme());

// API Functions
async function loadItems() {
  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      headers: getAuthHeaders()
    });
    
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = 'login.html';
      return [];
    }
    
    if (!response.ok) {
      throw new Error('Failed to load applications');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
}

async function saveItems(items) {
  // Note: This function is kept for compatibility but individual operations use API
  // Bulk save is not needed with API, but kept for export/import compatibility
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// API CRUD operations
async function createApplication(application) {
  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(application),
    });
    
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = 'login.html';
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Failed to create application');
    }
    return await response.json();
  } catch (error) {
    console.error('Create error:', error);
    throw error;
  }
}

async function updateApplication(id, application) {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(application),
    });
    
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = 'login.html';
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Failed to update application');
    }
    return await response.json();
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
}

async function deleteApplication(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = 'login.html';
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      throw new Error('Failed to delete application');
    }
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
}

function normalize(s) {
  return (s ?? "").toString().trim();
}

async function render() {
  const items = await loadItems();

  // search filter
  const q = normalize(searchEl.value).toLowerCase();
  
  // location filter
  const locationFilter = normalize(filterLocationEl.value).toLowerCase();
  
  // date range filter
  const dateFrom = filterDateFromEl.value;
  const dateTo = filterDateToEl.value;
  
  // multi-status filter
  const selectedStatuses = Array.from(statusFilterCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);
  
  // favorites filter
  const showOnlyFavorites = filterFavoritesBtn.classList.contains("active");
  
  // apply all filters
  let filtered = items.filter((it) => {
    // search filter
    const text = `${it.company} ${it.position}`.toLowerCase();
    const matchesQuery = q === "" || text.includes(q);
    
    // location filter
    const location = normalize(it.location ?? "").toLowerCase();
    const matchesLocation = locationFilter === "" || location.includes(locationFilter);
    
    // date range filter
    let matchesDateRange = true;
    if (dateFrom || dateTo) {
      const itemDate = new Date(it.dateApplied || 0);
      if (dateFrom && itemDate < new Date(dateFrom)) {
        matchesDateRange = false;
      }
      if (dateTo && itemDate > new Date(dateTo + "T23:59:59")) {
        matchesDateRange = false;
      }
    }
    
    // status filter (multi-select)
    const matchesStatus = selectedStatuses.length > 0 && selectedStatuses.includes(it.status);
    
    // favorites filter
    const matchesFavorites = !showOnlyFavorites || (it.favorite === true);
    
    return matchesQuery && matchesLocation && matchesDateRange && matchesStatus && matchesFavorites;
  });

  // sort
  filtered.sort((a, b) => {
    // Favorites first if selected
    if (sortByEl.value === "FAVORITES_FIRST") {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
    }
    
    const da = new Date(a.dateApplied).getTime();
    const db = new Date(b.dateApplied).getTime();
    
    if (sortByEl.value === "FAVORITES_FIRST") {
      return db - da; // Within favorites/non-favorites, sort by date newest first
    }
    return sortByEl.value === "NEWEST" ? db - da : da - db;
  });

  // stats
  const counts = items.reduce((acc, it) => {
    acc.total++;
    acc[it.status] = (acc[it.status] ?? 0) + 1;
    if (it.favorite) acc.favorites = (acc.favorites ?? 0) + 1;
    return acc;
  }, { total: 0, favorites: 0 });

  const statuses = ["Applied", "Interview", "Offer", "Rejected", "Accepted"];
  statsEl.innerHTML = `
    <div class="pill">Total: <b>${counts.total ?? 0}</b></div>
    <div class="pill">⭐ Favorites: <b>${counts.favorites ?? 0}</b></div>
    ${statuses.map(s => `<div class="pill">${s}: <b>${counts[s] ?? 0}</b></div>`).join("")}
  `;

  // view mode - default is "list"
  const viewMode = localStorage.getItem(VIEW_KEY) || "list";
  const isKanbanView = viewMode === "kanban";
  
  // Toggle view containers
  if (isKanbanView) {
    listEl.style.display = "none";
    kanbanEl.style.display = "flex";
  } else {
    listEl.style.display = "grid";
    kanbanEl.style.display = "none";
  }
  emptyStateEl.style.display = filtered.length === 0 ? "block" : "none";

  // Update toggle button text/icon
  if (isKanbanView) {
    if (viewIcon) viewIcon.textContent = "📋";
    if (viewText) viewText.textContent = "List";
  } else {
    if (viewIcon) viewIcon.textContent = "📊";
    if (viewText) viewText.textContent = "Kanban";
  }

  if (isKanbanView) {
    renderKanban(filtered);
  } else {
    renderList(filtered);
  }
}

function renderList(filtered) {
  listEl.innerHTML = "";

  filtered.forEach((it) => {
    const card = document.createElement("div");
    card.className = "card";

    const linkPart = it.link ? `<a class="link" href="${it.link}" target="_blank" rel="noreferrer">Link</a>` : "";
    const locPart = it.location ? `📍 ${it.location}` : "";
    const datePart = it.dateApplied ? `🗓 ${it.dateApplied}` : "";
    const favoriteClass = it.favorite ? "favorite active" : "favorite";
    const favoriteIcon = it.favorite ? "⭐" : "☆";

    card.innerHTML = `
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <h3 style="margin: 0; flex: 1;">${escapeHtml(it.company)} — ${escapeHtml(it.position)}</h3>
          <button class="btn-icon ${favoriteClass}" data-action="toggle-favorite" data-id="${it.id}" title="${it.favorite ? 'Remove from favorites' : 'Add to favorites'}">
            ${favoriteIcon}
          </button>
        </div>
        <div class="meta">
          <span class="badge">${escapeHtml(it.status)}</span>
          <span>${escapeHtml(locPart)}</span>
          <span>${escapeHtml(datePart)}</span>
          ${it.link ? linkPart : ""}
        </div>
        ${it.notes ? `<p class="muted small" style="margin:10px 0 0;">${escapeHtml(it.notes)}</p>` : ""}
      </div>
      <div class="right">
        <div class="card-actions">
          <button class="btn" data-action="edit" data-id="${it.id}">Edit</button>
          <button class="btn" data-action="delete" data-id="${it.id}">Delete</button>
        </div>
      </div>
    `;

    listEl.appendChild(card);
  });
}

/**
 * Render Kanban board view
 * Creates 5 columns (Applied, Interview, Offer, Rejected, Accepted)
 * Each column shows filtered items for that status with count badge
 */
function renderKanban(filtered) {
  const statuses = ["Applied", "Interview", "Offer", "Rejected", "Accepted"];
  kanbanEl.innerHTML = "";

  statuses.forEach(status => {
    const column = document.createElement("div");
    column.className = "kanban-column";
    column.dataset.status = status;
    
    // Filter items for this status (respects all current filters)
    const statusItems = filtered.filter(it => it.status === status);
    
    // Sort items within column based on current sort setting
    const sortedItems = [...statusItems].sort((a, b) => {
      const da = new Date(a.dateApplied || 0).getTime();
      const db = new Date(b.dateApplied || 0).getTime();
      if (sortByEl.value === "FAVORITES_FIRST") {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return db - da;
      }
      return sortByEl.value === "NEWEST" ? db - da : da - db;
    });
    
    const count = sortedItems.length;
    
    column.innerHTML = `
      <div class="kanban-column-header">
        <h3>${status}</h3>
        <span class="kanban-count">${count}</span>
      </div>
      <div class="kanban-column-body" data-status="${status}">
        ${sortedItems.map(it => createKanbanCard(it)).join("")}
      </div>
    `;
    
    kanbanEl.appendChild(column);
  });
  
  // Setup drag & drop with event delegation
  setupKanbanDragDrop();
}

/**
 * Setup drag & drop event listeners using event delegation
 * Prevents duplicate listeners on re-renders
 */
function setupKanbanDragDrop() {
  // Make cards draggable
  kanbanEl.querySelectorAll(".kanban-card").forEach(card => {
    card.draggable = true;
    // Prevent dragging on buttons and links
    card.querySelectorAll("button, a").forEach(el => {
      el.draggable = false;
    });
  });
  
  // Remove old listeners (if any) by cloning the element
  const newKanban = kanbanEl.cloneNode(true);
  kanbanEl.parentNode.replaceChild(newKanban, kanbanEl);
  kanbanEl = document.getElementById("kanban");
  
  // Add event listeners using event delegation
  kanbanEl.addEventListener("dragstart", (e) => {
    if (e.target.closest(".kanban-card")) {
      handleDragStart(e);
    }
  }, true);
  
  kanbanEl.addEventListener("dragend", (e) => {
    if (e.target.closest(".kanban-card")) {
      handleDragEnd(e);
    }
  }, true);
  
  // Make columns droppable
  kanbanEl.querySelectorAll(".kanban-column-body").forEach(column => {
    column.addEventListener("dragover", handleDragOver);
    column.addEventListener("drop", handleDrop);
    column.addEventListener("dragenter", handleDragEnter);
    column.addEventListener("dragleave", handleDragLeave);
  });
}

function createKanbanCard(it) {
  const linkPart = it.link ? `<a class="link" href="${it.link}" target="_blank" rel="noreferrer">Link</a>` : "";
  const locPart = it.location ? `📍 ${it.location}` : "";
  const datePart = it.dateApplied ? `🗓 ${it.dateApplied}` : "";
  const favoriteIcon = it.favorite ? "⭐" : "";
  const followUpBadge = it.followUpDate ? `<span class="follow-up-badge" title="Follow-up: ${it.followUpDate}${it.followUpNote ? ' - ' + escapeHtml(it.followUpNote) : ''}">📅</span>` : "";
  const followUpMeta = it.followUpDate ? `<div class="kanban-meta" style="color: var(--warning, #f39c12);">⏰ Follow-up: ${escapeHtml(it.followUpDate)}</div>` : "";
  
  return `
    <div class="kanban-card" draggable="true" data-id="${it.id}">
      <div class="kanban-card-header">
        <h4>${escapeHtml(it.company)}</h4>
        <div style="display: flex; align-items: center; gap: 0.25rem;">
          ${followUpBadge}
          ${favoriteIcon ? `<span class="kanban-favorite">${favoriteIcon}</span>` : ""}
        </div>
      </div>
      <div class="kanban-card-body">
        <p class="kanban-position">${escapeHtml(it.position)}</p>
        ${locPart ? `<div class="kanban-meta">${escapeHtml(locPart)}</div>` : ""}
        ${datePart ? `<div class="kanban-meta">${escapeHtml(datePart)}</div>` : ""}
        ${followUpMeta}
        ${it.notes ? `<p class="kanban-notes">${escapeHtml(it.notes)}</p>` : ""}
        ${it.link ? `<div class="kanban-link">${linkPart}</div>` : ""}
      </div>
      <div class="kanban-card-actions">
        <button class="btn-small" data-action="edit" data-id="${it.id}">Edit</button>
        <button class="btn-small" data-action="delete" data-id="${it.id}">Delete</button>
      </div>
    </div>
  `;
}

let draggedElement = null;
let draggedCardId = null;

function handleDragStart(e) {
  // Find the kanban card element (might be clicking on child element)
  const card = e.target.closest(".kanban-card");
  if (!card) return;
  
  draggedElement = card;
  draggedCardId = card.dataset.id;
  card.classList.add("dragging");
  
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", card.dataset.id);
  
  // Allow dragging
  e.stopPropagation();
}

function handleDragEnd(e) {
  const card = e.target.closest(".kanban-card");
  if (card) {
    card.classList.remove("dragging");
  }
  
  kanbanEl.querySelectorAll(".kanban-column-body").forEach(col => {
    col.classList.remove("drag-over");
  });
  
  draggedElement = null;
  draggedCardId = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = "move";
  return false;
}

function handleDragEnter(e) {
  e.preventDefault();
  e.stopPropagation();
  const columnBody = e.currentTarget;
  if (columnBody.classList.contains("kanban-column-body")) {
    columnBody.classList.add("drag-over");
  }
}

function handleDragLeave(e) {
  const columnBody = e.currentTarget;
  if (columnBody.classList.contains("kanban-column-body")) {
    // Only remove if we're actually leaving the column (not entering a child)
    if (!columnBody.contains(e.relatedTarget)) {
      columnBody.classList.remove("drag-over");
    }
  }
}

async function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const columnBody = e.currentTarget;
  if (!columnBody.classList.contains("kanban-column-body")) return;
  
  columnBody.classList.remove("drag-over");
  
  const newStatus = columnBody.dataset.status;
  const itemId = draggedCardId || e.dataTransfer.getData("text/plain");
  
  if (!newStatus || !itemId) return;
  
  try {
    const items = await loadItems();
    const item = items.find(x => x.id === itemId);
    
    if (item && item.status !== newStatus) {
      const updatedItem = { ...item, status: newStatus };
      await updateApplication(itemId, updatedItem);
      await render();
      await loadFollowUps(); // Refresh follow-ups after status change
    }
  } catch (error) {
    alert(`Error updating status: ${error.message}`);
  }
  
  draggedElement = null;
  draggedCardId = null;
  return false;
}

function escapeHtml(str) {
  return (str ?? "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function resetForm() {
  jobIdEl.value = "";
  companyEl.value = "";
  positionEl.value = "";
  statusEl.value = "Applied";
  dateAppliedEl.value = todayISO();
  locationEl.value = "";
  linkEl.value = "";
  notesEl.value = "";
  followUpDateEl.value = "";
  followUpNoteEl.value = "";
  saveBtn.textContent = "Save";
}

// Duplicate detection
async function checkDuplicate(company, position, excludeId = null) {
  const items = await loadItems();
  const normalizedCompany = normalize(company).toLowerCase();
  const normalizedPosition = normalize(position).toLowerCase();
  
  return items.find(item => {
    if (excludeId && item.id === excludeId) return false;
    const itemCompany = normalize(item.company || "").toLowerCase();
    const itemPosition = normalize(item.position || "").toLowerCase();
    return itemCompany === normalizedCompany && itemPosition === normalizedPosition;
  });
}

function showDuplicateDialog(duplicateItem) {
  const message = `Bu başvuru zaten mevcut!\n\n` +
    `Şirket: ${duplicateItem.company}\n` +
    `Pozisyon: ${duplicateItem.position}\n` +
    `Durum: ${duplicateItem.status}\n` +
    `Tarih: ${duplicateItem.dateApplied || "Belirtilmemiş"}\n\n` +
    `Ne yapmak istersiniz?`;
  
  const choice = confirm(
    message + "\n\n" +
    "OK = Mevcut kaydı düzenle\n" +
    "Cancel = Yine de yeni kayıt olarak ekle"
  );
  
  return choice; // true = edit existing, false = add anyway
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    company: normalize(companyEl.value),
    position: normalize(positionEl.value),
    status: statusEl.value,
    dateApplied: dateAppliedEl.value || todayISO(),
    location: normalize(locationEl.value),
    link: normalize(linkEl.value),
    notes: normalize(notesEl.value),
    favorite: false, // Will be set separately if needed
    followUpDate: followUpDateEl.value || null,
    followUpNote: normalize(followUpNoteEl.value) || null,
  };

  if (!payload.company || !payload.position) return;

  const isEditMode = !!jobIdEl.value;
  const applicationId = jobIdEl.value;
  
  // Duplicate check - only for new entries (not when editing)
  if (!isEditMode) {
    const duplicate = await checkDuplicate(payload.company, payload.position);
    if (duplicate) {
      const shouldEdit = showDuplicateDialog(duplicate);
      if (shouldEdit) {
        // Load the existing item for editing
        jobIdEl.value = duplicate.id;
        companyEl.value = duplicate.company;
        positionEl.value = duplicate.position;
        statusEl.value = duplicate.status;
        dateAppliedEl.value = duplicate.dateApplied || todayISO();
        locationEl.value = duplicate.location ?? "";
        linkEl.value = duplicate.link ?? "";
        notesEl.value = duplicate.notes ?? "";
        followUpDateEl.value = duplicate.followUpDate ?? "";
        followUpNoteEl.value = duplicate.followUpNote ?? "";
        saveBtn.textContent = "Update";
        window.scrollTo({ top: 0, behavior: "smooth" });
        return; // Don't save, just load for editing
      }
      // If user chooses to add anyway, continue with the save
    }
  }

    try {
      if (isEditMode) {
        // Update existing
        await updateApplication(applicationId, payload);
      } else {
        // Create new
        await createApplication(payload);
      }
      resetForm();
      await render();
      await loadFollowUps(); // Refresh follow-ups after create/update
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
});

resetBtn.addEventListener("click", resetForm);

// Handle clicks in both list and kanban views
async function handleCardClick(e) {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;
  
  if (!id) return;

  if (action === "toggle-favorite") {
    try {
      const items = await loadItems();
  const item = items.find((x) => x.id === id);
  if (!item) return;
      
      const updatedItem = { ...item, favorite: !item.favorite };
      await updateApplication(id, updatedItem);
      await render();
      await loadFollowUps(); // Refresh follow-ups after favorite toggle
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
    return;
  }

  if (action === "delete") {
    const ok = confirm("Delete this application?");
    if (!ok) return;
    
    try {
      await deleteApplication(id);
      await render();
      await loadFollowUps(); // Refresh follow-ups after delete
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
    return;
  }

  if (action === "edit") {
    try {
      const items = await loadItems();
      const item = items.find((x) => x.id === id);
      if (!item) return;
      
    jobIdEl.value = item.id;
    companyEl.value = item.company;
    positionEl.value = item.position;
    statusEl.value = item.status;
    dateAppliedEl.value = item.dateApplied || todayISO();
    locationEl.value = item.location ?? "";
    linkEl.value = item.link ?? "";
    notesEl.value = item.notes ?? "";
    followUpDateEl.value = item.followUpDate ?? "";
    followUpNoteEl.value = item.followUpNote ?? "";
    locationEl.value = item.location ?? "";
    linkEl.value = item.link ?? "";
    notesEl.value = item.notes ?? "";
    saveBtn.textContent = "Update";
    window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      alert(`Error loading item: ${error.message}`);
    }
  }
}

listEl.addEventListener("click", handleCardClick);
kanbanEl.addEventListener("click", handleCardClick);

// Export function
function exportData() {
  const items = loadItems();
  if (items.length === 0) {
    alert("Export edilecek veri bulunamadı.");
    return;
  }

  const data = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    totalItems: items.length,
    items: items
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `job-tracker-backup-${todayISO().replace(/-/g, "")}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert(`${items.length} başvuru başarıyla export edildi!`);
}

// Import function (backend supported)
async function importData(file) {
  const reader = new FileReader();
  
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      // Ask user for import mode
      const mode = confirm(
        "Import modu seçin:\n\n" +
        "OK = Birleştir (Merge) - Mevcut verilerle birleştir, aynı ID'ler güncellenir\n" +
        "Cancel = Değiştir (Replace) - Mevcut verileri sil, sadece import edilenleri kullan"
      ) ? 'merge' : 'replace';
      
      // Send to backend
      const response = await fetch(`${API_BASE_URL}/applications/import?mode=${mode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Import failed' }));
        throw new Error(errorData.error || errorData.message || 'Import failed');
      }
      
      const result = await response.json();
      
      // Refresh the UI
      await render();
      
      // Show detailed report
      const report = result.report;
      let message = `✅ Import tamamlandı!\n\n`;
      message += `📊 Rapor:\n`;
      message += `• Toplam kayıt: ${report.total}\n`;
      message += `• Geçerli: ${report.valid}\n`;
      message += `• Geçersiz: ${report.invalid}\n`;
      
      if (mode === 'merge') {
        message += `• Oluşturulan: ${report.created}\n`;
        message += `• Güncellenen: ${report.updated}\n`;
      } else {
        message += `• Oluşturulan: ${report.created}\n`;
      }
      
      if (report.skipped > 0) {
        message += `• Atlanan (validasyon hatası): ${report.skipped}\n`;
      }
      
      message += `\n📈 Toplam başvuru: ${report.finalTotal}`;
      
      if (report.invalidDetails && report.invalidDetails.length > 0) {
        message += `\n\n⚠️ Geçersiz kayıtlar:\n`;
        report.invalidDetails.slice(0, 5).forEach(detail => {
          message += `• Kayıt #${detail.index + 1}: ${detail.reason}\n`;
        });
        if (report.invalidDetails.length > 5) {
          message += `• ... ve ${report.invalidDetails.length - 5} kayıt daha\n`;
        }
      }
      
      alert(message);
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import hatası: ${error.message}\n\nLütfen geçerli bir JSON dosyası seçin.`);
    }
  };

  reader.onerror = () => {
    alert("Dosya okuma hatası oluştu.");
  };

  reader.readAsText(file);
}

// Event listeners
exportBtn.addEventListener("click", exportData);

// Theme toggle
themeToggle.addEventListener("click", toggleTheme);

importBtn.addEventListener("click", () => {
  importFile.click();
});

importFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    importData(file);
    // Reset input so same file can be imported again
    importFile.value = "";
  }
});

// Status filter checkboxes
statusFilterCheckboxes.forEach(cb => {
  cb.addEventListener("change", render);
});

// Select all statuses
selectAllStatusBtn.addEventListener("click", () => {
  statusFilterCheckboxes.forEach(cb => cb.checked = true);
  render();
});

// Clear all statuses
clearAllStatusBtn.addEventListener("click", () => {
  statusFilterCheckboxes.forEach(cb => cb.checked = false);
  render();
});

// Favorites filter toggle
filterFavoritesBtn.addEventListener("click", () => {
  filterFavoritesBtn.classList.toggle("active");
  render();
});

// View toggle (List/Kanban)
function toggleView() {
  const currentView = localStorage.getItem(VIEW_KEY) || "list";
  const newView = currentView === "list" ? "kanban" : "list";
  localStorage.setItem(VIEW_KEY, newView);
  
  if (newView === "kanban") {
    viewIcon.textContent = "📋";
    viewText.textContent = "List";
  } else {
    viewIcon.textContent = "📊";
    viewText.textContent = "Kanban";
  }
  
  render();
}

// Initialize view
const savedView = localStorage.getItem(VIEW_KEY) || "list";
if (savedView === "kanban") {
  viewIcon.textContent = "📋";
  viewText.textContent = "List";
} else {
  viewIcon.textContent = "📊";
  viewText.textContent = "Kanban";
}

viewToggle.addEventListener("click", toggleView);

// Logout function
function logout() {
  if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = 'login.html';
  }
}

// Logout button
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

// All filter inputs
[searchEl, filterLocationEl, filterDateFromEl, filterDateToEl, sortByEl].forEach((el) => {
  if (el) el.addEventListener("input", () => render());
  if (el) el.addEventListener("change", () => render());
});

// Follow-ups functions
async function loadFollowUps() {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/follow-ups`, {
      headers: getAuthHeaders()
    });
    
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = 'login.html';
      return;
    }
    
    if (!response.ok) {
      console.error('Failed to load follow-ups');
      return;
    }
    
    const data = await response.json();
    renderFollowUps(data);
  } catch (error) {
    console.error('Error loading follow-ups:', error);
  }
}

function renderFollowUps(data) {
  const { today, overdue, upcoming } = data;
  const totalCount = today.length + overdue.length + upcoming.length;
  
  if (totalCount === 0) {
    if (followUpsPanel) followUpsPanel.style.display = 'none';
    return;
  }
  
  if (followUpsPanel) followUpsPanel.style.display = 'block';
  
  let html = '';
  
  // Overdue section
  if (overdue.length > 0) {
    html += `
      <div class="follow-up-section overdue">
        <h3 style="color: var(--danger, #e74c3c); margin-bottom: 0.75rem;">
          🔴 Overdue (${overdue.length})
        </h3>
        <div class="follow-up-list">
          ${overdue.map(item => createFollowUpItem(item, 'overdue')).join('')}
        </div>
      </div>
    `;
  }
  
  // Today section
  if (today.length > 0) {
    html += `
      <div class="follow-up-section today">
        <h3 style="color: var(--warning, #f39c12); margin-bottom: 0.75rem;">
          🟡 Today (${today.length})
        </h3>
        <div class="follow-up-list">
          ${today.map(item => createFollowUpItem(item, 'today')).join('')}
        </div>
      </div>
    `;
  }
  
  // Upcoming section
  if (upcoming.length > 0) {
    html += `
      <div class="follow-up-section upcoming">
        <h3 style="color: var(--success, #27ae60); margin-bottom: 0.75rem;">
          🟢 Upcoming (next 7 days) (${upcoming.length})
        </h3>
        <div class="follow-up-list">
          ${upcoming.map(item => createFollowUpItem(item, 'upcoming')).join('')}
        </div>
      </div>
    `;
  }
  
  if (followUpsContent) {
    followUpsContent.innerHTML = html;
    
    // Attach event listeners
    followUpsContent.querySelectorAll('[data-action="mark-done"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.dataset.id;
        await markFollowUpDone(id);
      });
    });
    
    followUpsContent.querySelectorAll('[data-action="edit-followup"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        editFollowUpItem(id);
      });
    });
  }
}

function createFollowUpItem(item, type) {
  const dateStr = item.followUpDate ? new Date(item.followUpDate).toLocaleDateString('tr-TR') : '';
  const note = item.followUpNote ? ` - ${escapeHtml(item.followUpNote)}` : '';
  
  return `
    <div class="follow-up-item ${type}" style="
      background: var(--card-bg);
      border-left: 3px solid ${type === 'overdue' ? 'var(--danger, #e74c3c)' : type === 'today' ? 'var(--warning, #f39c12)' : 'var(--success, #27ae60)'};
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    ">
      <div style="flex: 1;">
        <div style="font-weight: 600;">${escapeHtml(item.company)} - ${escapeHtml(item.position)}</div>
        <div style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.25rem;">
          📅 ${dateStr}${note}
        </div>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn-small" data-action="mark-done" data-id="${item.id}" title="Mark as done">
          ✓ Done
        </button>
        <button class="btn-small" data-action="edit-followup" data-id="${item.id}" title="Edit">
          Edit
        </button>
      </div>
    </div>
  `;
}

async function markFollowUpDone(id) {
  try {
    const items = await loadItems();
    const item = items.find(x => x.id === id);
    if (!item) return;
    
    const updatedItem = { ...item, followUpDate: null, followUpNote: null };
    await updateApplication(id, updatedItem);
    await render();
    await loadFollowUps();
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

async function editFollowUpItem(id) {
  try {
    const items = await loadItems();
    const item = items.find(x => x.id === id);
    if (!item) return;
    
    jobIdEl.value = item.id;
    companyEl.value = item.company;
    positionEl.value = item.position;
    statusEl.value = item.status;
    dateAppliedEl.value = item.dateApplied || todayISO();
    locationEl.value = item.location ?? "";
    linkEl.value = item.link ?? "";
    notesEl.value = item.notes ?? "";
    followUpDateEl.value = item.followUpDate ?? "";
    followUpNoteEl.value = item.followUpNote ?? "";
    saveBtn.textContent = "Update";
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    alert(`Error loading item: ${error.message}`);
  }
}

// Initialize
render();
loadFollowUps();
