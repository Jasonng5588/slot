// LuckyDragon - Loyalty System with LocalStorage
const Loyalty = {
    CHECKINS_KEY: 'luckydragon_checkins',

    VIP_LEVELS: {
        bronze: { name: '青铜', icon: '🥉', minPoints: 0, cashback: 0.5 },
        silver: { name: '白银', icon: '🥈', minPoints: 5000, cashback: 1 },
        gold: { name: '黄金', icon: '🥇', minPoints: 20000, cashback: 1.5 },
        platinum: { name: '铂金', icon: '💎', minPoints: 50000, cashback: 2 },
        diamond: { name: '钻石', icon: '👑', minPoints: 100000, cashback: 3 }
    },

    DAILY_REWARDS: [
        { day: 1, reward: 100, icon: '🎁' },
        { day: 2, reward: 200, icon: '🎁' },
        { day: 3, reward: 500, icon: '🎁' },
        { day: 4, reward: 800, icon: '🎁' },
        { day: 5, reward: 1000, icon: '🎁' },
        { day: 6, reward: 1500, icon: '🎁' },
        { day: 7, reward: 3000, icon: '🎉' }
    ],

    getCheckins() {
        try {
            return JSON.parse(localStorage.getItem(this.CHECKINS_KEY) || '[]');
        } catch (e) {
            return [];
        }
    },

    saveCheckins(checkins) {
        localStorage.setItem(this.CHECKINS_KEY, JSON.stringify(checkins));
    },

    getVipInfo(level) {
        return this.VIP_LEVELS[level] || this.VIP_LEVELS.bronze;
    },

    getNextLevel(currentLevel) {
        const levels = Object.keys(this.VIP_LEVELS);
        const idx = levels.indexOf(currentLevel);
        return idx < levels.length - 1 ? levels[idx + 1] : null;
    },

    getProgressToNextLevel(points, currentLevel) {
        const nextLevel = this.getNextLevel(currentLevel);
        if (!nextLevel) return 100;

        const current = this.VIP_LEVELS[currentLevel].minPoints;
        const next = this.VIP_LEVELS[nextLevel].minPoints;
        return Math.min(100, ((points - current) / (next - current)) * 100);
    },

    async canClaimDaily(userId) {
        const today = new Date().toISOString().split('T')[0];
        const checkins = this.getCheckins();
        return !checkins.find(c => c.user_id === userId && c.check_date === today);
    },

    async claimDaily(userId) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const checkins = this.getCheckins();

        // Check if already claimed
        if (checkins.find(c => c.user_id === userId && c.check_date === today)) {
            return null;
        }

        // Get yesterday's streak
        const yesterdayCheckin = checkins.find(c => c.user_id === userId && c.check_date === yesterday);
        const streak = yesterdayCheckin ? (yesterdayCheckin.streak % 7) + 1 : 1;
        const reward = this.DAILY_REWARDS[streak - 1].reward;

        // Add checkin
        checkins.push({
            user_id: userId,
            check_date: today,
            streak,
            reward,
            created_at: new Date().toISOString()
        });

        this.saveCheckins(checkins);

        return { streak, reward };
    },

    async getDailyStreak(userId) {
        const checkins = this.getCheckins();
        const userCheckins = checkins
            .filter(c => c.user_id === userId)
            .sort((a, b) => new Date(b.check_date) - new Date(a.check_date));

        return userCheckins.length > 0 ? userCheckins[0].streak : 0;
    }
};

window.Loyalty = Loyalty;
