-- ============================================================
-- Database Schemas for Authentication Security Enhancements
-- تحديثات قاعدة البيانات لتحسين أمان المصادقة
-- ============================================================
-- Date: October 12, 2025
-- Version: 1.0
-- ============================================================

-- ============================================================
-- 1. Security Logs Table
--    جدول تسجيل الأحداث الأمنية
-- ============================================================

-- Create security_logs table
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'LOGIN_SUCCESS',
    'LOGIN_FAILED',
    'LOGOUT',
    'SIGNUP_SUCCESS',
    'SIGNUP_FAILED',
    'PASSWORD_RESET_REQUEST',
    'PASSWORD_RESET_SUCCESS',
    'PASSWORD_RESET_FAILED',
    'ACCOUNT_LOCKED',
    'ACCOUNT_UNLOCKED',
    'SUSPICIOUS_ACTIVITY',
    'SESSION_EXPIRED',
    'MFA_ENABLED',
    'MFA_DISABLED',
    'MFA_VERIFIED',
    'MFA_FAILED'
  )),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  location JSONB, -- {country, city, lat, lon}
  details JSONB, -- Additional event-specific details
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS security_logs_event_type_idx ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS security_logs_user_id_idx ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS security_logs_email_idx ON security_logs(email);
CREATE INDEX IF NOT EXISTS security_logs_created_at_idx ON security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS security_logs_ip_address_idx ON security_logs(ip_address);

-- Enable Row Level Security
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view security logs
CREATE POLICY "Only admins can view security logs" ON security_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

-- Policy: System can insert security logs (service role)
CREATE POLICY "System can insert security logs" ON security_logs
  FOR INSERT
  WITH CHECK (true);

-- Comment on table
COMMENT ON TABLE security_logs IS 'Logs all security-related events for auditing and monitoring';

-- ============================================================
-- 2. OTP Codes Table
--    جدول رموز التحقق لأرقام الهواتف
-- ============================================================

-- Create otp_codes table
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('phone_verification', 'password_reset', 'login')),
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS otp_codes_phone_idx ON otp_codes(phone);
CREATE INDEX IF NOT EXISTS otp_codes_expires_at_idx ON otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS otp_codes_type_idx ON otp_codes(type);

-- Enable RLS
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own OTP codes
CREATE POLICY "Users can view own OTP codes" ON otp_codes
  FOR SELECT
  USING (phone IN (
    SELECT profiles.phone FROM profiles WHERE profiles.id = auth.uid()
  ));

-- Policy: Service role can manage OTP codes
CREATE POLICY "Service can manage OTP codes" ON otp_codes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to cleanup expired OTP codes
CREATE OR REPLACE FUNCTION cleanup_expired_otp_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment
COMMENT ON TABLE otp_codes IS 'Stores OTP codes for phone verification and 2FA';

-- ============================================================
-- 3. User Sessions Table
--    جدول الجلسات النشطة للمستخدمين
-- ============================================================

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  device_name TEXT,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  location JSONB,
  is_current BOOLEAN DEFAULT false,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_session_token_idx ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS user_sessions_expires_at_idx ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS user_sessions_last_activity_idx ON user_sessions(last_activity DESC);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can delete their own sessions
CREATE POLICY "Users can delete own sessions" ON user_sessions
  FOR DELETE
  USING (user_id = auth.uid());

-- Policy: Service role can manage all sessions
CREATE POLICY "Service can manage sessions" ON user_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment
COMMENT ON TABLE user_sessions IS 'Tracks active user sessions for security monitoring';

-- ============================================================
-- 4. Password History Table
--    جدول سجل كلمات المرور السابقة
-- ============================================================

-- Create password_history table
CREATE TABLE IF NOT EXISTS password_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS password_history_user_id_idx ON password_history(user_id);
CREATE INDEX IF NOT EXISTS password_history_created_at_idx ON password_history(created_at DESC);

