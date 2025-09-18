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

async function initializeVolunteerTables(db: Database) {
  const run = promisify(db.run.bind(db));
  const all = promisify(db.all.bind(db));

  // Volunteer profiles table
  await run(`
    CREATE TABLE IF NOT EXISTS volunteer_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      skills TEXT, -- JSON array of skills
      availability TEXT, -- JSON array of availability
      preferences TEXT, -- JSON object for preferences
      status TEXT DEFAULT 'active', -- active, inactive, pending
      volunteer_since DATE DEFAULT CURRENT_DATE,
      total_hours INTEGER DEFAULT 0,
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Volunteer tags table
  await run(`
    CREATE TABLE IF NOT EXISTS volunteer_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT DEFAULT 'blue',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Volunteer-tag assignments (many-to-many)
  await run(`
    CREATE TABLE IF NOT EXISTS volunteer_tag_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      volunteer_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      assigned_by INTEGER, -- admin user who assigned
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (volunteer_id) REFERENCES volunteer_profiles (id),
      FOREIGN KEY (tag_id) REFERENCES volunteer_tags (id),
      UNIQUE(volunteer_id, tag_id)
    )
  `);

  // Enhanced volunteer signups table (extends existing volunteer_signups)
  await run(`
    CREATE TABLE IF NOT EXISTS volunteer_event_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      signup_id INTEGER NOT NULL,
      hours_worked INTEGER DEFAULT 0,
      performance_rating INTEGER, -- 1-5 scale
      admin_feedback TEXT,
      volunteer_feedback TEXT,
      attendance_status TEXT DEFAULT 'pending', -- pending, attended, no-show, cancelled
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (signup_id) REFERENCES volunteer_signups (id)
    )
  `);

  const defaultTags = [
    { name: 'Event Planning', color: 'blue', description: 'Help organize and coordinate community events' },
    { name: 'Food & Kitchen', color: 'green', description: 'Food preparation, serving, and kitchen assistance' },
    { name: 'Youth Programs', color: 'pink', description: 'Programs and activities for children and youth' },
    { name: 'Education & Teaching', color: 'purple', description: 'Teaching, tutoring, and educational support' },
    { name: 'General Support', color: 'teal', description: 'Admin, outreach, maintenance, and general assistance' }
  ];

  for (const tag of defaultTags) {
    await run(`
      INSERT INTO volunteer_tags (name, color, description)
      VALUES (?, ?, ?)
      ON CONFLICT(name) DO UPDATE SET
        color = excluded.color,
        description = excluded.description
    `, [tag.name, tag.color, tag.description]);
  }

  const tags: { id: number; name: string }[] = await all(`SELECT id, name FROM volunteer_tags`);
  for (const tag of tags) {
    await run(`
      UPDATE volunteer_tag_assignments
      SET tag_id = ?
      WHERE ((? - tag_id) % 5) = 0
    `, [tag.id, tag.id]);
  }
}

// GET - Fetch all volunteers with their details and tags
export async function GET(req: NextRequest) {
  let db;
  try {
    db = await getDb();
    await initializeVolunteerTables(db);
    const get = promisify(db.get.bind(db));
    const all = promisify(db.all.bind(db));
    
    const { searchParams } = new URL(req.url);
    const tags = searchParams.get('tags')?.split(',') || [];
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    
    let query = `
      SELECT 
        vp.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        COUNT(DISTINCT vs.id) as total_events,
        GROUP_CONCAT(DISTINCT vt.name) as tags,
        GROUP_CONCAT(DISTINCT vt.color) as tag_colors,
        AVG(ved.performance_rating) as avg_rating
      FROM volunteer_profiles vp
      JOIN users u ON vp.user_id = u.id
      LEFT JOIN volunteer_signups vs ON vp.user_id = vs.user_id
      LEFT JOIN volunteer_tag_assignments vta ON vp.id = vta.volunteer_id
      LEFT JOIN volunteer_tags vt ON vta.tag_id = vt.id
      LEFT JOIN volunteer_event_details ved ON vs.id = ved.signup_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Filter by status
    if (status) {
      query += ` AND vp.status = ?`;
      params.push(status);
    }
    
    // Search filter (name and email only)
    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ` GROUP BY vp.id ORDER BY vp.created_at DESC`;
    
    let volunteers = await all(query, params);
    
    // Filter by tags if specified
    if (tags.length > 0) {
      volunteers = volunteers.filter((volunteer: any) => {
        const volunteerTags = volunteer.tags ? volunteer.tags.split(',') : [];
        return tags.some(tag => volunteerTags.includes(tag));
      });
    }
    
    // Parse JSON fields
    volunteers = volunteers.map((volunteer: any) => ({
      ...volunteer,
      skills: volunteer.skills ? JSON.parse(volunteer.skills) : [],
      availability: volunteer.availability ? JSON.parse(volunteer.availability) : [],
      preferences: volunteer.preferences ? JSON.parse(volunteer.preferences) : {},
      tags: volunteer.tags ? volunteer.tags.split(',') : [],
      tag_colors: volunteer.tag_colors ? volunteer.tag_colors.split(',') : []
    }));
    
    return NextResponse.json({ volunteers });
    
  } catch (error) {
    console.error('Fetch volunteers error:', error);
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

// POST - Create or update volunteer profile
export async function POST(req: NextRequest) {
  let db;
  try {
    const body = await req.json();
    const {
      userId,
      emergencyContactName,
      emergencyContactPhone,
      skills = [],
      availability = [],
      preferences = {},
      adminNotes = '',
      tags = []
    } = body;
    
    db = await getDb();
    await initializeVolunteerTables(db);
    const run = promisify(db.run.bind(db));
    const get = promisify(db.get.bind(db));
    
    // Check if volunteer profile exists
    const existingProfile = await get(
      `SELECT id FROM volunteer_profiles WHERE user_id = ?`,
      [userId]
    );
    
    let profileId;
    
    if (existingProfile) {
      // Update existing profile
      await run(`
        UPDATE volunteer_profiles 
        SET emergency_contact_name = ?, emergency_contact_phone = ?, 
            skills = ?, availability = ?, preferences = ?, 
            admin_notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [
        emergencyContactName, 
        emergencyContactPhone,
        JSON.stringify(skills),
        JSON.stringify(availability),
        JSON.stringify(preferences),
        adminNotes,
        userId
      ]);
      profileId = existingProfile.id;
    } else {
      // Create new profile
      const result = await run(`
        INSERT INTO volunteer_profiles 
        (user_id, emergency_contact_name, emergency_contact_phone, skills, availability, preferences, admin_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        emergencyContactName,
        emergencyContactPhone,
        JSON.stringify(skills),
        JSON.stringify(availability),
        JSON.stringify(preferences),
        adminNotes
      ]);
      profileId = (result as any).lastID;
    }
    
    // Update tags
    if (tags.length > 0) {
      // Remove existing tags
      await run(`DELETE FROM volunteer_tag_assignments WHERE volunteer_id = ?`, [profileId]);
      
      // Add new tags
      for (const tagId of tags) {
        await run(`
          INSERT OR IGNORE INTO volunteer_tag_assignments (volunteer_id, tag_id)
          VALUES (?, ?)
        `, [profileId, tagId]);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Volunteer profile updated successfully',
      profileId 
    });
    
  } catch (error) {
    console.error('Create/update volunteer error:', error);
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
