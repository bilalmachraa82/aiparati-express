#!/usr/bin/env python3
import os
from dotenv import load_dotenv

# Test loading the .env file
print("Current directory:", os.getcwd())
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
print(f"Trying to load: {env_path}")

if os.path.exists(env_path):
    print("✓ .env file exists")
    load_dotenv(env_path)
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if api_key:
        print(f"✓ API Key loaded: {api_key[:20]}...")
    else:
        print("✗ API Key NOT found")
        # Print all environment variables that start with ANTHROPIC
        for k, v in os.environ.items():
            if k.startswith('ANTHROPIC'):
                print(f"  {k}: {v[:20] if v else 'None'}...")
else:
    print("✗ .env file NOT found")