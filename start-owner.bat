@echo off
cd /d "%~dp0"
python server.py --setup-if-needed --open-browser
if errorlevel 1 (
  echo Install Python 3.10 or newer and enable Add Python to PATH, then try again.
  pause
)
