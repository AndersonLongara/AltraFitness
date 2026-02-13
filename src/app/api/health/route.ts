import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const url = process.env.TURSO_DATABASE_URL || 'NOT SET';
        const hasToken = process.env.TURSO_AUTH_TOKEN ? 'YES' : 'NO';
        
        // Test DB connection
        const result = await db.all(sql`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`);
        
        return NextResponse.json({
            status: 'ok',
            turso_url: url.substring(0, 30) + '...',
            has_token: hasToken,
            tables: result,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : undefined;
        return NextResponse.json({
            status: 'error',
            error: message,
            stack: stack?.split('\n').slice(0, 5),
            turso_url: (process.env.TURSO_DATABASE_URL || 'NOT SET').substring(0, 30) + '...',
            has_token: process.env.TURSO_AUTH_TOKEN ? 'YES' : 'NO',
        }, { status: 500 });
    }
}
