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

// GET - Check if user has volunteer profile
export async function GET(req: NextRequest) {
  let db;
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    db = await getDb();
    const get = promisify(db.get.bind(db));
    
    const profile = await get(`
      SELECT 
        vp.*,
        GROUP_CONCAT(vt.name) as tag_names,
        GROUP_CONCAT(vt.color) as tag_colors
      FROM volunteer_profiles vp
      LEFT JOIN volunteer_tag_assignments vta ON vp.id = vta.volunteer_id
      LEFT JOIN volunteer_tags vt ON vta.tag_id = vt.id
      WHERE vp.user_id = ?
      GROUP BY vp.id
    `, [userId]);
    
    if (!profile) {
      return NextResponse.json({ profile: null });
    }
    
    // Parse JSON fields
    const profileData = {
      ...profile,
      skills: profile.skills ? JSON.parse(profile.skills) : [],
      availability: profile.availability ? JSON.parse(profile.availability) : [],
      preferences: profile.preferences ? JSON.parse(profile.preferences) : {},
      tags: profile.tag_names ? profile.tag_names.split(',') : [],
      tag_colors: profile.tag_colors ? profile.tag_colors.split(',') : []
    };
    
    return NextResponse.json({ profile: profileData });
    
  } catch (error) {
    console.error('Get volunteer profile error:', error);
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