#!/usr/bin/env python3
"""Standalone dev server for La Bodega game."""
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

PORT = 8080
GAME_DIR = Path(__file__).resolve().parent


class GameHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(GAME_DIR), **kwargs)

    def log_message(self, format, *args):
        pass  # suppress request logs


if __name__ == "__main__":
    os.chdir(GAME_DIR)
    server = HTTPServer(("0.0.0.0", PORT), GameHandler)
    print(f"La Bodega running at http://localhost:{PORT}")
    print("Press Ctrl+C to stop.")
    server.serve_forever()
