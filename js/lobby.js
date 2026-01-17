// LuckyDragon - Lobby JavaScript (All Unique Game Interfaces)
const Lobby = {
    currentSlide: 0,
    slideInterval: null,
    currentCategory: 'all',

    PROVIDERS: {
        'DragonGaming': { name: 'Dragon Gaming', logo: '🐉', color: '#ff6b35' },
        'LuckyStudio': { name: 'Lucky Studio', logo: '🍀', color: '#00d26a' },
        'GoldenFortune': { name: 'Golden Fortune', logo: '🏆', color: '#ffd700' },
        'StarVegas': { name: 'Star Vegas', logo: '⭐', color: '#8b5cf6' },
        'PhoenixSlots': { name: 'Phoenix Slots', logo: '🔥', color: '#ef4444' }
    },

    // Every game has its own unique themed page
    GAMES: [
        // === SLOTS - Each with unique themed interface ===
        { id: 1, name: '龙之财富 Megaways', provider: 'DragonGaming', image: 'images/games/dragon_treasure.png', url: 'game-dragonmega.html', badge: 'hot', category: 'slots' },
        { id: 2, name: '冰龙觉醒', provider: 'DragonGaming', image: 'images/games/ice_dragon.png', url: 'game-icedragon.html', badge: 'new', category: 'slots' },
        { id: 3, name: '财神到', provider: 'DragonGaming', image: 'images/games/caishen.png', url: 'game-caishen.html', badge: 'hot', category: 'slots' },
        { id: 4, name: '西游记', provider: 'DragonGaming', image: 'images/games/journey_west.png', url: 'game-journey.html', badge: 'hot', category: 'slots' },
        { id: 5, name: '凤凰涅槃', provider: 'DragonGaming', image: 'images/games/phoenix_rising.png', url: 'game-phoenix.html', badge: 'new', category: 'slots' },
        { id: 6, name: '东方神龙', provider: 'DragonGaming', image: 'images/games/dragon_treasure.png', url: 'game-dragonmega.html', badge: '', category: 'slots' },

        { id: 13, name: '幸运777', provider: 'LuckyStudio', image: 'images/games/lucky_777.png', url: 'game-777.html', badge: 'hot', category: 'slots' },
        { id: 14, name: '水果财富', provider: 'LuckyStudio', image: 'images/games/fruit_fortune.png', url: 'game-fruit.html', badge: '', category: 'slots' },
        { id: 15, name: '钻石矿工', provider: 'LuckyStudio', image: 'images/games/diamond_mine.png', url: 'game-diamond.html', badge: 'new', category: 'slots' },
        { id: 18, name: '招财猫', provider: 'LuckyStudio', image: 'images/games/lucky_cat.png', url: 'game-luckycat.html', badge: 'hot', category: 'slots' },
        { id: 21, name: '红包雨', provider: 'LuckyStudio', image: 'images/games/red_packet.png', url: 'game-caishen.html', badge: 'new', category: 'slots' },

        { id: 25, name: '黄金矿工', provider: 'GoldenFortune', image: 'images/games/diamond_mine.png', url: 'game-diamond.html', badge: 'hot', category: 'slots' },
        { id: 26, name: '西部淘金', provider: 'GoldenFortune', image: 'images/games/wild_west.png', url: 'game-western.html', badge: '', category: 'slots' },
        { id: 27, name: '海盗宝藏', provider: 'GoldenFortune', image: 'images/games/pirate_bounty.png', url: 'game-pirate.html', badge: 'hot', category: 'slots' },
        { id: 28, name: '埃及法老', provider: 'GoldenFortune', image: 'images/games/pharaoh_fortune.png', url: 'game-pharaoh.html', badge: 'new', category: 'slots' },
        { id: 29, name: '阿兹特克宝藏', provider: 'GoldenFortune', image: 'images/games/aztec_gold.png', url: 'game-pharaoh.html', badge: '', category: 'slots' },
        { id: 30, name: '太阳神殿', provider: 'GoldenFortune', image: 'images/games/pharaoh_fortune.png', url: 'game-pharaoh.html', badge: '', category: 'slots' },

        { id: 37, name: '星际探险', provider: 'StarVegas', image: 'images/games/cosmic_spin.png', url: 'game-diamond.html', badge: 'hot', category: 'slots' },
        { id: 38, name: '神秘狼', provider: 'StarVegas', image: 'images/games/mystic_wolf.png', url: 'game-icedragon.html', badge: '', category: 'slots' },
        { id: 43, name: '宇宙大奖', provider: 'StarVegas', image: 'images/games/cosmic_spin.png', url: 'game-diamond.html', badge: '', category: 'slots' },

        { id: 49, name: '火焰传说', provider: 'PhoenixSlots', image: 'images/games/phoenix_rising.png', url: 'game-phoenix.html', badge: 'hot', category: 'slots' },
        { id: 51, name: '火焰山', provider: 'PhoenixSlots', image: 'images/games/journey_west.png', url: 'game-journey.html', badge: 'new', category: 'slots' },

        // === FISHING GAMES ===
        { id: 8, name: '龙门跃鲤', provider: 'DragonGaming', image: 'images/games/golden_fish.png', url: 'game-fishing.html', badge: 'hot', category: 'fishing' },
        { id: 9, name: '海王捕鱼', provider: 'DragonGaming', image: 'images/games/ocean_king.png', url: 'game-fishing.html', badge: 'hot', category: 'fishing' },
        { id: 23, name: '幸运捕鱼', provider: 'LuckyStudio', image: 'images/games/golden_fish.png', url: 'game-fishing.html', badge: '', category: 'fishing' },
        { id: 35, name: '金鲨银鲨', provider: 'GoldenFortune', image: 'images/games/ocean_king.png', url: 'game-fishing.html', badge: 'new', category: 'fishing' },
        { id: 47, name: '星际捕鱼', provider: 'StarVegas', image: 'images/games/ocean_king.png', url: 'game-fishing.html', badge: '', category: 'fishing' },
        { id: 59, name: '烈火捕鱼', provider: 'PhoenixSlots', image: 'images/games/golden_fish.png', url: 'game-fishing.html', badge: '', category: 'fishing' },

        // === LOTTERY GAMES ===
        { id: 12, name: '4D 万字', provider: 'DragonGaming', image: 'images/games/fortune_wheel.png', url: 'game-lottery.html', badge: 'hot', category: 'lottery' },
        { id: 24, name: '幸运刮刮卡', provider: 'LuckyStudio', image: 'images/games/aztec_gold.png', url: 'game-scratch.html', badge: 'new', category: 'lottery' },
        { id: 46, name: '宇宙彩票', provider: 'StarVegas', image: 'images/games/cosmic_spin.png', url: 'game-lottery.html', badge: '', category: 'lottery' },
        { id: 60, name: '凤凰竞猜', provider: 'PhoenixSlots', image: 'images/games/fortune_wheel.png', url: 'game-lottery.html', badge: 'hot', category: 'lottery' },

        // === FAST GAMES ===
        { id: 10, name: '幸运转盘', provider: 'DragonGaming', image: 'images/games/fortune_wheel.png', url: 'game-wheel.html', badge: 'hot', category: 'fast' },
        { id: 11, name: '骰宝', provider: 'DragonGaming', image: 'images/games/wild_west.png', url: 'game-dice.html', badge: '', category: 'fast' },
        { id: 16, name: '幸运转盘+', provider: 'LuckyStudio', image: 'images/games/fortune_wheel.png', url: 'game-wheel.html', badge: '', category: 'fast' },
        { id: 17, name: '幸运骰子', provider: 'LuckyStudio', image: 'images/games/mystic_wolf.png', url: 'game-dice.html', badge: '', category: 'fast' },
        { id: 31, name: '金币瀑布', provider: 'GoldenFortune', image: 'images/games/fortune_wheel.png', url: 'game-wheel.html', badge: '', category: 'fast' },
        { id: 36, name: '黄金竞速', provider: 'GoldenFortune', image: 'images/games/diamond_mine.png', url: 'game-dice.html', badge: '', category: 'fast' },
        { id: 48, name: '星星消消乐', provider: 'StarVegas', image: 'images/games/fruit_fortune.png', url: 'game-scratch.html', badge: 'new', category: 'fast' },
    ],

    async init() {
        const user = await Auth.getCurrentUser();
        if (!user) { window.location.href = 'index.html'; return; }

        this.updateUserInfo(user);
        this.renderProviders();
        this.renderGames();
        this.startSlider();
        this.setupEventListeners();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        this.animateStats();
    },

    updateUserInfo(user) {
        const balance = parseFloat(user.balance || 0);
        const username = user.username || '用户';

        const navBalance = document.getElementById('navBalance');
        if (navBalance) navBalance.textContent = '$' + balance.toLocaleString();

        const navUsername = document.getElementById('navUsername');
        if (navUsername) navUsername.textContent = username;

        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) userAvatar.textContent = username.charAt(0).toUpperCase();

        const vipBadge = document.getElementById('navVipBadge');
        const vipInfo = this.getVipInfo(user.vip_level || 'bronze');
        if (vipBadge) {
            vipBadge.innerHTML = `<span class="vip-icon">${vipInfo.icon}</span><span class="vip-text">${vipInfo.name}</span>`;
            vipBadge.style.background = vipInfo.gradient;
        }
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

    renderProviders() {
        const container = document.querySelector('.providers-grid');
        if (!container) return;

        container.innerHTML = '';
        Object.entries(this.PROVIDERS).forEach(([key, provider]) => {
            const card = document.createElement('div');
            card.className = 'provider-card';
            card.style.cursor = 'pointer';
            card.onclick = () => this.filterByProvider(key);
            card.innerHTML = `<span class="provider-logo">${provider.logo}</span><span class="provider-name">${provider.name}</span>`;
            container.appendChild(card);
        });
    },

    renderGames(filter = 'all') {
        const grid = document.getElementById('gameGrid');
        if (!grid) return;

        grid.innerHTML = '';

        let games = this.GAMES;
        if (filter !== 'all' && filter !== 'recommended') {
            games = this.GAMES.filter(g => g.category === filter || g.provider === filter);
        }

        games.forEach(game => {
            const provider = this.PROVIDERS[game.provider];
            const card = document.createElement('div');
            card.className = 'game-card';
            card.onclick = () => this.playGame(game);

            card.innerHTML = `
        ${game.badge ? `<span class="game-badge ${game.badge}">${game.badge.toUpperCase()}</span>` : ''}
        <div class="game-card-image">
          <img src="${game.image}" alt="${game.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="game-placeholder" style="display:none;">🎰</div>
        </div>
        <div class="game-card-info">
          <div class="game-card-name">${game.name}</div>
          <div class="game-card-provider">${provider ? provider.name : game.provider}</div>
        </div>
        <div class="play-overlay"><div class="play-btn">▶</div></div>
      `;

            grid.appendChild(card);
        });
    },

    filterByProvider(provider) {
        this.currentCategory = provider;
        this.renderGames(provider);
        document.querySelectorAll('.game-tab').forEach(t => t.classList.remove('active'));
        Auth.showNotification('显示 ' + this.PROVIDERS[provider].name + ' 的游戏', 'info');
    },

    filterByCategory(category) {
        this.currentCategory = category;
        this.renderGames(category);
    },

    playGame(game) { window.location.href = game.url; },

    startSlider() { this.slideInterval = setInterval(() => this.nextSlide(), 5000); },

    nextSlide() {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        if (slides.length === 0) return;
        slides[this.currentSlide].classList.remove('active');
        dots[this.currentSlide]?.classList.remove('active');
        this.currentSlide = (this.currentSlide + 1) % slides.length;
        slides[this.currentSlide].classList.add('active');
        dots[this.currentSlide]?.classList.add('active');
    },

    goToSlide(index) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        if (slides.length === 0) return;
        slides[this.currentSlide].classList.remove('active');
        dots[this.currentSlide]?.classList.remove('active');
        this.currentSlide = index;
        slides[this.currentSlide].classList.add('active');
        dots[this.currentSlide]?.classList.add('active');
        clearInterval(this.slideInterval);
        this.startSlider();
    },

    setupEventListeners() {
        document.querySelectorAll('.dot').forEach((dot, i) => {
            dot.addEventListener('click', () => this.goToSlide(i));
        });

        document.querySelectorAll('.game-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.game-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentCategory = tab.dataset.category;
                this.renderGames(tab.dataset.category);
            });
        });

        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = tab.dataset.category;
                // Only prevent default for category filters, not for actual links
                if (category) {
                    e.preventDefault();
                    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    this.filterByCategory(category);
                    document.querySelector('.games-section')?.scrollIntoView({ behavior: 'smooth' });
                }
                // If no category, allow normal link navigation (promotions, vip, etc.)
            });
        });
    },

    updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleString('zh-CN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        }) + ' (GMT+8)';
        const el = document.getElementById('currentTime');
        if (el) el.textContent = timeStr;
    },

    animateStats() {
        const onlineEl = document.getElementById('onlineUsers');
        if (onlineEl) {
            setInterval(() => {
                const current = parseInt(onlineEl.textContent.replace(/,/g, ''));
                const change = Math.floor(Math.random() * 100) - 50;
                const newValue = Math.max(10000, current + change);
                onlineEl.textContent = newValue.toLocaleString();
            }, 3000);
        }
    }
};

