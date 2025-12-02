from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

# The backend serves the frontend folder as static files.
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
app = Flask(__name__, static_folder=frontend_path, static_url_path="/")
CORS(app)

# ---------- Algorithms ----------
def simulate_fifo(pages, frame_count):
    frames = []
    pointer = 0
    faults = 0
    steps = []
    for p in pages:
        replaced = False
        if p not in frames:
            faults += 1
            if len(frames) < frame_count:
                frames.append(p)
            else:
                frames[pointer] = p
                pointer = (pointer + 1) % frame_count
            replaced = True
        snapshot = frames.copy()
        while len(snapshot) < frame_count:
            snapshot.append(-1)
        steps.append({"page": p, "frames": snapshot, "status": "Fault" if replaced else "Hit"})
    return {"steps": steps, "faults": faults}

def simulate_lru(pages, frame_count):
    frames = []
    faults = 0
    steps = []
    for i, p in enumerate(pages):
        replaced = False
        if p not in frames:
            faults += 1
            if len(frames) < frame_count:
                frames.append(p)
            else:
                last_used = {}
                for f in frames:
                    last_used[f] = -1
                    for j in range(i - 1, -1, -1):
                        if pages[j] == f:
                            last_used[f] = j
                            break
                lru_page = min(last_used, key=last_used.get)
                frames[frames.index(lru_page)] = p
            replaced = True
        snapshot = frames.copy()
        while len(snapshot) < frame_count:
            snapshot.append(-1)
        steps.append({"page": p, "frames": snapshot, "status": "Fault" if replaced else "Hit"})
    return {"steps": steps, "faults": faults}

def simulate_optimal(pages, frame_count):
    frames = []
    faults = 0
    steps = []
    for i, p in enumerate(pages):
        replaced = False
        if p not in frames:
            faults += 1
            if len(frames) < frame_count:
                frames.append(p)
            else:
                next_use = {}
                for f in frames:
                    next_use[f] = float('inf')
                    for j in range(i + 1, len(pages)):
                        if pages[j] == f:
                            next_use[f] = j
                            break
                replace_page = max(next_use, key=next_use.get)
                frames[frames.index(replace_page)] = p
            replaced = True
        snapshot = frames.copy()
        while len(snapshot) < frame_count:
            snapshot.append(-1)
        steps.append({"page": p, "frames": snapshot, "status": "Fault" if replaced else "Hit"})
    return {"steps": steps, "faults": faults}

def simulate_clock(pages, frame_count):
    frames = [-1] * frame_count
    ref = [0] * frame_count   # reference bits
    pointer = 0
    faults = 0
    steps = []

    for p in pages:
        replaced = False
        # hit?
        if p in frames:
            idx = frames.index(p)
            ref[idx] = 1
        else:
            faults += 1
            # if empty slot exists
            if -1 in frames:
                idx = frames.index(-1)
                frames[idx] = p
                ref[idx] = 1
            else:
                # find victim
                while True:
                    if ref[pointer] == 0:
                        frames[pointer] = p
                        ref[pointer] = 1
                        pointer = (pointer + 1) % frame_count
                        break
                    else:
                        ref[pointer] = 0
                        pointer = (pointer + 1) % frame_count
            replaced = True

        snapshot = frames.copy()
        for i in range(len(snapshot)):
            if snapshot[i] == -1:
                snapshot[i] = -1
        steps.append({"page": p, "frames": snapshot, "status": "Fault" if replaced else "Hit"})
    return {"steps": steps, "faults": faults}

# ---------- API ----------
@app.route("/api/simulate", methods=["POST"])
def api_simulate():
    data = request.get_json()
    if not data:
        return jsonify({"error": "missing json body"}), 400

    pages = data.get("pages")
    frames = int(data.get("frames", 3))
    algo = data.get("algo", "fifo").lower()

    if not isinstance(pages, list) or any(not isinstance(x, int) for x in pages):
        return jsonify({"error": "pages must be a list of integers"}), 400
    if frames <= 0:
        return jsonify({"error": "frames must be positive integer"}), 400

    if algo == "fifo":
        result = simulate_fifo(pages, frames)
    elif algo == "lru":
        result = simulate_lru(pages, frames)
    elif algo == "optimal":
        result = simulate_optimal(pages, frames)
    elif algo == "clock":
        result = simulate_clock(pages, frames)
    else:
        return jsonify({"error": "unknown algorithm"}), 400

    return jsonify({
        "algo": algo,
        "frames": frames,
        "pages": pages,
        "result": result
    })

# Serve frontend files
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    # path relative to ../frontend
    root = app.static_folder
    if path != "" and os.path.exists(os.path.join(root, path)):
        return send_from_directory(root, path)
    return send_from_directory(root, "index.html")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
