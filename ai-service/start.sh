#!/bin/bash

# Check if virtual environment exists, create if not
# if [ ! -d "venv" ]; then
#     echo "Creating virtual environment..."
#     python3 -m venv venv
# fi

# Activate virtual environment
activate_env mas
# source venv/bin/activate

# Install requirements
# echo "Installing dependencies..."
# pip install -r requirements.txt

# Check if Ollama is running
if ! pgrep -f "ollama" > /dev/null; then
    echo "Starting Ollama..."
    ollama serve &
    sleep 3
fi

# Check if qwen2.5:3b model is available
if ! ollama list | grep -q "qwen2.5:3b"; then
    echo "Pulling qwen2.5:3b model..."
    ollama pull qwen2.5:3b
fi

# Start the FastAPI server
echo "Starting MAS Queens AI Assistant..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload