-- LuckyDragon Casino - Complete Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard

-- ============================================
-- 1. USERS TABLE (核心用户表)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  balance DECIMAL(15,2) DEFAULT 10000.00,
  vip_level VARCHAR(20) DEFAULT 'bronze',
  vip_points INTEGER DEFAULT 0,
  rtp INTEGER DEFAULT 95,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Add columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='rtp') THEN
    ALTER TABLE users ADD COLUMN rtp INTEGER DEFAULT 95;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email') THEN
    ALTER TABLE users ADD COLUMN email VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='status') THEN
    ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';
  END IF;
END $$;

-- ============================================
-- 2. TRANSACTIONS TABLE (交易记录)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. DAILY CHECKINS TABLE (每日签到)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  check_date DATE NOT NULL,
  streak INTEGER DEFAULT 1,
  reward DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, check_date)
);

-- ============================================
-- 4. PROMOTIONS TABLE (优惠活动)
-- ============================================
CREATE TABLE IF NOT EXISTS promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  bonus_amount DECIMAL(15,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. GAME SESSIONS TABLE (游戏记录)
-- ============================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_type VARCHAR(50) NOT NULL,
  bet_amount DECIMAL(15,2),
  win_amount DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. INDEXES (索引优化)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_id ON daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);

-- ============================================
-- 7. ROW LEVEL SECURITY (行级安全)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Allow all for users" ON users;
DROP POLICY IF EXISTS "Allow all for transactions" ON transactions;
DROP POLICY IF EXISTS "Allow all for daily_checkins" ON daily_checkins;
DROP POLICY IF EXISTS "Allow all for game_sessions" ON game_sessions;
DROP POLICY IF EXISTS "Allow read promotions" ON promotions;

CREATE POLICY "Allow all for users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for daily_checkins" ON daily_checkins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for game_sessions" ON game_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow read promotions" ON promotions FOR SELECT USING (true);

-- ============================================
-- 8. INSERT DEMO DATA
-- ============================================
INSERT INTO users (username, password, balance, vip_level, vip_points, rtp, status)
VALUES ('demo', 'demo123', 10000.00, 'gold', 5000, 95, 'active')
ON CONFLICT (username) DO NOTHING;

INSERT INTO promotions (name, description, bonus_amount, is_active)
VALUES 
  ('新用户注册奖励', '注册即送 $10,000 体验金', 10000, true),
  ('每日签到', '连续签到7天最高获得 $3,000', 0, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- DONE! Admin panel should now work completely
-- ============================================
