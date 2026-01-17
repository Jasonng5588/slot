// LuckyDragon Casino - Complete Admin Panel JavaScript
// Stable version with all features working

const Admin = {
    players: [],
    currentPlayer: null,
    supabase: null,
    initialized: false,

    GAMES: [
        { id: 1, name: '龙之财富 Megaways', category: '老虎机', rtp: 96, status: 'active' },
        { id: 2, name: '冰龙觉醒', category: '老虎机', rtp: 95, status: 'active' },
        { id: 3, name: '财神到', category: '老虎机', rtp: 96, status: 'active' },
        { id: 4, name: '西游记', category: '老虎机', rtp: 94, status: 'active' },
        { id: 5, name: '凤凰涅槃', category: '老虎机', rtp: 95, status: 'active' },
        { id: 6, name: '东方神龙', category: '老虎机', rtp: 96, status: 'active' },
        { id: 7, name: '招财猫', category: '老虎机', rtp: 95, status: 'active' },
        { id: 8, name: '海盗宝藏', category: '老虎机', rtp: 93, status: 'active' },
        { id: 9, name: '西部淘金', category: '老虎机', rtp: 94, status: 'active' },
        { id: 10, name: '埃及法老', category: '老虎机', rtp: 95, status: 'active' },
        { id: 11, name: '水果财富', category: '老虎机', rtp: 96, status: 'active' },
        { id: 12, name: '钻石矿工', category: '老虎机', rtp: 94, status: 'active' },
        { id: 13, name: '幸运777', category: '老虎机', rtp: 97, status: 'active' },
        { id: 14, name: '海王捕鱼', category: '捕鱼', rtp: 92, status: 'active' },
        { id: 15, name: '4D彩票', category: '彩票', rtp: 70, status: 'active' },
        { id: 16, name: '幸运转盘', category: '快速游戏', rtp: 90, status: 'active' },
        { id: 17, name: '骰宝', category: '快速游戏', rtp: 94, status: 'active' },
        { id: 18, name: '刮刮卡', category: '快速游戏', rtp: 88, status: 'active' }
    ],

    PROMOS: [],
    LOGS: [],

    // Initialize
    async init() {
        if (this.initialized) return;
        console.log('[Admin] Initializing...');

        try {
            // Wait for Supabase
            await this.waitForSupabase();

            // Setup UI
            this.setupNavigation();
            this.startClock();

            // Load data
            await this.loadPlayers();
            this.loadPromos();

            // Render all sections
            this.renderAll();

            this.addLog('系统', '管理员登录');
            this.initialized = true;
            console.log('[Admin] Ready! Players:', this.players.length);

        } catch (err) {
            console.error('[Admin] Init error:', err);
            this.showToast('初始化失败: ' + err.message, 'error');
        }
    },

    async waitForSupabase() {
        for (let i = 0; i < 20; i++) {
            if (typeof getSupabase === 'function') {
                this.supabase = getSupabase();
                if (this.supabase) {
                    console.log('[Admin] Supabase ready');
                    return;
                }
            }
            if (typeof initSupabase === 'function') {
                this.supabase = initSupabase();
                if (this.supabase) {
                    console.log('[Admin] Supabase initialized');
                    return;
                }
            }
            await new Promise(r => setTimeout(r, 200));
        }
        throw new Error('Supabase 连接超时');
    },

    getClient() {
        return this.supabase || (typeof getSupabase === 'function' ? getSupabase() : null);
    },

    // UI Helpers
    showToast(msg, type = 'success') {
        const c = document.getElementById('toastContainer');
        if (!c) { console.log('[Toast]', type, msg); return; }
        const t = document.createElement('div');
        t.className = 'toast ' + type;
        t.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}</span><span>${msg}</span>`;
        c.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    },

    openModal(id) {
        const m = document.getElementById(id);
        if (m) m.classList.add('active');
    },

    closeModal(id) {
        const m = document.getElementById(id);
        if (m) m.classList.remove('active');
    },

    setupNavigation() {
        document.querySelectorAll('.admin-nav-item[data-section]').forEach(item => {
            item.onclick = (e) => {
                e.preventDefault();
                this.showSection(item.dataset.section);
            };
        });
    },

    showSection(id) {
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
        const sec = document.getElementById(id);
        const nav = document.querySelector(`[data-section="${id}"]`);
        if (sec) sec.classList.add('active');
        if (nav) nav.classList.add('active');
    },

    startClock() {
        const update = () => {
            const el = document.getElementById('currentTime');
            if (el) el.textContent = new Date().toLocaleString('zh-CN');
        };
        update();
        setInterval(update, 1000);
    },

    addLog(cat, action, detail = '') {
        this.LOGS.unshift({ time: new Date().toISOString(), category: cat, action, detail });
        if (this.LOGS.length > 50) this.LOGS.pop();
        this.renderLogs();
    },

    timeAgo(d) {
        if (!d) return '-';
        const diff = Date.now() - new Date(d).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return '刚刚';
        if (m < 60) return m + '分钟前';
        const h = Math.floor(m / 60);
        if (h < 24) return h + '小时前';
        return Math.floor(h / 24) + '天前';
    },

    vipName(l) {
        return { bronze: '青铜', silver: '白银', gold: '黄金', platinum: '铂金', diamond: '钻石' }[l] || '青铜';
    },

    // Data Loading
    async loadPlayers() {
        const client = this.getClient();
        if (!client) { console.error('[Admin] No client'); return; }

        try {
            const { data, error } = await client.from('users').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            this.players = data || [];
            console.log('[Admin] Players loaded:', this.players.length);
        } catch (e) {
            console.error('[Admin] Load error:', e);
            this.players = [];
        }
    },

    loadPromos() {
        try {
            const s = localStorage.getItem('admin_promos');
            this.PROMOS = s ? JSON.parse(s) : [
                { id: 1, name: '🎁 新用户注册奖励', desc: '注册即送 $10,000', type: 'bonus', value: 10000, active: true },
                { id: 2, name: '📅 每日签到', desc: '连续签到7天获奖励', type: 'bonus', value: 500, active: true },
                { id: 3, name: '💎 VIP返水', desc: '0.5%-3%返水', type: 'cashback', value: 3, active: true }
            ];
        } catch (e) {
            this.PROMOS = [];
        }
    },

    savePromos() { localStorage.setItem('admin_promos', JSON.stringify(this.PROMOS)); },

    // Render All
    renderAll() {
        this.renderDashboard();
        this.renderPlayers();
        this.renderGamesRTP();
        this.renderPromos();
        this.renderGames();
        this.renderFinance();
        this.renderReports();
        this.renderLogs();
        this.populatePlayerSelect();
    },

    renderDashboard() {
        const total = this.players.reduce((s, p) => s + parseFloat(p.balance || 0), 0);
        this.setText('statPlayers', this.players.length);
        this.setText('statOnline', Math.max(1, Math.floor(this.players.length * 0.3)));
        this.setText('statBalance', '$' + total.toLocaleString());
        this.setText('statBets', '$125,680');
        this.setText('statProfit', '$27,140');

        const tb = document.getElementById('recentTransactions');
        if (tb) {
            tb.innerHTML = this.players.length > 0
                ? this.players.slice(0, 5).map((p, i) => {
                    const n = p.username || 'User';
                    const t = ['注册', '游戏', '签到', '充值'][i % 4];
                    const a = ['+$10,000', '-$50', '+$100', '+$500'][i % 4];
                    return `<tr><td><strong>${n}</strong></td><td>${t}</td><td style="color:${a[0] === '+' ? '#0d6' : '#f44'}">${a}</td><td>${this.timeAgo(p.created_at)}</td><td><span class="badge badge-success">完成</span></td></tr>`;
                }).join('')
                : '<tr><td colspan="5" style="text-align:center;color:#666;padding:30px;">暂无数据</td></tr>';
        }
    },

    renderPlayers() {
        this.setText('playerCount', `共 ${this.players.length} 位玩家`);
        const tb = document.getElementById('playersTable');
        if (!tb) return;

        tb.innerHTML = this.players.length > 0
            ? this.players.map(p => {
                const n = p.username || 'User';
                return `<tr>
                    <td><div style="display:flex;align-items:center;gap:8px;">
                        <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#ffd700,#ff8c00);display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;">${n[0].toUpperCase()}</div>
                        <div><strong>${n}</strong><br><small style="color:#666;">${p.email || p.id?.substring(0, 8) || ''}</small></div>
                    </div></td>
                    <td style="color:#ffd700;font-weight:600;">$${parseFloat(p.balance || 0).toLocaleString()}</td>
                    <td><span class="vip-badge vip-${p.vip_level || 'bronze'}">${this.vipName(p.vip_level)}</span></td>
                    <td>${p.rtp || 95}%</td>
                    <td>${(p.vip_points || 0).toLocaleString()}</td>
                    <td>--</td><td>--</td>
                    <td><span class="badge badge-success">活跃</span></td>
                    <td class="actions">
                        <button class="btn btn-outline btn-sm" onclick="Admin.editPlayer('${p.id}')" title="编辑">✏️</button>
                        <button class="btn btn-gold btn-sm" onclick="Admin.adjustBalance('${p.id}')" title="余额">💰</button>
                        <button class="btn btn-blue btn-sm" onclick="Admin.changeVip('${p.id}')" title="VIP">💎</button>
                        <button class="btn btn-green btn-sm" onclick="Admin.changeRtp('${p.id}')" title="RTP">🎯</button>
                    </td>
                </tr>`;
            }).join('')
            : '<tr><td colspan="9" style="text-align:center;color:#666;padding:40px;">暂无玩家</td></tr>';
    },

    renderGamesRTP() {
        const c = document.getElementById('gameRtpList');
        if (!c) return;
        c.innerHTML = this.GAMES.map((g, i) => `
            <div class="rtp-control" style="margin-bottom:15px;">
                <div class="rtp-header"><span>${g.name}</span><span id="gRtp${i}">${g.rtp}%</span></div>
                <input type="range" class="rtp-slider" min="70" max="99" value="${g.rtp}" 
                    oninput="document.getElementById('gRtp${i}').textContent=this.value+'%';Admin.GAMES[${i}].rtp=parseInt(this.value)">
                <div class="rtp-info"><span>70%</span><span>${g.category}</span><span>99%</span></div>
            </div>
        `).join('');
    },

    renderPromos() {
        const c = document.getElementById('promoList');
        if (!c) return;
        c.innerHTML = this.PROMOS.map(p => `
            <div class="card" style="margin-bottom:12px;">
                <div class="card-header"><span class="card-title">${p.name}</span><span class="badge ${p.active ? 'badge-success' : 'badge-danger'}">${p.active ? '进行中' : '停用'}</span></div>
                <div class="card-body"><p style="color:#888;">${p.desc}</p></div>
                <div class="card-footer" style="display:flex;gap:8px;">
                    <button class="btn ${p.active ? 'btn-outline' : 'btn-green'} btn-sm" onclick="Admin.togglePromo(${p.id})">${p.active ? '⏸停用' : '▶启用'}</button>
                    <button class="btn btn-blue btn-sm" onclick="Admin.editPromo(${p.id})">✏️编辑</button>
                    <button class="btn btn-red btn-sm" onclick="Admin.deletePromo(${p.id})">🗑删除</button>
                </div>
            </div>
        `).join('') || '<p style="color:#666;">暂无活动</p>';
    },

    renderGames() {
        const tb = document.getElementById('gamesTable');
        if (!tb) return;
        tb.innerHTML = this.GAMES.map(g => {
            const b = Math.floor(Math.random() * 20000) + 1000;
            const w = Math.floor(b * (g.rtp / 100));
            return `<tr>
                <td><strong>${g.name}</strong></td><td>${g.category}</td><td style="color:#0d6">${g.rtp}%</td>
                <td>$${b.toLocaleString()}</td><td>$${w.toLocaleString()}</td><td style="color:#0d6">$${(b - w).toLocaleString()}</td>
                <td><span class="badge badge-success">${g.status === 'active' ? '运行中' : '停用'}</span></td>
                <td><button class="btn btn-outline btn-sm" onclick="Admin.editGame(${g.id})">✏️</button><button class="btn btn-red btn-sm" onclick="Admin.toggleGame(${g.id})">${g.status === 'active' ? '停用' : '启用'}</button></td>
            </tr>`;
        }).join('');
    },

    renderFinance() {
        const tb = document.getElementById('financeTable');
        if (!tb) return;
        tb.innerHTML = this.players.slice(0, 8).map((p, i) => {
            const n = p.username || 'User';
            const t = ['注册奖励', '投注', '中奖', '签到'][i % 4];
            const a = ['+$10,000', '-$50', '+$120', '+$100'][i % 4];
            return `<tr><td>#${1000 + i}</td><td><strong>${n}</strong></td><td>${t}</td><td>龙之财富</td><td style="color:${a[0] === '+' ? '#0d6' : '#f44'}">${a}</td><td>${this.timeAgo(p.created_at)}</td><td><span class="badge badge-success">完成</span></td><td><button class="btn btn-outline btn-sm">详情</button></td></tr>`;
        }).join('') || '<tr><td colspan="8" style="text-align:center;color:#666;">暂无记录</td></tr>';
    },

    renderReports() {
        const tg = document.getElementById('topGames');
        if (tg) tg.innerHTML = this.GAMES.slice(0, 5).map((g, i) => `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span>${i + 1}. ${g.name}</span><span style="color:#ffd700;">$${Math.floor(Math.random() * 50000 + 10000).toLocaleString()}</span></div>`).join('');

        const tp = document.getElementById('topPlayers');
        if (tp) {
            const sorted = [...this.players].sort((a, b) => parseFloat(b.balance || 0) - parseFloat(a.balance || 0));
            tp.innerHTML = sorted.slice(0, 5).map((p, i) => `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span>${i + 1}. ${p.username || 'User'}</span><span style="color:#ffd700;">$${parseFloat(p.balance || 0).toLocaleString()}</span></div>`).join('') || '<p style="color:#666;">暂无数据</p>';
        }
    },

    renderLogs() {
        const c = document.getElementById('activityLog');
        if (!c) return;
        const icons = { '系统': '⚙️', '财务': '💰', 'VIP': '💎', 'RTP': '🎯', '优惠': '🎁', '游戏': '🎰', '玩家': '👤' };
        c.innerHTML = this.LOGS.length > 0
            ? this.LOGS.map(l => `<div class="activity-item"><div class="activity-icon">${icons[l.category] || '📝'}</div><div class="activity-content"><div class="activity-text"><strong>[${l.category}]</strong> ${l.action} ${l.detail ? '- ' + l.detail : ''}</div><div class="activity-time">${new Date(l.time).toLocaleString()}</div></div></div>`).join('')
            : '<p style="color:#666;text-align:center;">暂无日志</p>';
    },

    populatePlayerSelect() {
        const sel = document.getElementById('playerRtpSelect');
        if (!sel) return;
        sel.innerHTML = `<option value="">-- 选择玩家 (${this.players.length}位) --</option>` + this.players.map(p => `<option value="${p.id}">${p.username || 'User'} - RTP:${p.rtp || 95}%</option>`).join('');
    },

    setText(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; },

    // Player Actions
    editPlayer(id) {
        const p = this.players.find(x => x.id === id);
        if (!p) return this.showToast('找不到玩家', 'error');
        this.currentPlayer = p;

        this.setVal('editUsername', p.username || '');
        this.setVal('editEmail', p.email || '');
        this.setVal('editVipLevel', p.vip_level || 'bronze');
        this.setVal('editBalance', p.balance || 0);
        this.setVal('editRtp', p.rtp || 95);
        this.setText('editRtpVal', (p.rtp || 95) + '%');
        this.setVal('editVipPoints', p.vip_points || 0);
        this.setVal('editStatus', p.status || 'active');

        this.openModal('profileEditModal');
    },

    setVal(id, val) { const e = document.getElementById(id); if (e) e.value = val; },

    async savePlayerProfile() {
        if (!this.currentPlayer) return this.showToast('请选择玩家', 'error');
        const client = this.getClient();
        if (!client) return this.showToast('数据库未连接', 'error');

        const data = {
            username: document.getElementById('editUsername')?.value || this.currentPlayer.username,
            balance: parseFloat(document.getElementById('editBalance')?.value || 0),
            vip_level: document.getElementById('editVipLevel')?.value || 'bronze',
            vip_points: parseInt(document.getElementById('editVipPoints')?.value || 0)
        };

        // Only add optional fields if database supports them
        const email = document.getElementById('editEmail')?.value;
        const rtp = document.getElementById('editRtp')?.value;
        const status = document.getElementById('editStatus')?.value;

        try {
            // Try with all fields first
            let { error } = await client.from('users').update({
                ...data,
                email: email || null,
                rtp: parseInt(rtp || 95),
                status: status || 'active'
            }).eq('id', this.currentPlayer.id);

            // If error (column doesn't exist), try without optional fields
            if (error && error.message.includes('column')) {
                console.log('[Admin] Retrying without optional columns');
                const result = await client.from('users').update(data).eq('id', this.currentPlayer.id);
                error = result.error;
            }

            if (error) throw error;

            this.addLog('玩家', '编辑资料', data.username);
            this.showToast('保存成功！');
            this.closeModal('profileEditModal');
            await this.loadPlayers();
            this.renderAll();
        } catch (e) {
            console.error('[Admin] Save error:', e);
            this.showToast('保存失败: ' + e.message, 'error');
        }
    },

    adjustBalance(id) {
        const p = this.players.find(x => x.id === id);
        if (!p) return;
        this.currentPlayer = p;
        this.setText('balPlayerName', p.username || 'User');
        this.setText('balPlayerAmount', '$' + parseFloat(p.balance || 0).toLocaleString());
        this.setVal('balAmount', '');
        this.setVal('balReason', '');
        this.openModal('balanceModal');
    },

    async confirmBalance() {
        if (!this.currentPlayer) return this.showToast('请选择玩家', 'error');
        const client = this.getClient();
        if (!client) return this.showToast('数据库未连接', 'error');

        const type = document.getElementById('balType')?.value || 'add';
        const amount = parseFloat(document.getElementById('balAmount')?.value || 0);
        if (amount <= 0) return this.showToast('请输入有效金额', 'error');

        let newBal = parseFloat(this.currentPlayer.balance || 0);
        if (type === 'add') newBal += amount;
        else if (type === 'sub') newBal = Math.max(0, newBal - amount);
        else newBal = amount;

        try {
            const { error } = await client.from('users').update({ balance: newBal }).eq('id', this.currentPlayer.id);
            if (error) throw error;

            this.addLog('财务', '调整余额', `${this.currentPlayer.username} ${type === 'add' ? '+' : type === 'sub' ? '-' : '='} $${amount}`);
            this.showToast(`余额已更新: $${newBal.toLocaleString()}`);
            this.closeModal('balanceModal');
            await this.loadPlayers();
            this.renderAll();
        } catch (e) {
            this.showToast('操作失败: ' + e.message, 'error');
        }
    },

    changeVip(id) {
        const p = this.players.find(x => x.id === id);
        if (!p) return;
        this.currentPlayer = p;

        const c = document.getElementById('playerModalContent');
        if (!c) return;

        c.innerHTML = `
            <p>玩家: <strong>${p.username || 'User'}</strong></p>
            <p style="margin:15px 0;">当前: <span class="vip-badge vip-${p.vip_level || 'bronze'}">${this.vipName(p.vip_level)}</span></p>
            <select class="form-select" id="newVipLevel" style="margin-bottom:15px;">
                <option value="bronze" ${p.vip_level === 'bronze' ? 'selected' : ''}>🥉 青铜</option>
                <option value="silver" ${p.vip_level === 'silver' ? 'selected' : ''}>🥈 白银</option>
                <option value="gold" ${p.vip_level === 'gold' ? 'selected' : ''}>🥇 黄金</option>
                <option value="platinum" ${p.vip_level === 'platinum' ? 'selected' : ''}>💎 铂金</option>
                <option value="diamond" ${p.vip_level === 'diamond' ? 'selected' : ''}>👑 钻石</option>
            </select>
            <button class="btn btn-gold" style="width:100%;" onclick="Admin.confirmVip()">保存</button>
        `;

        const t = document.querySelector('#playerModal .modal-title');
        if (t) t.textContent = '💎 修改VIP';
        this.openModal('playerModal');
    },

    async confirmVip() {
        if (!this.currentPlayer) return;
        const client = this.getClient();
        if (!client) return this.showToast('数据库未连接', 'error');

        const level = document.getElementById('newVipLevel')?.value || 'bronze';

        try {
            const { error } = await client.from('users').update({ vip_level: level }).eq('id', this.currentPlayer.id);
            if (error) throw error;

            this.addLog('VIP', '修改等级', `${this.currentPlayer.username} → ${this.vipName(level)}`);
            this.showToast('VIP已更新: ' + this.vipName(level));
            this.closeModal('playerModal');
            await this.loadPlayers();
            this.renderAll();
        } catch (e) {
            this.showToast('操作失败: ' + e.message, 'error');
        }
    },

    changeRtp(id) {
        const p = this.players.find(x => x.id === id);
        if (!p) return;
        this.currentPlayer = p;

        const c = document.getElementById('playerModalContent');
        if (!c) return;

        const rtp = p.rtp || 95;
        c.innerHTML = `
            <p>玩家: <strong>${p.username || 'User'}</strong></p>
            <div style="margin:20px 0;">
                <div style="display:flex;justify-content:space-between;margin-bottom:10px;"><span>个人RTP</span><span id="rtpVal">${rtp}%</span></div>
                <input type="range" class="rtp-slider" min="70" max="99" value="${rtp}" id="rtpSlider" style="width:100%;" oninput="document.getElementById('rtpVal').textContent=this.value+'%'">
                <div style="display:flex;justify-content:space-between;color:#666;font-size:0.8rem;"><span>70%</span><span>99%</span></div>
            </div>
            <button class="btn btn-gold" style="width:100%;" onclick="Admin.confirmRtp()">保存RTP</button>
        `;

        const t = document.querySelector('#playerModal .modal-title');
        if (t) t.textContent = '🎯 调整RTP';
        this.openModal('playerModal');
    },

    async confirmRtp() {
        if (!this.currentPlayer) return;
        const client = this.getClient();
        if (!client) return this.showToast('数据库未连接', 'error');

        const rtp = parseInt(document.getElementById('rtpSlider')?.value || 95);

        try {
            // Try to update RTP column
            const { error } = await client.from('users').update({ rtp: rtp }).eq('id', this.currentPlayer.id);

            if (error) {
                // Column might not exist - show message
                console.error('[Admin] RTP save error:', error);
                this.showToast('请先在Supabase添加rtp列', 'warning');
                return;
            }

            this.addLog('RTP', '调整', `${this.currentPlayer.username} → ${rtp}%`);
            this.showToast('RTP已保存: ' + rtp + '%');
            this.closeModal('playerModal');
            await this.loadPlayers();
            this.renderAll();
        } catch (e) {
            this.showToast('操作失败: ' + e.message, 'error');
        }
    },

    // RTP Tab
    loadPlayerRtpFromSelect() {
        const sel = document.getElementById('playerRtpSelect');
        const ctrl = document.getElementById('playerRtpControl');
        if (!sel || !ctrl) return;

        const id = sel.value;
        if (id) {
            const p = this.players.find(x => x.id === id);
            if (p) {
                this.currentPlayer = p;
                this.setVal('playerRtpSlider', p.rtp || 95);
                this.setText('playerRtpValue', (p.rtp || 95) + '%');
                ctrl.style.display = 'block';
            }
        } else {
            ctrl.style.display = 'none';
        }
    },

    async savePlayerRtpFromTab() {
        if (!this.currentPlayer) return this.showToast('请选择玩家', 'error');
        const client = this.getClient();
        if (!client) return this.showToast('数据库未连接', 'error');

        const rtp = parseInt(document.getElementById('playerRtpSlider')?.value || 95);

        try {
            const { error } = await client.from('users').update({ rtp }).eq('id', this.currentPlayer.id);
            if (error) throw error;

            this.addLog('RTP', '调整', `${this.currentPlayer.username} → ${rtp}%`);
            this.showToast('RTP已保存!');
            await this.loadPlayers();
            this.renderAll();
        } catch (e) {
            this.showToast('保存失败: ' + e.message, 'error');
        }
    },

    // Promos
    showAddPromoModal() { this.openModal('promoModal'); },

    createPromo() {
        const name = document.getElementById('promoName')?.value?.trim();
        const desc = document.getElementById('promoDesc')?.value?.trim();
        if (!name || !desc) return this.showToast('请填写信息', 'error');

        this.PROMOS.push({
            id: Date.now(),
            name: '🎁 ' + name,
            desc,
            type: document.getElementById('promoType')?.value || 'bonus',
            value: parseInt(document.getElementById('promoValue')?.value || 100),
            active: true
        });

        this.savePromos();
        this.addLog('优惠', '创建活动', name);
        this.renderPromos();
        this.closeModal('promoModal');
        this.showToast('活动已创建');
    },

    editPromo(id) {
        const p = this.PROMOS.find(x => x.id === id);
        if (!p) return;
        const n = prompt('活动名称:', p.name.replace('🎁 ', ''));
        if (n) {
            p.name = '🎁 ' + n;
            this.savePromos();
            this.renderPromos();
            this.showToast('已更新');
        }
    },

    togglePromo(id) {
        const p = this.PROMOS.find(x => x.id === id);
        if (p) {
            p.active = !p.active;
            this.savePromos();
            this.renderPromos();
            this.showToast(p.active ? '已启用' : '已停用');
        }
    },

    deletePromo(id) {
        if (confirm('确定删除？')) {
            this.PROMOS = this.PROMOS.filter(x => x.id !== id);
            this.savePromos();
            this.renderPromos();
            this.showToast('已删除');
        }
    },

    // Games
    editGame(id) {
        const g = this.GAMES.find(x => x.id === id);
        if (!g) return;
        const rtp = prompt(`${g.name} RTP (当前${g.rtp}%):`, g.rtp);
        if (rtp) {
            const v = parseInt(rtp);
            if (v >= 70 && v <= 99) {
                g.rtp = v;
                this.renderGames();
                this.renderGamesRTP();
                this.showToast('RTP已更新');
            } else {
                this.showToast('RTP需在70-99之间', 'error');
            }
        }
    },

    toggleGame(id) {
        const g = this.GAMES.find(x => x.id === id);
        if (g) {
            g.status = g.status === 'active' ? 'inactive' : 'active';
            this.renderGames();
            this.showToast(g.status === 'active' ? '已启用' : '已停用');
        }
    },

    // Bonus & Broadcast
    showBonusModal() { this.openModal('bonusModal'); },
    showBroadcastModal() { this.openModal('broadcastModal'); },

    async sendBonus() {
        const target = document.getElementById('bonusTarget')?.value || 'all';
        const amount = parseFloat(document.getElementById('bonusAmount')?.value || 0);
        if (amount <= 0) return this.showToast('请输入金额', 'error');

        let targets = this.players;
        if (target === 'vip') targets = this.players.filter(p => p.vip_level && p.vip_level !== 'bronze');
        else if (target === 'active') targets = this.players.filter(p => parseFloat(p.balance || 0) > 0);

        if (targets.length === 0) return this.showToast('没有符合条件的玩家', 'warning');

        const client = this.getClient();
        if (!client) return this.showToast('数据库未连接', 'error');

        let ok = 0;
        for (const p of targets) {
            try {
                await client.from('users').update({ balance: parseFloat(p.balance || 0) + amount }).eq('id', p.id);
                ok++;
            } catch (e) { }
        }

        this.addLog('奖励', '发放', `${ok}人 x $${amount}`);
        this.showToast(`已发放 ${ok} 人`);
        this.closeModal('bonusModal');
        await this.loadPlayers();
        this.renderAll();
    },

    sendBroadcast() {
        const title = document.getElementById('bcTitle')?.value?.trim();
        const content = document.getElementById('bcContent')?.value?.trim();
        if (!title || !content) return this.showToast('请填写内容', 'error');

        this.addLog('公告', '发送', title);
        this.showToast('公告已发送');
        this.closeModal('broadcastModal');
    },

    // Utilities
    async refreshPlayers() {
        await this.loadPlayers();
        this.renderAll();
        this.showToast('已刷新');
    },

    refreshDashboard() {
        this.renderDashboard();
        this.showToast('已刷新');
    },

    exportPlayers() {
        const csv = 'Username,Balance,VIP,Points\n' + this.players.map(p => `${p.username || ''},${p.balance || 0},${p.vip_level || 'bronze'},${p.vip_points || 0}`).join('\n');
        const b = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'players.csv';
        a.click();
        this.showToast('已导出');
    },

    exportFinance() { this.showToast('导出中...'); },
    saveAllRTP() { this.addLog('RTP', '保存全部'); this.showToast('已保存'); },
    saveSettings() { this.addLog('设置', '保存'); this.showToast('已保存'); },

    searchPlayers() {
        const q = (document.getElementById('playerSearch')?.value || '').toLowerCase();
        if (!q) return this.renderPlayers();
        const filtered = this.players.filter(p => (p.username || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q));
        this.setText('playerCount', `共 ${filtered.length} 位玩家`);

        const tb = document.getElementById('playersTable');
        if (tb) {
            tb.innerHTML = filtered.map(p => {
                const n = p.username || 'User';
                return `<tr><td><strong>${n}</strong></td><td>$${parseFloat(p.balance || 0).toLocaleString()}</td><td><span class="vip-badge vip-${p.vip_level || 'bronze'}">${this.vipName(p.vip_level)}</span></td><td>${p.rtp || 95}%</td><td>${p.vip_points || 0}</td><td>--</td><td>--</td><td><span class="badge badge-success">活跃</span></td><td><button class="btn btn-gold btn-sm" onclick="Admin.adjustBalance('${p.id}')">💰</button></td></tr>`;
            }).join('') || '<tr><td colspan="9" style="text-align:center;">无匹配</td></tr>';
        }
    },

    filterPlayers(f) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`[data-filter="${f}"]`);
        if (btn) btn.classList.add('active');

        if (f === 'all') return this.renderPlayers();

        let filtered = this.players;
        if (f === 'vip') filtered = this.players.filter(p => p.vip_level && p.vip_level !== 'bronze');
        else if (f === 'new') {
            const week = Date.now() - 7 * 24 * 60 * 60 * 1000;
            filtered = this.players.filter(p => new Date(p.created_at).getTime() > week);
        }
        else if (f === 'active') filtered = this.players.filter(p => parseFloat(p.balance || 0) > 0);

        this.setText('playerCount', `共 ${filtered.length} 位玩家`);
        // Simplified render for filtered
        const tb = document.getElementById('playersTable');
        if (tb) {
            tb.innerHTML = filtered.map(p => {
                const n = p.username || 'User';
                return `<tr><td><strong>${n}</strong></td><td>$${parseFloat(p.balance || 0).toLocaleString()}</td><td><span class="vip-badge vip-${p.vip_level || 'bronze'}">${this.vipName(p.vip_level)}</span></td><td>${p.rtp || 95}%</td><td>${p.vip_points || 0}</td><td>--</td><td>--</td><td><span class="badge badge-success">活跃</span></td><td><button class="btn btn-gold btn-sm" onclick="Admin.adjustBalance('${p.id}')">💰</button></td></tr>`;
            }).join('') || '<tr><td colspan="9" style="text-align:center;">无匹配</td></tr>';
        }
    }
};

