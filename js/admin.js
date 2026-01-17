// LuckyDragon - Admin Panel with Supabase
const Admin = {
    currentPlayerId: null,
    balanceAdjustType: 'add',

    async init() {
        initSupabase();
        await this.loadDashboard();
        await this.loadPlayers();
        this.setupNavigation();
        this.setupBalanceModal();
        this.setupSearch();

        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('zh-CN');
    },

    setupNavigation() {
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = item.dataset.section;
                if (!section) return;
                e.preventDefault();

                document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
                document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));

                item.classList.add('active');
                document.getElementById(section).classList.add('active');
            });
        });
    },

    async getUsers() {
        const { data } = await getSupabase()
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        return data || [];
    },

    async loadDashboard() {
        const users = await this.getUsers();

        document.getElementById('totalPlayers').textContent = users.length;

        const totalBalance = users.reduce((sum, u) => sum + parseFloat(u.balance || 0), 0);
        document.getElementById('totalBalance').textContent = '$' + totalBalance.toLocaleString();

        const today = new Date().toDateString();
        const activeToday = users.filter(u => {
            if (!u.last_login) return false;
            return new Date(u.last_login).toDateString() === today;
        }).length;
        document.getElementById('activeToday').textContent = activeToday;

        // Recent players
        const tbody = document.getElementById('recentPlayersTable');
        tbody.innerHTML = '';

        users.slice(0, 5).forEach(u => {
            const vipInfo = Loyalty.getVipInfo(u.vip_level);
            const row = document.createElement('tr');
            row.innerHTML = `
        <td><div class="user-cell"><div class="user-avatar">${u.username.charAt(0).toUpperCase()}</div>${u.username}</div></td>
        <td class="text-gold">$${parseFloat(u.balance || 0).toLocaleString()}</td>
        <td><span class="vip-badge vip-${u.vip_level}">${vipInfo.icon} ${vipInfo.name}</span></td>
        <td>${new Date(u.created_at).toLocaleDateString('zh-CN')}</td>
      `;
            tbody.appendChild(row);
        });
    },

    async loadPlayers() {
        const users = await this.getUsers();
        const tbody = document.getElementById('playersTable');
        tbody.innerHTML = '';

        users.forEach(u => {
            const vipInfo = Loyalty.getVipInfo(u.vip_level);
            const row = document.createElement('tr');
            row.innerHTML = `
        <td><div class="user-cell"><div class="user-avatar">${u.username.charAt(0).toUpperCase()}</div>${u.username}</div></td>
        <td class="text-gold">$${parseFloat(u.balance || 0).toLocaleString()}</td>
        <td><span class="vip-badge vip-${u.vip_level}">${vipInfo.icon} ${vipInfo.name}</span></td>
        <td>${(u.vip_points || 0).toLocaleString()}</td>
        <td><span class="status-badge active">活跃</span></td>
        <td>
          <div class="action-btns">
            <button class="action-btn edit" onclick="Admin.openBalanceModal('${u.id}')" title="调整余额">💰</button>
            <button class="action-btn edit" onclick="Admin.openVipModal('${u.id}')" title="调整VIP">💎</button>
          </div>
        </td>
      `;
            tbody.appendChild(row);
        });
    },

    setupSearch() {
        const search = document.getElementById('playerSearch');
        search.addEventListener('input', () => {
            const query = search.value.toLowerCase();
            const rows = document.querySelectorAll('#playersTable tr');
            rows.forEach(row => {
                const name = row.querySelector('.user-cell')?.textContent.toLowerCase() || '';
                row.style.display = name.includes(query) ? '' : 'none';
            });
        });
    },

    setupBalanceModal() {
        document.querySelectorAll('.balance-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.balance-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.balanceAdjustType = btn.dataset.type;
            });
        });
    },

    async openBalanceModal(userId) {
        const { data: user } = await getSupabase()
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (!user) return;

        this.currentPlayerId = userId;
        document.getElementById('modalPlayerName').textContent = user.username;
        document.getElementById('modalCurrentBalance').textContent = '$' + parseFloat(user.balance || 0).toLocaleString();
        document.getElementById('adjustAmount').value = '';
        document.getElementById('adjustReason').value = '';
        document.getElementById('balanceModal').classList.add('active');
    },

    async openVipModal(userId) {
        const { data: user } = await getSupabase()
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (!user) return;

        this.currentPlayerId = userId;
        document.getElementById('vipModalPlayerName').textContent = user.username;
        document.getElementById('newVipLevel').value = user.vip_level || 'bronze';
        document.getElementById('vipModal').classList.add('active');
    }
};

function closeBalanceModal() {
    document.getElementById('balanceModal').classList.remove('active');
}

function closeVipModal() {
    document.getElementById('vipModal').classList.remove('active');
}

async function confirmAdjustBalance() {
    const amount = parseInt(document.getElementById('adjustAmount').value);
    const reason = document.getElementById('adjustReason').value || '管理员调整';

    if (!amount || amount <= 0) {
        Auth.showToast('请输入有效金额', 'error');
        return;
    }

    const finalAmount = Admin.balanceAdjustType === 'add' ? amount : -amount;
    await Wallet.updateBalance(Admin.currentPlayerId, finalAmount);
    await Wallet.recordTransaction(Admin.currentPlayerId, Admin.balanceAdjustType, Math.abs(finalAmount), reason);

    Auth.showToast(`余额已${Admin.balanceAdjustType === 'add' ? '增加' : '扣除'} $${amount}`, 'success');
    closeBalanceModal();
    await Admin.loadDashboard();
    await Admin.loadPlayers();
}

async function confirmAdjustVip() {
    const newLevel = document.getElementById('newVipLevel').value;

    await getSupabase()
        .from('users')
        .update({ vip_level: newLevel })
        .eq('id', Admin.currentPlayerId);

    Auth.showToast('VIP等级已更新', 'success');
    closeVipModal();
    await Admin.loadPlayers();
}

function showAddPromoModal() {
    Auth.showToast('优惠创建功能开发中...', 'info');
}

document.addEventListener('DOMContentLoaded', () => Admin.init());
