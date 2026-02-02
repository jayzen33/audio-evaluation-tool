"""
Audio Evaluation Tools - Backend API
A Flask backend for user management and progress storage.
"""

import json
import os
import sqlite3
from datetime import datetime
from typing import Any

from flask import Flask, g, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

CORS(app, origins="*")

DATABASE = os.environ.get("DATABASE_PATH", "data/evaluation.db")
DATA_DIR = os.path.dirname(DATABASE)

os.makedirs(DATA_DIR, exist_ok=True)


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    """Initialize database tables."""
    with app.app_context():
        db = get_db()
        db.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                tool TEXT NOT NULL,
                experiment TEXT NOT NULL,
                data TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(user_id, tool, experiment)
            );

            CREATE INDEX IF NOT EXISTS idx_progress_user
                ON progress(user_id);
            CREATE INDEX IF NOT EXISTS idx_progress_tool_exp
                ON progress(tool, experiment);
        """)
        db.commit()


def validate_progress_data(data: Any) -> tuple[bool, str]:
    """Validate progress data structure."""
    if data is None:
        return False, "Progress data is required"

    if not isinstance(data, (dict, list)):
        return False, "Progress data must be an object or array"

    if isinstance(data, dict) and len(data) > 10000:
        return False, "Progress data too large (max 10000 keys)"

    if isinstance(data, list) and len(data) > 10000:
        return False, "Progress data too large (max 10000 items)"

    return True, ""


# ==================== User Endpoints ====================


@app.route("/api/users", methods=["GET"])
def list_users():
    """List all users."""
    db = get_db()
    users = db.execute(
        "SELECT id, name, created_at FROM users ORDER BY name"
    ).fetchall()
    return jsonify(
        [
            {"id": u["id"], "name": u["name"], "createdAt": u["created_at"]}
            for u in users
        ]
    )


@app.route("/api/users/<user_id>", methods=["GET"])
def get_user(user_id):
    """Get a specific user."""
    db = get_db()
    user = db.execute(
        "SELECT id, name, created_at FROM users WHERE id = ?", (user_id,)
    ).fetchone()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    return jsonify(
        {"id": user["id"], "name": user["name"], "createdAt": user["created_at"]}
    )


@app.route("/api/users", methods=["POST"])
def create_user():
    """Create a new user."""
    data = request.get_json()

    if not data or "id" not in data:
        return jsonify({"error": "User ID is required"}), 400

    user_id = data["id"].strip()
    name = data.get("name", user_id).strip()

    if not user_id:
        return jsonify({"error": "User ID cannot be empty"}), 400

    if len(user_id) > 100:
        return jsonify({"error": "User ID too long (max 100 characters)"}), 400

    db = get_db()

    existing = db.execute(
        "SELECT id, created_at FROM users WHERE id = ?", (user_id,)
    ).fetchone()
    if existing:
        db.execute("UPDATE users SET name = ? WHERE id = ?", (name, user_id))
        db.commit()
        return jsonify(
            {
                "id": user_id,
                "name": name,
                "createdAt": existing["created_at"],
                "message": "User already exists, name updated",
            }
        )

    created_at = datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO users (id, name, created_at) VALUES (?, ?, ?)",
        (user_id, name, created_at),
    )
    db.commit()

    return jsonify({"id": user_id, "name": name, "createdAt": created_at}), 201


@app.route("/api/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    """Delete a user and all their progress."""
    db = get_db()

    user = db.execute("SELECT id FROM users WHERE id = ?", (user_id,)).fetchone()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    db.execute("DELETE FROM progress WHERE user_id = ?", (user_id,))
    db.execute("DELETE FROM users WHERE id = ?", (user_id,))
    db.commit()

    return jsonify({"message": "User and all progress deleted", "userId": user_id})


@app.route("/api/users/<user_id>/progress", methods=["GET"])
def list_user_progress(user_id):
    """List all progress for a user across all tools and experiments."""
    db = get_db()

    user = db.execute("SELECT id FROM users WHERE id = ?", (user_id,)).fetchone()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    rows = db.execute(
        "SELECT tool, experiment, data, updated_at FROM progress WHERE user_id = ? ORDER BY updated_at DESC",
        (user_id,),
    ).fetchall()

    progress_list = []
    for row in rows:
        data = json.loads(row["data"])
        tool = row["tool"]

        if tool == "comparison":
            count = len(data) if isinstance(data, dict) else 0
        elif tool == "abtest":
            count = (
                len([v for v in data.values() if v is not None])
                if isinstance(data, dict)
                else 0
            )
        elif tool == "mos":
            count = (
                len([v for v in data.values() if v is not None])
                if isinstance(data, dict)
                else 0
            )
        else:
            count = 0

        progress_list.append(
            {
                "tool": tool,
                "experiment": row["experiment"],
                "itemCount": count,
                "updatedAt": row["updated_at"],
            }
        )

    return jsonify({"userId": user_id, "progress": progress_list})


# ==================== Progress Endpoints ====================


@app.route("/api/progress/<tool>/<experiment>/<user_id>", methods=["GET"])
def get_progress(tool, experiment, user_id):
    """Get progress for a specific user, tool, and experiment."""
    db = get_db()
    row = db.execute(
        """SELECT data, updated_at FROM progress
           WHERE user_id = ? AND tool = ? AND experiment = ?""",
        (user_id, tool, experiment),
    ).fetchone()

    if row is None:
        return jsonify(
            {
                "userId": user_id,
                "tool": tool,
                "experiment": experiment,
                "data": None,
                "updatedAt": None,
            }
        )

    return jsonify(
        {
            "userId": user_id,
            "tool": tool,
            "experiment": experiment,
            "data": json.loads(row["data"]),
            "updatedAt": row["updated_at"],
        }
    )


@app.route("/api/progress/<tool>/<experiment>/<user_id>", methods=["POST"])
def save_progress(tool, experiment, user_id):
    """Save progress for a specific user, tool, and experiment."""
    data = request.get_json()

    if data is None:
        return jsonify({"error": "Progress data is required"}), 400

    valid, error_msg = validate_progress_data(data)
    if not valid:
        return jsonify({"error": error_msg}), 400

    db = get_db()
    user = db.execute("SELECT id FROM users WHERE id = ?", (user_id,)).fetchone()
    if user is None:
        db.execute(
            "INSERT INTO users (id, name, created_at) VALUES (?, ?, ?)",
            (user_id, user_id, datetime.utcnow().isoformat()),
        )

    updated_at = datetime.utcnow().isoformat()

    db.execute(
        """
        INSERT INTO progress (user_id, tool, experiment, data, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id, tool, experiment)
        DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
    """,
        (user_id, tool, experiment, json.dumps(data), updated_at),
    )

    db.commit()

    return jsonify(
        {
            "userId": user_id,
            "tool": tool,
            "experiment": experiment,
            "data": data,
            "updatedAt": updated_at,
        }
    )


@app.route("/api/progress/<tool>/<experiment>/<user_id>", methods=["DELETE"])
def delete_progress(tool, experiment, user_id):
    """Delete progress for a specific user, tool, and experiment."""
    db = get_db()
    db.execute(
        "DELETE FROM progress WHERE user_id = ? AND tool = ? AND experiment = ?",
        (user_id, tool, experiment),
    )
    db.commit()

    return jsonify({"message": "Progress deleted"})


@app.route("/api/progress/export/<user_id>", methods=["GET"])
def export_all_progress(user_id):
    """Export all progress for a user."""
    db = get_db()
    rows = db.execute(
        "SELECT tool, experiment, data, updated_at FROM progress WHERE user_id = ?",
        (user_id,),
    ).fetchall()

    progress_list = []
    for row in rows:
        progress_list.append(
            {
                "tool": row["tool"],
                "experiment": row["experiment"],
                "data": json.loads(row["data"]),
                "updatedAt": row["updated_at"],
            }
        )

    return jsonify(
        {
            "userId": user_id,
            "exportedAt": datetime.utcnow().isoformat(),
            "progress": progress_list,
        }
    )


# ==================== Health Check ====================


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})


# ==================== Main ====================

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
