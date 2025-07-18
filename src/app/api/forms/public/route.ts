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

// GET - Fetch forms that should be displayed on homepage
export async function GET(req: NextRequest) {
  let db;
  try {
    db = await getDb();
    const all = promisify(db.all.bind(db));
    
    const forms = await all(`
      SELECT 
        id, title, description, slug, google_form_url, deadline, 
        icon, color, created_at
      FROM custom_forms 
      WHERE status = 'active' AND display_on_homepage = 1
      ORDER BY created_at DESC
    `);
    
    // Check if deadlines have passed
    const formsWithStatus = forms.map((form: any) => ({
      ...form,
      isExpired: form.deadline ? new Date(form.deadline) < new Date() : false
    }));
    
    return NextResponse.json({ forms: formsWithStatus });
    
  } catch (error) {
    console.error('Fetch public forms error:', error);
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