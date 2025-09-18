from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Dict, List

from shared.database import (
    execute_select_query,
    get_event_by_title,
    get_events,
    get_volunteer_opportunities,
    create_event_rsvp,
    check_user_rsvp_status,
    get_event_by_id,
    get_user_by_email,
)
from shared.prayer_times import get_prayer_times


@dataclass
class ToolDefinition:
    name: str
    description: str
    parameters: Dict[str, Any]
    handler: Callable[[Dict[str, Any]], Dict[str, Any]]

    def as_openai_tool(self) -> Dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters,
            },
        }


class ToolRegistry:
    def __init__(self, *, allowed_sql_operations: List[str] | None = None):
        self._allowed_sql_operations = allowed_sql_operations or ["SELECT", "WITH"]
        self._tools: Dict[str, ToolDefinition] = {}
        self._context: Dict[str, Any] = {}
        self._register_default_tools()

    def _register_default_tools(self) -> None:
        self.register(
            ToolDefinition(
                name="get_prayer_times",
                description=(
                    "Get Islamic prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) for any date. "
                    "Calculate relative dates like 'tomorrow', 'in 3 days', etc. yourself before calling. "
                    "Returns both Adhan (call to prayer) and Iqama (start of prayer) times."
                ),
                parameters={
                    "type": "object",
                    "properties": {
                        "date": {
                            "type": "string",
                            "description": "Target date in YYYY-MM-DD format. Calculate from relative terms first."
                        }
                    },
                },
                handler=self._handle_get_prayer_times,
            )
        )

        self.register(
            ToolDefinition(
                name="search_events",
                description="List mosque events with optional keyword and date filters.",
                parameters={
                    "type": "object",
                    "properties": {
                        "query": {"type": "string"},
                        "date_from": {"type": "string"},
                        "limit": {"type": "integer", "minimum": 1, "maximum": 20},
                    },
                },
                handler=self._handle_search_events,
            )
        )

        self.register(
            ToolDefinition(
                name="get_event_details",
                description="Fetch a single event by title or partial match.",
                parameters={
                    "type": "object",
                    "properties": {
                        "event_title": {
                            "type": "string",
                            "description": "Event title or keyword."
                        }
                    },
                    "required": ["event_title"],
                },
                handler=self._handle_event_details,
            )
        )

        self.register(
            ToolDefinition(
                name="search_volunteer_opportunities",
                description="Return upcoming volunteer roles that still need help.",
                parameters={"type": "object", "properties": {}},
                handler=self._handle_volunteers,
            )
        )

        self.register(
            ToolDefinition(
                name="get_next_prayer_time",
                description=(
                    "Get the next upcoming prayer time for today. "
                    "Compares current time with today's prayer schedule to find which prayer is next."
                ),
                parameters={"type": "object", "properties": {}},
                handler=self._handle_next_prayer,
            )
        )

        self.register(
            ToolDefinition(
                name="find_volunteer_contact_for_recent_event",
                description=(
                    "Find volunteer contact information for the most recently discussed event in conversation. "
                    "Use when user asks 'who can I contact to volunteer for the event' or similar contextual questions."
                ),
                parameters={
                    "type": "object",
                    "properties": {
                        "event_reference": {
                            "type": "string",
                            "description": "Reference to the event ('next event', 'that event', or specific event name from conversation)"
                        }
                    }
                },
                handler=self._handle_contextual_volunteer_contact,
            )
        )

        self.register(
            ToolDefinition(
                name="execute_sql_query",
                description=(
                    "Execute intelligent SQL queries against the mosque database for complex questions. "
                    "Available tables: events (id, title, description, date, time, location, category, volunteers_needed, contact_email, price, status), "
                    "users (id, first_name, last_name, email, phone), "
                    "volunteer_signups (user_id, event_id, created_at), "
                    "event_rsvps (user_id, event_id, created_at). "
                    "Use for complex filtering, aggregations, or when predefined tools don't suffice. "
                    "Only SELECT and WITH statements allowed."
                ),
                parameters={
                    "type": "object",
                    "properties": {
                        "sql": {
                            "type": "string",
                            "description": "Complete SQLite SELECT query. Include table/column context."
                        },
                        "parameters": {
                            "type": ["array", "object"],
                            "description": "Optional SQL parameters for safe parameterized queries."
                        },
                    },
                    "required": ["sql"],
                },
                handler=self._handle_execute_sql,
            )
        )

        self.register(
            ToolDefinition(
                name="rsvp_to_event",
                description=(
                    "RSVP to an event for a user. Validates that the event is open for registration, "
                    "user hasn't already RSVP'd, and creates the RSVP if all checks pass. "
                    "Returns detailed status and next steps."
                ),
                parameters={
                    "type": "object",
                    "properties": {
                        "user_email": {
                            "type": "string",
                            "description": "Email address of the user who wants to RSVP"
                        },
                        "event_title": {
                            "type": "string",
                            "description": "Title or partial title of the event to RSVP for"
                        }
                    },
                    "required": ["user_email", "event_title"],
                },
                handler=self._handle_rsvp_to_event,
            )
        )

        self.register(
            ToolDefinition(
                name="rsvp_current_user_to_event",
                description=(
                    "RSVP the currently logged-in user to an event. Uses the user's session context "
                    "to automatically identify them. Only works when user is authenticated. "
                    "Validates event availability and prevents duplicate RSVPs."
                ),
                parameters={
                    "type": "object",
                    "properties": {
                        "event_title": {
                            "type": "string",
                            "description": "Title or partial title of the event to RSVP for"
                        }
                    },
                    "required": ["event_title"],
                },
                handler=self._handle_rsvp_current_user,
            )
        )

    def register(self, tool: ToolDefinition) -> None:
        self._tools[tool.name] = tool

    def as_openai_tools(self) -> List[Dict[str, Any]]:
        return [tool.as_openai_tool() for tool in self._tools.values()]

    def set_context(self, context: Dict[str, Any]) -> None:
        """Set the current context for tool execution"""
        self._context = context or {}

    def get_context(self) -> Dict[str, Any]:
        """Get the current context"""
        return self._context

    def execute(self, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        tool = self._tools.get(name)
        if not tool:
            raise ValueError(f"Unknown tool requested: {name}")
        return tool.handler(arguments or {})

    @staticmethod
    def _handle_get_prayer_times(arguments: Dict[str, Any]) -> Dict[str, Any]:
        date = arguments.get("date")
        return {"prayer_times": get_prayer_times(date)}

    @staticmethod
    def _handle_search_events(arguments: Dict[str, Any]) -> Dict[str, Any]:
        limit = arguments.get("limit", 10)
        query = arguments.get("query", "")
        date_from = arguments.get("date_from")
        events = get_events(limit=limit, user_query=query, date_filter=date_from)
        return {"events": events, "count": len(events)}

    @staticmethod
    def _handle_event_details(arguments: Dict[str, Any]) -> Dict[str, Any]:
        title = arguments.get("event_title", "")
        event = get_event_by_title(title)
        if not event:
            return {"error": "Event not found"}
        return {"event": event}

    @staticmethod
    def _handle_volunteers(arguments: Dict[str, Any]) -> Dict[str, Any]:
        opportunities = get_volunteer_opportunities()
        return {"opportunities": opportunities, "count": len(opportunities)}

    @staticmethod
    def _handle_next_prayer(arguments: Dict[str, Any]) -> Dict[str, Any]:
        from datetime import datetime

        prayer_data = get_prayer_times()
        if "error" in prayer_data:
            return prayer_data

        current_time = datetime.now().strftime("%H:%M")
        current_hour_min = datetime.strptime(current_time, "%H:%M").time()

        prayers = [
            ("Fajr", prayer_data.get("fajr", "")),
            ("Dhuhr", prayer_data.get("dhuhr", "")),
            ("Asr", prayer_data.get("asr", "")),
            ("Maghrib", prayer_data.get("maghrib", "")),
            ("Isha", prayer_data.get("isha", ""))
        ]

        for prayer_name, prayer_time_str in prayers:
            try:
                # Convert prayer time to 24hr format for comparison
                prayer_time = datetime.strptime(prayer_time_str.replace(" AM", "").replace(" PM", ""), "%I:%M")
                if "PM" in prayer_time_str and prayer_time.hour != 12:
                    prayer_time = prayer_time.replace(hour=prayer_time.hour + 12)
                elif "AM" in prayer_time_str and prayer_time.hour == 12:
                    prayer_time = prayer_time.replace(hour=0)

                if prayer_time.time() > current_hour_min:
                    iqama_key = f"{prayer_name.lower()}_iqama"
                    iqama_time = prayer_data.get(iqama_key, "")
                    return {
                        "next_prayer": prayer_name,
                        "adhan_time": prayer_time_str,
                        "iqama_time": iqama_time,
                        "current_time": current_time
                    }
            except:
                continue

        # If no prayer found for today, return Fajr for tomorrow
        return {
            "next_prayer": "Fajr (tomorrow)",
            "message": "All prayers for today have passed. Next prayer is Fajr tomorrow."
        }

    @staticmethod
    def _handle_contextual_volunteer_contact(arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Handle contextual volunteer contact requests by finding the most relevant upcoming event"""
        # For now, find the next upcoming event that needs volunteers
        # In a more sophisticated system, this would look at conversation history
        events = get_events(limit=5, user_query="")

        for event in events:
            if event.get("volunteers_needed", 0) > 0:
                return {
                    "event": event["title"],
                    "date": event["date"],
                    "time": event["time"],
                    "location": event["location"],
                    "volunteers_needed": event["volunteers_needed"],
                    "contact_email": event["contact_email"],
                    "price": event["price"]
                }

        return {"error": "No upcoming events currently need volunteers"}

    def _handle_execute_sql(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        sql = arguments.get("sql", "")
        parameters = arguments.get("parameters")
        rows = execute_select_query(
            sql,
            parameters,
            allowed_operations=self._allowed_sql_operations,
        )
        return {"rows": rows, "row_count": len(rows)}

    @staticmethod
    def _handle_rsvp_to_event(arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Handle RSVP to event with comprehensive validation"""
        user_email = arguments.get("user_email", "").strip()
        event_title = arguments.get("event_title", "").strip()

        if not user_email or not event_title:
            return {"error": "Both user email and event title are required"}

        # Get user by email
        user = get_user_by_email(user_email)
        if not user:
            return {
                "error": f"User with email {user_email} not found",
                "suggestion": "Please make sure the email address is correct or register first"
            }

        # Get event by title
        event = get_event_by_title(event_title)
        if not event:
            return {
                "error": f"Event '{event_title}' not found",
                "suggestion": "Please check the event title or search for available events"
            }

        # Check if event is active/open for registration
        if event.get("status") != "active":
            return {
                "error": f"Event '{event['title']}' is not open for registration",
                "event_status": event.get("status", "unknown")
            }

        # Check if event requires payment
        event_price = event.get("price", 0)
        if event_price and event_price > 0:
            return {
                "error": f"This event costs ${event_price} and requires payment",
                "message": "For paid events, please visit our website to complete registration with payment",
                "event_details": {
                    "title": event["title"],
                    "date": event["date"],
                    "time": event["time"],
                    "location": event["location"],
                    "price": event_price
                },
                "suggestion": "Contact the mosque directly for payment options or visit the website"
            }

        # Check if user has already RSVP'd
        rsvp_status = check_user_rsvp_status(user["id"], event["id"])
        if "error" in rsvp_status:
            return {"error": f"Error checking RSVP status: {rsvp_status['error']}"}

        if rsvp_status["has_rsvpd"]:
            return {
                "error": f"You have already RSVP'd to '{event['title']}'",
                "rsvp_date": rsvp_status["rsvp_date"],
                "event_details": {
                    "title": event["title"],
                    "date": event["date"],
                    "time": event["time"],
                    "location": event["location"]
                }
            }

        # Create the RSVP
        rsvp_success = create_event_rsvp(user["id"], event["id"])
        if not rsvp_success:
            return {"error": "Failed to create RSVP due to database error"}

        # Return success with event details
        return {
            "success": True,
            "message": f"Successfully RSVP'd to '{event['title']}'",
            "user": {
                "name": f"{user['first_name']} {user['last_name']}",
                "email": user["email"]
            },
            "event_details": {
                "title": event["title"],
                "date": event["date"],
                "time": event["time"],
                "location": event["location"],
                "description": event["description"],
                "price": event["price"],
                "contact_email": event["contact_email"]
            },
            "next_steps": "Please mark your calendar and contact the organizer if you have any questions"
        }

    def _handle_rsvp_current_user(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Handle RSVP for the currently logged-in user"""
        event_title = arguments.get("event_title", "").strip()

        if not event_title:
            return {"error": "Event title is required"}

        # Get user email from context
        context = self.get_context()
        user_email = context.get("user_email")

        if not user_email:
            return {
                "error": "User not authenticated",
                "message": "Please log in to RSVP for events",
                "suggestion": "You can also provide your email explicitly if you prefer"
            }

        # Use the existing RSVP logic with the extracted email
        return self._handle_rsvp_to_event({
            "user_email": user_email,
            "event_title": event_title
        })