function changeSlide(dir) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return;
    slides[Lobby.currentSlide].classList.remove('active');
    dots[Lobby.currentSlide]?.classList.remove('active');
    Lobby.currentSlide = (Lobby.currentSlide + dir + slides.length) % slides.length;
    slides[Lobby.currentSlide].classList.add('active');
    dots[Lobby.currentSlide]?.classList.add('active');
    clearInterval(Lobby.slideInterval);
    Lobby.startSlider();
}

function toggleUserMenu() { document.getElementById('userDropdown')?.classList.toggle('active'); }

document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) document.getElementById('userDropdown')?.classList.remove('active');
});

async function refreshBalance() {
    const user = await Auth.getCurrentUser();
    if (user) {
        document.getElementById('navBalance').textContent = '$' + parseFloat(user.balance || 0).toLocaleString();
        Auth.showNotification('余额已刷新', 'success');
    }
}

function loadMoreGames() { Auth.showNotification('已显示全部 ' + Lobby.GAMES.length + ' 款游戏！', 'info'); }
function openChat() { Auth.showNotification('客服功能即将上线！', 'info'); }
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

function goToCategory(category) {
    Lobby.filterByCategory(category);
    const names = { slots: '🎰 老虎机', fishing: '🐟 捕鱼游戏', lottery: '🎱 彩票游戏', fast: '⚡ 快速游戏', all: '全部游戏' };
    Auth.showNotification('显示 ' + (names[category] || category), 'info');
    document.querySelector('.games-section')?.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => Lobby.init());
