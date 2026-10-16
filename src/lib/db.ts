import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import type { AsyncRemoteCallback, SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import * as schema from '../../db/schema';

export type Database = SqliteRemoteDatabase<typeof schema>;

export interface DatabaseConnection {
    db: Database;
    sqlite: DatabaseSync;
}

/** Default local SQLite file used for dev/build when DATABASE_URL is unset. */
const DEFAULT_DATABASE_URL = 'file:tailspin.db';

let cachedDb: Database | undefined;

/** Resolve a local SQLite URL to the path expected by Node's built-in driver. */
function databasePath(url: string): string {
    if (url === ':memory:') {
        return url;
    }

    if (!url.startsWith('file:')) {
        throw new Error('DATABASE_URL must be a local file: URL or :memory:.');
    }

    const filePath = url.startsWith('file://') ? fileURLToPath(url) : url.slice('file:'.length);
    if (!filePath) {
        throw new Error('DATABASE_URL must include a database file path.');
    }

    mkdirSync(dirname(filePath), { recursive: true });
    return filePath;
}

/** Bridge Drizzle's async SQLite adapter to Node's synchronous built-in driver. */
function createRemoteCallback(sqlite: DatabaseSync): AsyncRemoteCallback {
    return async (sql: string, params: SQLInputValue[], method: 'run' | 'all' | 'values' | 'get') => {
        const statement = sqlite.prepare(sql);

        switch (method) {
            case 'run':
                statement.run(...params);
                return { rows: [] };
            case 'all':
                return { rows: statement.all(...params).map((row) => Object.values(row)) };
            case 'values':
                return { rows: statement.all(...params).map((row) => Object.values(row)) };
            case 'get': {
                const row = statement.get(...params);
                // Drizzle's proxy type requires an array, but its get mapper accepts no row.
                return { rows: row === undefined ? (undefined as unknown as never[]) : Object.values(row) };
            }
        }
    };
}

/**
 * Run generated migration statements atomically through Node's SQLite driver,
 * so a failed migration leaves the schema as it was.
 *
 * @param sqlite - Raw connection from `createDatabaseConnection`.
 * @param queries - Statements handed over by Drizzle's migrator.
 * @throws The error of the statement that failed, once the transaction is rolled back.
 */
export function executeMigrationQueries(sqlite: DatabaseSync, queries: string[]): void {
    sqlite.exec('BEGIN');
    try {
        for (const query of queries) {
            sqlite.exec(query);
        }
        sqlite.exec('COMMIT');
    } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
    }
}

/**
 * Create a Drizzle client for the given local SQLite connection URL. Scripts
 * call it; pages and routes share `getDatabase()` instead.
 *
 * @param url - `file:<path>` or `:memory:`; defaults to `DATABASE_URL`, then `file:tailspin.db`.
 * @returns A new client, with its own connection.
 * @throws When the URL is neither a `file:` URL nor `:memory:`.
 */
export function createDatabase(url: string = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL): Database {
    return createDatabaseConnection(url).db;
}

/**
 * Create the Drizzle client and its Node SQLite connection. Migrations need
 * the raw connection, to run their statements in one transaction.
 *
 * @param url - `file:<path>` or `:memory:`; defaults to `DATABASE_URL`, then `file:tailspin.db`.
 * @returns The client and the connection it runs on.
 * @throws When the URL is neither a `file:` URL nor `:memory:`.
 */
export function createDatabaseConnection(
    url: string = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
): DatabaseConnection {
    const sqlite = new DatabaseSync(databasePath(url));
    // Rows come back keyed by column name: table-qualified names keep the two `id` columns of a join apart.
    sqlite.exec('PRAGMA short_column_names = OFF; PRAGMA full_column_names = ON;');
    const db = drizzle(createRemoteCallback(sqlite), { schema });
    return { db, sqlite };
}

/**
 * Shared database client, opened on first use: pages read it at build time,
 * and on-demand routes such as `/api/games/:id` at request time.
 *
 * @returns The same client on every call, for `DATABASE_URL` or `file:tailspin.db`.
 * @throws On first use, when `DATABASE_URL` is neither a `file:` URL nor `:memory:`.
 */
export function getDatabase(): Database {
    if (!cachedDb) {
        cachedDb = createDatabase();
    }
    return cachedDb;
}
