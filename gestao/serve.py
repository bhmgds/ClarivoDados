from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import errno
from pathlib import Path
import webbrowser


APP_DIR = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = 8766


class LocalAppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(APP_DIR), **kwargs)

    def end_headers(self):
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; img-src 'self' data:; style-src 'self'; "
            "script-src 'self'; connect-src 'none'; object-src 'none'; "
            "base-uri 'none'; frame-ancestors 'none'",
        )
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        super().end_headers()


def main():
    url = f"http://{HOST}:{PORT}/"
    try:
        server = ThreadingHTTPServer((HOST, PORT), LocalAppHandler)
    except OSError as error:
        if error.errno == errno.EADDRINUSE:
            raise SystemExit(f"A porta {PORT} já está em uso. Feche o outro servidor ou escolha outra porta.") from error
        raise
    print(f"Clarivo Gestão disponível em {url}")
    print("Acesse apenas neste computador. Pressione Ctrl+C para encerrar.")
    try:
        webbrowser.open(url)
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor local encerrado.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
