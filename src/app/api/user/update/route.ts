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

export async function PUT(req: NextRequest) {
  let db;
  try {
    const { userId, phone, volunteerInterests, skills, availability, emergencyContactName, emergencyContactPhone } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    db = await getDb();
    const run = promisify(db.run.bind(db));
    
    // Update user profile
    await run(
      `UPDATE users SET 
        phone = ?, 
        volunteer_interests = ?, 
        skills = ?, 
        availability = ?, 
        emergency_contact_name = ?,
        emergency_contact_phone = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [phone, volunteerInterests, skills, availability, emergencyContactName, emergencyContactPhone, userId]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Update user error:', error);
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