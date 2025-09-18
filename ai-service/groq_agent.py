#!/usr/bin/env python3
"""
Advanced Groq Agent for MAS Queens - Enhanced AI with function calling and multi-step workflows
"""

import json
import logging
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from groq import Groq
from dotenv import load_dotenv

from shared.database import get_events, get_event_by_title, get_volunteer_opportunities, create_event_rsvp, create_volunteer_signup
from shared.prayer_times import get_prayer_times

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class GroqMosqueAgent:
    def __init__(self):
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

        # Enhanced conversation memory with user preferences and context
        self.conversation_memory = {}

        # System prompt optimized for advanced capabilities
        self.system_prompt = f"""You are an advanced AI assistant for MAS Queens mosque and community center.

CURRENT DATE: {datetime.now().strftime('%Y-%m-%d')}

RESPONSE FORMATTING RULES:
When showing events, use this EXACT format:
📅 **[Event Title]**
🕐 [Date] at [Time]
📍 [Location]
💰 Price: $[amount] (or "Free" if price is 0)
👥 Volunteers needed: [number]
📧 Contact: [email]

CRITICAL RULES:
- NEVER guess prices - always use the exact price from the database
- NEVER say "free" unless price is 0
- Be factual, not conversational ("There is an event" not "It seems like there's an event")
- Always include complete information when available
- Use structured formatting for events, prayer times, and contact info

CAPABILITIES:
- Calculate dates naturally (today, tomorrow, next week, in 3 days, etc.)
- Handle complex multi-step queries
- Remember conversation context and user preferences
- Provide proactive suggestions and follow-ups
- Maintain warm, Islamic etiquette in all interactions

RESPONSE STYLE:
- Be direct and informative, not uncertain
- Use structured formatting for better readability
- Always include contact information when relevant
- Be helpful and suggest next steps

Always be accurate with data from the database and suggest contacting mosque administration for complex requests."""

        # Enhanced tool definitions with more sophisticated capabilities
        self.tools = [
            {
                "type": "function",
                "function": {
                    "name": "get_prayer_times",
                    "description": "Get Islamic prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) for any date",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "date": {
                                "type": "string",
                                "description": "Date in YYYY-MM-DD format. YOU MUST calculate the actual date from natural language. For example: 'tomorrow' = calculate tomorrow's date, 'in 2 days' = calculate 2 days from today's date (2024-09-18)"
                            }
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "search_events",
                    "description": "Search for events with flexible filtering by date range, keywords, categories",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Search keywords for event title, description, or category"
                            },
                            "date_from": {
                                "type": "string",
                                "description": "Start date for search in YYYY-MM-DD format"
                            },
                            "date_to": {
                                "type": "string",
                                "description": "End date for search in YYYY-MM-DD format"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Maximum number of events to return (default 10, max 20)"
                            }
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_event_details",
                    "description": "Get detailed information about a specific event by title or partial name",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "event_title": {
                                "type": "string",
                                "description": "Full or partial event title to search for"
                            }
                        },
                        "required": ["event_title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "search_volunteers",
                    "description": "Find volunteer opportunities, optionally for specific events",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "event_name": {
                                "type": "string",
                                "description": "Specific event to find volunteer info for (optional)"
                            }
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_conversation_context",
                    "description": "Retrieve previous conversation context and user preferences",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "session_id": {
                                "type": "string",
                                "description": "Session ID to retrieve context for"
                            }
                        },
                        "required": ["session_id"]
                    }
                }
            }
        ]

    def get_session_memory(self, session_id: str) -> Dict[str, Any]:
        """Get enhanced session memory with preferences and context"""
        if session_id not in self.conversation_memory:
            self.conversation_memory[session_id] = {
                "chat_history": [],
                "user_preferences": {},
                "discussed_events": [],
                "interests": [],
                "last_prayer_query": None,
                "volunteer_interests": [],
                "session_start": datetime.now().isoformat()
            }
        return self.conversation_memory[session_id]

    def update_session_memory(self, session_id: str, message: str, response: str, context: Dict[str, Any] = None):
        """Update session memory with enhanced context tracking"""
        memory = self.get_session_memory(session_id)

        # Add to chat history
        memory["chat_history"].append({
            "role": "user",
            "content": message,
            "timestamp": datetime.now().isoformat()
        })
        memory["chat_history"].append({
            "role": "assistant",
            "content": response,
            "timestamp": datetime.now().isoformat()
        })

        # Keep last 12 messages (6 exchanges)
        if len(memory["chat_history"]) > 12:
            memory["chat_history"] = memory["chat_history"][-12:]

        # Update context and preferences based on conversation
        if context:
            if "events" in context:
                memory["discussed_events"].extend(context["events"])
                memory["discussed_events"] = list(set(memory["discussed_events"]))[-5:]  # Keep last 5 unique events

            if "prayer_times" in context:
                memory["last_prayer_query"] = context["prayer_times"]

            if "volunteer" in context:
                memory["volunteer_interests"].append(context["volunteer"])

    def execute_function(self, function_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute function calls with enhanced error handling and context"""
        try:
            logger.info(f"Executing function: {function_name} with args: {arguments}")

            if function_name == "get_prayer_times":
                date = arguments.get("date")
                return get_prayer_times(date)

            elif function_name == "search_events":
                query = arguments.get("query", "")
                date_from = arguments.get("date_from")
                date_to = arguments.get("date_to")  # Future feature
                limit = min(arguments.get("limit", 10), 20)  # Cap at 20

                events = get_events(limit=limit, user_query=query, date_filter=date_from)
                return {"events": events, "count": len(events)}

            elif function_name == "get_event_details":
                event_title = arguments.get("event_title")
                event = get_event_by_title(event_title)
                return event if event else {"error": "Event not found"}

            elif function_name == "search_volunteers":
                event_name = arguments.get("event_name")
                if event_name:
                    event = get_event_by_title(event_name)
                    return event if event else {"error": "Event not found"}
                else:
                    opportunities = get_volunteer_opportunities()
                    return {"opportunities": opportunities}

            elif function_name == "get_conversation_context":
                session_id = arguments.get("session_id")
                return self.get_session_memory(session_id)

            else:
                return {"error": f"Unknown function: {function_name}"}

        except Exception as e:
            logger.error(f"Error executing function {function_name}: {e}")
            return {"error": f"Function execution failed: {str(e)}"}

    def generate_response(self, message: str, session_id: str = "default") -> str:
        """Generate intelligent response with function calling and context awareness"""
        try:
            # Get session memory
            memory = self.get_session_memory(session_id)

            # Build conversation with context
            messages = [{"role": "system", "content": self.system_prompt}]

            # Add recent conversation history
            messages.extend(memory["chat_history"][-8:])  # Last 8 messages for context

            # Add current message
            messages.append({"role": "user", "content": message})

            # First API call - let model decide on function calls
            response = self.groq_client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=self.tools,
                tool_choice="auto",
                temperature=0.1,
                max_tokens=600  # More tokens for detailed responses
            )

            choice = response.choices[0]

            # Handle function calls
            if choice.message.tool_calls:
                # Add assistant message with tool calls
                messages.append({
                    "role": "assistant",
                    "content": choice.message.content,
                    "tool_calls": choice.message.tool_calls
                })

                # Execute each function call
                for tool_call in choice.message.tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)

                    # Execute function
                    function_result = self.execute_function(function_name, function_args)

                    # Add function result to conversation
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps(function_result)
                    })

                # Get final response with function results
                final_response = self.groq_client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=0.1,
                    max_tokens=600
                )

                bot_response = final_response.choices[0].message.content
            else:
                # Direct response without function calls
                bot_response = choice.message.content

            # Update session memory
            self.update_session_memory(session_id, message, bot_response)

            return bot_response

        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "I apologize, I'm experiencing some difficulties right now. Please try again or contact the mosque administration for assistance."

    def get_health_status(self) -> Dict[str, Any]:
        """Get agent health and status"""
        try:
            # Test API connection
            test_response = self.groq_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "Test"}],
                max_tokens=5
            )

            return {
                "status": "healthy",
                "model": self.model,
                "active_sessions": len(self.conversation_memory),
                "tools_available": len(self.tools)
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }