// LuckyDragon - VIP Page JavaScript
const VipPage = {
    user: null,

    VIP_LEVELS: {
        bronze: { name: 'Bronze 青铜会员', icon: '🥉', minPoints: 0, nextThreshold: 5000 },
        silver: { name: 'Silver 白银会员', icon: '🥈', minPoints: 5000, nextThreshold: 20000 },
        gold: { name: 'Gold 黄金会员', icon: '🥇', minPoints: 20000, nextThreshold: 50000 },
        platinum: { name: 'Platinum 铂金会员', icon: '💎', minPoints: 50000, nextThreshold: 100000 },
        diamond: { name: 'Diamond 钻石会员', icon: '👑', minPoints: 100000, nextThreshold: 999999 }
    },

    async init() {
        this.user = await Auth.getCurrentUser();
        if (!this.user) {
            window.location.href = 'index.html';
            return;
        }

        this.updateVipInfo();
        this.highlightCurrentLevel();
    },

    updateVipInfo() {
        const level = this.user.vip_level || 'bronze';
        const points = this.user.vip_points || 0;
        const vipInfo = this.VIP_LEVELS[level];

        // Navbar
        document.getElementById('navBalance').textContent = '$' + parseFloat(this.user.balance || 0).toLocaleString();

        // VIP status
        document.getElementById('vipAvatar').textContent = vipInfo.icon;
        document.getElementById('vipLevelName').textContent = vipInfo.name;
        document.getElementById('vipPoints').textContent = points.toLocaleString();

        // Progress
        const progress = ((points - vipInfo.minPoints) / (vipInfo.nextThreshold - vipInfo.minPoints)) * 100;
        document.getElementById('vipProgress').style.width = Math.min(100, progress) + '%';
        document.getElementById('pointsNeeded').textContent = Math.max(0, vipInfo.nextThreshold - points).toLocaleString();
    },

    highlightCurrentLevel() {
        const level = this.user.vip_level || 'bronze';
        document.querySelectorAll('.level-card').forEach(card => {
            if (card.dataset.level === level) {
                card.style.border = '2px solid var(--color-gold)';
                card.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.3)';
            }
        });
    }
};

// Daily check-in
async function claimDaily() {
    if (!VipPage.user) return;

    const result = await Loyalty.claimDaily(VipPage.user.id);

    if (result) {
        // Add reward to balance
        await Wallet.updateBalance(VipPage.user.id, result.reward);
        VipPage.user = await Auth.getCurrentUser();
        VipPage.updateVipInfo();

        Auth.showNotification(`🎉 签到成功！第 ${result.streak} 天，获得 $${result.reward}!`, 'success');

        // Update UI
        const days = document.querySelectorAll('.checkin-day');
        days.forEach((day, i) => {
            if (i < result.streak - 1) {
                day.classList.add('completed');
                day.classList.remove('current');
            } else if (i === result.streak - 1) {
                day.classList.add('completed');
                day.classList.remove('current');
            } else if (i === result.streak) {
                day.classList.add('current');
            }
        });
    } else {
        Auth.showNotification('您今天已经签到过了，明天再来吧！', 'info');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => VipPage.init());
