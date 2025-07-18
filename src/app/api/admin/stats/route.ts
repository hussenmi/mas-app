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

async function initializeTables(db: Database) {
  const run = promisify(db.run.bind(db));
  
  // Ensure volunteer_signups table exists
  await run(`
    CREATE TABLE IF NOT EXISTS volunteer_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (event_id) REFERENCES events (id),
      UNIQUE(user_id, event_id)
    )
  `);
}

// GET - Fetch dashboard statistics
export async function GET(req: NextRequest) {
  let db;
  try {
    db = await getDb();
    await initializeTables(db);
    const get = promisify(db.get.bind(db));
    
    // Get total users count
    const usersResult = await get(`SELECT COUNT(*) as count FROM users`);
    const totalUsers = (usersResult as any)?.count || 0;
    
    // Get active events count (events with status is active)
    const eventsResult = await get(`
      SELECT COUNT(*) as count FROM events 
      WHERE (status = 'active' OR status IS NULL)
    `);
    const activeEvents = (eventsResult as any)?.count || 0;
    
    // Get total active volunteers count (from volunteer profiles)
    let totalVolunteers = 0;
    try {
      const volunteersResult = await get(`
        SELECT COUNT(*) as count FROM volunteer_profiles WHERE status = 'active'
      `);
      totalVolunteers = (volunteersResult as any)?.count || 0;
    } catch (error) {
      // Fallback to volunteer_signups if volunteer_profiles doesn't exist yet
      const fallbackResult = await get(`
        SELECT COUNT(DISTINCT user_id) as count FROM volunteer_signups
      `);
      totalVolunteers = (fallbackResult as any)?.count || 0;
    }
    
    // Get total donations this month (if donations table exists)
    let monthlyDonations = 0;
    try {
      const donationsResult = await get(`
        SELECT COALESCE(SUM(amount), 0) as total FROM donations 
        WHERE date(created_at) >= date('now', 'start of month')
      `);
      monthlyDonations = (donationsResult as any)?.total || 0;
    } catch (error) {
      // Donations table doesn't exist yet
      monthlyDonations = 0;
    }
    
    // Get total forms count
    let totalForms = 0;
    try {
      const formsResult = await get(`SELECT COUNT(*) as count FROM custom_forms`);
      totalForms = (formsResult as any)?.count || 0;
    } catch (error) {
      // Forms table doesn't exist yet
      totalForms = 0;
    }
    
    return NextResponse.json({
      totalUsers,
      activeEvents,
      totalVolunteers,
      monthlyDonations,
      totalForms
    });
    
  } catch (error) {
    console.error('Fetch admin stats error:', error);
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