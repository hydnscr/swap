// ── Supabase config ───────────────────────────────────────────────────────────
const SUPABASE_URL  = 'https://scauksmvxzrtcttnesyw.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjYXVrc212eHpydGN0dG5lc3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NTU5NTYsImV4cCI6MjA5ODIzMTk1Nn0.tnr81Xb-Wiqb_XvBhNwGKl8fdQEnMSA2ioGI4KiqhTk';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Stripe config ─────────────────────────────────────────────────────────────
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_fZu7sDbun2qJb99eugg3600';

// ── Auth state ────────────────────────────────────────────────────────────────
let currentUser = null;
let isSwapPlus  = false;
let username    = null;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const authModal          = document.getElementById('auth-modal');
const paywallModal       = document.getElementById('paywall-modal');
const authForm           = document.getElementById('auth-form');
const authEmail          = document.getElementById('auth-email');
const authUsername       = document.getElementById('auth-username');
const authPassword       = document.getElementById('auth-password');
const authSubmitBtn      = document.getElementById('auth-submit');
const authToggleBtn      = document.getElementById('auth-toggle');
const authToggleText     = document.getElementById('auth-toggle-text');
const authTitle          = document.getElementById('auth-title');
const authSub            = document.getElementById('auth-sub');
const authError          = document.getElementById('auth-error');
const authClose          = document.getElementById('auth-modal-close');
const paywallClose       = document.getElementById('paywall-modal-close');
const paywallUpgradeBtn  = document.getElementById('paywall-upgrade-btn');
const paywallLoginBtn    = document.getElementById('paywall-login-btn');
const headerAuthBtn      = document.getElementById('header-auth-btn');
const headerUserEl       = document.getElementById('header-user');
const headerAvatar       = document.getElementById('header-avatar');
const headerUsername     = document.getElementById('header-username');
const headerSignoutBtn   = document.getElementById('header-signout');
const usernameWrap       = document.getElementById('auth-username-wrap');
const headerSwapPlusBtn  = document.getElementById('header-swapplus-btn');

// ── Auth mode ─────────────────────────────────────────────────────────────────
let authMode = 'signup';

function setAuthMode(m) {
  authMode = m;
  if (m === 'signup') {
    authTitle.textContent      = 'Create your account';
    authSub.textContent        = 'Save your library across devices and unlock Swap+.';
    authSubmitBtn.textContent  = 'Sign up';
    authToggleText.textContent = 'Already have an account?';
    authToggleBtn.textContent  = 'Log in';
    usernameWrap.style.display = 'block';
  } else {
    authTitle.textContent      = 'Welcome back';
    authSub.textContent        = 'Log in to access your library and Swap+.';
    authSubmitBtn.textContent  = 'Log in';
    authToggleText.textContent = "Don't have an account?";
    authToggleBtn.textContent  = 'Sign up';
    usernameWrap.style.display = 'none';
  }
  authError.textContent = '';
}

authToggleBtn.addEventListener('click', () => setAuthMode(authMode === 'signup' ? 'login' : 'signup'));

// ── Show / hide modals ────────────────────────────────────────────────────────
function showAuthModal(mode = 'signup') {
  setAuthMode(mode);
  authModal.classList.remove('hidden');
  authEmail.focus();
}
function hideAuthModal() {
  authModal.classList.add('hidden');
  authEmail.value    = '';
  authPassword.value = '';
  if (authUsername) authUsername.value = '';
  authError.textContent = '';
}
function showPaywallModal(reason = 'limit') {
  paywallModal.classList.remove('hidden');
  const msg = document.getElementById('swaps-left-msg');
  if (msg) {
    if (reason === 'limit') {
      msg.textContent = "You've used all 3 of your free swaps today.";
    } else {
      msg.textContent = "Unlock all features with Swap+.";
    }
  }
}
function hidePaywallModal() { paywallModal.classList.add('hidden'); }

authClose.addEventListener('click', hideAuthModal);

// Swap+ header button
headerSwapPlusBtn?.addEventListener('click', () => showPaywallModal('upgrade'));
authModal.addEventListener('click', e => { if (e.target === authModal) hideAuthModal(); });
paywallClose.addEventListener('click', hidePaywallModal);
paywallModal.addEventListener('click', e => { if (e.target === paywallModal) hidePaywallModal(); });

// ── Sign up / log in ──────────────────────────────────────────────────────────
authForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email    = authEmail.value.trim();
  const password = authPassword.value;
  const uname    = authUsername?.value.trim();

  authError.textContent     = '';
  authError.style.color     = '';
  authSubmitBtn.disabled    = true;
  authSubmitBtn.textContent = authMode === 'signup' ? 'Signing up…' : 'Logging in…';

  try {
    if (authMode === 'signup') {
      if (!uname) throw new Error('Please choose a username.');
      if (uname.length < 2) throw new Error('Username must be at least 2 characters.');

      // Check username isn't taken
      const { data: existing } = await sb
        .from('profiles')
        .select('username')
        .eq('username', uname)
        .maybeSingle();

      if (existing) throw new Error('That username is already taken.');

      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw error;

      // Save profile
      await sb.from('profiles').upsert({
        id:        data.user.id,
        email,
        username:  uname,
        swap_plus: false,
      });

      hideAuthModal();

    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      hideAuthModal();
    }
  } catch (err) {
    authError.style.color     = '';
    authError.textContent     = err.message || 'Something went wrong.';
    authSubmitBtn.disabled    = false;
    authSubmitBtn.textContent = authMode === 'signup' ? 'Sign up' : 'Log in';
  }
});

