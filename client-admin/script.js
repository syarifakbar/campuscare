const api = '/api';

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const logoutButton = document.getElementById('logoutButton');
const refreshButton = document.getElementById('refreshButton');
const refreshUserButton = document.getElementById('refreshUserButton');
const categoryForm = document.getElementById('categoryForm');
const exportButton = document.getElementById('exportButton');
const resetFilterButton = document.getElementById('resetFilterButton');

const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');

const loginMessage = document.getElementById('loginMessage');
const categoryMessage = document.getElementById('categoryMessage');
const welcomeText = document.getElementById('welcomeText');
const reportList = document.getElementById('reportList');
const categoryList = document.getElementById('categoryList');
const userList = document.getElementById('userList');
const visibleReportText = document.getElementById('visibleReportText');

const totalText = document.getElementById('totalText');
const masukText = document.getElementById('masukText');
const diprosesText = document.getElementById('diprosesText');
const selesaiText = document.getElementById('selesaiText');
const ditolakText = document.getElementById('ditolakText');
const mahasiswaText = document.getElementById('mahasiswaText');

let currentUser = JSON.parse(localStorage.getItem('kampuscare_admin') || 'null');
let statuses = ['Masuk', 'Diproses', 'Selesai', 'Ditolak'];
let allReports = [];
let allCategories = [];
let allUsers = [];

function escapeHTML(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function statusClass(status) {
  return `status-${String(status).toLowerCase().replace(/ /g, '-')}`;
}

function formatDate(value) {
  if (!value || value === '-') return '-';
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.style.color = isError ? '#dc2626' : '#2563eb';
}

async function requestJSON(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Terjadi kesalahan.');
  }
  return data;
}

function renderAuthState() {
  if (currentUser && currentUser.role === 'admin') {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    welcomeText.textContent = `Halo, ${currentUser.name}`;
    loadInitialData();
  } else {
    loginSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
  }
}

async function loadStats() {
  const reportData = await requestJSON(`${api}/reports/stats`);
  const userData = await requestJSON(`${api}/auth/stats`);

  totalText.textContent = reportData.stats.total;
  masukText.textContent = reportData.stats.masuk;
  diprosesText.textContent = reportData.stats.diproses;
  selesaiText.textContent = reportData.stats.selesai;
  ditolakText.textContent = reportData.stats.ditolak;
  mahasiswaText.textContent = userData.stats.totalMahasiswa;
}

async function loadStatuses() {
  const data = await requestJSON(`${api}/reports/statuses`);
  statuses = data.statuses;

  statusFilter.innerHTML = '<option value="all">Semua Status</option>' + statuses
    .map((status) => `<option value="${escapeHTML(status)}">${escapeHTML(status)}</option>`)
    .join('');
}

function populateCategoryFilter() {
  categoryFilter.innerHTML = '<option value="all">Semua Kategori</option>' + allCategories
    .map((category) => `<option value="${escapeHTML(category.name)}">${escapeHTML(category.name)}</option>`)
    .join('');
}

async function loadReports() {
  const data = await requestJSON(`${api}/reports?role=admin`);
  allReports = data.reports;
  applyReportFilters();
}

