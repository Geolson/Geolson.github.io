#!/bin/bash
# Helper script to launch the portfolio locally

PORT=8000
DIRECTORY="/home/parrot0x01/Documents/portfolio website"

echo "=========================================================="
echo " Starting Azure Data Factory Portfolio Local Web Server "
echo "=========================================================="
echo "Directory: $DIRECTORY"
echo "Port:      $PORT"
echo "URL:       http://localhost:$PORT"
echo "=========================================================="

# Check if python3 is available
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is not installed or not in PATH."
    echo "Please install python3 or run any local HTTP server in this directory."
    exit 1
fi

# Go to the directory containing files
cd "$DIRECTORY" || exit

# Try to open browser in background (with 1 second delay to allow server startup)
(
    sleep 1
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:$PORT"
    elif command -v gnome-open &> /dev/null; then
        gnome-open "http://localhost:$PORT"
    elif command -v google-chrome &> /dev/null; then
        google-chrome "http://localhost:$PORT"
    elif command -v firefox &> /dev/null; then
        firefox "http://localhost:$PORT"
    else
        echo "Please open your browser and navigate to: http://localhost:$PORT"
    fi
) &

# Run Python simple HTTP server
python3 -m http.server $PORT