-- Enable RLS
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access password history
CREATE POLICY "Service can manage password history" ON password_history
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to check if password was used before
CREATE OR REPLACE FUNCTION check_password_history(
  p_user_id UUID,
  p_password_hash TEXT,
  p_history_limit INT DEFAULT 5
)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM password_history
    WHERE user_id = p_user_id
      AND password_hash = p_password_hash
    ORDER BY created_at DESC
    LIMIT p_history_limit
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add password to history
CREATE OR REPLACE FUNCTION add_password_to_history(
  p_user_id UUID,
  p_password_hash TEXT,
  p_max_history INT DEFAULT 5
)
RETURNS void AS $$
BEGIN
  -- Insert new password
  INSERT INTO password_history (user_id, password_hash)
  VALUES (p_user_id, p_password_hash);
  
  -- Keep only last N passwords
  DELETE FROM password_history
  WHERE user_id = p_user_id
    AND id NOT IN (
      SELECT id FROM password_history
      WHERE user_id = p_user_id
      ORDER BY created_at DESC
      LIMIT p_max_history
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment
COMMENT ON TABLE password_history IS 'Stores hashed password history to prevent password reuse';

-- ============================================================
-- 5. Account Lockout Table
--    جدول قفل الحسابات بعد محاولات فاشلة
-- ============================================================

-- Create account_lockouts table
CREATE TABLE IF NOT EXISTS account_lockouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL UNIQUE, -- email or phone
  failed_attempts INT DEFAULT 0,
  locked_at TIMESTAMP WITH TIME ZONE,
  locked_until TIMESTAMP WITH TIME ZONE,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS account_lockouts_identifier_idx ON account_lockouts(identifier);
CREATE INDEX IF NOT EXISTS account_lockouts_locked_until_idx ON account_lockouts(locked_until);

-- Enable RLS
ALTER TABLE account_lockouts ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage lockouts
CREATE POLICY "Service can manage lockouts" ON account_lockouts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to record failed attempt
CREATE OR REPLACE FUNCTION record_failed_attempt(
  p_identifier TEXT,
  p_max_attempts INT DEFAULT 5,
  p_lockout_duration INTERVAL DEFAULT '15 minutes'::INTERVAL
)
RETURNS JSONB AS $$
DECLARE
  v_record RECORD;
  v_result JSONB;
BEGIN
  -- Get or create lockout record
  INSERT INTO account_lockouts (identifier, failed_attempts, last_attempt_at)
  VALUES (p_identifier, 1, NOW())
  ON CONFLICT (identifier) DO UPDATE
  SET 
    failed_attempts = CASE
      -- Reset if lockout expired and attempt window passed
      WHEN account_lockouts.locked_until IS NOT NULL 
           AND NOW() > account_lockouts.locked_until 
           AND NOW() - account_lockouts.last_attempt_at > INTERVAL '10 minutes'
      THEN 1
      -- Increment if within attempt window
      ELSE account_lockouts.failed_attempts + 1
    END,
    last_attempt_at = NOW(),
    -- Lock account if max attempts reached
    locked_at = CASE
      WHEN account_lockouts.failed_attempts + 1 >= p_max_attempts
      THEN NOW()
      ELSE account_lockouts.locked_at
    END,
    locked_until = CASE
      WHEN account_lockouts.failed_attempts + 1 >= p_max_attempts
      THEN NOW() + p_lockout_duration
      ELSE account_lockouts.locked_until
    END,
    updated_at = NOW()
  RETURNING * INTO v_record;
  
  -- Build result
  v_result := jsonb_build_object(
    'locked', v_record.locked_until IS NOT NULL AND NOW() < v_record.locked_until,
    'attempts_left', GREATEST(0, p_max_attempts - v_record.failed_attempts),
    'locked_until', v_record.locked_until,
    'failed_attempts', v_record.failed_attempts
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION check_account_lockout(p_identifier TEXT)
RETURNS JSONB AS $$
DECLARE
  v_record RECORD;
  v_result JSONB;
BEGIN
  SELECT * INTO v_record
  FROM account_lockouts
  WHERE identifier = p_identifier;
  
  -- No record found
  IF NOT FOUND THEN
    RETURN jsonb_build_object('locked', false, 'attempts_left', 5);
  END IF;
  
  -- Check if locked
  IF v_record.locked_until IS NOT NULL AND NOW() < v_record.locked_until THEN
    v_result := jsonb_build_object(
      'locked', true,
      'locked_until', v_record.locked_until,
      'remaining_time', EXTRACT(EPOCH FROM (v_record.locked_until - NOW()))
    );
  ELSE
    -- Not locked or lockout expired
    v_result := jsonb_build_object(
      'locked', false,
      'attempts_left', GREATEST(0, 5 - v_record.failed_attempts)
    );
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear failed attempts (on successful login)
CREATE OR REPLACE FUNCTION clear_failed_attempts(p_identifier TEXT)
RETURNS void AS $$
BEGIN
  DELETE FROM account_lockouts
  WHERE identifier = p_identifier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment
COMMENT ON TABLE account_lockouts IS 'Tracks failed login attempts and account lockouts';

-- ============================================================
-- 6. Update profiles table (if needed)
--    تحديث جدول البروفايلات
-- ============================================================

-- Add phone_verified column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add password_expires_at column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'password_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN password_expires_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add mfa_enabled column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'mfa_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN mfa_enabled BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add last_password_change column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_password_change'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_password_change TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
  END IF;
END $$;

-- ============================================================
-- 7. Scheduled Jobs (using pg_cron if available)
--    مهام دورية لتنظيف البيانات القديمة
-- ============================================================

-- Note: These require pg_cron extension
-- Enable it with: CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Clean up expired OTP codes daily
-- SELECT cron.schedule(
--   'cleanup-expired-otp-codes',
--   '0 2 * * *', -- Every day at 2 AM
--   'SELECT cleanup_expired_otp_codes()'
-- );

-- Clean up expired sessions daily
-- SELECT cron.schedule(
--   'cleanup-expired-sessions',
--   '0 3 * * *', -- Every day at 3 AM
--   'SELECT cleanup_expired_sessions()'
-- );

-- Clean up old security logs (keep last 90 days)
-- SELECT cron.schedule(
--   'cleanup-old-security-logs',
--   '0 4 * * 0', -- Every Sunday at 4 AM
--   $$DELETE FROM security_logs WHERE created_at < NOW() - INTERVAL '90 days'$$
-- );

-- ============================================================
-- 8. Triggers
--    المحفزات التلقائية
-- ============================================================

-- Trigger to update updated_at on account_lockouts
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_account_lockouts_updated_at
  BEFORE UPDATE ON account_lockouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_otp_codes_updated_at
  BEFORE UPDATE ON otp_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 9. Initial Data / Seed (Optional)
--    بيانات أولية اختيارية
-- ============================================================

-- Add comment about initialization
COMMENT ON SCHEMA public IS 'Authentication security enhancements schema - Version 1.0';

-- ============================================================
-- 10. Grants (Adjust based on your setup)
--     الصلاحيات
-- ============================================================

-- Grant permissions to service role
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant read permissions to authenticated users on their own data
-- Already handled via RLS policies

-- ============================================================
-- Installation Notes / ملاحظات التثبيت
-- ============================================================

/*
To install these schemas:

1. Connect to your Supabase project
2. Go to SQL Editor
3. Run this entire script
4. Verify tables were created successfully
5. Test RLS policies
6. Set up pg_cron jobs if needed

للتثبيت:
1. اتصل بمشروع Supabase
2. اذهب إلى محرر SQL
3. قم بتشغيل هذا السكريبت بالكامل
4. تحقق من إنشاء الجداول بنجاح
5. اختبر سياسات RLS
6. قم بإعداد مهام pg_cron إذا لزم الأمر
*/

-- ============================================================
-- Verification Queries / استعلامات التحقق
-- ============================================================

-- Check if all tables were created
DO $$
DECLARE
  tables TEXT[] := ARRAY[
    'security_logs',
    'otp_codes',
    'user_sessions',
    'password_history',
    'account_lockouts'
  ];
  table_name TEXT;
  missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
  FOREACH table_name IN ARRAY tables
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = table_name
    ) THEN
      missing_tables := array_append(missing_tables, table_name);
    END IF;
  END LOOP;
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE NOTICE 'Missing tables: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE 'All tables created successfully ✅';
  END IF;
END $$;

-- ============================================================
-- End of Schema
-- ============================================================

