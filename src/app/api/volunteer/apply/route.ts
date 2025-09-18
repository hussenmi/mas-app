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
      previous_experience TEXT,
      why_volunteer TEXT,
      additional_info TEXT,
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

  // Add missing columns if they don't exist
  try {
    await run(`ALTER TABLE volunteer_profiles ADD COLUMN previous_experience TEXT`);
  } catch (e) {
    // Column already exists
  }
  
  try {
    await run(`ALTER TABLE volunteer_profiles ADD COLUMN why_volunteer TEXT`);
  } catch (e) {
    // Column already exists
  }
  
  try {
    await run(`ALTER TABLE volunteer_profiles ADD COLUMN additional_info TEXT`);
  } catch (e) {
    // Column already exists
  }

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

  const updatedTags = [
    { name: 'Event Planning', color: 'blue', description: 'Help organize and coordinate community events' },
    { name: 'Food & Kitchen', color: 'green', description: 'Food preparation, serving, and kitchen assistance' },
    { name: 'Youth Programs', color: 'pink', description: 'Programs and activities for children and youth' },
    { name: 'Education & Teaching', color: 'purple', description: 'Teaching, tutoring, and educational support' },
    { name: 'General Support', color: 'teal', description: 'Admin, outreach, maintenance, and general assistance' }
  ];

  for (const tag of updatedTags) {
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

// POST - Submit volunteer application
export async function POST(req: NextRequest) {
  let db;
  try {
    const body = await req.json();
    const {
      userId,
      phone = '',
      areasOfInterest = [],
      skills = [],
      availability = [],
      emergencyContactName,
      emergencyContactPhone,
      whyVolunteer = '',
      previousExperience = '',
      additionalInfo = ''
    } = body;
    
    if (!userId || !emergencyContactName || !emergencyContactPhone) {
      return NextResponse.json(
        { error: 'User ID, emergency contact name, and phone are required' },
        { status: 400 }
      );
    }

    if (areasOfInterest.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one area of interest' },
        { status: 400 }
      );
    }
    
    db = await getDb();
    await initializeVolunteerTables(db);
    const run = promisify(db.run.bind(db));
    const get = promisify(db.get.bind(db));
    const all = promisify(db.all.bind(db));
    
    // Check if volunteer profile already exists
    const existingProfile = await get(
      `SELECT id FROM volunteer_profiles WHERE user_id = ?`,
      [userId]
    );
    
    let profileId;
    
    if (existingProfile) {
      // Update existing profile
      profileId = existingProfile.id;
      
      await run(`
        UPDATE volunteer_profiles 
        SET emergency_contact_name = ?, emergency_contact_phone = ?, 
            skills = ?, availability = ?, previous_experience = ?, 
            why_volunteer = ?, additional_info = ?, 
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [
        emergencyContactName,
        emergencyContactPhone,
        JSON.stringify(skills),
        JSON.stringify(availability),
        previousExperience,
        whyVolunteer,
        additionalInfo,
        userId
      ]);
      
      // Clear existing tag assignments
      await run(`DELETE FROM volunteer_tag_assignments WHERE volunteer_id = ?`, [profileId]);
    } else {
      // Create new profile
      const result = await run(`
        INSERT INTO volunteer_profiles 
        (user_id, emergency_contact_name, emergency_contact_phone, skills, availability, 
         previous_experience, why_volunteer, additional_info, preferences)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        emergencyContactName,
        emergencyContactPhone,
        JSON.stringify(skills),
        JSON.stringify(availability),
        previousExperience,
        whyVolunteer,
        additionalInfo,
        JSON.stringify({}) // Empty preferences initially
      ]);
      
      // Get the created profile ID
      const profileRecord = await get(
        'SELECT id FROM volunteer_profiles WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      
      if (!profileRecord) {
        throw new Error('Failed to create volunteer profile');
      }
      
      profileId = profileRecord.id;
    }
    
    // Update user's phone number if provided
    if (phone.trim()) {
      await run(`UPDATE users SET phone = ? WHERE id = ?`, [phone, userId]);
    }
    
    // Assign selected areas of interest as tags
    for (const tagId of areasOfInterest) {
      const result = await run(`
        INSERT OR IGNORE INTO volunteer_tag_assignments (volunteer_id, tag_id)
        VALUES (?, ?)
      `, [profileId, tagId]);
      
      // Verify the assignment was created
      const assignment = await get(
        'SELECT * FROM volunteer_tag_assignments WHERE volunteer_id = ? AND tag_id = ?',
        [profileId, tagId]
      );
      console.log('Tag assignment created:', assignment);
    }
    
    // Verify total assignments for this volunteer
    const allAssignments = await all(
      'SELECT vta.*, vt.name FROM volunteer_tag_assignments vta LEFT JOIN volunteer_tags vt ON vta.tag_id = vt.id WHERE volunteer_id = ?',
      [profileId]
    );
    console.log('All assignments for volunteer', profileId, ':', allAssignments);
    
    return NextResponse.json({ 
      success: true, 
      message: existingProfile 
        ? 'Volunteer preferences updated successfully!' 
        : 'Volunteer application submitted successfully! Welcome to our volunteer team.',
      profileId,
      isUpdate: !!existingProfile,
      islamicQuote: {
        arabic: 'مَنْ تَطَوَّعَ خَيْرًا فَهُوَ خَيْرٌ لَهُ',
        english: 'And whoever volunteers good, it is better for him.',
        reference: 'Quran 2:184'
      }
    });
    
  } catch (error) {
    console.error('Volunteer application error:', error);
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
