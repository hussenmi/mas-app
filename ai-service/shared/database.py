#!/usr/bin/env python3
"""
Shared database functions for MAS Queens AI Service
"""

import sqlite3
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Sequence

logger = logging.getLogger(__name__)

# Database path
DB_PATH = Path(__file__).parent.parent.parent / "users.db"

def get_db_connection():
    """Get database connection with row factory"""
    try:
        conn = sqlite3.connect(str(DB_PATH))
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return None

def get_events(limit: int = 10, user_query: str = "", date_filter: str = None) -> List[Dict[str, Any]]:
    """Get upcoming events with optional filtering"""
    conn = get_db_connection()
    if not conn:
        return []

    try:
        base_query = """
            SELECT id, title, description, date, time, location, category, volunteers_needed, contact_email, price
            FROM events
            WHERE status = 'active' AND date >= date('now')
        """

        params = []

        if date_filter:
            base_query += " AND date >= ?"
            params.append(date_filter)

        if user_query:
            base_query += " AND (title LIKE ? OR description LIKE ? OR category LIKE ?)"
            search_term = f"%{user_query}%"
            params.extend([search_term, search_term, search_term])

        base_query += " ORDER BY date ASC LIMIT ?"
        params.append(limit)

        cursor = conn.execute(base_query, params)
        events = []

        for row in cursor.fetchall():
            events.append({
                "id": row["id"],
                "title": row["title"],
                "description": row["description"],
                "date": row["date"],
                "time": row["time"],
                "location": row["location"],
                "category": row["category"],
                "volunteers_needed": row["volunteers_needed"],
                "contact_email": row["contact_email"],
                "price": row["price"]
            })

        return events

    except Exception as e:
        logger.error(f"Error fetching events: {e}")
        return []
    finally:
        conn.close()

def get_event_by_title(title: str) -> Optional[Dict[str, Any]]:
    """Get specific event by title"""
    conn = get_db_connection()
    if not conn:
        return None

    try:
        cursor = conn.execute("""
            SELECT id, title, description, date, time, location, category, volunteers_needed, contact_email, price, status
            FROM events
            WHERE LOWER(title) LIKE LOWER(?) AND status = 'active'
            LIMIT 1
        """, (f"%{title}%",))

        row = cursor.fetchone()
        if row:
            return {
                "id": row["id"],
                "title": row["title"],
                "description": row["description"],
                "date": row["date"],
                "time": row["time"],
                "location": row["location"],
                "category": row["category"],
                "volunteers_needed": row["volunteers_needed"],
                "contact_email": row["contact_email"],
                "price": row["price"],
                "status": row["status"]
            }
        return None

    except Exception as e:
        logger.error(f"Error fetching event by title: {e}")
        return None
    finally:
        conn.close()

def get_volunteer_opportunities() -> List[Dict[str, Any]]:
    """Get volunteer opportunities"""
    conn = get_db_connection()
    if not conn:
        return []

    try:
        cursor = conn.execute("""
            SELECT title, date, time, volunteers_needed, description, contact_email
            FROM events
            WHERE date >= date('now') AND volunteers_needed > 0 AND status = 'active'
            ORDER BY date ASC
            LIMIT 10
        """)

        opportunities = []
        for row in cursor.fetchall():
            opportunities.append({
                "title": row["title"],
                "date": row["date"],
                "time": row["time"],
                "volunteers_needed": row["volunteers_needed"],
                "description": row["description"],
                "contact_email": row["contact_email"]
            })

        return opportunities
    except Exception as e:
        logger.error(f"Error fetching volunteer opportunities: {e}")
        return []
    finally:
        conn.close()


