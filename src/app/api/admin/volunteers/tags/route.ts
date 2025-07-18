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

// GET - Fetch all volunteer tags
export async function GET(req: NextRequest) {
  let db;
  try {
    db = await getDb();
    const all = promisify(db.all.bind(db));
    const run = promisify(db.run.bind(db));
    
    // Ensure the volunteer tags table exists and has correct data
    await run(`
      CREATE TABLE IF NOT EXISTS volunteer_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        color TEXT DEFAULT 'blue',
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await run(`
      CREATE TABLE IF NOT EXISTS volunteer_tag_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        volunteer_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        assigned_by INTEGER,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(volunteer_id, tag_id)
      )
    `);
    
    // Insert default tags if none exist
    const existingTags = await all('SELECT COUNT(*) as count FROM volunteer_tags');
    if (existingTags[0].count === 0) {
      await run(`
        INSERT INTO volunteer_tags (name, color, description) VALUES 
        ('Event Planning', 'blue', 'Help organize and coordinate community events'),
        ('Food & Kitchen', 'green', 'Food preparation, serving, and kitchen assistance'),
        ('Youth Programs', 'pink', 'Programs and activities for children and youth'),
        ('Education & Teaching', 'purple', 'Teaching, tutoring, and educational support'),
        ('General Support', 'teal', 'Admin, outreach, maintenance, and general assistance')
      `);
    }
    
    const tags = await all(`
      SELECT 
        vt.*,
        COUNT(vta.volunteer_id) as volunteer_count
      FROM volunteer_tags vt
      LEFT JOIN volunteer_tag_assignments vta ON vt.id = vta.tag_id
      LEFT JOIN volunteer_profiles vp ON vta.volunteer_id = vp.id AND vp.status = 'active'
      GROUP BY vt.id
      ORDER BY vt.name
    `);
    
    // Debug: Also get total assignments
    const totalAssignments = await all('SELECT COUNT(*) as count FROM volunteer_tag_assignments');
    const totalVolunteers = await all('SELECT COUNT(*) as count FROM volunteer_profiles WHERE status = "active"');
    
    console.log('Debug - Total tag assignments:', totalAssignments[0].count);
    console.log('Debug - Total active volunteers:', totalVolunteers[0].count);
    console.log('Debug - Tags with counts:', tags);
    
    return NextResponse.json({ tags });
    
  } catch (error) {
    console.error('Fetch volunteer tags error:', error);
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

// POST - Create new volunteer tag
export async function POST(req: NextRequest) {
  let db;
  try {
    const body = await req.json();
    const { name, color = 'blue', description = '' } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }
    
    db = await getDb();
    const run = promisify(db.run.bind(db));
    
    const result = await run(`
      INSERT INTO volunteer_tags (name, color, description)
      VALUES (?, ?, ?)
    `, [name, color, description]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Tag created successfully',
      tagId: (result as any).lastID 
    });
    
  } catch (error) {
    console.error('Create volunteer tag error:', error);
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'A tag with this name already exists' },
        { status: 400 }
      );
    }
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