-- AutoFund AI - Database Initialization Script
-- Creates initial database schema and data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_created_at ON tasks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status_created_at ON tasks(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_nif_ano_exercicio ON tasks(nif, ano_exercicio);
CREATE INDEX IF NOT EXISTS idx_financial_data_task_id ON financial_data(task_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_task_id ON analysis_results(task_id);
CREATE INDEX IF NOT EXISTS idx_generated_files_task_id ON generated_files(task_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp DESC);

-- Create default admin user (password: admin123)
INSERT INTO users (email, hashed_password, is_active, is_premium, created_at)
VALUES ('admin@autofund.ai', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', true, true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Create default subscription for admin user
INSERT INTO subscriptions (user_id, plan_type, status, monthly_quota, current_usage, current_period_start, current_period_end, created_at)
SELECT id, 'enterprise', 'active', 1000, 0, DATE_TRUNC('month', NOW()), DATE_TRUNC('month', NOW()) + INTERVAL '1 month', NOW()
FROM users
WHERE email = 'admin@autofund.ai'
ON CONFLICT (user_id) DO NOTHING;

-- Insert initial system metrics
INSERT INTO system_metrics (metric_name, metric_value, metric_unit, timestamp)
VALUES
    ('server_startup', 1, 'count', NOW()),
    ('database_initialized', 1, 'count', NOW())
ON CONFLICT DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to subscriptions table
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions to app user (if using PostgreSQL)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'autofund') THEN
        GRANT CONNECT ON DATABASE autofund_ai TO autofund;
        GRANT USAGE ON SCHEMA public TO autofund;
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO autofund;
        GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO autofund;

        -- Set default permissions for future tables
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO autofund;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO autofund;
    END IF;
END
$$;