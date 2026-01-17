-- LuckyDragon Casino - 管理后台数据库更新
-- 请在 Supabase SQL Editor 中运行此代码
-- https://supabase.com/dashboard/project/uiiitnakstwbxgaykmkx/sql/new

-- ================================================
-- 添加缺失的列到 users 表
-- ================================================

-- 添加 RTP 列 (玩家个人RTP设置)
ALTER TABLE users ADD COLUMN IF NOT EXISTS rtp INTEGER DEFAULT 95;

-- 添加 email 列
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 添加 status 列 (用于封禁玩家)
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- ================================================
-- 更新 RLS 政策确保可以更新
-- ================================================

DROP POLICY IF EXISTS "Allow all for users" ON users;
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true) WITH CHECK (true);

-- ================================================
-- 完成! 运行后刷新 Admin 页面
-- ================================================
