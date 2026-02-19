import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { schema } from './schema';

const rawUrl = process.env.TURSO_DATABASE_URL || 'file:local.db';
// Strip any trailing whitespace/newlines that may come from env var config
const url = rawUrl.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (process.env.NODE_ENV === 'production' && !url.startsWith('libsql://')) {
    console.error(`[DB] WARNING: TURSO_DATABASE_URL is "${url}" — expected libsql:// URL in production!`);
}

export const client = createClient({
    url,
    authToken,
});

// Enable foreign key constraints for SQLite/Turso
// This is critical for ON DELETE CASCADE to work properly
client.execute('PRAGMA foreign_keys = ON').catch(() => {
    // Turso may not support PRAGMA or it may be already enabled
    // Silently ignore the error
});

export const db = drizzle(client, { schema });
export type DbType = typeof db;
