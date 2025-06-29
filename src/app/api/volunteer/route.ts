import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

const DATABASE_FILE = './volunteers.db';

async function getDb() {
  const db = await open({
    filename: DATABASE_FILE,
    driver: sqlite3.Database,
  });

  // Drop table if it exists to clear old data without password field
  await db.exec(`DROP TABLE IF EXISTS volunteers;`);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS volunteers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return new NextResponse('Name, email, phone, and password are required', { status: 400 });
    }

    const db = await getDb();

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await db.run(
      'INSERT INTO volunteers (name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
      name,
      email,
      phone,
      password_hash,
    );

    return new NextResponse('Volunteer signed up successfully', { status: 200 });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return new NextResponse('Email already registered', { status: 409 });
    }
    console.error('Error signing up volunteer:', error);
    return new NextResponse('Error signing up volunteer', { status: 500 });
  }
}