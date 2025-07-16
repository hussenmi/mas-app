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

// POST - RSVP for an event
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
    await initializeDatabase(db);
    const run = promisify(db.run.bind(db));
    const get = promisify(db.get.bind(db));
    
    // Check if user already RSVPed for this event
    const existingRsvp = await get(
      'SELECT id FROM event_rsvps WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );
    
    if (existingRsvp) {
      return NextResponse.json(
        { error: 'You have already RSVPed for this event' },
        { status: 400 }
      );
    }
    
    // Get event details to check if payment is required
    const event = await get(
      'SELECT price FROM events WHERE id = ? AND status = "active"',
      [eventId]
    );
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or no longer active' },
        { status: 404 }
      );
    }
    
    // For now, we'll just create the RSVP
    // In a real app, you'd integrate with a payment processor for paid events
    const paymentStatus = event.price > 0 ? 'pending' : 'completed';
    
    await run(
      'INSERT INTO event_rsvps (user_id, event_id, payment_status, amount_paid) VALUES (?, ?, ?, ?)',
      [userId, eventId, paymentStatus, event.price || 0]
    );
    
    return NextResponse.json({
      success: true,
      message: event.price > 0 
        ? `RSVP successful! Payment of $${event.price} is required to confirm your attendance.`
        : 'RSVP successful! We look forward to seeing you at the event.'
    });
    
  } catch (error) {
    console.error('Event RSVP error:', error);
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

// DELETE - Cancel RSVP
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let db;
  try {
    const eventId = params.id;
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
    const run = promisify(db.run.bind(db));
    
    await run(
      'DELETE FROM event_rsvps WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );
    
    return NextResponse.json({
      success: true,
      message: 'RSVP cancelled successfully'
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