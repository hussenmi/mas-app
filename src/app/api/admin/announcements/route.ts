import { NextRequest, NextResponse } from 'next/server';
import { Database } from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { cache } from '@/lib/cache';

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

async function initializeDatabase(db: Database) {
  const run = promisify(db.run.bind(db));
  
  await run(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      icon TEXT DEFAULT '',
      is_active BOOLEAN DEFAULT 1,
      priority INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// GET - Fetch all announcements
export async function GET(req: NextRequest) {
  let db;
  try {
    db = await getDb();
    await initializeDatabase(db);
    const all = promisify(db.all.bind(db));
    
    const announcements = await all(`
      SELECT * FROM announcements 
      ORDER BY priority DESC, created_at DESC
    `);
    
    return NextResponse.json({ announcements });
    
  } catch (error) {
    console.error('Fetch announcements error:', error);
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

// POST - Create new announcement
export async function POST(req: NextRequest) {
  let db;
  try {
    const { text, icon, priority } = await req.json();
    
    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Announcement text is required' },
        { status: 400 }
      );
    }
    
    db = await getDb();
    await initializeDatabase(db);
    
    // Use callback approach to get lastID properly
    const insertId = await new Promise<number>((resolve, reject) => {
      db.run(`
        INSERT INTO announcements (text, icon, priority)
        VALUES (?, ?, ?)
      `, [text.trim(), icon || '', priority || 0], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
    
    // Invalidate announcements cache
    cache.delete('active-announcements');
    
    return NextResponse.json({ 
      message: 'Announcement created successfully',
      id: insertId
    });
    
  } catch (error) {
    console.error('Create announcement error:', error);
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