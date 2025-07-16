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

// GET - Fetch RSVPs for a specific event
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  let db;
  try {
    const eventId = params.id;
    
    db = await getDb();
    await initializeDatabase(db);
    const all = promisify(db.all.bind(db));
    
    const rsvps = await all(`
      SELECT 
        er.id as rsvp_id,
        er.status,
        er.payment_status,
        er.amount_paid,
        er.created_at as rsvped_at,
        er.auto_created_from_volunteer,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.emergency_contact,
        (SELECT COUNT(*) FROM volunteer_signups vs WHERE vs.user_id = u.id AND vs.event_id = er.event_id) as is_volunteer
      FROM event_rsvps er
      JOIN users u ON er.user_id = u.id
      WHERE er.event_id = ?
      ORDER BY er.auto_created_from_volunteer DESC, er.created_at ASC
    `, [eventId]);
    
    return NextResponse.json({ rsvps });
    
  } catch (error) {
    console.error('Fetch event RSVPs error:', error);
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