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
  
  // Create table if it doesn't exist
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
  
  // Check if table is empty and add default announcements
  const get = promisify(db.get.bind(db));
  const count = await get(`SELECT COUNT(*) as count FROM announcements`);
  
  if ((count as any).count === 0) {
    // Insert default announcements
    await run(`INSERT INTO announcements (text, icon, priority) VALUES (?, ?, ?)`, 
      ['📿 Ramadan preparation classes start next week', '📿', 3]);
    await run(`INSERT INTO announcements (text, icon, priority) VALUES (?, ?, ?)`, 
      ['🕌 Friday Jumu\'ah at 1:15 PM', '🕌', 2]);
    await run(`INSERT INTO announcements (text, icon, priority) VALUES (?, ?, ?)`, 
      ['📚 Youth Islamic studies program registration open', '📚', 1]);
    await run(`INSERT INTO announcements (text, icon, priority) VALUES (?, ?, ?)`, 
      ['🤝 Community iftar this Saturday 6:30 PM', '🤝', 0]);
  }
}

// GET - Fetch active announcements for public display
export async function GET(req: NextRequest) {
  // Check cache first (5 minute TTL for announcements)
  const cacheKey = 'active-announcements';
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    console.log('Returning cached announcements');
    return NextResponse.json(cachedData);
  }

  let db;
  try {
    console.log('Fetching fresh announcements from database');
    db = await getDb();
    await initializeDatabase(db);
    const all = promisify(db.all.bind(db));
    
    const announcements = await all(`
      SELECT id, text, icon FROM announcements 
      WHERE is_active = 1
      ORDER BY priority DESC, created_at DESC
    `);
    
    const responseData = { announcements };
    
    // Cache for 5 minutes (300 seconds)
    cache.set(cacheKey, responseData, 300);
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Fetch public announcements error:', error);
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