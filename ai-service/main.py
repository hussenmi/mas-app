#!/usr/bin/env python3

import json
import sqlite3
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pathlib import Path

import ollama
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from hijri_converter import Hijri, Gregorian


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MAS Queens AI Assistant", version="1.0.0")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    context: Optional[Dict[str, Any]] = None
    sources: Optional[List[str]] = None

class PrayerTimesResponse(BaseModel):
    fajr: str
    sunrise: str
    dhuhr: str
    asr: str
    maghrib: str
    isha: str
    date: str
    hijri_date: str

# Database path
DB_PATH = Path(__file__).parent.parent / "users.db"

class MosqueAI:
    def __init__(self):
        self.model = "qwen2.5:3b"
        self.system_prompt = """You are a helpful AI assistant for MAS Queens, a mosque and community center. You help community members with:

1. Islamic guidance and questions
2. Prayer times and Islamic calendar
3. Event information and recommendations
4. Volunteer opportunities
5. General mosque information

Be respectful, knowledgeable about Islam, and helpful. Keep responses concise but informative.
If you don't know something specific about the mosque, suggest they contact the administration.

Always respond in a warm, community-oriented manner."""

    def get_db_connection(self):
        """Get database connection"""
        try:
            conn = sqlite3.connect(str(DB_PATH))
            conn.row_factory = sqlite3.Row
            return conn
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            return None

    def get_prayer_times(self, date: str = None) -> Dict[str, str]:
        """Get prayer times for specific date (placeholder - you'd integrate with actual prayer API)"""
        # For now, returning sample times - you'd integrate with IslamicFinder API or similar
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")

        # Convert to Hijri date
        gregorian_date = datetime.strptime(date, "%Y-%m-%d")
        hijri_date = Gregorian(gregorian_date.year, gregorian_date.month, gregorian_date.day).to_hijri()

        return {
            "fajr": "5:30 AM",
            "sunrise": "7:00 AM",
            "dhuhr": "12:30 PM",
            "asr": "3:45 PM",
            "maghrib": "6:15 PM",
            "isha": "7:45 PM",
            "date": date,
            "hijri_date": f"{hijri_date.day} {hijri_date.month_name()} {hijri_date.year} AH"
        }

    def get_upcoming_events(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get upcoming events from database"""
        conn = self.get_db_connection()
        if not conn:
            return []

        try:
            cursor = conn.execute("""
                SELECT title, description, date, time, location, category
                FROM events
                WHERE date >= date('now')
                ORDER BY date ASC
                LIMIT ?
            """, (limit,))

            events = []
            for row in cursor.fetchall():
                events.append({
                    "title": row["title"],
                    "description": row["description"],
                    "date": row["date"],
                    "time": row["time"],
                    "location": row["location"],
                    "category": row["category"]
                })

            return events
        except Exception as e:
            logger.error(f"Error fetching events: {e}")
            return []
        finally:
            conn.close()

    def get_volunteer_opportunities(self) -> List[Dict[str, Any]]:
        """Get volunteer opportunities"""
        conn = self.get_db_connection()
        if not conn:
            return []

        try:
            cursor = conn.execute("""
                SELECT e.title, e.date, e.time, e.volunteers_needed, e.description
                FROM events e
                WHERE e.date >= date('now') AND e.volunteers_needed > 0
                ORDER BY e.date ASC
                LIMIT 10
            """)

            opportunities = []
            for row in cursor.fetchall():
                opportunities.append({
                    "title": row["title"],
                    "date": row["date"],
                    "time": row["time"],
                    "volunteers_needed": row["volunteers_needed"],
                    "description": row["description"]
                })

            return opportunities
        except Exception as e:
            logger.error(f"Error fetching volunteer opportunities: {e}")
            return []
        finally:
            conn.close()

    def process_query(self, message: str) -> Dict[str, Any]:
        """Process user query and determine intent"""
        message_lower = message.lower()

        # Prayer times intent
        if any(word in message_lower for word in ["prayer", "salah", "namaz", "time", "fajr", "dhuhr", "asr", "maghrib", "isha"]):
            prayer_times = self.get_prayer_times()
            return {
                "intent": "prayer_times",
                "data": prayer_times,
                "context": "prayer_times"
            }

        # Events intent
        elif any(word in message_lower for word in ["event", "program", "activity", "happening", "schedule"]):
            events = self.get_upcoming_events()
            return {
                "intent": "events",
                "data": events,
                "context": "events"
            }

        # Volunteer intent
        elif any(word in message_lower for word in ["volunteer", "help", "contribute", "serve"]):
            opportunities = self.get_volunteer_opportunities()
            return {
                "intent": "volunteer",
                "data": opportunities,
                "context": "volunteer"
            }

        # General Islamic Q&A
        else:
            return {
                "intent": "general",
                "data": None,
                "context": "general"
            }

    def generate_response(self, message: str, context: Dict[str, Any] = None) -> str:
        """Generate AI response using Ollama"""
        try:
            # Process the query to understand intent
            query_result = self.process_query(message)
            intent = query_result["intent"]
            data = query_result["data"]

            # Build context-aware prompt
            if intent == "prayer_times":
                context_info = f"""Current prayer times:
- Fajr: {data['fajr']}
- Sunrise: {data['sunrise']}
- Dhuhr: {data['dhuhr']}
- Asr: {data['asr']}
- Maghrib: {data['maghrib']}
- Isha: {data['isha']}
- Date: {data['date']} ({data['hijri_date']})"""

            elif intent == "events":
                if data:
                    events_info = "Upcoming events:\n"
                    for event in data[:3]:  # Show top 3 events
                        events_info += f"- {event['title']} on {event['date']} at {event['time']}\n"
                    context_info = events_info
                else:
                    context_info = "No upcoming events found."

            elif intent == "volunteer":
                if data:
                    volunteer_info = "Volunteer opportunities:\n"
                    for opp in data[:3]:
                        volunteer_info += f"- {opp['title']} on {opp['date']} (needs {opp['volunteers_needed']} volunteers)\n"
                    context_info = volunteer_info
                else:
                    context_info = "No current volunteer opportunities."
            else:
                context_info = ""

            # Create the full prompt
            full_prompt = f"""{self.system_prompt}

Context information:
{context_info}

User question: {message}

Please provide a helpful response:"""

            # Call Ollama
            response = ollama.chat(model=self.model, messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": f"Context: {context_info}\n\nQuestion: {message}"}
            ])

            return response['message']['content']

        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "I apologize, I'm having trouble processing your request right now. Please try again or contact the mosque administration for assistance."

# Initialize AI assistant
ai_assistant = MosqueAI()

@app.get("/")
async def root():
    return {"message": "MAS Queens AI Assistant is running"}

@app.get("/health")
async def health_check():
    try:
        # Test Ollama connection
        models = ollama.list()
        return {"status": "healthy", "ollama": "connected", "models": len(models['models'])}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.post("/chat", response_model=ChatResponse)
async def chat(chat_message: ChatMessage):
    """Main chat endpoint"""
    try:
        response = ai_assistant.generate_response(
            chat_message.message,
            chat_message.context
        )

        return ChatResponse(
            response=response,
            context={"timestamp": datetime.now().isoformat()},
            sources=["MAS Queens AI Assistant"]
        )
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/prayer-times", response_model=PrayerTimesResponse)
async def get_prayer_times(date: str = None):
    """Get prayer times for specific date"""
    try:
        times = ai_assistant.get_prayer_times(date)
        return PrayerTimesResponse(**times)
    except Exception as e:
        logger.error(f"Prayer times error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get prayer times")

@app.get("/events")
async def get_events(limit: int = 10):
    """Get upcoming events"""
    try:
        events = ai_assistant.get_upcoming_events(limit)
        return {"events": events}
    except Exception as e:
        logger.error(f"Events error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get events")

@app.get("/volunteer-opportunities")
async def get_volunteer_opportunities():
    """Get volunteer opportunities"""
    try:
        opportunities = ai_assistant.get_volunteer_opportunities()
        return {"opportunities": opportunities}
    except Exception as e:
        logger.error(f"Volunteer opportunities error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get volunteer opportunities")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)