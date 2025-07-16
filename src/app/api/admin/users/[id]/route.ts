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

// GET - Fetch specific user details with activity
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  let db;
  try {
    const userId = params.id;
    
    db = await getDb();
    const get = promisify(db.get.bind(db));
    const all = promisify(db.all.bind(db));
    
    // Get user details
    const user = await get(`
      SELECT * FROM users WHERE id = ?
    `, [userId]);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get user's volunteer activities
    const volunteerActivities = await all(`
      SELECT 
        e.id,
        e.title,
        e.date,
        e.time,
        e.location,
        vs.status,
        vs.created_at as signed_up_at
      FROM volunteer_signups vs
      JOIN events e ON vs.event_id = e.id
      WHERE vs.user_id = ?
      ORDER BY e.date DESC
    `, [userId]);
    
    // Get user's event RSVPs
    const rsvpActivities = await all(`
      SELECT 
        e.id,
        e.title,
        e.date,
        e.time,
        e.location,
        er.status,
        er.payment_status,
        er.amount_paid,
        er.created_at as rsvped_at
      FROM event_rsvps er
      JOIN events e ON er.event_id = e.id
      WHERE er.user_id = ?
      ORDER BY e.date DESC
    `, [userId]);
    
    return NextResponse.json({ 
      user, 
      volunteerActivities, 
      rsvpActivities 
    });
    
  } catch (error) {
    console.error('Fetch user details error:', error);
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

// DELETE - Delete user and all related data
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let db;
  try {
    const userId = params.id;
    
    db = await getDb();
    const run = promisify(db.run.bind(db));
    
    // Delete user's volunteer signups
    await run(`DELETE FROM volunteer_signups WHERE user_id = ?`, [userId]);
    
    // Delete user's event RSVPs
    await run(`DELETE FROM event_rsvps WHERE user_id = ?`, [userId]);
    
    // Delete user
    await run(`DELETE FROM users WHERE id = ?`, [userId]);
    
    return NextResponse.json({ message: 'User deleted successfully' });
    
  } catch (error) {
    console.error('Delete user error:', error);
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