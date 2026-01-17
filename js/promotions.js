// LuckyDragon - Promotions Page JavaScript
const Promotions = {
    async init() {
        const user = await Auth.getCurrentUser();
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        this.updateUserInfo(user);
        this.setupFilters();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    },

    updateUserInfo(user) {
        document.getElementById('navBalance').textContent = '$' + parseFloat(user.balance || 0).toLocaleString();
        document.getElementById('navUsername').textContent = user.username;
        document.getElementById('userAvatar').textContent = user.username.charAt(0).toUpperCase();
    },

    setupFilters() {
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const filter = tab.dataset.filter;
                this.filterPromos(filter);
            });
        });
    },

    filterPromos(filter) {
        const cards = document.querySelectorAll('.promo-card');

        cards.forEach(card => {
            const categories = card.dataset.category || '';

            if (filter === 'all' || categories.includes(filter)) {
                card.classList.remove('hidden');
                card.style.animation = 'fadeIn 0.3s ease';
            } else {
                card.classList.add('hidden');
            }
        });
    },

    updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }) + ' (GMT+8)';

        const el = document.getElementById('currentTime');
        if (el) el.textContent = timeStr;
    }
};

// Promo functions
function showPromoDetails(id) {
    const modal = document.getElementById('promoModal');
    const body = document.getElementById('modalBody');

    const details = {
        1: `
      <h4>288% 超级欢迎礼金</h4>
      <p>首次存款即可获得高达 288% 的超级奖励！</p>
      <hr>
      <h5>活动规则：</h5>
      <ul>
        <li>最低存款：$30</li>
        <li>最高奖金：$28,800</li>
        <li>流水要求：25倍奖金</li>
        <li>有效期：30天</li>
        <li>适用游戏：所有老虎机</li>
      </ul>
    `,
        2: `
      <h4>396 免费旋转</h4>
      <p>注册即送 396 次免费旋转！</p>
      <hr>
      <h5>活动规则：</h5>
      <ul>
        <li>免费旋转分 7 天发放</li>
        <li>每天可领取 50-60 次</li>
        <li>适用游戏：Gates of Olympus, Sweet Bonanza</li>
        <li>赢利需完成 5 倍流水</li>
      </ul>
    `,
        3: `
      <h4>每日 50% 充值奖励</h4>
      <p>每天首次充值可获得 50% 奖励！</p>
      <hr>
      <h5>活动规则：</h5>
      <ul>
        <li>每天限领一次</li>
        <li>最低存款：$20</li>
        <li>最高奖金：$500/天</li>
        <li>流水要求：15倍</li>
      </ul>
    `,
        4: `
      <h4>VIP 无限返水计划</h4>
      <p>VIP 会员专享无上限返水！</p>
      <hr>
      <h5>返水比例：</h5>
      <ul>
        <li>Bronze: 0.5%</li>
        <li>Silver: 1%</li>
        <li>Gold: 1.5%</li>
        <li>Platinum: 2%</li>
        <li>Diamond: 3%</li>
      </ul>
    `
    };

    body.innerHTML = details[id] || '<p>活动详情请联系客服</p>';
    modal.classList.add('active');
}

function closePromoModal() {
    document.getElementById('promoModal').classList.remove('active');
}

function applyPromo(id) {
    Auth.showNotification('🎉 活动申请成功！奖金将在充值后自动发放', 'success');
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closePromoModal();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => Promotions.init());
