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
  return db;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new NextResponse('Email and password are required', { status: 400 });
    }

    const db = await getDb();
    const volunteer = await db.get(
      'SELECT * FROM volunteers WHERE email = ?',
      email,
    );

    if (!volunteer) {
      return new NextResponse('Invalid credentials', { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, volunteer.password_hash);

    if (isMatch) {
      // In a real app, you would issue a token (e.g., JWT) here
      const { password_hash, ...rest } = volunteer; // Exclude password hash from response
      return NextResponse.json({ success: true, volunteer: rest });
    } else {
      return new NextResponse('Invalid credentials', { status: 401 });
    }
  } catch (error) {
    console.error('Error signing in volunteer:', error);
    return new NextResponse('Error signing in volunteer', { status: 500 });
  }
}