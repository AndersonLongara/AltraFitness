import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get environment info
    const envInfo = {
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL || 'NOT SET',
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'SET (hidden)' : 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL || 'NOT SET',
      DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN ? 'SET (hidden)' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
    };

    // List all tables
    const tables = await db.all(sql`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);

    // Check specifically for lead_forms tables
    const leadTables = await db.all(sql`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('lead_forms', 'lead_form_answers')
    `);

    // Try to count rows in lead_forms if it exists
    let leadFormsCount = null;
    try {
      if (leadTables.some((t: any) => t.name === 'lead_forms')) {
        const count = await db.all(sql`SELECT COUNT(*) as count FROM lead_forms`);
        leadFormsCount = count[0];
      }
    } catch (error: any) {
      leadFormsCount = { error: error.message };
    }

    return NextResponse.json({
      status: 'success',
      environment: envInfo,
      totalTables: tables.length,
      allTables: tables.map((t: any) => t.name),
      leadTablesFound: leadTables.map((t: any) => t.name),
      leadFormsRowCount: leadFormsCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: error.stack,
      environment: {
        TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL || 'NOT SET',
        TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'SET (hidden)' : 'NOT SET',
        NODE_ENV: process.env.NODE_ENV,
      },
    }, { status: 500 });
  }
}
