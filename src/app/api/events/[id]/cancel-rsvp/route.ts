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

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let db;
  try {
    const eventId = params.id;
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    db = await getDb();
    const run = promisify(db.run.bind(db));
    const get = promisify(db.get.bind(db));
    
    // Check if user has an RSVP
    const rsvp = await get(`
      SELECT * FROM event_rsvps 
      WHERE user_id = ? AND event_id = ?
    `, [userId, eventId]);
    
    if (!rsvp) {
      return NextResponse.json(
        { error: 'You have not RSVPed to this event' },
        { status: 404 }
      );
    }
    
    // Remove the RSVP
    await run(`
      DELETE FROM event_rsvps 
      WHERE user_id = ? AND event_id = ?
    `, [userId, eventId]);
    
    // Also remove volunteer signup if they had one (can't volunteer if not attending)
    try {
      const volunteerSignup = await get(`
        SELECT id FROM volunteer_signups 
        WHERE user_id = ? AND event_id = ?
      `, [userId, eventId]);
      
      if (volunteerSignup) {
        await run(`
          DELETE FROM volunteer_signups 
          WHERE user_id = ? AND event_id = ?
        `, [userId, eventId]);
        
        return NextResponse.json({ 
          message: 'Your RSVP and volunteer signup have been cancelled successfully. You cannot volunteer for an event you\'re not attending. We hope to see you at future events!' 
        });
      }
    } catch (volunteerError) {
      console.error('Error removing volunteer signup:', volunteerError);
      // Continue with just RSVP cancellation if volunteer removal fails
    }
    
    return NextResponse.json({ 
      message: 'Your RSVP has been cancelled successfully. We hope to see you at future events!' 
    });
    
  } catch (error) {
    console.error('Cancel RSVP error:', error);
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