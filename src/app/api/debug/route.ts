import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    const diagnostics: Record<string, unknown> = {};
    
    // 1. Check environment variables
    diagnostics.env = {
        TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL 
            ? process.env.TURSO_DATABASE_URL.substring(0, 40) + '...' 
            : 'NOT SET',
        TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'SET (length: ' + process.env.TURSO_AUTH_TOKEN.length + ')' : 'NOT SET',
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? 'SET (length: ' + process.env.CLERK_SECRET_KEY.length + ')' : 'NOT SET',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'SET' : 'NOT SET',
        NODE_ENV: process.env.NODE_ENV,
    };

    // 2. Test DB connection
    try {
        const { createClient } = await import('@libsql/client');
        const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
        const authToken = process.env.TURSO_AUTH_TOKEN;
        
        const client = createClient({ url, authToken });
        
        const tables = await client.execute('SELECT name FROM sqlite_master WHERE type=\'table\' ORDER BY name');
        diagnostics.db = {
            status: 'connected',
            url: url.substring(0, 40),
            tableCount: tables.rows.length,
            tables: tables.rows.map(r => r.name),
        };

        // 3. Test the exact query that the dashboard page does
        try {
            const studentsResult = await client.execute('SELECT * FROM students LIMIT 1');
            diagnostics.studentsQuery = {
                status: 'ok',
                columns: studentsResult.columns,
                rowCount: studentsResult.rows.length,
            };
        } catch (e) {
            diagnostics.studentsQuery = {
                status: 'error',
                error: e instanceof Error ? e.message : String(e),
            };
        }

        // 4. Test trainers table
        try {
            const trainersResult = await client.execute('SELECT * FROM trainers LIMIT 1');
            diagnostics.trainersQuery = {
                status: 'ok',
                columns: trainersResult.columns,
                rowCount: trainersResult.rows.length,
            };
        } catch (e) {
            diagnostics.trainersQuery = {
                status: 'error',
                error: e instanceof Error ? e.message : String(e),
            };
        }

        // 5. Test payments table
        try {
            const paymentsResult = await client.execute('SELECT * FROM payments LIMIT 1');
            diagnostics.paymentsQuery = {
                status: 'ok',
                columns: paymentsResult.columns,
                rowCount: paymentsResult.rows.length,
            };
        } catch (e) {
            diagnostics.paymentsQuery = {
                status: 'error',
                error: e instanceof Error ? e.message : String(e),
            };
        }

    } catch (e) {
        diagnostics.db = {
            status: 'error',
            error: e instanceof Error ? e.message : String(e),
            stack: e instanceof Error ? e.stack?.split('\n').slice(0, 5) : undefined,
        };
    }

    // 6. Test Drizzle ORM import
    try {
        const { db } = await import('@/db');
        const { sql } = await import('drizzle-orm');
        const result = await db.all(sql`SELECT 1 as test`);
        diagnostics.drizzle = {
            status: 'ok',
            testResult: result,
        };
    } catch (e) {
        diagnostics.drizzle = {
            status: 'error',
            error: e instanceof Error ? e.message : String(e),
            stack: e instanceof Error ? e.stack?.split('\n').slice(0, 5) : undefined,
        };
    }

    return NextResponse.json(diagnostics, { 
        status: 200,
        headers: { 'Cache-Control': 'no-store' }
    });
}
