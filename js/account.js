// LuckyDragon - Account Center JavaScript (Fixed)
const Account = {
    user: null,
    selectedMethod: null,
    selectedBank: null,

    async init() {
        // Get user from database
        this.user = await Auth.getCurrentUser();

        if (!this.user) {
            console.error('No user found, redirecting to login');
            window.location.href = 'index.html';
            return;
        }

        console.log('User loaded:', this.user);
        this.updateUserInfo();
        this.setupTabs();
        this.loadActivity();
    },

    updateUserInfo() {
        if (!this.user) return;

        const balance = parseFloat(this.user.balance || 0);
        const vipLevel = this.user.vip_level || 'bronze';
        const vipPoints = this.user.vip_points || 0;
        const username = this.user.username || '用户';

        console.log('Updating UI with:', { username, balance, vipLevel, vipPoints });

        // Navbar balance
        const navBalance = document.getElementById('navBalance');
        if (navBalance) navBalance.textContent = '$' + balance.toLocaleString();

        // User card
        const userNameEl = document.getElementById('userName');
        if (userNameEl) userNameEl.textContent = username;

        const avatarEl = document.getElementById('userAvatarLarge');
        if (avatarEl) avatarEl.textContent = username.charAt(0).toUpperCase();

        const balanceAmountEl = document.getElementById('balanceAmount');
        if (balanceAmountEl) balanceAmountEl.textContent = '$' + balance.toLocaleString(undefined, { minimumFractionDigits: 2 });

        // VIP badge
        const vipInfo = this.getVipInfo(vipLevel);
        const vipBadge = document.getElementById('userVipBadge');
        if (vipBadge) {
            vipBadge.innerHTML = `<span class="vip-icon">${vipInfo.icon}</span><span>${vipInfo.name}</span>`;
            vipBadge.style.background = vipInfo.gradient;
        }

        // Balance cards
        const totalBalanceEl = document.getElementById('totalBalance');
        if (totalBalanceEl) totalBalanceEl.textContent = '$' + balance.toLocaleString(undefined, { minimumFractionDigits: 2 });

        const withdrawableEl = document.getElementById('withdrawable');
        if (withdrawableEl) withdrawableEl.textContent = '$' + (balance * 0.8).toLocaleString(undefined, { minimumFractionDigits: 2 });

        const nonWithdrawableEl = document.getElementById('nonWithdrawable');
        if (nonWithdrawableEl) nonWithdrawableEl.textContent = '$' + (balance * 0.2).toLocaleString(undefined, { minimumFractionDigits: 2 });

        // VIP progress
        const currentVipIcon = document.getElementById('currentVipIcon');
        if (currentVipIcon) currentVipIcon.textContent = vipInfo.icon;

        const currentVipName = document.getElementById('currentVipName');
        if (currentVipName) currentVipName.textContent = vipInfo.name;

        const nextLevel = this.getNextLevel(vipLevel);
        const nextVipName = document.getElementById('nextVipName');
        if (nextVipName) nextVipName.textContent = nextLevel ? this.getVipInfo(nextLevel).name : 'MAX';

        const progress = this.calculateProgress(vipPoints, vipLevel);
        const vipProgressFill = document.getElementById('vipProgressFill');
        if (vipProgressFill) vipProgressFill.style.width = progress + '%';

        const depositProgress = document.getElementById('depositProgress');
        if (depositProgress) depositProgress.textContent = `$${vipPoints.toLocaleString()} / $${this.getNextThreshold(vipLevel).toLocaleString()}`;
    },

    getVipInfo(level) {
        const levels = {
            bronze: { name: 'Bronze', icon: '🥉', gradient: 'linear-gradient(135deg, #cd7f32, #8b4513)' },
            silver: { name: 'Silver', icon: '🥈', gradient: 'linear-gradient(135deg, #c0c0c0, #808080)' },
            gold: { name: 'Gold', icon: '🥇', gradient: 'linear-gradient(135deg, #ffd700, #b8860b)' },
            platinum: { name: 'Platinum', icon: '💎', gradient: 'linear-gradient(135deg, #e5e4e2, #a0a0a0)' },
            diamond: { name: 'Diamond', icon: '👑', gradient: 'linear-gradient(135deg, #b9f2ff, #00bfff)' }
        };
        return levels[level] || levels.bronze;
    },

    getNextLevel(current) {
        const order = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
        const idx = order.indexOf(current);
        return idx < order.length - 1 ? order[idx + 1] : null;
    },

    getNextThreshold(level) {
        const thresholds = { bronze: 5000, silver: 20000, gold: 50000, platinum: 100000, diamond: 999999 };
        return thresholds[level] || 5000;
    },

    calculateProgress(points, level) {
        const thresholds = { bronze: 0, silver: 5000, gold: 20000, platinum: 50000, diamond: 100000 };
        const current = thresholds[level] || 0;
        const next = this.getNextThreshold(level);
        return Math.min(100, ((points - current) / (next - current)) * 100);
    },

    setupTabs() {
        document.querySelectorAll('.deposit-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.deposit-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const method = tab.dataset.method;
                if (method === 'crypto') {
                    Auth.showNotification('加密货币充值即将上线！', 'info');
                }
            });
        });
    },

    loadActivity() {
        // Activity is shown in HTML
    }
};

// Helper functions
function selectMethod(method) {
    Account.selectedMethod = method;
    document.querySelectorAll('.method-card').forEach(c => c.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    Auth.showNotification('已选择 ' + method.toUpperCase(), 'info');
}

function selectBank(bank) {
    Account.selectedBank = bank;
    Auth.showNotification('已选择银行: ' + bank.toUpperCase(), 'info');
}

function setAmount(amount) {
    document.getElementById('depositAmount').value = amount;
}

async function processDeposit() {
    const amount = parseFloat(document.getElementById('depositAmount').value);

    if (!amount || amount < 20) {
        Auth.showNotification('最低充值金额为 $20', 'error');
        return;
    }

    if (!Account.selectedMethod) {
        Auth.showNotification('请选择支付方式', 'error');
        return;
    }

    Auth.showNotification('🎉 充值请求已提交！', 'success');

    // Add to balance
    setTimeout(async () => {
        await Wallet.updateBalance(Account.user.id, amount);
        Account.user = await Auth.getCurrentUser();
        Account.updateUserInfo();
        Auth.showNotification('✅ 充值成功！$' + amount + ' 已添加到账户', 'success');
    }, 2000);
}

function restoreWallet() {
    Auth.showNotification('钱包已恢复', 'success');
    Account.init();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => Account.init());
