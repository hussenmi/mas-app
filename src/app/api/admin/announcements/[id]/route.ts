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

// PUT - Update announcement
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  let db;
  try {
    const announcementId = params.id;
    const { text, icon, is_active, priority } = await req.json();
    
    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Announcement text is required' },
        { status: 400 }
      );
    }
    
    db = await getDb();
    const run = promisify(db.run.bind(db));
    
    await run(`
      UPDATE announcements 
      SET text = ?, icon = ?, is_active = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [text.trim(), icon || '', is_active ? 1 : 0, priority || 0, announcementId]);
    
    // Invalidate announcements cache
    cache.delete('active-announcements');
    
    return NextResponse.json({ message: 'Announcement updated successfully' });
    
  } catch (error) {
    console.error('Update announcement error:', error);
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

// DELETE - Delete announcement
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let db;
  try {
    const announcementId = params.id;
    
    db = await getDb();
    const run = promisify(db.run.bind(db));
    
    await run(`DELETE FROM announcements WHERE id = ?`, [announcementId]);
    
    // Invalidate announcements cache
    cache.delete('active-announcements');
    
    return NextResponse.json({ message: 'Announcement deleted successfully' });
    
  } catch (error) {
    console.error('Delete announcement error:', error);
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