// ── Sign out ──────────────────────────────────────────────────────────────────
headerSignoutBtn.addEventListener('click', async () => {
  await sb.auth.signOut();
  currentUser = null;
  isSwapPlus  = false;
  username    = null;
  updateHeaderAuth();
});

// ── Header auth button ────────────────────────────────────────────────────────
headerAuthBtn.addEventListener('click', () => showAuthModal('login'));
paywallLoginBtn.addEventListener('click', () => { hidePaywallModal(); showAuthModal('login'); });

// ── Stripe upgrade ────────────────────────────────────────────────────────────
paywallUpgradeBtn.addEventListener('click', () => {
  if (!currentUser) { hidePaywallModal(); showAuthModal('signup'); return; }
  // Build redirect URL back to the app with ?unlocked=true
  const url = `${STRIPE_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(currentUser.email)}`;
  window.location.href = url;
});

// ── Fetch profile (username + swap_plus) ──────────────────────────────────────
async function fetchProfile(user) {
  try {
    const { data } = await sb
      .from('profiles')
      .select('username, swap_plus')
      .eq('id', user.id)
      .maybeSingle();
    if (data) {
      username   = data.username || user.email.split('@')[0];
      isSwapPlus = data.swap_plus || false;
      if (isSwapPlus) localStorage.setItem('swap_plus', 'true');
    }
  } catch (e) {
    console.warn('Could not fetch profile:', e);
    username = user.email.split('@')[0];
  }
}

// ── Handle ?unlocked=true from Stripe ────────────────────────────────────────
async function handleStripeReturn() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('unlocked') !== 'true') return;
  window.history.replaceState({}, '', window.location.pathname);
  if (!currentUser) return;

  try {
    await sb.from('profiles').upsert({
      id: currentUser.id,
      email: currentUser.email,
      swap_plus: true,
    });
    localStorage.setItem('swap_plus', 'true');
    isSwapPlus = true;
    updateHeaderAuth();
    showUnlockedBanner();
  } catch (e) {
    console.warn('Could not save Swap+:', e);
    localStorage.setItem('swap_plus', 'true');
    isSwapPlus = true;
    showUnlockedBanner();
  }
}

function showUnlockedBanner() {
  const banner = document.createElement('div');
  banner.style.cssText = `
    position:fixed;top:80px;left:50%;transform:translateX(-50%);
    background:#3d2e22;color:#fff;padding:12px 24px;border-radius:12px;
    font-size:0.9rem;z-index:300;box-shadow:0 4px 20px rgba(0,0,0,.2);
    animation:cardIn .4s ease forwards;white-space:nowrap;
  `;
  banner.innerHTML = '✨ Swap+ unlocked! Unlimited swaps, forever.';
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 4000);
}

// ── Update header ─────────────────────────────────────────────────────────────
function updateHeaderAuth() {
  if (currentUser && username) {
    headerAuthBtn.classList.add('hidden');
    headerUserEl.classList.remove('hidden');
    headerAvatar.textContent   = username[0].toUpperCase();
    headerUsername.textContent = username + (isSwapPlus ? ' ✨' : '');
  } else {
    headerAuthBtn.classList.remove('hidden');
    headerUserEl.classList.add('hidden');
  }
  // Show Swap+ button only when user is not already Swap+
  if (headerSwapPlusBtn) {
    if (isSwapPlus) {
      headerSwapPlusBtn.classList.add('hidden');
    } else {
      headerSwapPlusBtn.classList.remove('hidden');
    }
  }
}

// ── Auth state listener ───────────────────────────────────────────────────────
sb.auth.onAuthStateChange(async (event, session) => {
  currentUser = session?.user || null;
  if (currentUser) {
    await fetchProfile(currentUser);
    updateHeaderAuth();
    await handleStripeReturn();
  } else {
    updateHeaderAuth();
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────
(async () => {
  const { data: { session } } = await sb.auth.getSession();
  currentUser = session?.user || null;
  if (currentUser) {
    await fetchProfile(currentUser);
    await handleStripeReturn();
  }
  updateHeaderAuth();
})();

// ── Cloud library (Swap+ only) ────────────────────────────────────────────────
async function getCloudLibrary() {
  if (!currentUser) return [];
  try {
    const { data, error } = await sb
      .from('library')
      .select('title, type, data')
      .eq('user_id', currentUser.id);
    if (error) throw error;
    return (data || []).map(row => row.data);
  } catch (e) {
    console.warn('Could not load cloud library:', e);
    return [];
  }
}

async function toggleCloudSave(rec) {
  if (!currentUser) return false;
  try {
    const { data: existing } = await sb
      .from('library')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('title', rec.title)
      .eq('type', rec.type)
      .maybeSingle();

    if (existing) {
      await sb.from('library').delete().eq('id', existing.id);
      return false;
    } else {
      await sb.from('library').insert({
        user_id: currentUser.id,
        title: rec.title,
        type: rec.type,
        data: rec,
      });
      return true;
    }
  } catch (e) {
    console.warn('Could not toggle cloud save:', e);
    return false;
  }
}

// ── Expose for app.js ─────────────────────────────────────────────────────────
window.Auth = {
  isSwapPlus: () => isSwapPlus,
  isLoggedIn: () => !!currentUser,
  showPaywall: showPaywallModal,
  showAuth:    showAuthModal,
  getCloudLibrary,
  toggleCloudSave,
};