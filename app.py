from __future__ import annotations

import csv
import json
import sqlite3
from datetime import date, datetime
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, HTTPServer
from io import StringIO
from pathlib import Path
from urllib.parse import parse_qs, urlparse

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "rubrics.db"
TEMPLATES_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_db_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                period TEXT
            );

            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                pronouns TEXT,
                student_number TEXT,
                tags TEXT
            );

            CREATE TABLE IF NOT EXISTS enrollments (
                class_id INTEGER NOT NULL,
                student_id INTEGER NOT NULL,
                PRIMARY KEY (class_id, student_id)
            );

            CREATE TABLE IF NOT EXISTS standards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT,
                statement TEXT NOT NULL,
                grade TEXT,
                domain TEXT
            );

            CREATE TABLE IF NOT EXISTS rubrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                standard_id INTEGER NOT NULL,
                level1_text TEXT NOT NULL,
                level2_text TEXT NOT NULL,
                level3_text TEXT NOT NULL,
                level4_text TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                class_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                standard_id INTEGER NOT NULL,
                focus_note TEXT
            );

            CREATE TABLE IF NOT EXISTS observations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                student_id INTEGER NOT NULL,
                level INTEGER,
                evidence_type TEXT,
                supports TEXT,
                note TEXT,
                timestamp TEXT NOT NULL,
                created_by TEXT NOT NULL
            );
            """
        )


def seed_data() -> None:
    with get_db_connection() as conn:
        existing = conn.execute("SELECT COUNT(*) FROM classes").fetchone()[0]
        if existing:
            return

        conn.execute("INSERT INTO classes (name, period) VALUES (?, ?)", ("Grade 3 Math", "Period 2"))
        class_id = conn.execute("SELECT id FROM classes WHERE name = ?", ("Grade 3 Math",)).fetchone()[0]

        students = [
            "Ava Martinez",
            "Liam Chen",
            "Noah Johnson",
            "Sophia Patel",
            "Mia Rivera",
            "Ethan Brooks",
            "Isabella Kim",
            "Lucas Nguyen",
            "Amelia Davis",
            "Oliver Torres",
        ]

        for name in students:
            conn.execute("INSERT INTO students (name) VALUES (?)", (name,))
        student_rows = conn.execute("SELECT id FROM students").fetchall()
        for row in student_rows:
            conn.execute("INSERT INTO enrollments (class_id, student_id) VALUES (?, ?)", (class_id, row["id"]))

        conn.execute(
            "INSERT INTO standards (code, statement, grade, domain) VALUES (?, ?, ?, ?)",
            ("3 OA 1", "Interpret products of whole numbers.", "3", "Operations and Algebraic Thinking"),
        )
        standard_id = conn.execute("SELECT id FROM standards WHERE code = ?", ("3 OA 1",)).fetchone()[0]

        conn.execute(
            """
            INSERT INTO rubrics (standard_id, level1_text, level2_text, level3_text, level4_text)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                standard_id,
                "Emergent Learner: Needs significant support to interpret multiplication as groups.",
                "Approaching Proficiency: Identifies groups with prompting and visual support.",
                "Proficient: Explains multiplication as equal groups and solves with minimal support.",
                "Mastery: Applies multiplication flexibly and justifies reasoning with examples.",
            ),
        )

        today = date.today()
        earlier = today.replace(day=max(1, today.day - 2))
        conn.execute(
            "INSERT INTO sessions (class_id, date, standard_id) VALUES (?, ?, ?)",
            (class_id, str(today), standard_id),
        )
        conn.execute(
            "INSERT INTO sessions (class_id, date, standard_id) VALUES (?, ?, ?)",
            (class_id, str(earlier), standard_id),
        )

        session_id = conn.execute("SELECT id FROM sessions ORDER BY date ASC LIMIT 1").fetchone()[0]

        levels = [3, 2, 3, 4, 1, None, 2, 3, 4, 2]
        evidence_types = [
            "Oral",
            "Work Sample",
            "Observation",
            "Exit Ticket",
            "Written",
            None,
            "Small Group",
            "Oral",
            "Work Sample",
            "Observation",
        ]
        supports = [
            ["sentence frames"],
            ["manipulatives"],
            [],
            [],
            ["read aloud"],
            [],
            ["partner"],
            [],
            ["extra time"],
            [],
        ]

        for idx, row in enumerate(student_rows):
            conn.execute(
                """
                INSERT INTO observations (session_id, student_id, level, evidence_type, supports, note, timestamp, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    session_id,
                    row["id"],
                    levels[idx],
                    evidence_types[idx],
                    json.dumps(supports[idx]),
                    "Evidence I saw: shared reasoning with a partner." if idx % 3 == 0 else None,
                    datetime.utcnow().isoformat(),
                    "teacher",
                ),
            )

        conn.commit()


def serialize_row(row: sqlite3.Row) -> dict:
    return dict(row)


def json_response(handler: BaseHTTPRequestHandler, payload: object, status: HTTPStatus = HTTPStatus.OK) -> None:
    data = json.dumps(payload).encode("utf-8")
    handler.send_response(status.value)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)


def csv_response(handler: BaseHTTPRequestHandler, filename: str, output: StringIO) -> None:
    data = output.getvalue().encode("utf-8")
    handler.send_response(HTTPStatus.OK.value)
    handler.send_header("Content-Type", "text/csv; charset=utf-8")
    handler.send_header("Content-Disposition", f"attachment; filename=\"{filename}\"")
    handler.send_header("Content-Length", str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)


def read_json(handler: BaseHTTPRequestHandler) -> dict:
    length = int(handler.headers.get("Content-Length", "0"))
    if length == 0:
        return {}
    raw = handler.rfile.read(length).decode("utf-8")
    return json.loads(raw)


def serve_file(handler: BaseHTTPRequestHandler, path: Path, content_type: str) -> None:
    if not path.exists():
        handler.send_error(HTTPStatus.NOT_FOUND.value, "File not found")
        return
    data = path.read_bytes()
    handler.send_response(HTTPStatus.OK.value)
    handler.send_header("Content-Type", content_type)
    handler.send_header("Content-Length", str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)


def parse_path(path: str) -> tuple[str, dict]:
    parsed = urlparse(path)
    return parsed.path, parse_qs(parsed.query)


class RubricHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        path, query = parse_path(self.path)
        if path == "/":
            html = (TEMPLATES_DIR / "index.html").read_text(encoding="utf-8")
            html = html.replace("{{ today }}", str(date.today()))
            self.send_response(HTTPStatus.OK.value)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(html.encode("utf-8"))))
            self.end_headers()
            self.wfile.write(html.encode("utf-8"))
            return

        if path.startswith("/static/"):
            file_path = STATIC_DIR / path.replace("/static/", "")
            content_type = "text/plain"
            if file_path.suffix == ".css":
                content_type = "text/css; charset=utf-8"
            elif file_path.suffix == ".js":
                content_type = "application/javascript; charset=utf-8"
            return serve_file(self, file_path, content_type)

        if path == "/api/classes":
            with get_db_connection() as conn:
                rows = conn.execute("SELECT * FROM classes ORDER BY name").fetchall()
            return json_response(self, [serialize_row(row) for row in rows])

        if path == "/api/standards":
            with get_db_connection() as conn:
                standards = conn.execute("SELECT * FROM standards ORDER BY code").fetchall()
                rubrics = conn.execute("SELECT * FROM rubrics").fetchall()
            rubric_map = {}
            for row in rubrics:
                rubric_map[row["standard_id"]] = {
                    "id": row["id"],
                    "standard_id": row["standard_id"],
                    "levels": {
                        "1": row["level1_text"],
                        "2": row["level2_text"],
                        "3": row["level3_text"],
                        "4": row["level4_text"],
                    },
                }
            return json_response(
                self,
                {
                    "standards": [serialize_row(row) for row in standards],
                    "rubrics": rubric_map,
                },
            )

        if path == "/api/sessions":
            class_id = query.get("class_id", [None])[0]
            standard_id = query.get("standard_id", [None])[0]
            sql = "SELECT * FROM sessions"
            params: list[object] = []
            conditions = []
            if class_id:
                conditions.append("class_id = ?")
                params.append(int(class_id))
            if standard_id:
                conditions.append("standard_id = ?")
                params.append(int(standard_id))
            if conditions:
                sql += " WHERE " + " AND ".join(conditions)
            sql += " ORDER BY date DESC"
            with get_db_connection() as conn:
                rows = conn.execute(sql, params).fetchall()
            return json_response(self, [serialize_row(row) for row in rows])

        if path.startswith("/api/session/"):
            session_id = int(path.split("/")[-1])
            with get_db_connection() as conn:
                session = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
                if not session:
                    return json_response(self, {"error": "Not found"}, HTTPStatus.NOT_FOUND)
                enrollments = conn.execute("SELECT student_id FROM enrollments WHERE class_id = ?", (session["class_id"],)).fetchall()
                student_ids = [row["student_id"] for row in enrollments]
                students = []
                if student_ids:
                    placeholders = ",".join("?" for _ in student_ids)
                    students = conn.execute(
                        f"SELECT * FROM students WHERE id IN ({placeholders}) ORDER BY name",
                        student_ids,
                    ).fetchall()
                observations = conn.execute("SELECT * FROM observations WHERE session_id = ?", (session_id,)).fetchall()
                rubric = conn.execute("SELECT * FROM rubrics WHERE standard_id = ?", (session["standard_id"],)).fetchone()

            response = {
                "session": serialize_row(session),
                "students": [serialize_row(row) for row in students],
                "observations": [
                    {
                        **serialize_row(obs),
                        "supports": json.loads(obs["supports"]) if obs["supports"] else [],
                    }
                    for obs in observations
                ],
                "rubric": None,
            }
            if rubric:
                response["rubric"] = {
                    "id": rubric["id"],
                    "standard_id": rubric["standard_id"],
                    "levels": {
                        "1": rubric["level1_text"],
                        "2": rubric["level2_text"],
                        "3": rubric["level3_text"],
                        "4": rubric["level4_text"],
                    },
                }
            return json_response(self, response)

        if path.startswith("/api/export/session/"):
            session_id = int(path.split("/")[-1])
            with get_db_connection() as conn:
                observations = conn.execute("SELECT * FROM observations WHERE session_id = ?", (session_id,)).fetchall()
            output = StringIO()
            writer = csv.writer(output)
            writer.writerow(["student_id", "level", "evidence_type", "supports", "note", "timestamp"])
            for obs in observations:
                writer.writerow(
                    [
                        obs["student_id"],
                        obs["level"] or "Not Observed",
                        obs["evidence_type"] or "",
                        ", ".join(json.loads(obs["supports"])) if obs["supports"] else "",
                        obs["note"] or "",
                        obs["timestamp"],
                    ]
                )
            return csv_response(self, f"session_{session_id}.csv", output)

        if path == "/api/export/longitudinal":
            class_id = int(query.get("class_id", ["0"])[0])
            standard_id = int(query.get("standard_id", ["0"])[0])
            with get_db_connection() as conn:
                sessions = conn.execute(
                    "SELECT * FROM sessions WHERE class_id = ? AND standard_id = ?",
                    (class_id, standard_id),
                ).fetchall()
                session_ids = [row["id"] for row in sessions]
                observations = []
                if session_ids:
                    placeholders = ",".join("?" for _ in session_ids)
                    observations = conn.execute(
                        f"SELECT * FROM observations WHERE session_id IN ({placeholders})",
                        session_ids,
                    ).fetchall()
            output = StringIO()
            writer = csv.writer(output)
            writer.writerow(["session_date", "student_id", "level", "evidence_type", "supports", "note", "timestamp"])
            session_lookup = {row["id"]: row["date"] for row in sessions}
            for obs in observations:
                writer.writerow(
                    [
                        session_lookup.get(obs["session_id"], ""),
                        obs["student_id"],
                        obs["level"] or "Not Observed",
                        obs["evidence_type"] or "",
                        ", ".join(json.loads(obs["supports"])) if obs["supports"] else "",
                        obs["note"] or "",
                        obs["timestamp"],
                    ]
                )
            return csv_response(self, "longitudinal.csv", output)

        if path == "/health":
            return json_response(self, {"status": "ok"})

        self.send_error(HTTPStatus.NOT_FOUND.value, "Not found")

    def do_POST(self) -> None:
        path, _ = parse_path(self.path)
        payload = read_json(self)

        if path == "/api/session":
            with get_db_connection() as conn:
                cursor = conn.execute(
                    "INSERT INTO sessions (class_id, date, standard_id, focus_note) VALUES (?, ?, ?, ?)",
                    (
                        payload["class_id"],
                        payload["date"],
                        payload["standard_id"],
                        payload.get("focus_note"),
                    ),
                )
                conn.commit()
                session = conn.execute("SELECT * FROM sessions WHERE id = ?", (cursor.lastrowid,)).fetchone()
            return json_response(self, serialize_row(session))

        if path == "/api/observation":
            with get_db_connection() as conn:
                existing = conn.execute(
                    "SELECT * FROM observations WHERE session_id = ? AND student_id = ?",
                    (payload["session_id"], payload["student_id"]),
                ).fetchone()
                supports = json.dumps(payload.get("supports", []))
                timestamp = datetime.utcnow().isoformat()
                if existing:
                    conn.execute(
                        """
                        UPDATE observations
                        SET level = ?, evidence_type = ?, supports = ?, note = ?, timestamp = ?
                        WHERE id = ?
                        """,
                        (
                            payload.get("level"),
                            payload.get("evidence_type"),
                            supports,
                            payload.get("note"),
                            timestamp,
                            existing["id"],
                        ),
                    )
                    observation_id = existing["id"]
                else:
                    cursor = conn.execute(
                        """
                        INSERT INTO observations (session_id, student_id, level, evidence_type, supports, note, timestamp, created_by)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            payload["session_id"],
                            payload["student_id"],
                            payload.get("level"),
                            payload.get("evidence_type"),
                            supports,
                            payload.get("note"),
                            timestamp,
                            payload.get("created_by", "teacher"),
                        ),
                    )
                    observation_id = cursor.lastrowid
                conn.commit()
                observation = conn.execute("SELECT * FROM observations WHERE id = ?", (observation_id,)).fetchone()
            response = serialize_row(observation)
            response["supports"] = json.loads(response["supports"]) if response["supports"] else []
            return json_response(self, response)

        if path == "/api/students":
            with get_db_connection() as conn:
                cursor = conn.execute(
                    "INSERT INTO students (name, pronouns) VALUES (?, ?)",
                    (payload["name"], payload.get("pronouns")),
                )
                student_id = cursor.lastrowid
                conn.execute(
                    "INSERT INTO enrollments (class_id, student_id) VALUES (?, ?)",
                    (payload["class_id"], student_id),
                )
                conn.commit()
                student = conn.execute("SELECT * FROM students WHERE id = ?", (student_id,)).fetchone()
            return json_response(self, serialize_row(student))

        if path == "/api/standards":
            with get_db_connection() as conn:
                cursor = conn.execute(
                    "INSERT INTO standards (code, statement, grade, domain) VALUES (?, ?, ?, ?)",
                    (
                        payload.get("code"),
                        payload["statement"],
                        payload.get("grade"),
                        payload.get("domain"),
                    ),
                )
                standard_id = cursor.lastrowid
                cursor = conn.execute(
                    """
                    INSERT INTO rubrics (standard_id, level1_text, level2_text, level3_text, level4_text)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        standard_id,
                        payload.get("level1_text", "Emergent Learner"),
                        payload.get("level2_text", "Approaching Proficiency"),
                        payload.get("level3_text", "Proficient"),
                        payload.get("level4_text", "Mastery"),
                    ),
                )
                conn.commit()
                standard = conn.execute("SELECT * FROM standards WHERE id = ?", (standard_id,)).fetchone()
                rubric = conn.execute("SELECT * FROM rubrics WHERE id = ?", (cursor.lastrowid,)).fetchone()
            rubric_payload = {
                "id": rubric["id"],
                "standard_id": rubric["standard_id"],
                "levels": {
                    "1": rubric["level1_text"],
                    "2": rubric["level2_text"],
                    "3": rubric["level3_text"],
                    "4": rubric["level4_text"],
                },
            }
            return json_response(
                self,
                {
                    "standard": serialize_row(standard),
                    "rubric": rubric_payload,
                },
            )

        return json_response(self, {"error": "Not found"}, HTTPStatus.NOT_FOUND)

    def do_PUT(self) -> None:
        path, _ = parse_path(self.path)
        payload = read_json(self)

        if path.startswith("/api/session/"):
            session_id = int(path.split("/")[-1])
            with get_db_connection() as conn:
                conn.execute(
                    "UPDATE sessions SET date = ?, focus_note = ? WHERE id = ?",
                    (payload.get("date"), payload.get("focus_note"), session_id),
                )
                conn.commit()
                session = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
            return json_response(self, serialize_row(session))

        if path.startswith("/api/rubric/"):
            standard_id = int(path.split("/")[-1])
            with get_db_connection() as conn:
                rubric = conn.execute("SELECT * FROM rubrics WHERE standard_id = ?", (standard_id,)).fetchone()
                if rubric:
                    conn.execute(
                        """
                        UPDATE rubrics
                        SET level1_text = ?, level2_text = ?, level3_text = ?, level4_text = ?
                        WHERE id = ?
                        """,
                        (
                            payload["level1_text"],
                            payload["level2_text"],
                            payload["level3_text"],
                            payload["level4_text"],
                            rubric["id"],
                        ),
                    )
                    rubric_id = rubric["id"]
                else:
                    cursor = conn.execute(
                        """
                        INSERT INTO rubrics (standard_id, level1_text, level2_text, level3_text, level4_text)
                        VALUES (?, ?, ?, ?, ?)
                        """,
                        (
                            standard_id,
                            payload["level1_text"],
                            payload["level2_text"],
                            payload["level3_text"],
                            payload["level4_text"],
                        ),
                    )
                    rubric_id = cursor.lastrowid
                conn.commit()
                updated = conn.execute("SELECT * FROM rubrics WHERE id = ?", (rubric_id,)).fetchone()
            return json_response(
                self,
                {
                    "id": updated["id"],
                    "standard_id": updated["standard_id"],
                    "levels": {
                        "1": updated["level1_text"],
                        "2": updated["level2_text"],
                        "3": updated["level3_text"],
                        "4": updated["level4_text"],
                    },
                },
            )

        return json_response(self, {"error": "Not found"}, HTTPStatus.NOT_FOUND)


def run() -> None:
    init_db()
    seed_data()
    server = HTTPServer(("0.0.0.0", 5000), RubricHandler)
    print("Serving on http://0.0.0.0:5000")
    server.serve_forever()


if __name__ == "__main__":
    run()
