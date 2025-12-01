"""
AutoFund AI - Database Migration System
Handles database schema migrations with version tracking
"""

import asyncio
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import List, Optional

import asyncpg
from pythonjsonlogger import jsonlogger


class Migration:
    """Represents a single database migration"""

    def __init__(self, version: str, description: str, sql: str, dependencies: Optional[List[str]] = None):
        self.version = version
        self.description = description
        self.sql = sql
        self.dependencies = dependencies or []
        self.applied_at = None


class MigrationManager:
    """Manages database migrations"""

    def __init__(self, database_url: str, migrations_dir: str = "database/migrations"):
        self.database_url = database_url
        self.migrations_dir = Path(migrations_dir)
        self.migrations = []
        self.logger = self._setup_logger()

    def _setup_logger(self):
        """Setup migration logger"""
        logger = logging.getLogger("migrations")
        logger.setLevel(logging.INFO)

        handler = logging.StreamHandler()
        formatter = jsonlogger.JsonFormatter(
            "%(asctime)s %(name)s %(levelname)s %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

        return logger

    async def load_migrations(self):
        """Load migration files from disk"""
        self.migrations = []

        # Create migrations table if it doesn't exist
        await self._create_migrations_table()

        # Get applied migrations
        applied = await self._get_applied_migrations()

        # Load migration files
        migration_files = sorted(self.migrations_dir.glob("*.sql"))

        for file_path in migration_files:
            version = file_path.stem
            with open(file_path, 'r') as f:
                content = f.read()

            # Parse migration metadata
            lines = content.split('\n')
            description = "No description"
            dependencies = []

            for line in lines:
                if line.startswith("-- Description:"):
                    description = line.replace("-- Description:", "").strip()
                elif line.startswith("-- Depends:"):
                    deps = line.replace("-- Depends:", "").strip()
                    dependencies = [d.strip() for d in deps.split(',') if d.strip()]

            # Extract SQL (remove comments)
            sql = '\n'.join([
                line for line in lines
                if not line.startswith('--') and line.strip()
            ])

            migration = Migration(
                version=version,
                description=description,
                sql=sql,
                dependencies=dependencies
            )

            if version in applied:
                migration.applied_at = applied[version]

            self.migrations.append(migration)

        self.logger.info(f"Loaded {len(self.migrations)} migrations")

    async def _create_migrations_table(self):
        """Create the migrations tracking table"""
        conn = await asyncpg.connect(self.database_url)

        await conn.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(255) PRIMARY KEY,
                description TEXT,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                checksum VARCHAR(32)
            )
        """)

        await conn.close()

    async def _get_applied_migrations(self) -> dict:
        """Get list of applied migrations from database"""
        conn = await asyncpg.connect(self.database_url)

        rows = await conn.fetch(
            "SELECT version, applied_at FROM schema_migrations ORDER BY version"
        )

        await conn.close()

        return {row['version']: row['applied_at'] for row in rows}

    async def _apply_migration(self, migration: Migration):
        """Apply a single migration"""
        self.logger.info(
            f"Applying migration {migration.version}: {migration.description}"
        )

        conn = await asyncpg.connect(self.database_url)

        try:
            # Begin transaction
            async with conn.transaction():
                # Execute migration SQL
                await conn.execute(migration.sql)

                # Record migration
                await conn.execute(
                    """
                    INSERT INTO schema_migrations (version, description, applied_at)
                    VALUES ($1, $2, NOW())
                    ON CONFLICT (version) DO NOTHING
                    """,
                    migration.version,
                    migration.description
                )

                self.logger.info(f"Migration {migration.version} applied successfully")

        except Exception as e:
            self.logger.error(
                f"Failed to apply migration {migration.version}: {str(e)}"
            )
            raise
        finally:
            await conn.close()

    async def migrate(self, target_version: Optional[str] = None):
        """Run migrations up to target version"""
        await self.load_migrations()

        # Sort migrations by version
        self.migrations.sort(key=lambda m: m.version)

        # Filter migrations to apply
        to_apply = []
        for migration in self.migrations:
            if migration.applied_at:
                continue  # Already applied

            if target_version and migration.version > target_version:
                break  # Reached target

            # Check dependencies
            if migration.dependencies:
                for dep in migration.dependencies:
                    if not any(m.version == dep and m.applied_at for m in self.migrations):
                        raise Exception(
                            f"Migration {migration.version} depends on {dep} which is not applied"
                        )

            to_apply.append(migration)

        # Apply migrations
        if not to_apply:
            self.logger.info("No migrations to apply")
            return

        self.logger.info(f"Applying {len(to_apply)} migrations")

        for migration in to_apply:
            await self._apply_migration(migration)

        self.logger.info("All migrations applied successfully")

    async def rollback(self, target_version: str):
        """Rollback to target version"""
        # This is a placeholder for rollback functionality
        # In production, you'd need to store rollback SQL or generate it
        raise NotImplementedError("Rollback functionality not implemented")

    async def status(self):
        """Show migration status"""
        await self.load_migrations()

        self.logger.info("Migration Status:")
        self.logger.info("=" * 50)

        for migration in self.migrations:
            status = "✅ Applied" if migration.applied_at else "⏳ Pending"
            applied_at = f" (at {migration.applied_at})" if migration.applied_at else ""
            self.logger.info(
                f"{migration.version}: {migration.description} - {status}{applied_at}"
            )


# Initial migrations
INITIAL_MIGRATIONS = {
    "001_initial_schema.sql": """
