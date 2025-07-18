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

// GET - Fetch form by slug for public display
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  let db;
  try {
    const slug = params.slug;
    
    db = await getDb();
    const get = promisify(db.get.bind(db));
    
    const form = await get(`
      SELECT 
        id, title, description, slug, google_form_url, embed_url, 
        deadline, instructions, requirements, icon, color, status
      FROM custom_forms 
      WHERE slug = ? AND status = 'active'
    `, [slug]);
    
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }
    
    // Parse JSON fields and check expiration
    const formData = {
      ...form,
      instructions: form.instructions ? JSON.parse(form.instructions) : null,
      requirements: form.requirements ? JSON.parse(form.requirements) : null,
      isExpired: form.deadline ? new Date(form.deadline) < new Date() : false
    };
    
    return NextResponse.json({ form: formData });
    
  } catch (error) {
    console.error('Fetch form by slug error:', error);
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