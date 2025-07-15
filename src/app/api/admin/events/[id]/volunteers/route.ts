import { NextRequest, NextResponse } from 'next/server';
import { Database } from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

const dbPath = path.join(process.cwd(), 'users.db');

async function getDb() {
  return new Promise<Database>((resolve, reject) => {
    const db = new Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

async function initializeDatabase(db: Database) {
  const run = promisify(db.run.bind(db));
  
  await run(`
    CREATE TABLE IF NOT EXISTS volunteer_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      status TEXT DEFAULT 'confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, event_id)
    )
  `);
}

// GET - Fetch volunteers for a specific event
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  let db;
  try {
    const eventId = params.id;
    
    db = await getDb();
    await initializeDatabase(db);
    const all = promisify(db.all.bind(db));
    
    const volunteers = await all(`
      SELECT 
        vs.id as signup_id,
        vs.status,
        vs.created_at as signed_up_at,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.emergency_contact
      FROM volunteer_signups vs
      JOIN users u ON vs.user_id = u.id
      WHERE vs.event_id = ?
      ORDER BY vs.created_at ASC
    `, [eventId]);
    
    return NextResponse.json({ volunteers });
    
  } catch (error) {
    console.error('Fetch event volunteers error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  } finally {
    if (db) {
      db.close();
    }
  }
}