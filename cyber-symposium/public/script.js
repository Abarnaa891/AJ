const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  root.classList.add('light');
}

const themeToggle = document.getElementById('themeToggle');
const updateToggleIcon = () => {
  const isLight = root.classList.contains('light');
  themeToggle.textContent = isLight ? '🌞' : '🌙';
  themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
};
updateToggleIcon();

themeToggle.addEventListener('click', () => {
  root.classList.toggle('light');
  const theme = root.classList.contains('light') ? 'light' : 'dark';
  localStorage.setItem('theme', theme);
  updateToggleIcon();
});

const form = document.getElementById('registrationForm');
const statusEl = document.getElementById('formStatus');

function setFieldError(name, message) {
  const errorEl = document.querySelector(`.error[data-for="${name}"]`);
  if (errorEl) errorEl.textContent = message || '';
}

function clearErrors() {
  document.querySelectorAll('.error').forEach(el => el.textContent = '');
}

function getFormData(formEl) {
  const data = new FormData(formEl);
  const payload = Object.fromEntries(data.entries());
  const interests = data.getAll('interests');
  if (interests && interests.length) payload.interests = interests;
  payload.agree = data.get('agree') === 'on';
  return payload;
}

function validate(payload) {
  let valid = true;
  if (!payload.fullName || payload.fullName.trim().length < 2) {
    setFieldError('fullName', 'Please enter your full name.');
    valid = false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!payload.email || !emailRegex.test(payload.email)) {
    setFieldError('email', 'Enter a valid email address.');
    valid = false;
  }
  if (!payload.attendance) {
    setFieldError('attendance', 'Select an attendance mode.');
    valid = false;
  }
  if (!payload.agree) {
    setFieldError('agree', 'You must agree to proceed.');
    valid = false;
  }
  return valid;
}

async function submitRegistration(event) {
  event.preventDefault();
  clearErrors();
  statusEl.textContent = '';

  const payload = getFormData(form);
  if (!validate(payload)) {
    statusEl.textContent = 'Please fix the errors above.';
    statusEl.className = 'status error';
    return;
  }

  statusEl.textContent = 'Submitting…';
  statusEl.className = 'status';

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (res.ok && json.ok) {
      statusEl.textContent = 'Registration successful! Check your inbox for confirmation.';
      statusEl.className = 'status success';
      form.reset();
    } else {
      throw new Error(json.error || 'Failed to register');
    }
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
    statusEl.className = 'status error';
  }
}

form.addEventListener('submit', submitRegistration);

