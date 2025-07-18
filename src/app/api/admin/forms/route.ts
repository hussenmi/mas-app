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

async function initializeDatabase(db: Database) {
  const run = promisify(db.run.bind(db));
  
  await run(`
    CREATE TABLE IF NOT EXISTS custom_forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      google_form_url TEXT NOT NULL,
      embed_url TEXT NOT NULL,
      deadline TEXT,
      instructions TEXT, -- JSON string
      requirements TEXT, -- JSON string
      display_on_homepage BOOLEAN DEFAULT 0,
      status TEXT DEFAULT 'active',
      icon TEXT DEFAULT 'FileText',
      color TEXT DEFAULT 'from-blue-500 to-blue-600',
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// GET - Fetch all forms (for admin)
export async function GET(req: NextRequest) {
  let db;
  try {
    db = await getDb();
    await initializeDatabase(db);
    const all = promisify(db.all.bind(db));
    
    const forms = await all(`
      SELECT 
        cf.*,
        COALESCE(au.first_name || ' ' || au.last_name, 'Unknown Admin') as created_by_name
      FROM custom_forms cf
      LEFT JOIN admin_users au ON cf.created_by = au.id
      ORDER BY cf.display_on_homepage DESC, cf.created_at DESC
    `);
    
    // Parse JSON fields
    const formsWithParsedData = forms.map((form: any) => ({
      ...form,
      instructions: form.instructions ? JSON.parse(form.instructions) : null,
      requirements: form.requirements ? JSON.parse(form.requirements) : null,
      display_on_homepage: Boolean(form.display_on_homepage)
    }));
    
    return NextResponse.json({ forms: formsWithParsedData });
    
  } catch (error) {
    console.error('Fetch forms error:', error);
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

// POST - Create new form
export async function POST(req: NextRequest) {
  let db;
  try {
    const {
      title,
      description,
      slug,
      googleFormUrl,
      embedUrl,
      deadline,
      instructions,
      requirements,
      displayOnHomepage,
      icon,
      color,
      createdBy
    } = await req.json();
    
    if (!title || !description || !slug || !googleFormUrl || !embedUrl) {
      return NextResponse.json(
        { error: 'Title, description, slug, and form URLs are required' },
        { status: 400 }
      );
    }
    
    db = await getDb();
    await initializeDatabase(db);
    const run = promisify(db.run.bind(db));
    
    // Check if slug already exists
    const get = promisify(db.get.bind(db));
    const existingForm = await get('SELECT id FROM custom_forms WHERE slug = ?', [slug]);
    
    if (existingForm) {
      return NextResponse.json(
        { error: 'A form with this slug already exists' },
        { status: 400 }
      );
    }
    
    const insertId = await new Promise<number>((resolve, reject) => {
      db.run(`
        INSERT INTO custom_forms (
          title, description, slug, google_form_url, embed_url, deadline, 
          instructions, requirements, display_on_homepage, icon, color, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        title,
        description,
        slug,
        googleFormUrl,
        embedUrl,
        deadline || null,
        instructions ? JSON.stringify(instructions) : null,
        requirements ? JSON.stringify(requirements) : null,
        displayOnHomepage ? 1 : 0,
        icon || 'FileText',
        color || 'from-blue-500 to-blue-600',
        createdBy
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    return NextResponse.json({
      success: true,
      message: 'Form created successfully',
      formId: insertId
    });
    
  } catch (error) {
    console.error('Create form error:', error);
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