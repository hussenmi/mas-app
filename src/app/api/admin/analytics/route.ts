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

// GET - Fetch analytics data
export async function GET(req: NextRequest) {
  let db;
  try {
    db = await getDb();
    const all = promisify(db.all.bind(db));
    const get = promisify(db.get.bind(db));
    
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || '30'; // days
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Calculate date range
    let dateFilter = '';
    let dateParams: any[] = [];
    
    if (startDate && endDate) {
      dateFilter = 'AND DATE(created_at) BETWEEN ? AND ?';
      dateParams = [startDate, endDate];
    } else {
      dateFilter = 'AND DATE(created_at) >= DATE("now", "-' + parseInt(timeRange) + ' days")';
    }

    // 1. Overview Statistics
    const totalUsers = await get('SELECT COUNT(*) as count FROM users');
    const totalVolunteers = await get('SELECT COUNT(*) as count FROM volunteer_profiles');
    const totalEvents = await get('SELECT COUNT(*) as count FROM events');
    const totalRsvps = await get('SELECT COUNT(*) as count FROM event_rsvps');
    
    // 2. User Growth Over Time
    const userGrowth = await all(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as total_users
      FROM users 
      WHERE 1=1 ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date
    `, dateParams);

    // 3. Volunteer Analytics
    const volunteersByTag = await all(`
      SELECT 
        vt.name as tag_name,
        vt.color as tag_color,
        COUNT(vta.volunteer_id) as volunteer_count
      FROM volunteer_tags vt
      LEFT JOIN volunteer_tag_assignments vta ON vt.id = vta.tag_id
      GROUP BY vt.id, vt.name, vt.color
      ORDER BY volunteer_count DESC
    `);

    const volunteerGrowth = await all(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_volunteers,
        SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as total_volunteers
      FROM volunteer_profiles 
      WHERE 1=1 ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date
    `, dateParams);

    // 4. Top Active Volunteers
    const topVolunteers = await all(`
      SELECT 
        u.first_name || ' ' || u.last_name as name,
        COUNT(vs.id) as events_participated,
        COALESCE(AVG(ved.performance_rating), 0) as avg_rating,
        GROUP_CONCAT(DISTINCT vt.name) as tags
      FROM volunteer_profiles vp
      JOIN users u ON vp.user_id = u.id
      LEFT JOIN volunteer_signups vs ON vp.user_id = vs.user_id
      LEFT JOIN volunteer_event_details ved ON vs.id = ved.signup_id
      LEFT JOIN volunteer_tag_assignments vta ON vp.id = vta.volunteer_id
      LEFT JOIN volunteer_tags vt ON vta.tag_id = vt.id
      GROUP BY vp.id, u.first_name, u.last_name
      ORDER BY events_participated DESC
      LIMIT 10
    `);

    // 5. Event Analytics
    const eventsByMonth = await all(`
      SELECT 
        strftime('%Y-%m', date) as month,
        COUNT(*) as event_count
      FROM events 
      WHERE 1=1 ${dateFilter.replace('created_at', 'date')}
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month
    `, dateParams);

    const popularEvents = await all(`
      SELECT 
        e.title,
        e.date,
        COUNT(er.id) as rsvp_count,
        e.volunteers_needed as capacity,
        CASE 
          WHEN e.volunteers_needed > 0 THEN ROUND((COUNT(er.id) * 100.0 / e.volunteers_needed), 2)
          ELSE 0 
        END as fill_percentage
      FROM events e
      LEFT JOIN event_rsvps er ON e.id = er.event_id
      WHERE 1=1 ${dateFilter.replace('created_at', 'e.date')}
      GROUP BY e.id, e.title, e.date, e.volunteers_needed
      ORDER BY rsvp_count DESC
      LIMIT 10
    `, dateParams);

    // 6. RSVP Trends
    const rsvpTrends = await all(`
      SELECT 
        DATE(er.created_at) as date,
        COUNT(*) as rsvps,
        COUNT(DISTINCT er.user_id) as unique_users
      FROM event_rsvps er
      WHERE 1=1 ${dateFilter.replace('created_at', 'er.created_at')}
      GROUP BY DATE(er.created_at)
      ORDER BY date
    `, dateParams);

    // 7. Volunteer Signup Trends
    const volunteerSignupTrends = await all(`
      SELECT 
        DATE(vs.created_at) as date,
        COUNT(*) as signups,
        COUNT(DISTINCT vs.user_id) as unique_volunteers
      FROM volunteer_signups vs
      WHERE 1=1 ${dateFilter.replace('created_at', 'vs.created_at')}
      GROUP BY DATE(vs.created_at)
      ORDER BY date
    `, dateParams);

    // 8. Event Categories (if you have categories)
    const eventCategories = await all(`
      SELECT 
        COALESCE(category, 'Uncategorized') as category,
        COUNT(*) as event_count
      FROM events
      WHERE 1=1 ${dateFilter.replace('created_at', 'date')}
      GROUP BY category
      ORDER BY event_count DESC
    `, dateParams);

    // 9. User Activity (last 30 days)
    const userActivity = await all(`
      SELECT 
        'Event RSVPs' as activity_type,
        COUNT(*) as count
      FROM event_rsvps 
      WHERE DATE(created_at) >= DATE('now', '-30 days')
      
      UNION ALL
      
      SELECT 
        'Volunteer Signups' as activity_type,
        COUNT(*) as count
      FROM volunteer_signups 
      WHERE DATE(created_at) >= DATE('now', '-30 days')
      
      UNION ALL
      
      SELECT 
        'New User Registrations' as activity_type,
        COUNT(*) as count
      FROM users 
      WHERE DATE(created_at) >= DATE('now', '-30 days')
    `);

    // 10. Engagement Metrics
    const engagementMetrics = await get(`
      SELECT 
        (SELECT COUNT(*) FROM event_rsvps WHERE DATE(created_at) >= DATE('now', '-30 days')) as recent_rsvps,
        (SELECT COUNT(*) FROM volunteer_signups WHERE DATE(created_at) >= DATE('now', '-30 days')) as recent_volunteer_signups,
        (SELECT COUNT(DISTINCT user_id) FROM event_rsvps WHERE DATE(created_at) >= DATE('now', '-30 days')) as active_users,
        (SELECT COUNT(*) FROM users WHERE DATE(created_at) >= DATE('now', '-30 days')) as new_users
    `);

    const analytics = {
      overview: {
        totalUsers: totalUsers.count,
        totalVolunteers: totalVolunteers.count,
        totalEvents: totalEvents.count,
        totalRsvps: totalRsvps.count,
        engagementRate: engagementMetrics.active_users > 0 ? 
          Math.round((engagementMetrics.active_users / totalUsers.count) * 100) : 0
      },
      growth: {
        users: userGrowth,
        volunteers: volunteerGrowth
      },
      volunteers: {
        byTag: volunteersByTag,
        topVolunteers: topVolunteers.map(v => ({
          ...v,
          tags: v.tags ? v.tags.split(',') : []
        }))
      },
      events: {
        byMonth: eventsByMonth,
        popular: popularEvents,
        categories: eventCategories
      },
      engagement: {
        rsvpTrends: rsvpTrends,
        volunteerSignupTrends: volunteerSignupTrends,
        userActivity: userActivity,
        metrics: engagementMetrics
      },
      timeRange: {
        startDate: startDate || new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0],
        days: parseInt(timeRange)
      }
    };

    return NextResponse.json({ analytics });

  } catch (error) {
    console.error('Analytics error:', error);
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