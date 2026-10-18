import os
import sys
import json
import mimetypes
import subprocess
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import urllib.parse

# Set UTF-8 encoding for Windows stdout
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 8080
CLASSROOM_DIR = r"G:\My Drive\Classroom"
BASE_DIR = CLASSROOM_DIR if os.path.exists(CLASSROOM_DIR) else os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
APP_DIR = os.path.dirname(__file__)

def resolve_file_path(file_rel):
    if not file_rel:
        return None
    candidates = [
        os.path.join(BASE_DIR, file_rel),
        os.path.join(APP_DIR, file_rel),
        os.path.join(BASE_DIR, file_rel.replace("_", " ")),
        os.path.join(BASE_DIR, file_rel.replace(" ", "_")),
        os.path.join(APP_DIR, file_rel.replace("_", " ")),
        os.path.join(APP_DIR, file_rel.replace(" ", "_")),
    ]
    for cand in candidates:
        abs_p = os.path.abspath(cand)
        if os.path.isfile(abs_p):
            return abs_p
    return None

class ClassroomHubHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=APP_DIR, **kwargs)

    def do_HEAD(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        if parsed.path == "/api/file":
            file_rel = urllib.parse.unquote(params.get("path", [""])[0])
            full_path = resolve_file_path(file_rel)
            if not full_path or not os.path.isfile(full_path):
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
            full_path = resolve_file_path(file_rel)
            if not full_path or not os.path.exists(full_path):
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
            full_path = resolve_file_path(file_rel)
            if not full_path or not os.path.isfile(full_path):
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

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/publish":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
                sync_path = os.path.join(APP_DIR, "portal_sync.json")
                payload = data.get("payload", data)
                with open(sync_path, "w", encoding="utf-8") as f:
                    json.dump(payload, f, indent=2, ensure_ascii=False)

                deployed = False
                deploy_msg = "Saved to portal_sync.json"
                if data.get("triggerDeploy"):
                    deploy_script = os.path.join(APP_DIR, "deploy_to_github.py")
                    if os.path.exists(deploy_script):
                        res = subprocess.run([sys.executable, deploy_script], capture_output=True, text=True)
                        deployed = (res.returncode == 0)
                        deploy_msg = res.stdout if deployed else res.stderr

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True,
                    "message": "Published live via authenticated ClassroomHub server backend!",
                    "deployed": deployed,
                    "deployMsg": deploy_msg
                }).encode("utf-8"))
            except Exception as e:
                self.send_error(500, f"Server publish error: {str(e)}")
            return

        self.send_error(404, "Endpoint not found")

def run_server(port=PORT):
    server_address = ("", port)
    try:
        httpd = ThreadingHTTPServer(server_address, ClassroomHubHandler)
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
