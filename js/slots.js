// LuckyDragon - Slot Machine Engine
const SlotEngine = {
    // Symbol definitions
    SYMBOLS: ['🐉', '💎', '7️⃣', '🍀', '⭐', '🔔', '🍒', '🍋'],

    // Symbol payouts (matches 3,4,5 symbols)
    PAYOUTS: {
        '🐉': [10, 25, 100],  // Dragon - highest
        '💎': [8, 20, 75],
        '7️⃣': [6, 15, 50],
        '🍀': [5, 12, 40],
        '⭐': [4, 10, 30],
        '🔔': [3, 8, 25],
        '🍒': [2, 5, 15],
        '🍋': [1, 3, 10]
    },

    // Generate random symbol
    getRandomSymbol() {
        // Weighted - lower value symbols more common
        const weights = [5, 8, 10, 12, 15, 18, 20, 25];
        const total = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * total;

        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) return this.SYMBOLS[i];
        }
        return this.SYMBOLS[this.SYMBOLS.length - 1];
    },

    // Generate reel strip
    generateReelStrip(length = 20) {
        return Array(length).fill(0).map(() => this.getRandomSymbol());
    },

    // Spin reels and get result
    spin(numReels = 5, numRows = 3) {
        const result = [];
        for (let r = 0; r < numReels; r++) {
            const reel = [];
            for (let row = 0; row < numRows; row++) {
                reel.push(this.getRandomSymbol());
            }
            result.push(reel);
        }
        return result;
    },

    // Check for wins on paylines
    checkWins(reels, bet) {
        const wins = [];
        const numRows = reels[0].length;

        // Check horizontal lines
        for (let row = 0; row < numRows; row++) {
            const line = reels.map(reel => reel[row]);
            const win = this.checkLine(line, bet);
            if (win) wins.push({ type: 'line', row, ...win });
        }

        return wins;
    },

    // Check a single line for wins
    checkLine(symbols, bet) {
        const first = symbols[0];
        let count = 1;

        for (let i = 1; i < symbols.length; i++) {
            if (symbols[i] === first) count++;
            else break;
        }

        if (count >= 3) {
            const payout = this.PAYOUTS[first];
            const multiplier = payout[count - 3] || payout[2];
            return {
                symbol: first,
                count,
                payout: bet * multiplier
            };
        }
        return null;
    },

    // Calculate total wins
    calculateTotalWin(wins) {
        return wins.reduce((sum, w) => sum + w.payout, 0);
    }
};

window.SlotEngine = SlotEngine;