-- Description: Create initial database schema
--

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    nif VARCHAR(9),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    quota_used INTEGER DEFAULT 0,
    quota_limit INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE,
    quota_limit INTEGER NOT NULL,
    auto_renew BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing tasks table
CREATE TABLE IF NOT EXISTS processing_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    task_type VARCHAR(50) NOT NULL DEFAULT 'ies_processing',
    file_name VARCHAR(255),
    file_size INTEGER,
    file_path VARCHAR(500),
    result_path VARCHAR(500),
    error_message TEXT,
    progress INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial analyses table
CREATE TABLE IF NOT EXISTS financial_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES processing_tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_nif VARCHAR(9),
    company_name VARCHAR(255),
    fiscal_year INTEGER,
    data JSONB NOT NULL,
    analysis JSONB NOT NULL,
    risk_level VARCHAR(20),
    recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API usage table
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    duration_ms INTEGER,
    response_size INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES processing_tasks(id) ON DELETE CASCADE,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100),
    mime_type VARCHAR(100),
    checksum VARCHAR(64),
    storage_path VARCHAR(500),
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_processing_tasks_user ON processing_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_tasks_status ON processing_tasks(status);
CREATE INDEX IF NOT EXISTS idx_processing_tasks_created ON processing_tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_financial_analyses_user ON financial_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_analyses_nif ON financial_analyses(company_nif);
CREATE INDEX IF NOT EXISTS idx_api_usage_user ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_file_uploads_user ON file_uploads(user_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processing_tasks_updated_at BEFORE UPDATE ON processing_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
""",

    "002_add_indexes.sql": """
-- Description: Add additional performance indexes
-- Depends: 001_initial_schema

-- Additional indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_processing_tasks_user_status ON processing_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_financial_analyses_fiscal_year ON financial_analyses(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_financial_analyses_data_gin ON financial_analyses USING GIN(data);
CREATE INDEX IF NOT EXISTS idx_financial_analyses_analysis_gin ON financial_analyses USING GIN(analysis);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint_method ON api_usage(endpoint, method);
""",
}


async def create_initial_migrations():
    """Create initial migration files"""
    migrations_dir = Path("database/migrations")
    migrations_dir.mkdir(parents=True, exist_ok=True)

    for filename, content in INITIAL_MIGRATIONS.items():
        file_path = migrations_dir / filename
        if not file_path.exists():
            with open(file_path, 'w') as f:
                f.write(content)
            print(f"Created migration: {filename}")


async def main():
    """Main migration runner"""
    import sys
    from api.config import get_settings

    settings = get_settings()

    # Create initial migrations if needed
    await create_initial_migrations()

    # Initialize migration manager
    manager = MigrationManager(settings.DATABASE_URL)

    # Parse command
    command = sys.argv[1] if len(sys.argv) > 1 else "status"

    if command == "migrate":
        target = sys.argv[2] if len(sys.argv) > 2 else None
        await manager.migrate(target)
    elif command == "status":
        await manager.status()
    elif command == "create":
        # Create new migration
        description = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else "New migration"
        version = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{version}_{description.replace(' ', '_').lower()}.sql"

        content = f"""-- Description: {description}
-- Depends:

-- Add your migration SQL here

"""

        with open(f"database/migrations/{filename}", 'w') as f:
            f.write(content)

        print(f"Created migration: {filename}")
    else:
        print("Usage: python migrate.py [migrate|status|create] [options]")


if __name__ == "__main__":
    asyncio.run(main())