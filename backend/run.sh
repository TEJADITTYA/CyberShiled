#!/usr/bin/env bash
# Quick Start Script for Cyber Shield Flask Backend

cd "$(dirname "$0")"

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing requirements..."
pip install -r requirements.txt

echo "Starting Cyber Shield Flask Backend on http://127.0.0.1:5000..."
python3 app.py
