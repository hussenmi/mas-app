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

// GET - Fetch user's volunteer signups
export async function GET(req: NextRequest) {
  let db;
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    db = await getDb();
    await initializeDatabase(db);
    const all = promisify(db.all.bind(db));
    
    const signups = await all(
      'SELECT event_id FROM volunteer_signups WHERE user_id = ? AND status = "confirmed"',
      [userId]
    );
    
    const eventIds = signups.map(signup => signup.event_id);
    
    return NextResponse.json({ eventIds });
    
  } catch (error) {
    console.error('Fetch user signups error:', error);
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