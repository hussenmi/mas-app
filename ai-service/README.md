# MAS Queens AI Assistant

A locally-hosted AI chatbot using Ollama and qwen2.5:3b model for the MAS Queens community app.

## Features

- 🕌 **Islamic Guidance**: Prayer times, Islamic Q&A, and religious guidance
- 📅 **Event Discovery**: Get information about upcoming mosque events
- 🤝 **Volunteer Matching**: Find volunteer opportunities that match your skills
- 🗣️ **Natural Conversation**: Chat in natural language about mosque services

## Prerequisites

- Python 3.8+
- Ollama installed and running
- qwen2.5:3b model downloaded

## Setup Instructions

### 1. Install Ollama (if not already installed)
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Download the AI model
```bash
ollama pull qwen2.5:3b
```

### 3. Start the AI service
```bash
cd ai-service
./start.sh
```

This will:
- Create a Python virtual environment
- Install all dependencies
- Start Ollama if not running
- Launch the FastAPI server on port 8000

### 4. Test the service
Visit http://localhost:8000/health to check if the service is running.

## API Endpoints

- `POST /chat` - Main chat interface
- `GET /prayer-times` - Get prayer times
- `GET /events` - Get upcoming events
- `GET /volunteer-opportunities` - Get volunteer opportunities
- `GET /health` - Health check

## Chat Widget Integration

The chat widget is automatically included in the Next.js app and will appear as a floating button in the bottom-right corner of all user-facing pages (excluding admin pages).

## Manual Setup (Alternative)

If the start script doesn't work, you can set up manually:

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Ollama (in a separate terminal)
ollama serve

# Start the AI service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Configuration

### Database Path
The service automatically connects to your existing SQLite database at `../users.db`.

### Model Configuration
To use a different model, update the `model` variable in `main.py`:
```python
self.model = "your-model-name"
```

### Prayer Times
Currently uses placeholder prayer times. To integrate with a real prayer time API:
1. Sign up for IslamicFinder API or similar
2. Update the `get_prayer_times()` method in `main.py`

## Troubleshooting

### Ollama Not Starting
```bash
# Check if Ollama is running
pgrep -f ollama

# Start manually if needed
ollama serve
```

### Model Not Found
```bash
# List available models
ollama list

# Pull the model if missing
ollama pull qwen2.5:3b
```

### Permission Denied
```bash
# Make script executable
chmod +x start.sh
```

### Port Already in Use
If port 8000 is busy, you can change it in `start.sh` or run manually:
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Then update the frontend ChatWidget.tsx to use the new port.

## Chat Examples

### Prayer Times
- "What are today's prayer times?"
- "When is Maghrib?"
- "What time is Fajr tomorrow?"

### Events
- "What events are coming up?"
- "Are there any programs this weekend?"
- "What's happening at the mosque?"

### Volunteering
- "How can I volunteer?"
- "What volunteer opportunities are available?"
- "I want to help with events"

### Islamic Guidance
- "What is the importance of Salah?"
- "Can you share a Quranic verse about charity?"
- "What are the pillars of Islam?"

## Development

### Adding New Intents
1. Update the `process_query()` method in `main.py`
2. Add corresponding data fetching methods
3. Update the system prompt for better responses

### Customizing Responses
Modify the `system_prompt` in the `MosqueAI` class to change the AI's personality and knowledge base.

### Adding Quick Actions
Update the `getQuickActions()` function in `ChatWidget.tsx` to add new quick action buttons.