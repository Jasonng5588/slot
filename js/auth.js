// LuckyDragon - Authentication System (Real Database)
const Auth = {
  useSupabase: true,

  // Initialize
  async init() {
    initSupabase();
    this.setupForms();

    // Check if user is logged in
    const session = this.getSession();
    if (session && window.location.pathname.includes('index.html')) {
      window.location.href = 'lobby.html';
    }
  },

  // Setup login/register forms
  setupForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        const btn = loginForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> 登录中...';

        try {
          const result = await this.login(username, password);
          if (result.success) {
            this.showNotification('🎉 登录成功！正在跳转...', 'success');
            setTimeout(() => window.location.href = 'lobby.html', 1000);
          } else {
            this.showNotification(result.error || '登录失败', 'error');
            btn.disabled = false;
            btn.textContent = '立即登录';
          }
        } catch (error) {
          console.error('Login error:', error);
          this.showNotification('网络错误，请重试', 'error');
          btn.disabled = false;
          btn.textContent = '立即登录';
        }
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;

        // Validation
        if (username.length < 3 || username.length > 20) {
          this.showNotification('用户名需要3-20个字符', 'error');
          return;
        }
        if (password.length < 6) {
          this.showNotification('密码至少需要6个字符', 'error');
          return;
        }
        if (password !== confirm) {
          this.showNotification('两次输入的密码不一致', 'error');
          return;
        }

        const btn = registerForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> 注册中...';

        try {
          const result = await this.register(username, password);
          if (result.success) {
            this.showNotification('🎉 注册成功！获得 $10,000 体验金！', 'success');
            setTimeout(() => window.location.href = 'lobby.html', 1500);
          } else {
            this.showNotification(result.error || '注册失败', 'error');
            btn.disabled = false;
            btn.textContent = '立即注册';
          }
        } catch (error) {
          console.error('Register error:', error);
          this.showNotification('网络错误，请重试', 'error');
          btn.disabled = false;
          btn.textContent = '立即注册';
        }
      });
    }
  },

  // Login with Supabase
  async login(username, password) {
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .eq('password', password)
          .single();

        if (error || !data) {
          // Check if it's a connection error or wrong credentials
          if (error?.code === 'PGRST116') {
            return { success: false, error: '用户名或密码错误' };
          }
          console.error('Supabase login error:', error);
          return { success: false, error: '用户名或密码错误' };
        }

        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);

        this.setSession(data.id, data.username);
        return { success: true, user: data };
      } catch (e) {
        console.error('Login exception:', e);
        return { success: false, error: '连接错误，请重试' };
      }
    }

    return { success: false, error: '数据库连接失败' };
  },

  // Register with Supabase
  async register(username, password) {
    const supabase = getSupabase();

    if (supabase) {
      try {
        // Check if username exists
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .single();

        if (existing) {
          return { success: false, error: '用户名已存在' };
        }

        // Create new user with $10,000 starting balance
        const { data, error } = await supabase
          .from('users')
          .insert({
            username: username,
            password: password,
            balance: 10000,
            vip_level: 'bronze',
            vip_points: 0,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('Register error:', error);
          return { success: false, error: '注册失败，请重试' };
        }

        this.setSession(data.id, data.username);
        return { success: true, user: data };
      } catch (e) {
        console.error('Register exception:', e);
        return { success: false, error: '连接错误，请重试' };
      }
    }

    return { success: false, error: '数据库连接失败' };
  },

  // Session management
  setSession(userId, username) {
    const session = {
      userId: userId,
      username: username,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('luckydragon_session', JSON.stringify(session));
    // Also save to sessionStorage for RTPManager
    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('username', username);
  },

  getSession() {
    const session = localStorage.getItem('luckydragon_session');
    if (session) {
      const parsed = JSON.parse(session);
      // Sync to sessionStorage
      sessionStorage.setItem('userId', parsed.userId);
      sessionStorage.setItem('username', parsed.username);
      return parsed;
    }
    return null;
  },

  // Get current user from database
  async getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.userId)
          .single();

        if (error || !data) {
          console.error('Get user error:', error);
          return null;
        }

        return data;
      } catch (e) {
        console.error('Get user exception:', e);
        return null;
      }
    }

    return null;
  },

  // Logout
  logout() {
    localStorage.removeItem('luckydragon_session');
    window.location.href = 'index.html';
  },

  // Notification system
  showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification-toast').forEach(n => n.remove());

    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

// Make showNotification globally available
window.Auth = Auth;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => Auth.init());
