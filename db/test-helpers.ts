import { migrate } from 'drizzle-orm/sqlite-proxy/migrator';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createDatabaseConnection, executeMigrationQueries, type Database } from '../src/lib/db';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Create a fresh in-memory Node SQLite database with the schema migrated in,
 * to pass as the `db` argument of a data-access helper under test.
 *
 * @returns An empty database, private to the caller: each test gets its own.
 */
export async function createTestDatabase(): Promise<Database> {
    const { db, sqlite } = createDatabaseConnection(':memory:');
    await migrate(
        db,
        async (queries: string[]): Promise<void> => executeMigrationQueries(sqlite, queries),
        { migrationsFolder: join(here, 'migrations') },
    );
    return db;
}
