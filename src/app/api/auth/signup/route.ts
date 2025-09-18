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
    
    // Add columns if they don't exist (for existing databases)
    try {
      await run(`ALTER TABLE users ADD COLUMN emergency_contact_name TEXT`);
    } catch (e) {
      // Column already exists
    }
    
    try {
      await run(`ALTER TABLE users ADD COLUMN emergency_contact_phone TEXT`);
    } catch (e) {
      // Column already exists
    }

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
    const { email, password, firstName, lastName, phone } = await req.json();
    
    console.log('Signup attempt for email:', email);
    
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Initialize database if it doesn't exist
    await initializeDb();
    
    db = await getDb();
    const get = promisify(db.get.bind(db));
    const run = promisify(db.run.bind(db));
    
    // Check if user already exists
    const existingUser = await get('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const result = await run(
      'INSERT INTO users (email, password, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, phone || null]
    );
    
    // Check if result and lastID exist
    const userId = result && typeof result === 'object' && 'lastID' in result 
      ? (result as any).lastID 
      : null;
    
    if (!userId) {
      // Fallback: query the database to get the user ID
      const newUser = await get('SELECT id FROM users WHERE email = ?', [email]);
      const fallbackUserId = newUser ? newUser.id : null;
      
      if (!fallbackUserId) {
        throw new Error('User was created but could not retrieve user ID');
      }
      
      console.log('User created successfully with fallback ID:', fallbackUserId);
      
      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        userId: fallbackUserId
      });
    }
    
    console.log('User created successfully with ID:', userId);
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      userId: userId
    });
    
  } catch (error) {
    console.error('Signup error:', error);
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