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

async function initializeDb() {
  let db;
  try {
    db = await getDb();
    const run = promisify(db.run.bind(db));
    
    // Create admin users table
    await run(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Also create regular users table in case it doesn't exist
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        volunteer_interests TEXT,
        skills TEXT,
        availability TEXT,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create events table
    await run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        location TEXT NOT NULL,
        volunteers_needed INTEGER NOT NULL,
        volunteers_signed_up INTEGER DEFAULT 0,
        category TEXT NOT NULL,
        requirements TEXT,
        contact_email TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES admin_users (id)
      )
    `);

    // Create volunteer signups table
    await run(`
      CREATE TABLE IF NOT EXISTS volunteer_signups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        signed_up_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'confirmed',
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (event_id) REFERENCES events (id),
        UNIQUE(user_id, event_id)
      )
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    if (db) {
      db.close();
    }
  }
}

export async function POST(req: NextRequest) {
  let db;
  try {
    const { email, password, firstName, lastName, role = 'admin', adminKey } = await req.json();
    
    console.log('Admin signup attempt for email:', email);
    
    // Simple admin key check (in production, use environment variable)
    const ADMIN_CREATION_KEY = process.env.ADMIN_CREATION_KEY || 'masqueens2024admin';
    if (adminKey !== ADMIN_CREATION_KEY) {
      return NextResponse.json(
        { error: 'Invalid admin creation key' },
        { status: 401 }
      );
    }
    
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Admin password must be at least 8 characters' },
        { status: 400 }
      );
    }
    
    // Initialize database if it doesn't exist
    await initializeDb();
    
    db = await getDb();
    const get = promisify(db.get.bind(db));
    const run = promisify(db.run.bind(db));
    
    // Check if admin already exists
    const existingAdmin = await get('SELECT id FROM admin_users WHERE email = ?', [email]);
    
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin user already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Insert new admin
    const result = await run(
      'INSERT INTO admin_users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, role]
    );
    
    console.log('Admin created successfully with ID:', result.lastID);
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      adminId: result.lastID
    });
    
  } catch (error) {
    console.error('Admin signup error:', error);
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