// LuckyDragon - Wallet System (Real Database)
const Wallet = {
    // Get user balance from database
    async getBalance(userId) {
        const supabase = getSupabase();
        if (!supabase) return 0;

        try {
            const { data, error } = await supabase
                .from('users')
                .select('balance')
                .eq('id', userId)
                .single();

            if (error || !data) return 0;
            return parseFloat(data.balance) || 0;
        } catch (e) {
            console.error('Get balance error:', e);
            return 0;
        }
    },

    // Update user balance in database
    async updateBalance(userId, amount) {
        const supabase = getSupabase();
        if (!supabase) return null;

        try {
            // Get current balance
            const { data: user } = await supabase
                .from('users')
                .select('balance')
                .eq('id', userId)
                .single();

            if (!user) return null;

            const newBalance = Math.max(0, parseFloat(user.balance) + amount);

            // Update balance
            const { data, error } = await supabase
                .from('users')
                .update({ balance: newBalance })
                .eq('id', userId)
                .select('balance')
                .single();

            if (error) {
                console.error('Update balance error:', error);
                return null;
            }

            // Record transaction
            await this.recordTransaction(userId, amount > 0 ? 'credit' : 'debit', Math.abs(amount), amount > 0 ? '奖励/存款' : '游戏投注');

            return parseFloat(data.balance);
        } catch (e) {
            console.error('Update balance exception:', e);
            return null;
        }
    },

    // Add VIP points
    async addVipPoints(userId, points) {
        const supabase = getSupabase();
        if (!supabase) return null;

        try {
            const { data: user } = await supabase
                .from('users')
                .select('vip_points, vip_level')
                .eq('id', userId)
                .single();

            if (!user) return null;

            const newPoints = (user.vip_points || 0) + points;
            const newLevel = this.calculateVipLevel(newPoints);

            await supabase
                .from('users')
                .update({ vip_points: newPoints, vip_level: newLevel })
                .eq('id', userId);

            return { points: newPoints, level: newLevel };
        } catch (e) {
            console.error('Add VIP points error:', e);
            return null;
        }
    },

    // Calculate VIP level based on points
    calculateVipLevel(points) {
        if (points >= 100000) return 'diamond';
        if (points >= 50000) return 'platinum';
        if (points >= 20000) return 'gold';
        if (points >= 5000) return 'silver';
        return 'bronze';
    },

    // Record transaction
    async recordTransaction(userId, type, amount, description) {
        const supabase = getSupabase();
        if (!supabase) return;

        try {
            await supabase
                .from('transactions')
                .insert({
                    user_id: userId,
                    type: type,
                    amount: amount,
                    description: description,
                    status: 'completed',
                    created_at: new Date().toISOString()
                });
        } catch (e) {
            console.error('Record transaction error:', e);
        }
    },

    // Get transaction history
    async getTransactions(userId, limit = 20) {
        const supabase = getSupabase();
        if (!supabase) return [];

        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) return [];
            return data || [];
        } catch (e) {
            return [];
        }
    },

    // Process deposit (placeholder for payment integration)
    async processDeposit(userId, amount, method) {
        // TODO: Integrate with Stripe/PayPal/etc
        // For now, just add to balance after "payment"
        console.log(`Processing deposit: $${amount} via ${method}`);

        const newBalance = await this.updateBalance(userId, amount);
        return {
            success: true,
            balance: newBalance,
            message: `成功充值 $${amount}`
        };
    },

    // Process withdrawal (placeholder)
    async processWithdraw(userId, amount, bankDetails) {
        // TODO: Integrate with payment gateway
        console.log(`Processing withdrawal: $${amount}`);

        const balance = await this.getBalance(userId);
        if (balance < amount) {
            return { success: false, error: '余额不足' };
        }

        // Deduct balance
        const newBalance = await this.updateBalance(userId, -amount);

        // Record pending withdrawal
        const supabase = getSupabase();
        if (supabase) {
            await supabase.from('transactions').insert({
                user_id: userId,
                type: 'withdrawal',
                amount: amount,
                description: `提现到 ${bankDetails.bank}`,
                status: 'pending',
                created_at: new Date().toISOString()
            });
        }

        return {
            success: true,
            balance: newBalance,
            message: `提现申请已提交，$${amount} 预计 1-24 小时内到账`
        };
    }
};

window.Wallet = Wallet;
