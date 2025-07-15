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

// GET - Fetch single event
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  let db;
  try {
    const eventId = params.id;
    
    db = await getDb();
    const get = promisify(db.get.bind(db));
    const all = promisify(db.all.bind(db));
    
    const event = await get(`
      SELECT 
        e.*,
        a.first_name || ' ' || a.last_name as created_by_name,
        (SELECT COUNT(*) FROM volunteer_signups vs WHERE vs.event_id = e.id AND vs.status = 'confirmed') as actual_signups
      FROM events e
      LEFT JOIN admin_users a ON e.created_by = a.id
      WHERE e.id = ?
    `, [eventId]);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Get volunteer signups for this event
    const signups = await all(`
      SELECT 
        vs.id,
        vs.created_at as signed_up_at,
        vs.status,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM volunteer_signups vs
      JOIN users u ON vs.user_id = u.id
      WHERE vs.event_id = ?
      ORDER BY vs.created_at ASC
    `, [eventId]);
    
    return NextResponse.json({ event, signups });
    
  } catch (error) {
    console.error('Fetch event error:', error);
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

// PUT - Update event
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  let db;
  try {
    const eventId = params.id;
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
      status
    } = await req.json();
    
    if (!title || !description || !date || !time || !location || !volunteersNeeded || !category || !contactEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    db = await getDb();
    const run = promisify(db.run.bind(db));
    
    await run(`
      UPDATE events SET
        title = ?,
        description = ?,
        date = ?,
        time = ?,
        location = ?,
        volunteers_needed = ?,
        category = ?,
        requirements = ?,
        contact_email = ?,
        status = ?
      WHERE id = ?
    `, [
      title, description, date, time, location, volunteersNeeded,
      category, requirements || '', contactEmail, status || 'active', eventId
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Event updated successfully'
    });
    
  } catch (error) {
    console.error('Update event error:', error);
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

// DELETE - Delete event
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let db;
  try {
    const eventId = params.id;
    
    db = await getDb();
    const run = promisify(db.run.bind(db));
    
    // Soft delete - mark as inactive
    await run(`
      UPDATE events SET
        status = 'deleted'
      WHERE id = ?
    `, [eventId]);
    
    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete event error:', error);
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