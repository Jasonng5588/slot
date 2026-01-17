// LuckyDragon - Dragon Megaways Slot Game (Themed Symbols)
const MegawaysGame = {
    // Use themed symbol characters with CSS styling
    SYMBOLS: [
        { id: 'dragon', name: '龙', img: 'images/symbols/dragon.png', value: 100, color: '#FFD700' },
        { id: 'diamond', name: '钻', img: null, value: 75, color: '#00D4FF', char: '💎' },
        { id: 'seven', name: '7', img: null, value: 50, color: '#FF4444', char: '7' },
        { id: 'clover', name: '福', img: null, value: 40, color: '#00D26A', char: '福' },
        { id: 'star', name: '星', img: null, value: 30, color: '#8B5CF6', char: '★' },
        { id: 'bell', name: '铃', img: null, value: 25, color: '#FFC107', char: '🔔' },
        { id: 'cherry', name: '樱', img: null, value: 15, color: '#FF1744', char: '🍒' },
        { id: 'coin', name: '币', img: null, value: 10, color: '#FFD700', char: '💰' }
    ],
    NUM_REELS: 6,
    MIN_ROWS: 2,
    MAX_ROWS: 7,

    bet: 10,
    betOptions: [1, 2, 5, 10, 20, 50, 100, 200],
    betIndex: 3,
    isSpinning: false,
    autoSpinCount: 0,
    multiplier: 1,
    currentWin: 0,
    user: null,
    reels: [],

    async init() {
        this.user = await Auth.getCurrentUser();
        if (!this.user) {
            window.location.href = 'index.html';
            return;
        }

        this.updateBalanceDisplay();
        this.generateReels();
        this.renderReels();
        this.setupControls();
    },

    generateReels() {
        this.reels = [];
        let totalWays = 1;

        for (let r = 0; r < this.NUM_REELS; r++) {
            const numRows = this.MIN_ROWS + Math.floor(Math.random() * (this.MAX_ROWS - this.MIN_ROWS + 1));
            totalWays *= numRows;
            const symbols = [];
            for (let i = 0; i < numRows; i++) {
                symbols.push(this.getRandomSymbol());
            }
            this.reels.push(symbols);
        }

        document.getElementById('waysDisplay').textContent = totalWays.toLocaleString();
    },

    getRandomSymbol() {
        const weights = [3, 5, 8, 10, 15, 18, 22, 28];
        const total = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (let i = 0; i < weights.length; i++) {
            r -= weights[i];
            if (r <= 0) return this.SYMBOLS[i];
        }
        return this.SYMBOLS[this.SYMBOLS.length - 1];
    },

    renderReels() {
        const container = document.getElementById('reelsContainer');
        container.innerHTML = '';

        this.reels.forEach((reel, reelIdx) => {
            const reelEl = document.createElement('div');
            reelEl.className = 'megaways-reel';
            reelEl.dataset.reel = reelIdx;

            reel.forEach((symbol, rowIdx) => {
                const symbolEl = document.createElement('div');
                symbolEl.className = 'megaways-symbol themed-symbol';
                symbolEl.dataset.row = rowIdx;
                symbolEl.style.setProperty('--symbol-color', symbol.color);

                if (symbol.img) {
                    // Use image for dragon symbol
                    symbolEl.innerHTML = `<img src="${symbol.img}" alt="${symbol.name}" class="symbol-img">`;
                } else if (symbol.char) {
                    // Use styled character
                    symbolEl.innerHTML = `<span class="symbol-char" style="color: ${symbol.color}">${symbol.char}</span>`;
                }

                reelEl.appendChild(symbolEl);
            });

            container.appendChild(reelEl);
        });
    },

    setupControls() {
        document.getElementById('spinBtn').addEventListener('click', () => this.spin());
        document.getElementById('betUp').addEventListener('click', () => this.changeBet(1));
        document.getElementById('betDown').addEventListener('click', () => this.changeBet(-1));
        document.getElementById('autoSpinBtn').addEventListener('click', () => this.toggleAutoSpin());
    },

    changeBet(dir) {
        this.betIndex = Math.max(0, Math.min(this.betOptions.length - 1, this.betIndex + dir));
        this.bet = this.betOptions[this.betIndex];
        document.getElementById('betAmount').textContent = '$' + this.bet;
    },

    async spin() {
        if (this.isSpinning) return;

        // Refresh user data
        this.user = await Auth.getCurrentUser();
        const balance = parseFloat(this.user.balance || 0);

        if (balance < this.bet) {
            Auth.showNotification('余额不足！', 'error');
            return;
        }

        this.isSpinning = true;
        this.currentWin = 0;
        this.multiplier = 1;
        document.getElementById('winDisplay').textContent = '$0';
        document.getElementById('multiplierDisplay').textContent = '1x';
        document.getElementById('spinBtn').disabled = true;

        // Deduct bet
        await Wallet.updateBalance(this.user.id, -this.bet);
        await Wallet.addVipPoints(this.user.id, Math.floor(this.bet));
        this.user = await Auth.getCurrentUser();
        this.updateBalanceDisplay();

        // Animate
        await this.animateSpin();

        // Check wins
        const wins = this.checkMegawaysWins();
        if (wins.length > 0) {
            await this.processCascade(wins);
        }

        document.getElementById('spinBtn').disabled = false;
        this.isSpinning = false;

        // Auto spin
        if (this.autoSpinCount > 0) {
            this.autoSpinCount--;
            if (this.autoSpinCount > 0) {
                setTimeout(() => this.spin(), 500);
            } else {
                document.getElementById('autoSpinBtn').classList.remove('active');
                document.getElementById('autoSpinBtn').textContent = '自动 ×10';
            }
        }
    },

    async animateSpin() {
        return new Promise(resolve => {
            let spins = 0;
            const interval = setInterval(() => {
                this.generateReels();
                this.renderReels();
                spins++;
                if (spins >= 15) {
                    clearInterval(interval);
                    resolve();
                }
            }, 80);
        });
    },

    checkMegawaysWins() {
        const wins = [];
        const firstSymbols = this.reels.map(r => r[0]);

        for (let sym of this.SYMBOLS) {
            let count = 0;
            for (let i = 0; i < firstSymbols.length; i++) {
                if (firstSymbols[i].id === sym.id) count++;
                else break;
            }
            if (count >= 3) {
                wins.push({ symbol: sym, count, payout: this.bet * sym.value * (count - 2) });
                break;
            }
        }
        return wins;
    },

    async processCascade(wins) {
        for (const win of wins) {
            this.currentWin += win.payout * this.multiplier;

            document.querySelectorAll('.megaways-reel').forEach((reel, i) => {
                if (i < win.count) {
                    reel.querySelector('.megaways-symbol').classList.add('winning');
                }
            });

            await this.delay(800);

            document.getElementById('winDisplay').textContent = '$' + this.currentWin.toLocaleString();
            await Wallet.updateBalance(this.user.id, win.payout * this.multiplier);
            this.user = await Auth.getCurrentUser();
            this.updateBalanceDisplay();

            if (this.currentWin >= this.bet * 20) {
                this.showBigWin(this.currentWin);
            }

            this.multiplier++;
            document.getElementById('multiplierDisplay').textContent = this.multiplier + 'x';

            await this.delay(300);
            this.generateReels();
            this.renderReels();
        }
    },

    delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    },

    showBigWin(amount) {
        const overlay = document.getElementById('bigWinOverlay');
        document.getElementById('bigWinTitle').textContent = amount >= this.bet * 50 ? 'MEGA WIN!' : 'BIG WIN!';
        document.getElementById('bigWinAmount').textContent = '$' + amount.toLocaleString();
        overlay.classList.add('active');
    },

    toggleAutoSpin() {
        if (this.autoSpinCount > 0) {
            this.autoSpinCount = 0;
            document.getElementById('autoSpinBtn').classList.remove('active');
            document.getElementById('autoSpinBtn').textContent = '自动 ×10';
        } else {
            this.autoSpinCount = 10;
            document.getElementById('autoSpinBtn').classList.add('active');
            document.getElementById('autoSpinBtn').textContent = '停止';
            if (!this.isSpinning) this.spin();
        }
    },

    updateBalanceDisplay() {
        const bal = '$' + parseFloat(this.user?.balance || 0).toLocaleString();
        document.getElementById('balanceDisplay').textContent = bal;
        document.getElementById('gameBalance').textContent = bal;
    }
};

function showPaytable() { document.getElementById('paytableModal').classList.add('active'); }
function closePaytable() { document.getElementById('paytableModal').classList.remove('active'); }
function closeBigWin() { document.getElementById('bigWinOverlay').classList.remove('active'); }

document.addEventListener('DOMContentLoaded', () => MegawaysGame.init());
