// LuckyDragon RTP Manager - Controls win rates based on player RTP
// This module reads player RTP from Supabase and applies it to all games

const RTPManager = {
    playerRtp: 95, // Default RTP
    globalRtp: 95,
    gameRtps: {},
    loaded: false,

    async init() {
        await this.loadPlayerRtp();
        this.loaded = true;
        console.log('[RTPManager] Initialized - Player RTP:', this.playerRtp);
        return this.playerRtp;
    },

    async loadPlayerRtp() {
        try {
            // Get Supabase client
            if (typeof initSupabase === 'function') initSupabase();
            const client = typeof getSupabase === 'function' ? getSupabase() : null;
            if (!client) return;

            // Get current user from session
            const userId = sessionStorage.getItem('userId');
            if (!userId) return;

            // Fetch player RTP
            const { data } = await client.from('users').select('rtp').eq('id', userId).single();
            if (data && data.rtp) {
                this.playerRtp = data.rtp;
            }

            // Also load global RTP from localStorage (set by admin)
            const savedGlobal = localStorage.getItem('admin_globalRtp');
            if (savedGlobal) this.globalRtp = parseInt(savedGlobal);

            console.log('[RTPManager] Player RTP:', this.playerRtp, '/ Global:', this.globalRtp);
        } catch (e) {
            console.error('[RTPManager] Error:', e);
        }
    },

    // Get effective RTP for current player
    getEffectiveRtp() {
        // Player-specific RTP takes priority, otherwise use global
        return this.playerRtp || this.globalRtp || 95;
    },

    // Calculate if player should win based on RTP
    // RTP 95% means player wins back 95% of bet over long term
    // This translates to win frequency and win amounts
    shouldWin(baseChance = 0.3) {
        const rtp = this.getEffectiveRtp();

        // Adjust win chance based on RTP
        // Lower RTP = less wins, Higher RTP = more wins
        // RTP 70 = ~15% win rate, RTP 99 = ~45% win rate
        const adjustedChance = baseChance * (rtp / 95);

        return Math.random() < adjustedChance;
    },

    // Calculate win multiplier based on RTP
    getWinMultiplier(baseMultiplier) {
        const rtp = this.getEffectiveRtp();

        // Adjust multiplier based on RTP
        // Lower RTP = lower multipliers, Higher RTP = higher multipliers
        const rtpFactor = rtp / 95;
        return baseMultiplier * rtpFactor;
    },

    // Calculate payout based on RTP
    calculatePayout(bet, symbols, payTable) {
        const rtp = this.getEffectiveRtp();

        // Base payout from pay table
        let basePayout = 0;
        if (payTable && payTable[symbols]) {
            basePayout = payTable[symbols] * bet;
        }

        // Adjust based on RTP
        const rtpFactor = rtp / 95;
        return Math.floor(basePayout * rtpFactor);
    },

    // Get RTP-adjusted random outcome
    // For slot games: decides which symbols to show
    getAdjustedSymbols(symbolPool, reelCount = 3) {
        const rtp = this.getEffectiveRtp();
        const symbols = [];

        // Higher RTP = more chance of matching symbols
        const matchChance = (rtp - 50) / 100; // RTP 70 = 20% match, RTP 99 = 49% match

        for (let i = 0; i < reelCount; i++) {
            if (i > 0 && Math.random() < matchChance) {
                // Copy previous symbol for match
                symbols.push(symbols[i - 1]);
            } else {
                // Random symbol
                symbols.push(symbolPool[Math.floor(Math.random() * symbolPool.length)]);
            }
        }

        return symbols;
    },

    // For Megaways: get reel strip with RTP consideration
    getMegawaysReel(symbols, count) {
        const rtp = this.getEffectiveRtp();
        const reel = [];

        // Separate high and low value symbols
        const highValueSymbols = symbols.slice(0, 3);
        const lowValueSymbols = symbols.slice(3);
        const wildIndex = symbols.indexOf('🔮') >= 0 ? symbols.indexOf('🔮') : -1;

        // Higher RTP = more high value and wild symbols
        const highValueChance = 0.1 + (rtp - 70) / 200; // RTP 70 = 10%, RTP 99 = 24.5%
        const wildChance = (rtp - 70) / 500; // RTP 70 = 0%, RTP 99 = 5.8%

        for (let i = 0; i < count; i++) {
            const roll = Math.random();
            if (wildIndex >= 0 && roll < wildChance) {
                reel.push(symbols[wildIndex]);
            } else if (roll < highValueChance) {
                reel.push(highValueSymbols[Math.floor(Math.random() * highValueSymbols.length)]);
            } else {
                reel.push(lowValueSymbols[Math.floor(Math.random() * lowValueSymbols.length)]);
            }
        }

        return reel;
    },

    // Check for scatter trigger (for free spins)
    checkScatterTrigger(reels, scatterSymbol = '⭐') {
        let scatterCount = 0;

        reels.forEach(reel => {
            if (Array.isArray(reel)) {
                reel.forEach(s => { if (s === scatterSymbol) scatterCount++; });
            } else if (reel === scatterSymbol) {
                scatterCount++;
            }
        });

        // 3+ scatters trigger free spins
        return {
            triggered: scatterCount >= 3,
            count: scatterCount,
            freeSpins: scatterCount >= 5 ? 15 : scatterCount >= 4 ? 12 : scatterCount >= 3 ? 8 : 0
        };
    },

    // Get RTP info for display
    getRtpInfo() {
        return {
            playerRtp: this.playerRtp,
            globalRtp: this.globalRtp,
            effectiveRtp: this.getEffectiveRtp()
        };
    }
};

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
    window.RTPManager = RTPManager;
    document.addEventListener('DOMContentLoaded', () => {
        RTPManager.init();
    });
}
