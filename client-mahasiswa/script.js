const api = '/api';

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const reportForm = document.getElementById('reportForm');
const logoutButton = document.getElementById('logoutButton');
const refreshButton = document.getElementById('refreshButton');

const loginMessage = document.getElementById('loginMessage');
const reportMessage = document.getElementById('reportMessage');
const welcomeText = document.getElementById('welcomeText');
const categoryInput = document.getElementById('categoryInput');
const reportList = document.getElementById('reportList');
const notificationList = document.getElementById('notificationList');
const totalReportsText = document.getElementById('totalReportsText');
const processingReportsText = document.getElementById('processingReportsText');
const doneReportsText = document.getElementById('doneReportsText');

let currentUser = JSON.parse(localStorage.getItem('kampuscare_user') || 'null');

function statusClass(status) {
  return `status-${String(status).toLowerCase().replace(/ /g, '-')}`;
}

function formatDate(value) {
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
  if (currentUser && currentUser.role === 'mahasiswa') {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    welcomeText.textContent = `Halo, ${currentUser.name}`;
    loadInitialData();
  } else {
    loginSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
  }
}

async function loadCategories() {
  const data = await requestJSON(`${api}/categories`);
  categoryInput.innerHTML = data.categories
    .map((category) => `<option value="${category.name}">${category.name}</option>`)
    .join('');
}

async function loadReports() {
  const data = await requestJSON(`${api}/reports?role=mahasiswa&userId=${currentUser.id}`);
  const reports = data.reports;

  totalReportsText.textContent = reports.length;
  processingReportsText.textContent = reports.filter((item) => item.status === 'Diproses').length;
  doneReportsText.textContent = reports.filter((item) => item.status === 'Selesai').length;

  if (!reports.length) {
    reportList.innerHTML = '<div class="empty-state">Belum ada laporan. Kirim laporan pertama kamu dulu.</div>';
    return;
  }

  reportList.innerHTML = reports.map((report) => `
    <article class="report-card">
      <h4>${report.title}</h4>
      <p>${report.description}</p>
      <div class="report-meta">
        <span class="badge ${statusClass(report.status)}">${report.status}</span>
        <span class="badge">${report.category}</span>
        <span class="badge">${report.location}</span>
      </div>
      ${report.adminNote ? `<p><b>Catatan admin:</b> ${report.adminNote}</p>` : '<p class="muted">Belum ada catatan admin.</p>'}
      <p class="muted">Dibuat: ${formatDate(report.createdAt)}</p>
    </article>
  `).join('');
}

async function loadNotifications() {
  const data = await requestJSON(`${api}/reports/notifications/${currentUser.id}`);
  const notifications = data.notifications;

  if (!notifications.length) {
    notificationList.innerHTML = '<div class="empty-state">Belum ada notifikasi.</div>';
    return;
  }

  notificationList.innerHTML = notifications.slice(0, 5).map((item) => `
    <div class="notification-card">
      <p>${item.message}</p>
      <p class="muted">${formatDate(item.createdAt)}</p>
    </div>
  `).join('');
}

async function loadInitialData() {
  try {
    await loadCategories();
    await loadReports();
    await loadNotifications();
  } catch (error) {
    showMessage(reportMessage, error.message, true);
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage(loginMessage, 'Memproses login...');

  try {
    const data = await requestJSON(`${api}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        username: document.getElementById('usernameInput').value,
        password: document.getElementById('passwordInput').value
      })
    });

    if (data.user.role !== 'mahasiswa') {
      throw new Error('Akun ini bukan akun mahasiswa.');
    }

    currentUser = data.user;
    localStorage.setItem('kampuscare_user', JSON.stringify(currentUser));
    showMessage(loginMessage, 'Login berhasil.');
    renderAuthState();
  } catch (error) {
    showMessage(loginMessage, error.message, true);
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage(loginMessage, 'Memproses register...');

  try {
    const data = await requestJSON(`${api}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('registerNameInput').value,
        username: document.getElementById('registerUsernameInput').value,
        password: document.getElementById('registerPasswordInput').value
      })
    });

    currentUser = data.user;
    localStorage.setItem('kampuscare_user', JSON.stringify(currentUser));
    showMessage(loginMessage, 'Register berhasil.');
    renderAuthState();
  } catch (error) {
    showMessage(loginMessage, error.message, true);
  }
});

reportForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage(reportMessage, 'Mengirim laporan...');

  try {
    await requestJSON(`${api}/reports`, {
      method: 'POST',
      body: JSON.stringify({
        userId: currentUser.id,
        reporterName: currentUser.name,
        title: document.getElementById('titleInput').value,
        category: categoryInput.value,
        location: document.getElementById('locationInput').value,
        description: document.getElementById('descriptionInput').value
      })
    });

    reportForm.reset();
    showMessage(reportMessage, 'Laporan berhasil dikirim.');
    await loadReports();
    await loadNotifications();
  } catch (error) {
    showMessage(reportMessage, error.message, true);
  }
});

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('kampuscare_user');
  currentUser = null;
  renderAuthState();
});

refreshButton.addEventListener('click', loadInitialData);

renderAuthState();