function getFilteredReports() {
  const keyword = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  const selectedCategory = categoryFilter.value;
  const selectedSort = sortFilter.value;

  let result = allReports.filter((report) => {
    const searchableText = [
      report.title,
      report.description,
      report.category,
      report.location,
      report.reporterName,
      report.status,
      report.adminNote
    ].join(' ').toLowerCase();

    const matchKeyword = !keyword || searchableText.includes(keyword);
    const matchStatus = selectedStatus === 'all' || report.status === selectedStatus;
    const matchCategory = selectedCategory === 'all' || report.category === selectedCategory;

    return matchKeyword && matchStatus && matchCategory;
  });

  if (selectedSort === 'oldest') {
    result = result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (selectedSort === 'title') {
    result = result.sort((a, b) => String(a.title).localeCompare(String(b.title)));
  } else {
    result = result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return result;
}

function applyReportFilters() {
  const reports = getFilteredReports();
  renderReports(reports);
}

function renderReports(reports) {
  visibleReportText.textContent = `Menampilkan ${reports.length} dari ${allReports.length} laporan.`;

  if (!allReports.length) {
    reportList.innerHTML = '<div class="empty-state">Belum ada laporan masuk.</div>';
    return;
  }

  if (!reports.length) {
    reportList.innerHTML = '<div class="empty-state">Tidak ada laporan yang cocok dengan filter.</div>';
    return;
  }

  reportList.innerHTML = reports.map((report) => `
    <article class="report-card">
      <div class="report-title-row">
        <div>
          <h4>${escapeHTML(report.title)}</h4>
          <p>${escapeHTML(report.description)}</p>
        </div>
        <span class="badge ${statusClass(report.status)}">${escapeHTML(report.status)}</span>
      </div>
      <div class="report-meta">
        <span class="badge">${escapeHTML(report.category)}</span>
        <span class="badge">${escapeHTML(report.location)}</span>
        <span class="badge">Pelapor: ${escapeHTML(report.reporterName)}</span>
      </div>
      <div class="date-grid">
        <p class="muted">Dibuat: ${formatDate(report.createdAt)}</p>
        <p class="muted">Update: ${formatDate(report.updatedAt)}</p>
      </div>
      <div class="action-grid">
        <label>
          Status
          <select id="status-${report.id}">
            ${statuses.map((status) => `<option value="${escapeHTML(status)}" ${status === report.status ? 'selected' : ''}>${escapeHTML(status)}</option>`).join('')}
          </select>
        </label>
        <label>
          Catatan Admin
          <input id="note-${report.id}" value="${escapeHTML(report.adminNote || '')}" placeholder="Contoh: sedang dicek teknisi" />
        </label>
        <button onclick="updateReport('${report.id}')">Update</button>
      </div>
      <button class="danger-button small-button" onclick="deleteReport('${report.id}')" style="margin-top:10px">Hapus Laporan</button>
    </article>
  `).join('');
}

async function loadUsers() {
  const data = await requestJSON(`${api}/auth/users?role=mahasiswa`);
  allUsers = data.users;

  if (!allUsers.length) {
    userList.innerHTML = '<div class="empty-state">Belum ada akun mahasiswa yang terdaftar.</div>';
    return;
  }

  userList.innerHTML = allUsers.map((user) => `
    <article class="user-card">
      <div class="user-avatar">${escapeHTML(user.name.slice(0, 1).toUpperCase())}</div>
      <div class="user-info">
        <h4>${escapeHTML(user.name)}</h4>
        <p class="muted">@${escapeHTML(user.username)} · Terdaftar: ${formatDate(user.createdAt)}</p>
        <div class="report-meta">
          <span class="badge">Total laporan: ${user.totalReports}</span>
          <span class="badge status-masuk">Masuk: ${user.reportsMasuk}</span>
          <span class="badge status-diproses">Diproses: ${user.reportsDiproses}</span>
          <span class="badge status-selesai">Selesai: ${user.reportsSelesai}</span>
          <span class="badge status-ditolak">Ditolak: ${user.reportsDitolak}</span>
        </div>
      </div>
    </article>
  `).join('');
}

async function loadCategories() {
  const data = await requestJSON(`${api}/categories`);
  allCategories = data.categories;
  populateCategoryFilter();

  if (!allCategories.length) {
    categoryList.innerHTML = '<div class="empty-state">Belum ada kategori.</div>';
    return;
  }

  categoryList.innerHTML = allCategories.map((category) => `
    <div class="category-card">
      <strong>${escapeHTML(category.name)}</strong>
      <button class="danger-button small-button" onclick="deleteCategory('${category.id}')">Hapus</button>
    </div>
  `).join('');
}

async function loadInitialData() {
  try {
    await loadStatuses();
    await loadCategories();
    await loadStats();
    await loadReports();
    await loadUsers();
  } catch (error) {
    showMessage(categoryMessage, error.message, true);
  }
}

async function updateReport(id) {
  const status = document.getElementById(`status-${id}`).value;
  const adminNote = document.getElementById(`note-${id}`).value;

  try {
    await requestJSON(`${api}/reports/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNote })
    });

    await loadInitialData();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteReport(id) {
  const confirmed = confirm('Yakin ingin menghapus laporan ini?');
  if (!confirmed) return;

  try {
    await requestJSON(`${api}/reports/${id}`, {
      method: 'DELETE'
    });

    await loadInitialData();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteCategory(id) {
  const confirmed = confirm('Yakin ingin menghapus kategori ini?');
  if (!confirmed) return;

  try {
    await requestJSON(`${api}/categories/${id}`, {
      method: 'DELETE'
    });

    await loadCategories();
    applyReportFilters();
  } catch (error) {
    alert(error.message);
  }
}

function exportReportsJSON() {
  const reports = getFilteredReports();
  const payload = {
    app: 'KampusCare',
    client: 'Admin',
    exportedAt: new Date().toISOString(),
    total: reports.length,
    reports
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'kampuscare-laporan.json';
  link.click();
  URL.revokeObjectURL(url);
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage(loginMessage, 'Memproses login admin...');

  try {
    const data = await requestJSON(`${api}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        username: document.getElementById('usernameInput').value,
        password: document.getElementById('passwordInput').value
      })
    });

    if (data.user.role !== 'admin') {
      throw new Error('Akun ini bukan akun admin.');
    }

    currentUser = data.user;
    localStorage.setItem('kampuscare_admin', JSON.stringify(currentUser));
    showMessage(loginMessage, 'Login berhasil.');
    renderAuthState();
  } catch (error) {
    showMessage(loginMessage, error.message, true);
  }
});

categoryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage(categoryMessage, 'Menambahkan kategori...');

  try {
    await requestJSON(`${api}/categories`, {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('categoryNameInput').value
      })
    });

    categoryForm.reset();
    showMessage(categoryMessage, 'Kategori berhasil ditambahkan.');
    await loadCategories();
    applyReportFilters();
  } catch (error) {
    showMessage(categoryMessage, error.message, true);
  }
});

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('kampuscare_admin');
  currentUser = null;
  renderAuthState();
});

refreshButton.addEventListener('click', loadInitialData);
refreshUserButton.addEventListener('click', loadUsers);
exportButton.addEventListener('click', exportReportsJSON);

resetFilterButton.addEventListener('click', () => {
  searchInput.value = '';
  statusFilter.value = 'all';
  categoryFilter.value = 'all';
  sortFilter.value = 'newest';
  applyReportFilters();
});

searchInput.addEventListener('input', applyReportFilters);
statusFilter.addEventListener('change', applyReportFilters);
categoryFilter.addEventListener('change', applyReportFilters);
sortFilter.addEventListener('change', applyReportFilters);

window.updateReport = updateReport;
window.deleteReport = deleteReport;
window.deleteCategory = deleteCategory;

renderAuthState();
