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

// GET - Fetch specific volunteer with full details and event history
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  let db;
  try {
    const volunteerId = parseInt(params.id);
    
    db = await getDb();
    const get = promisify(db.get.bind(db));
    const all = promisify(db.all.bind(db));
    
    // Get volunteer profile with user details
    const volunteer = await get(`
      SELECT 
        vp.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.created_at as user_created_at
      FROM volunteer_profiles vp
      JOIN users u ON vp.user_id = u.id
      WHERE vp.id = ?
    `, [volunteerId]);
    
    if (!volunteer) {
      return NextResponse.json(
        { error: 'Volunteer not found' },
        { status: 404 }
      );
    }
    
    // Get volunteer tags
    const tags = await all(`
      SELECT vt.*, vta.assigned_at
      FROM volunteer_tags vt
      JOIN volunteer_tag_assignments vta ON vt.id = vta.tag_id
      WHERE vta.volunteer_id = ?
      ORDER BY vt.name
    `, [volunteerId]);
    
    // Get event history
    const eventHistory = await all(`
      SELECT 
        e.title,
        e.date,
        e.location,
        vs.status as signup_status,
        vs.created_at as signup_date,
        ved.hours_worked,
        ved.performance_rating,
        ved.admin_feedback,
        ved.volunteer_feedback,
        ved.attendance_status
      FROM volunteer_signups vs
      JOIN events e ON vs.event_id = e.id
      LEFT JOIN volunteer_event_details ved ON vs.id = ved.signup_id
      WHERE vs.user_id = ?
      ORDER BY e.date DESC
    `, [volunteer.user_id]);
    
    // Parse JSON fields
    const volunteerData = {
      ...volunteer,
      skills: volunteer.skills ? JSON.parse(volunteer.skills) : [],
      availability: volunteer.availability ? JSON.parse(volunteer.availability) : [],
      preferences: volunteer.preferences ? JSON.parse(volunteer.preferences) : {},
      tags,
      eventHistory
    };
    
    return NextResponse.json({ volunteer: volunteerData });
    
  } catch (error) {
    console.error('Fetch volunteer details error:', error);
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

// PATCH - Update volunteer profile
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let db;
  try {
    const volunteerId = parseInt(params.id);
    const body = await req.json();
    
    db = await getDb();
    const run = promisify(db.run.bind(db));
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    
    if (body.emergencyContactName !== undefined) {
      updateFields.push('emergency_contact_name = ?');
      updateValues.push(body.emergencyContactName);
    }
    if (body.emergencyContactPhone !== undefined) {
      updateFields.push('emergency_contact_phone = ?');
      updateValues.push(body.emergencyContactPhone);
    }
    if (body.skills !== undefined) {
      updateFields.push('skills = ?');
      updateValues.push(JSON.stringify(body.skills));
    }
    if (body.availability !== undefined) {
      updateFields.push('availability = ?');
      updateValues.push(JSON.stringify(body.availability));
    }
    if (body.preferences !== undefined) {
      updateFields.push('preferences = ?');
      updateValues.push(JSON.stringify(body.preferences));
    }
    if (body.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(body.status);
    }
    if (body.adminNotes !== undefined) {
      updateFields.push('admin_notes = ?');
      updateValues.push(body.adminNotes);
    }
    if (body.totalHours !== undefined) {
      updateFields.push('total_hours = ?');
      updateValues.push(body.totalHours);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(volunteerId);
    
    await run(`
      UPDATE volunteer_profiles 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);
    
    // Update tags if provided
    if (body.tags !== undefined) {
      // Remove existing tags
      await run(`DELETE FROM volunteer_tag_assignments WHERE volunteer_id = ?`, [volunteerId]);
      
      // Add new tags
      for (const tagId of body.tags) {
        await run(`
          INSERT OR IGNORE INTO volunteer_tag_assignments (volunteer_id, tag_id)
          VALUES (?, ?)
        `, [volunteerId, tagId]);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Volunteer updated successfully' 
    });
    
  } catch (error) {
    console.error('Update volunteer error:', error);
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

// DELETE - Remove volunteer profile (soft delete - set status to inactive)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let db;
  try {
    const volunteerId = parseInt(params.id);
    
    db = await getDb();
    const run = promisify(db.run.bind(db));
    
    await run(`
      UPDATE volunteer_profiles 
      SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [volunteerId]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Volunteer deactivated successfully' 
    });
    
  } catch (error) {
    console.error('Delete volunteer error:', error);
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