#!/usr/bin/env python3
"""
Advanced Groq-powered AI Server for MAS Queens
"""

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

from groq_agent import GroqMosqueAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MAS Queens Advanced AI Assistant",
    description="Advanced Groq-powered AI with function calling and multi-step workflows",
    version="2.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatMessage(BaseModel):
    message: str
    session_id: str = "default"
    context: dict = {}

class ChatResponse(BaseModel):
    response: str
    context: dict
    sources: list
    agent_info: dict

# Initialize advanced agent
try:
    ai_agent = GroqMosqueAgent()
    logger.info("✅ Advanced Groq Agent initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize Groq Agent: {e}")
    ai_agent = None

@app.get("/")
async def root():
    return {
        "message": "MAS Queens Advanced AI Assistant (Groq-powered)",
        "version": "2.0.0",
        "capabilities": [
            "Natural date calculations",
            "Advanced function calling",
            "Multi-step workflows",
            "Enhanced conversation memory",
            "Proactive suggestions"
        ]
    }

@app.get("/health")
async def health_check():
    if not ai_agent:
        return {"status": "unhealthy", "error": "Agent not initialized"}

    return ai_agent.get_health_status()

@app.post("/chat", response_model=ChatResponse)
async def chat(chat_message: ChatMessage):
    """Advanced chat endpoint with enhanced capabilities"""
    if not ai_agent:
        raise HTTPException(status_code=500, detail="AI Agent not available")

    try:
        # Generate response using advanced agent
        response = ai_agent.generate_response(
            message=chat_message.message,
            session_id=chat_message.session_id
        )

        return ChatResponse(
            response=response,
            context={
                "timestamp": datetime.now().isoformat(),
                "session_id": chat_message.session_id,
                "agent_version": "2.0.0"
            },
            sources=["MAS Queens Advanced AI Assistant"],
            agent_info={
                "model": "llama-3.1-8b-instant",
                "provider": "groq",
                "capabilities": ["function_calling", "multi_step", "memory"]
            }
        )

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process chat message")

@app.get("/agent/memory/{session_id}")
async def get_session_memory(session_id: str):
    """Get conversation memory for debugging/monitoring"""
    if not ai_agent:
        raise HTTPException(status_code=500, detail="AI Agent not available")

    try:
        memory = ai_agent.get_session_memory(session_id)
        return {
            "session_id": session_id,
            "memory": memory
        }
    except Exception as e:
        logger.error(f"Memory retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve session memory")

@app.get("/agent/stats")
async def get_agent_stats():
    """Get agent statistics and performance metrics"""
    if not ai_agent:
        raise HTTPException(status_code=500, detail="AI Agent not available")

    return {
        "active_sessions": len(ai_agent.conversation_memory),
        "available_tools": len(ai_agent.tools),
        "model": ai_agent.model,
        "uptime": "Active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)