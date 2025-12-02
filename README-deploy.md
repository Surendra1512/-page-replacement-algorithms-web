# Deploying page-replacement-web (recommended: Render)

This repository contains a small Flask backend that serves a static frontend. To give anyone a permanent public URL where they can open the project, the recommended option is to deploy the app to a free web service (Render, Railway, Fly, etc.). Render is straightforward and works well with a `Dockerfile` (already included).

---

Recommended flow (fastest, permanent public URL):

1. Create a GitHub repository and push this project to it.
   - From your project folder:

```powershell
git init
git add .
git commit -m "Initial commit"
# create a repo on GitHub, then add the remote and push
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

2. Deploy on Render (free tier):
   - Sign in to https://render.com and connect your GitHub account.
   - Click "New" → "Web Service".
   - Select the repository you just pushed.
   - For **Environment**, choose "Docker" (Render will build using the included `Dockerfile`).
   - Set the service to listen on port `5000`. Render will detect the exposed port from the Dockerfile.
   - Create the service — Render will build and deploy and give you a public URL (e.g., `https://your-app.onrender.com`).

3. Optional: Environment variables
   - If you later need environment variables (for other services), set them in Render's Dashboard under the service settings.

Alternative: Railway / Fly / Heroku
- If you prefer Railway or Fly, they also support Docker or direct Python deployments. The `Dockerfile` included will work on any provider that supports Docker deployments.

Temporary sharing (quick, ephemeral link):

If you prefer a quick ephemeral public link without deploying, you can use ngrok. I added a helper script at `backend/start_tunnel.py` that uses `pyngrok`.

Quick ngrok steps (requires an ngrok account):

1. Sign up and get your authtoken: https://dashboard.ngrok.com/get-started/your-authtoken
2. In PowerShell:

```powershell
$env:NGROK_AUTHTOKEN = "<YOUR_TOKEN>"
Set-Location -LiteralPath 'c:\Users\suren\Downloads\page-replacement-web\page-replacement-web'
python backend/start_tunnel.py
```

The script will print a public URL (ngrok) that you can share; note that the tunnel is ephemeral and will stop when the script ends.

---

If you want, I can:
- Create a GitHub repo for you and prepare the push commands here (you'll still need to run the `git push` locally), or
- Walk you step-by-step through deploying to Render (I can provide screenshots and exact settings), or
- Start an ngrok tunnel for a quick share now (you'll need to provide an authtoken).

Tell me which of the three follow-ups you'd like and I will continue.
