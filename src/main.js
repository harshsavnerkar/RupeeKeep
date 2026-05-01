import './style.css'

/**
 * DATABASE CONFIGURATION
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let db = null;
if (firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
}

// --- State Management ---
let currentUser = JSON.parse(localStorage.getItem('keeper_user')) || null;
let savingsData = JSON.parse(localStorage.getItem('keeper_savings')) || {};
let userMilestones = JSON.parse(localStorage.getItem('keeper_milestones')) || {};
let viewDate = new Date();

// --- DOM Elements ---
const views = {
  auth: document.getElementById('auth-view'),
  dashboard: document.getElementById('dashboard-view')
};

const forms = {
  login: document.getElementById('login-form'),
  register: document.getElementById('register-form')
};

const modal = {
  container: document.getElementById('date-modal'),
  date: document.getElementById('modal-date'),
  amount: document.getElementById('modal-amount')
};

// --- Initialization ---
async function init() {
  lucide.createIcons();
  
  if (currentUser) {
    showView('dashboard');
    if (db) await syncWithDB();
    updateDashboard();
  } else {
    showView('auth');
  }

  setupEventListeners();
  renderCalendar();

  // Splash Screen Fade Out
  setTimeout(() => {
    const splash = document.getElementById('splash');
    const app = document.getElementById('app');
    if (splash) {
      splash.classList.add('hidden');
      if (app) app.classList.add('loaded');
      setTimeout(() => { splash.style.display = 'none'; }, 800);
    }
  }, 2200);
}

async function syncWithDB() {
  if (!db || !currentUser) return;
  try {
    const doc = await db.collection('savings').doc(currentUser.username).get();
    if (doc.exists) {
      const data = doc.data();
      savingsData[currentUser.username] = data.entries || {};
      userMilestones = data.milestones || {};
      localStorage.setItem('keeper_savings', JSON.stringify(savingsData));
      localStorage.setItem('keeper_milestones', JSON.stringify(userMilestones));
    }
  } catch (e) {
    console.error("DB Sync Error:", e);
  }
}

async function saveToDB() {
  if (!db || !currentUser) return;
  try {
    await db.collection('savings').doc(currentUser.username).set({
      entries: savingsData[currentUser.username],
      milestones: userMilestones
    });
  } catch (e) {
    console.error("DB Save Error:", e);
  }
}

function showView(viewName) {
  Object.values(views).forEach(v => v.classList.remove('active'));
  views[viewName].classList.add('active');
}

// --- Celebration Logic ---
function triggerCelebration() {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };
  function randomInRange(min, max) { return Math.random() * (max - min) + min; }
  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    const particleCount = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
}

// --- Auth Logic ---
function setupEventListeners() {
  document.getElementById('show-register').onclick = () => {
    forms.login.style.display = 'none';
    forms.register.style.display = 'block';
  };
  document.getElementById('show-login').onclick = () => {
    forms.register.style.display = 'none';
    forms.login.style.display = 'block';
  };

  document.getElementById('login-btn').onclick = async () => {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if (!user || !pass) return alert('Fill all fields');

    const loginBtn = document.getElementById('login-btn');
    loginBtn.innerText = 'Logging in...';
    loginBtn.disabled = true;

    try {
      let authenticated = false;
      
      // 1. Check Database (Global Account)
      if (db) {
        const doc = await db.collection('accounts').doc(user).get();
        if (doc.exists && doc.data().password === pass) {
          authenticated = true;
        }
      }

      // 2. Fallback to Local (Only for offline testing)
      if (!authenticated) {
        const localAccounts = JSON.parse(localStorage.getItem('keeper_accounts')) || {};
        if (localAccounts[user] && localAccounts[user].password === pass) {
          authenticated = true;
        }
      }

      if (authenticated) {
        currentUser = { username: user };
        localStorage.setItem('keeper_user', JSON.stringify(currentUser));
        if (db) await syncWithDB();
        showView('dashboard');
        updateDashboard();
        renderCalendar();
      } else {
        alert('Invalid credentials. If you registered on another device, make sure your Database is connected!');
      }
    } catch (e) {
      console.error("Login Error:", e);
      alert("Login failed. Check your internet or Database settings.");
    } finally {
      loginBtn.innerText = 'Login';
      loginBtn.disabled = false;
    }
  };

  document.getElementById('register-btn').onclick = async () => {
    const user = document.getElementById('reg-username').value;
    const pass = document.getElementById('reg-password').value;
    if (!user || !pass) return alert('Fill all fields');

    const regBtn = document.getElementById('register-btn');
    regBtn.innerText = 'Creating account...';
    regBtn.disabled = true;

    try {
      // 1. Check if exists in DB
      if (db) {
        const doc = await db.collection('accounts').doc(user).get();
        if (doc.exists) {
          alert('Username already taken in the cloud');
          return;
        }
        // Save to DB
        await db.collection('accounts').doc(user).set({ password: pass });
      }

      // 2. Always save to Local as well
      const localAccounts = JSON.parse(localStorage.getItem('keeper_accounts')) || {};
      localAccounts[user] = { password: pass };
      localStorage.setItem('keeper_accounts', JSON.stringify(localAccounts));

      alert('Account created successfully! You can now login.');
      forms.register.style.display = 'none';
      forms.login.style.display = 'block';
    } catch (e) {
      console.error("Registration Error:", e);
      alert("Registration failed. Make sure your Firestore Database is enabled!");
    } finally {
      regBtn.innerText = 'Create Account';
      regBtn.disabled = false;
    }
  };

  document.getElementById('logout-btn').onclick = () => {
    currentUser = null;
    localStorage.removeItem('keeper_user');
    showView('auth');
  };

  document.getElementById('prev-month').onclick = () => {
    viewDate.setMonth(viewDate.getMonth() - 1);
    renderCalendar();
    updateDashboard();
  };

  document.getElementById('next-month').onclick = () => {
    viewDate.setMonth(viewDate.getMonth() + 1);
    renderCalendar();
    updateDashboard();
  };

  document.getElementById('save-btn').onclick = async () => {
    const amount = parseFloat(document.getElementById('savings-amount').value);
    if (isNaN(amount) || amount <= 0) return alert('Enter a valid amount');
    const today = new Date().toISOString().split('T')[0];
    const userSavings = savingsData[currentUser.username] || {};
    userSavings[today] = (userSavings[today] || 0) + amount;
    savingsData[currentUser.username] = userSavings;
    localStorage.setItem('keeper_savings', JSON.stringify(savingsData));
    document.getElementById('savings-amount').value = '';
    checkGoalReached(currentUser.username);
    if (db) await saveToDB();
    updateDashboard();
    renderCalendar();
  };

  document.getElementById('close-modal').onclick = () => {
    modal.container.style.display = 'none';
  };
}

// --- Goal Logic ---
function getMonthlyTotal(username, date) {
  const userSavings = savingsData[username] || {};
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return Object.keys(userSavings).filter(d => d.startsWith(prefix)).reduce((sum, d) => sum + userSavings[d], 0);
}

function getNextGoal(monthlyTotal) { return Math.ceil((monthlyTotal + 1) / 500) * 500 || 500; }

function checkGoalReached(username) {
  const now = new Date();
  const monthlyTotal = getMonthlyTotal(username, now);
  const milestoneKey = `${username}_${now.getFullYear()}_${now.getMonth() + 1}`;
  const lastGoal = userMilestones[milestoneKey] || 0;
  const currentMilestone = Math.floor(monthlyTotal / 500) * 500;
  if (currentMilestone > lastGoal) {
    userMilestones[milestoneKey] = currentMilestone;
    localStorage.setItem('keeper_milestones', JSON.stringify(userMilestones));
    setTimeout(() => {
      triggerCelebration();
      alert(`🎉 Monthly Milestone Reached! You saved ₹${currentMilestone} in ${now.toLocaleString('default', { month: 'long' })}!`);
    }, 500);
  }
}

// --- Dashboard Logic ---
function updateDashboard() {
  if (!currentUser) return;
  document.getElementById('user-display').innerText = currentUser.username;
  const monthlyTotal = getMonthlyTotal(currentUser.username, viewDate);
  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  document.getElementById('total-savings').innerText = `₹${monthlyTotal.toLocaleString()}`;
  document.querySelector('#dashboard-view .glass-card p').innerText = `Savings in ${monthName}`;
  const nextGoal = getNextGoal(monthlyTotal);
  const prevGoal = Math.max(0, nextGoal - 500);
  const progressInLevel = monthlyTotal - prevGoal;
  const progress = Math.min((progressInLevel / 500) * 100, 100);
  const progressBar = document.getElementById('goal-progress');
  if (progressBar) progressBar.style.width = `${progress}%`;
  const goalText = document.getElementById('goal-text');
  if (goalText) goalText.innerText = `Goal: ₹${nextGoal.toLocaleString()}`;
}

// --- Calendar Logic ---
function renderCalendar() {
  const calendarBody = document.getElementById('calendar-body');
  if (!calendarBody) return;
  calendarBody.innerHTML = '';
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const display = document.getElementById('month-display');
  if (display) display.innerText = `${monthNames[month]} ${year}`;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) { calendarBody.appendChild(document.createElement('div')); }
  const userSavings = currentUser ? (savingsData[currentUser.username] || {}) : {};
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEl = document.createElement('div');
    dayEl.classList.add('calendar-day');
    dayEl.innerText = day;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) dayEl.classList.add('today');
    if (userSavings[dateStr]) dayEl.classList.add('saved');
    if (new Date(year, month, day) > today) {
      dayEl.classList.add('disabled');
    } else {
      dayEl.onclick = () => {
        const amount = userSavings[dateStr] || 0;
        modal.date.innerText = `${monthNames[month]} ${day}, ${year}`;
        modal.amount.innerText = `₹${amount.toLocaleString()}`;
        modal.container.style.display = 'flex';
      };
    }
    calendarBody.appendChild(dayEl);
  }
}

init();