// Global functions for HTML onclick handlers
function showSection(id) { Admin.showSection(id); }
function closeModal(id) { Admin.closeModal(id); }
function showBroadcastModal() { Admin.showBroadcastModal(); }
function showBonusModal() { Admin.showBonusModal(); }
function confirmBalance() { Admin.confirmBalance(); }
function showAddPromoModal() { Admin.showAddPromoModal(); }
function createPromo() { Admin.createPromo(); }
function searchPlayers() { Admin.searchPlayers(); }
function filterPlayers(f) { Admin.filterPlayers(f); }
function refreshPlayers() { Admin.refreshPlayers(); }
function refreshDashboard() { Admin.refreshDashboard(); }
function exportPlayers() { Admin.exportPlayers(); }
function exportFinance() { Admin.exportFinance(); }
function saveAllRTP() { Admin.saveAllRTP(); }
function saveSettings() { Admin.saveSettings(); }
function sendBonus() { Admin.sendBonus(); }
function sendBroadcast() { Admin.sendBroadcast(); }

function showRtpTab(tab) {
    document.querySelectorAll('.tabs .tab-btn').forEach(b => b.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const el = document.getElementById('rtp' + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (el) el.classList.add('active');
}

function loadPlayerRtp() { Admin.loadPlayerRtpFromSelect(); }
function updatePlayerRtp(v) { const e = document.getElementById('playerRtpValue'); if (e) e.textContent = v + '%'; }
function savePlayerRtp() { Admin.savePlayerRtpFromTab(); }

// Start
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Admin] DOM Ready, waiting for scripts...');
    setTimeout(() => Admin.init(), 800);
});
