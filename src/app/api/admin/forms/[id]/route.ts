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

// GET - Fetch single form
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  let db;
  try {
    const formId = params.id;
    
    db = await getDb();
    const get = promisify(db.get.bind(db));
    
    const form = await get(`
      SELECT 
        cf.*,
        COALESCE(au.first_name || ' ' || au.last_name, 'Unknown Admin') as created_by_name
      FROM custom_forms cf
      LEFT JOIN admin_users au ON cf.created_by = au.id
      WHERE cf.id = ?
    `, [formId]);
    
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }
    
    // Parse JSON fields
    const formWithParsedData = {
      ...form,
      instructions: form.instructions ? JSON.parse(form.instructions) : null,
      requirements: form.requirements ? JSON.parse(form.requirements) : null,
      display_on_homepage: Boolean(form.display_on_homepage)
    };
    
    return NextResponse.json({ form: formWithParsedData });
    
  } catch (error) {
    console.error('Fetch form error:', error);
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

// PATCH - Update form
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let db;
  try {
    const formId = params.id;
    const updates = await req.json();
    
    db = await getDb();
    const run = promisify(db.run.bind(db));
    
    // Build dynamic update query
    const updateFields = [];
    const values = [];
    
    if (updates.title !== undefined) {
      updateFields.push('title = ?');
      values.push(updates.title);
    }
    
    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      values.push(updates.description);
    }
    
    if (updates.slug !== undefined) {
      updateFields.push('slug = ?');
      values.push(updates.slug);
    }
    
    if (updates.google_form_url !== undefined) {
      updateFields.push('google_form_url = ?');
      values.push(updates.google_form_url);
    }
    
    if (updates.embed_url !== undefined) {
      updateFields.push('embed_url = ?');
      values.push(updates.embed_url);
    }
    
    if (updates.deadline !== undefined) {
      updateFields.push('deadline = ?');
      values.push(updates.deadline);
    }
    
    if (updates.display_on_homepage !== undefined) {
      updateFields.push('display_on_homepage = ?');
      values.push(updates.display_on_homepage ? 1 : 0);
    }
    
    if (updates.status !== undefined) {
      updateFields.push('status = ?');
      values.push(updates.status);
    }
    
    if (updates.icon !== undefined) {
      updateFields.push('icon = ?');
      values.push(updates.icon);
    }
    
    if (updates.color !== undefined) {
      updateFields.push('color = ?');
      values.push(updates.color);
    }
    
    if (updates.instructions !== undefined) {
      updateFields.push('instructions = ?');
      values.push(updates.instructions ? JSON.stringify(updates.instructions) : null);
    }
    
    if (updates.requirements !== undefined) {
      updateFields.push('requirements = ?');
      values.push(updates.requirements ? JSON.stringify(updates.requirements) : null);
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(formId);
    
    const query = `UPDATE custom_forms SET ${updateFields.join(', ')} WHERE id = ?`;
    
    await run(query, values);
    
    return NextResponse.json({
      success: true,
      message: 'Form updated successfully'
    });
    
  } catch (error) {
    console.error('Update form error:', error);
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

// DELETE - Delete form
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let db;
  try {
    const formId = params.id;
    
    db = await getDb();
    const run = promisify(db.run.bind(db));
    
    await run('DELETE FROM custom_forms WHERE id = ?', [formId]);
    
    return NextResponse.json({
      success: true,
      message: 'Form deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete form error:', error);
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