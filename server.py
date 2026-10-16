import os
import sys
import json
import mimetypes
import subprocess
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse

# Set UTF-8 encoding for Windows stdout
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 8080
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
APP_DIR = os.path.dirname(__file__)

class ClassroomHubHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=APP_DIR, **kwargs)

    def do_HEAD(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        if parsed.path == "/api/file":
            file_rel = urllib.parse.unquote(params.get("path", [""])[0])
            full_path = os.path.abspath(os.path.join(BASE_DIR, file_rel))
            if not full_path.lower().startswith(BASE_DIR.lower()) or not os.path.isfile(full_path):
                self.send_error(404, "File not found")
                return
            mime_type, _ = mimetypes.guess_type(full_path)
            if not mime_type:
                mime_type = "application/octet-stream"
            file_size = os.path.getsize(full_path)
            self.send_response(200)
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(file_size))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            return
        return super().do_HEAD()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)

        # API: Open file directly in Windows native app
        if parsed.path == "/api/open-local":
            file_rel = urllib.parse.unquote(params.get("path", [""])[0])
            if not file_rel:
                self.send_error(400, "Missing path parameter")
                return
            full_path = os.path.abspath(os.path.join(BASE_DIR, file_rel))
            # Case-insensitive security check on Windows
            if not full_path.lower().startswith(BASE_DIR.lower()) or not os.path.exists(full_path):
                self.send_error(404, "File not found or access denied")
                return
            try:
                if sys.platform == "win32":
                    os.startfile(full_path)
                elif sys.platform == "darwin":
                    subprocess.run(["open", full_path])
                else:
                    subprocess.run(["xdg-open", full_path])
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": f"Opened {os.path.basename(full_path)}"}).encode("utf-8"))
            except Exception as e:
                self.send_error(500, f"Error launching file: {str(e)}")
            return

        # API: Stream or Download file
        if parsed.path == "/api/file":
            file_rel = urllib.parse.unquote(params.get("path", [""])[0])
            download = params.get("download", ["0"])[0] == "1"
            if not file_rel:
                self.send_error(400, "Missing path parameter")
                return
            full_path = os.path.abspath(os.path.join(BASE_DIR, file_rel))
            if not full_path.lower().startswith(BASE_DIR.lower()) or not os.path.isfile(full_path):
                self.send_error(404, "File not found")
                return

            mime_type, _ = mimetypes.guess_type(full_path)
            if not mime_type:
                mime_type = "application/octet-stream"

            file_size = os.path.getsize(full_path)
            filename = os.path.basename(full_path)

            self.send_response(200)
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(file_size))
            self.send_header("Access-Control-Allow-Origin", "*")
            if download:
                self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
            else:
                self.send_header("Content-Disposition", f'inline; filename="{filename}"')
            self.end_headers()

            with open(full_path, "rb") as f:
                while chunk := f.read(64 * 1024):
                    self.wfile.write(chunk)
            return

        # Fallback to standard static file serving from APP_DIR
        return super().do_GET()

def run_server(port=PORT):
    server_address = ("", port)
    try:
        httpd = HTTPServer(server_address, ClassroomHubHandler)
        print(f"======================================================")
        print(f"🚀 Fahim Niloy's Classroom Hub Server Running!")
        print(f"📍 Local URL: http://localhost:{port}")
        print(f"📂 Serving Resources from: {BASE_DIR}")
        print(f"======================================================")
        httpd.serve_forever()
    except OSError as e:
        if port < 8090:
            print(f"Port {port} busy, trying {port + 1}...")
            run_server(port + 1)
        else:
            raise e

if __name__ == "__main__":
    run_server()