def execute_select_query(
    sql: str,
    parameters: Optional[Sequence[Any]] = None,
    *,
    allowed_operations: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """Run a safe read-only SQL query against the primary database."""
    conn = get_db_connection()
    if not conn:
        return []

    try:
        normalized = sql.strip().upper()
        if not normalized:
            return []

        if allowed_operations:
            if not any(normalized.startswith(op) for op in allowed_operations):
                raise ValueError("SQL operation not permitted")

        dangerous_keywords = [
            "DROP",
            "DELETE",
            "UPDATE",
            "INSERT",
            "ALTER",
            "TRUNCATE",
            "REPLACE",
            "ATTACH",
            "DETACH",
            "PRAGMA",
        ]

        for keyword in dangerous_keywords:
            if keyword in normalized:
                raise ValueError("SQL contains a restricted keyword")

        cursor = conn.execute(sql, parameters or [])
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        return [dict(zip(columns, row)) for row in rows]
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Error executing SQL query: {exc}")
        return []
    finally:
        conn.close()

def create_event_rsvp(user_id: int, event_id: int) -> bool:
    """Create an event RSVP (future agent capability)"""
    conn = get_db_connection()
    if not conn:
        return False

    try:
        conn.execute("""
            INSERT INTO event_rsvps (user_id, event_id, created_at)
            VALUES (?, ?, datetime('now'))
        """, (user_id, event_id))
        conn.commit()
        return True
    except Exception as e:
        logger.error(f"Error creating RSVP: {e}")
        return False
    finally:
        conn.close()

def create_volunteer_signup(user_id: int, event_id: int) -> bool:
    """Create a volunteer signup (future agent capability)"""
    conn = get_db_connection()
    if not conn:
        return False

    try:
        conn.execute("""
            INSERT INTO volunteer_signups (user_id, event_id, created_at)
            VALUES (?, ?, datetime('now'))
        """, (user_id, event_id))
        conn.commit()
        return True
    except Exception as e:
        logger.error(f"Error creating volunteer signup: {e}")
        return False
    finally:
        conn.close()

def check_user_rsvp_status(user_id: int, event_id: int) -> Dict[str, Any]:
    """Check if user has already RSVP'd to an event"""
    conn = get_db_connection()
    if not conn:
        return {"error": "Database connection failed"}

    try:
        cursor = conn.execute("""
            SELECT created_at FROM event_rsvps
            WHERE user_id = ? AND event_id = ?
        """, (user_id, event_id))

        existing_rsvp = cursor.fetchone()

        return {
            "has_rsvpd": existing_rsvp is not None,
            "rsvp_date": existing_rsvp["created_at"] if existing_rsvp else None
        }
    except Exception as e:
        logger.error(f"Error checking RSVP status: {e}")
        return {"error": f"Error checking RSVP status: {e}"}
    finally:
        conn.close()

def get_event_by_id(event_id: int) -> Optional[Dict[str, Any]]:
    """Get event details by ID"""
    conn = get_db_connection()
    if not conn:
        return None

    try:
        cursor = conn.execute("""
            SELECT id, title, description, date, time, location, category,
                   volunteers_needed, contact_email, price, status
            FROM events
            WHERE id = ?
        """, (event_id,))

        row = cursor.fetchone()
        if row:
            return {
                "id": row["id"],
                "title": row["title"],
                "description": row["description"],
                "date": row["date"],
                "time": row["time"],
                "location": row["location"],
                "category": row["category"],
                "volunteers_needed": row["volunteers_needed"],
                "contact_email": row["contact_email"],
                "price": row["price"],
                "status": row["status"]
            }
        return None

    except Exception as e:
        logger.error(f"Error fetching event by ID: {e}")
        return None
    finally:
        conn.close()

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email address"""
    conn = get_db_connection()
    if not conn:
        return None

    try:
        cursor = conn.execute("""
            SELECT id, first_name, last_name, email, phone
            FROM users
            WHERE email = ?
        """, (email,))

        row = cursor.fetchone()
        if row:
            return {
                "id": row["id"],
                "first_name": row["first_name"],
                "last_name": row["last_name"],
                "email": row["email"],
                "phone": row["phone"]
            }
        return None

    except Exception as e:
        logger.error(f"Error fetching user by email: {e}")
        return None
    finally:
        conn.close()
