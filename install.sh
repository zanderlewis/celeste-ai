#!/bin/bash

# Update package lists (for Linux)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Updating package lists..."
    sudo apt-get update
fi

# Install necessary dependencies (example: git, curl)
echo "Installing dependencies..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo apt-get install -y git curl
elif [[ "$OSTYPE" == "darwin"* ]]; then
    brew install git curl
fi

# Clone the repository
echo "Cloning the repository..."
git clone https://github.com/zanderlewis/celeste-ai.git

# Navigate into the repository directory
cd celeste-ai

# Run the application
echo "Running the application..."
python3 run

echo "Installation and setup complete."
echo "Celeste AI is now running on localhost:9779"