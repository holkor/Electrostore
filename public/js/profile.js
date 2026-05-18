// public/js/profile.js
// Регистрация, вход, выход, проверка текущей сессии.
// Требует подключения global.js перед этим файлом.

const statusBox = document.getElementById('profile-status');
const messageBox = document.getElementById('auth-message');
const logoutButton = document.getElementById('logout-btn');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

function showMessage(text, isError = false) {
  if (!messageBox) return;
  messageBox.hidden = false;
  messageBox.textContent = text;
  messageBox.className = `status-message ${isError ? 'status-error' : 'status-success'}`;
}

function renderUser(user) {
  if (!statusBox) return;

  if (!user) {
    statusBox.innerHTML = `
      <p><strong>Статус:</strong> гость</p>
      <p>Активная пользовательская сессия не найдена.</p>
      <p>После входа данные будут храниться в базе, а сессия сохранится через cookie.</p>
    `;
    if (logoutButton) logoutButton.disabled = true;
    return;
  }

  statusBox.innerHTML = `
    <p><strong>Статус:</strong> авторизован</p>
    <p><strong>Имя:</strong> ${escapeHtml(user.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
    <p>Сессия активна и привязана к cookie браузера.</p>
  `;
  if (logoutButton) logoutButton.disabled = false;
}

async function loadCurrentUser() {
  try {
    const user = await checkAuth();
    renderUser(user);
  } catch (error) {
    renderUser(null);
    showMessage(error.message, true);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const formData = new FormData(registerForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    await requestJSON('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    registerForm.reset();
    showMessage('Регистрация прошла успешно. Сессия создана, cookie установлены.');
    await loadCurrentUser();
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    await requestJSON('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    loginForm.reset();
    showMessage('Вход выполнен. Данные пользователя загружены из базы.');
    await loadCurrentUser();
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function handleLogout() {
  try {
    await requestJSON('/api/auth/logout', { method: 'POST' });
    showMessage('Вы вышли из аккаунта. Сессия очищена.');
    await loadCurrentUser();
  } catch (error) {
    showMessage(error.message, true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (registerForm) registerForm.addEventListener('submit', handleRegister);
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (logoutButton) logoutButton.addEventListener('click', handleLogout);
  loadCurrentUser();
});
