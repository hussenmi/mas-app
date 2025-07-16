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

// GET - Fetch all users with statistics
export async function GET(req: NextRequest) {
  let db;
  try {
    db = await getDb();
    const all = promisify(db.all.bind(db));
    
    const users = await all(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.emergency_contact,
        u.created_at,
        COUNT(DISTINCT vs.event_id) as volunteer_events,
        COUNT(DISTINCT er.event_id) as rsvp_events
      FROM users u
      LEFT JOIN volunteer_signups vs ON u.id = vs.user_id
      LEFT JOIN event_rsvps er ON u.id = er.user_id
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone, u.emergency_contact, u.created_at
      ORDER BY u.created_at DESC
    `);
    
    return NextResponse.json({ users });
    
  } catch (error) {
    console.error('Fetch users error:', error);
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