import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    db = await getDb();
    const get = promisify(db.get.bind(db));
    
    // Find user by email
    const user = await get(
      'SELECT id, email, password, first_name, last_name, phone, volunteer_interests, skills, availability, emergency_contact_name, emergency_contact_phone FROM users WHERE email = ?',
      [email]
    );
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // In a real app, you'd generate a JWT token here
    // For simplicity, we'll just return user info
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        volunteerInterests: user.volunteer_interests,
        skills: user.skills,
        availability: user.availability,
        emergencyContactName: user.emergency_contact_name,
        emergencyContactPhone: user.emergency_contact_phone
      }
    });
    
  } catch (error) {
    console.error('Signin error:', error);
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