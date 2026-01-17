// LuckyDragon - Classic 777 Slot Game (Themed Symbols Edition with RTP)
const ClassicSlot = {
    // 主题化符号 - 使用中文字符和CSS样式代替emoji
    SYMBOLS: [
        { id: 'lucky7', char: '7', color: '#FF4444', name: '幸运7', value: 100, glow: true, isHigh: true },
        { id: 'dragon', char: '龙', color: '#FFD700', name: '金龙', value: 80, glow: true, isHigh: true },
        { id: 'diamond', char: '◆', color: '#00D4FF', name: '钻石', value: 60, glow: false, isHigh: true },
        { id: 'star', char: '★', color: '#FFD700', name: '金星', value: 40, glow: false },
        { id: 'bell', char: '🔔', color: '#FFC107', name: '金铃', value: 30, glow: false },
        { id: 'bar', char: 'BAR', color: '#8B5CF6', name: 'BAR', value: 25, glow: false },
        { id: 'cherry', char: '🍒', color: '#FF1744', name: '樱桃', value: 20, glow: false },
        { id: 'orange', char: '🍊', color: '#FF9800', name: '橙子', value: 15, glow: false },
        { id: 'lemon', char: '🍋', color: '#FFEB3B', name: '柠檬', value: 10, glow: false }
    ],

    NUM_REELS: 3,
    ROWS_PER_REEL: 3,

    bet: 10,
    betOptions: [5, 10, 20, 50, 100],
    betIndex: 1,
    isSpinning: false,
    user: null,
    reelPositions: [0, 0, 0],
    playerRtp: 95,

    async init() {
        this.user = await Auth.getCurrentUser();
        if (!this.user) {
            window.location.href = 'index.html';
            return;
        }

        // Load player's RTP
        if (typeof RTPManager !== 'undefined') {
            await RTPManager.init();
            this.playerRtp = RTPManager.getEffectiveRtp();
        }

        this.updateBalanceDisplay();
        this.renderReels();
        this.setupControls();
    },

    // RTP-adjusted random symbol
    getRandomSymbol() {
        const rtp = this.playerRtp;
        let adjustedSymbols = this.SYMBOLS.map(s => {
            let weight = 100 - s.value; // Base weight inversely proportional to value
            if (s.isHigh) {
                // High value symbols: increase with higher RTP
                weight = weight * (1 + (rtp - 70) / 100);
            } else {
                // Low value symbols: decrease with higher RTP
                weight = weight * (1 - (rtp - 70) / 200);
            }
            return { ...s, adjustedWeight: Math.max(1, weight) };
        });

        const total = adjustedSymbols.reduce((a, s) => a + s.adjustedWeight, 0);
        let r = Math.random() * total;
        for (const sym of adjustedSymbols) {
            r -= sym.adjustedWeight;
            if (r <= 0) return sym;
        }
        return this.SYMBOLS[this.SYMBOLS.length - 1];
    },

    renderReels() {
        for (let r = 0; r < this.NUM_REELS; r++) {
            const reelInner = document.querySelector(`#reel${r} .reel-inner`);
            if (!reelInner) continue;

            reelInner.innerHTML = '';

            // Generate multiple symbols for each reel
            for (let i = 0; i < 20; i++) {
                const sym = this.getRandomSymbol();
                const symbolEl = document.createElement('div');
                symbolEl.className = 'symbol themed-slot-symbol';
                symbolEl.dataset.symbolId = sym.id;
                symbolEl.style.setProperty('--symbol-color', sym.color);

                symbolEl.innerHTML = `
                    <span class="symbol-content ${sym.glow ? 'glow' : ''}" style="color: ${sym.color}">
                        ${sym.char}
                    </span>
                `;

                reelInner.appendChild(symbolEl);
            }
        }
    },

    setupControls() {
        document.getElementById('spinBtn').addEventListener('click', () => this.spin());
        document.getElementById('betUp')?.addEventListener('click', () => this.changeBet(1));
        document.getElementById('betDown')?.addEventListener('click', () => this.changeBet(-1));
    },

    changeBet(dir) {
        this.betIndex = Math.max(0, Math.min(this.betOptions.length - 1, this.betIndex + dir));
        this.bet = this.betOptions[this.betIndex];
        const betEl = document.getElementById('betAmount');
        const betDisplay = document.getElementById('betDisplay');
        if (betEl) betEl.textContent = '$' + this.bet;
        if (betDisplay) betDisplay.textContent = '$' + this.bet;
    },

    async spin() {
        if (this.isSpinning) return;

        this.user = await Auth.getCurrentUser();
        const balance = parseFloat(this.user?.balance || 0);

        if (balance < this.bet) {
            Auth.showNotification('余额不足！', 'error');
            return;
        }

        this.isSpinning = true;
        document.getElementById('spinBtn').disabled = true;
        document.getElementById('winDisplay').textContent = '$0';

        // Deduct bet
        await Wallet.updateBalance(this.user.id, -this.bet);
        await Wallet.addVipPoints(this.user.id, Math.floor(this.bet));
        this.user = await Auth.getCurrentUser();
        this.updateBalanceDisplay();

        // Spin animation
        await this.animateSpin();

        // Check for wins
        const win = this.checkWins();
        if (win > 0) {
            await Wallet.updateBalance(this.user.id, win);
            this.user = await Auth.getCurrentUser();
            this.updateBalanceDisplay();
            document.getElementById('winDisplay').textContent = '$' + win.toLocaleString();

            if (win >= this.bet * 10) {
                this.showBigWin(win);
            } else {
                Auth.showNotification(`🎉 恭喜赢得 $${win}！`, 'success');
            }
        }

        document.getElementById('spinBtn').disabled = false;
        this.isSpinning = false;
    },

    async animateSpin() {
        return new Promise(resolve => {
            const reels = document.querySelectorAll('.reel');
            reels.forEach(reel => reel.classList.add('spinning'));

            // Regenerate symbols during spin
            let spins = 0;
            const interval = setInterval(() => {
                for (let r = 0; r < this.NUM_REELS; r++) {
                    const reelInner = document.querySelector(`#reel${r} .reel-inner`);
                    if (reelInner) {
                        reelInner.innerHTML = '';
                        for (let i = 0; i < 20; i++) {
                            const sym = this.getRandomSymbol();
                            const symbolEl = document.createElement('div');
                            symbolEl.className = 'symbol themed-slot-symbol';
                            symbolEl.dataset.symbolId = sym.id;
                            symbolEl.style.setProperty('--symbol-color', sym.color);
                            symbolEl.innerHTML = `
                                <span class="symbol-content ${sym.glow ? 'glow' : ''}" style="color: ${sym.color}">
                                    ${sym.char}
                                </span>
                            `;
                            reelInner.appendChild(symbolEl);
                        }
                    }
                }
                spins++;
                if (spins >= 10) {
                    clearInterval(interval);
                    reels.forEach(reel => reel.classList.remove('spinning'));
                    resolve();
                }
            }, 100);
        });
    },

    checkWins() {
        // Get center row symbols
        const centerSymbols = [];
        for (let r = 0; r < this.NUM_REELS; r++) {
            const symbols = document.querySelectorAll(`#reel${r} .symbol`);
            if (symbols.length >= 2) {
                centerSymbols.push(symbols[1].dataset.symbolId);
            }
        }

        // Apply RTP multiplier to wins
        const rtpMultiplier = this.playerRtp / 95;

        // Check if all same
        if (centerSymbols.length === 3 && centerSymbols[0] === centerSymbols[1] && centerSymbols[1] === centerSymbols[2]) {
            const sym = this.SYMBOLS.find(s => s.id === centerSymbols[0]);
            if (sym) {
                // Mark winning symbols
                document.querySelectorAll('.symbol').forEach((el, idx) => {
                    if (idx % 20 === 1) el.classList.add('winning');
                });
                return Math.floor(this.bet * (sym.value / 10) * rtpMultiplier);
            }
        }

        // Check for any 2 matching
        if (centerSymbols[0] === centerSymbols[1] || centerSymbols[1] === centerSymbols[2]) {
            return Math.floor(this.bet * 0.5 * rtpMultiplier);
        }

        return 0;
    },

    showBigWin(amount) {
        const overlay = document.getElementById('bigWinOverlay');
        document.getElementById('bigWinAmount').textContent = '$' + amount.toLocaleString();
        overlay.classList.add('active');
    },

    updateBalanceDisplay() {
        const bal = '$' + parseFloat(this.user?.balance || 0).toLocaleString();
        document.getElementById('balanceDisplay').textContent = bal;
        document.getElementById('gameBalance').textContent = bal;
    }
};

function closeBigWin() {
    document.getElementById('bigWinOverlay').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => ClassicSlot.init());

