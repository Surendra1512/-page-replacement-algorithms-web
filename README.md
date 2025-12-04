# Page Replacement Simulator

Local: http://127.0.0.1:5000

Public (deployed): https://page-replacement-web.onrender.com

Quick ways to open the app after opening this workspace in VS Code:

- Click the local link above (it will be clickable inside VS Code editors).
- Run the PowerShell helper script to open the local app in your browser:

  powershell -ExecutionPolicy Bypass -File "open-local.ps1"

- Use the VS Code Task: `Tasks: Run Task` → **Open App in Browser (Local)**

How to start the server (local):

1. Open a terminal in the workspace `frontend` or repo root and start the Flask app:

   cd backend
   python -m flask run

   (or run your usual start command that launches the backend Flask server; if your app uses `app.py` directly, run `python backend/app.py`)

2. After the server is running, use one of the quick-open methods above.

Notes:
- The public URL is a deployed copy (may be turned off or updated separately).
- The `open-local.ps1` script simply opens `http://127.0.0.1:5000` in your default browser.

If you'd like a one-click button inside the editor (or a custom extension), I can add that next.
