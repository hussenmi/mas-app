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
    
    console.log('Admin database initialized successfully');
  } catch (error) {
    console.error('Admin database initialization error:', error);
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
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Initialize database if it doesn't exist
    await initializeDb();
    
    db = await getDb();
    const get = promisify(db.get.bind(db));
    
    // Find admin by email
    const admin = await get(
      'SELECT id, email, password, first_name, last_name, role FROM admin_users WHERE email = ?',
      [email]
    );
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }
    
    // Return admin info (without password)
    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        role: admin.role
      }
    });
    
  } catch (error) {
    console.error('Admin signin error:', error);
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