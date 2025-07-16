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
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      volunteers_needed INTEGER NOT NULL,
      category TEXT NOT NULL,
      requirements TEXT,
      contact_email TEXT NOT NULL,
      price DECIMAL(10,2) DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Add price column if it doesn't exist (for existing databases)
  await run(`ALTER TABLE events ADD COLUMN price DECIMAL(10,2) DEFAULT 0`).catch(() => {
    // Column already exists, ignore error
  });
  
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
  
  await run(`
    CREATE TABLE IF NOT EXISTS event_rsvps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      status TEXT DEFAULT 'confirmed',
      payment_status TEXT DEFAULT 'pending',
      amount_paid DECIMAL(10,2) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (event_id) REFERENCES events (id),
      UNIQUE(user_id, event_id)
    )
  `);
}

// GET - Fetch all active events for public use
export async function GET(req: NextRequest) {
  let db;
  try {
    db = await getDb();
    await initializeDatabase(db);
    const all = promisify(db.all.bind(db));
    
    const events = await all(`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.date,
        e.time,
        e.location,
        e.volunteers_needed,
        e.category,
        e.requirements,
        e.contact_email,
        e.price,
        (SELECT COUNT(*) FROM volunteer_signups vs WHERE vs.event_id = e.id AND vs.status = 'confirmed') as volunteers_signed_up,
        (SELECT COUNT(*) FROM event_rsvps er WHERE er.event_id = e.id AND er.status = 'confirmed') as total_rsvps
      FROM events e
      WHERE e.status = 'active'
      ORDER BY e.date ASC, e.time ASC
    `);
    
    return NextResponse.json({ events });
    
  } catch (error) {
    console.error('Fetch public events error:', error);
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