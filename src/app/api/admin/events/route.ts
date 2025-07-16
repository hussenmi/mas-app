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
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES admin_users (id)
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
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (event_id) REFERENCES events (id),
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

// GET - Fetch all events
export async function GET(req: NextRequest) {
  let db;
  try {
    db = await getDb();
    await initializeDatabase(db);
    const all = promisify(db.all.bind(db));
    
    const events = await all(`
      SELECT 
        e.*,
        a.first_name || ' ' || a.last_name as created_by_name,
        (SELECT COUNT(*) FROM volunteer_signups vs WHERE vs.event_id = e.id AND vs.status = 'confirmed') as actual_signups,
        (SELECT COUNT(*) FROM event_rsvps er WHERE er.event_id = e.id AND er.status = 'confirmed') as total_rsvps
      FROM events e
      LEFT JOIN admin_users a ON e.created_by = a.id
      WHERE e.status = 'active'
      ORDER BY e.date ASC, e.time ASC
    `);
    
    return NextResponse.json({ events });
    
  } catch (error) {
    console.error('Fetch events error:', error);
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

// POST - Create new event
export async function POST(req: NextRequest) {
  let db;
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      volunteersNeeded,
      category,
      requirements,
      contactEmail,
      price,
      createdBy
    } = await req.json();
    
    if (!title || !description || !date || !time || !location || !volunteersNeeded || !category || !contactEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    db = await getDb();
    await initializeDatabase(db);
    const run = promisify(db.run.bind(db));
    
    await run(`
      INSERT INTO events (
        title, description, date, time, location, volunteers_needed, 
        category, requirements, contact_email, price, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, description, date, time, location, volunteersNeeded,
      category, requirements || '', contactEmail, price || 0, createdBy
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Event created successfully'
    });
    
  } catch (error) {
    console.error('Create event error:', error);
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