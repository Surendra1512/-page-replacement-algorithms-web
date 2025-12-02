import os
from pyngrok import ngrok
import time

# If you have an ngrok authtoken, set it in the NGROK_AUTHTOKEN env var
authtoken = os.environ.get("NGROK_AUTHTOKEN")
if authtoken:
    ngrok.set_auth_token(authtoken)
else:
    print("Warning: NGROK_AUTHTOKEN not set. If you have an ngrok authtoken, set the NGROK_AUTHTOKEN environment variable to avoid authentication errors.")

# Open an HTTP tunnel on port 5000
public_tunnel = ngrok.connect(5000)
print("NGROK_URL:", public_tunnel.public_url)
print("Tunnel will stay open until you stop this script (Ctrl+C).")
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    ngrok.disconnect(public_tunnel.public_url)
    print("Tunnel stopped")
