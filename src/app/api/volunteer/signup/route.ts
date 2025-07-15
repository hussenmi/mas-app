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
      status TEXT DEFAULT 'active',
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
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

export async function POST(req: NextRequest) {
  let db;
  try {
    const { userId, eventId } = await req.json();
    
    if (!userId || !eventId) {
      return NextResponse.json(
        { error: 'User ID and Event ID are required' },
        { status: 400 }
      );
    }
    
    db = await getDb();
    await initializeDatabase(db);
    const run = promisify(db.run.bind(db));
    const get = promisify(db.get.bind(db));
    
    // Check if user is already signed up for this event
    const existingSignup = await get(
      'SELECT id FROM volunteer_signups WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );
    
    if (existingSignup) {
      return NextResponse.json(
        { error: 'You are already signed up for this event' },
        { status: 400 }
      );
    }
    
    // Check if event is full
    const event = await get(
      'SELECT volunteers_needed, (SELECT COUNT(*) FROM volunteer_signups WHERE event_id = ? AND status = "confirmed") as current_signups FROM events WHERE id = ?',
      [eventId, eventId]
    );
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    if (event.current_signups >= event.volunteers_needed) {
      return NextResponse.json(
        { error: 'This event is full' },
        { status: 400 }
      );
    }
    
    // Create the signup
    await run(
      'INSERT INTO volunteer_signups (user_id, event_id, status) VALUES (?, ?, ?)',
      [userId, eventId, 'confirmed']
    );
    
    return NextResponse.json({
      success: true,
      message: 'Successfully signed up for the event'
    });
    
  } catch (error) {
    console.error('Volunteer signup error:', error);
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