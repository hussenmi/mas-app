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
    const run = promisify(db.run.bind(db));
    const get = promisify(db.get.bind(db));
    
    // Check if user is actually signed up
    const signup = await get(`
      SELECT * FROM volunteer_signups 
      WHERE user_id = ? AND event_id = ?
    `, [userId, eventId]);
    
    if (!signup) {
      return NextResponse.json(
        { error: 'You are not signed up for this volunteer opportunity' },
        { status: 404 }
      );
    }
    
    // Remove the volunteer signup
    await run(`
      DELETE FROM volunteer_signups 
      WHERE user_id = ? AND event_id = ?
    `, [userId, eventId]);
    
    // Check if there's an auto-created RSVP and remove it
    try {
      const autoRsvp = await get(`
        SELECT id FROM event_rsvps 
        WHERE user_id = ? AND event_id = ? AND auto_created_from_volunteer = 1
      `, [userId, eventId]);
      
      if (autoRsvp) {
        await run(`
          DELETE FROM event_rsvps 
          WHERE user_id = ? AND event_id = ? AND auto_created_from_volunteer = 1
        `, [userId, eventId]);
      }
    } catch (rsvpError) {
      console.error('Auto-RSVP removal error:', rsvpError);
    }
    
    // Note: volunteer counts are calculated dynamically, no need to update events table
    
    return NextResponse.json({ 
      message: 'Your volunteer signup has been cancelled successfully. We understand that circumstances change.' 
    });
    
  } catch (error) {
    console.error('Cancel volunteer signup error:', error);
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