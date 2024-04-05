from http.server import BaseHTTPRequestHandler, HTTPServer
import http.cookies
import json
import os
import sys
import subprocess
import signal

CMD_TIMEOUT_SEC = 10


def call_bash_cmd(cmd):
    new_session = False
    if sys.platform.startswith('linux'):
        # POSIX only
        new_session = True
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE,
                         stderr=subprocess.STDOUT,
                         start_new_session=new_session, shell=True)

    try:
        out = p.communicate(timeout=CMD_TIMEOUT_SEC)[0].decode('utf-8')
        timeout_reached = False
    except subprocess.TimeoutExpired:
        print('Execution timeout. Aborting...')
        kill_all(p.pid)
        out = p.communicate()[0].decode('utf-8')
        timeout_reached = True
    return p.returncode, out, timeout_reached


def kill_all(pid):
    if sys.platform.startswith('linux'):
        os.killpg(os.getpgid(pid), signal.SIGTERM)
    elif sys.platform.startswith('cygwin'):
        winpid = int(open("/proc/{pid}/winpid".format(pid=pid)).read())
        subprocess.Popen(['TASKKILL', '/F', '/PID', str(winpid), '/T'])
    elif sys.platform.startswith('win32'):
        subprocess.Popen(['TASKKILL', '/F', '/PID', str(pid), '/T'])


def openssl_version():
    _, out, timeout = call_bash_cmd('openssl version')
    if timeout:
        return 'timeout'
    return out


def openssl_ciphers_list():
    _, out, _ = call_bash_cmd('openssl ciphers -s -v')
    return out


class HTTPRequestHandler(BaseHTTPRequestHandler):
    CONTENT_APPJSON = 'application/json'
    CONTENT_CSS = 'text/css'
    CONTENT_JS = 'text/javascript'
    CONTENT_HTML = 'text/html'
    sessions = {}

    def __init__(self, *args):
        self.cookies = None
        self.session_id = None
        BaseHTTPRequestHandler.__init__(self, *args)

    def _set_response_200(self, content_type):
        self.send_response(200)
        self.send_header('Content-type', content_type)
        self.send_header('Set-Cookie', self.cookies.output(header=''))
        self.end_headers()

    def _set_response_404(self):
        self.send_response(404)
        self.end_headers()

    def _handle_session(self):
        self.cookies = http.cookies.SimpleCookie(self.headers.get('Cookie'))
        self.session_id = self.cookies.get('session_id')

        if self.session_id:
            self.session_id = self.session_id.value
            session_data = self.sessions.get(self.session_id, {})
        else:
            self.session_id = os.urandom(16).hex()
            session_data = {}
            self.sessions[self.session_id] = session_data
            self.cookies['session_id'] = self.session_id

        # print(f'Session token: {self.session_id}')

    def do_GET(self):
        self._handle_session()
        routes = {
            '/': self.handle_index,
            '/data': self.handle_data,
        }
        routes_args = [
            ('/web', self.handle_web_request)
        ]

        handler = None
        for route, h in routes_args:
            if self.path.startswith(route):
                handler = h
                break
        if handler is None:
            handler = routes.get(self.path, self.handle_not_found)

        handler()

    def do_POST(self):
        self._handle_session()
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        processed_data = {}
        if self.path == '/rpc':
            print(f'Executing {data["cmd"]} command...')
            ret_code, out, timeout = call_bash_cmd(data['cmd'])

            processed_data = {'ret_code': ret_code,
                              'out': out, 'timeout': timeout}

        self._set_response_200(self.CONTENT_APPJSON)
        self.wfile.write(json.dumps(processed_data).encode('utf-8'))

    def handle_data(self):
        self._set_response_200(self.CONTENT_APPJSON)
        response = {'version': openssl_version(),
                    'ciphers': openssl_ciphers_list()}
        self.wfile.write(json.dumps(response).encode('utf-8'))

    def handle_index(self):
        self.path = '/web/index.html'
        self.handle_web_request()

    def handle_web_request(self):
        if self.path.endswith('.css'):
            self._set_response_200(self.CONTENT_CSS)
        elif self.path.endswith('.js'):
            self._set_response_200(self.CONTENT_JS)
        else:
            self._set_response_200(self.CONTENT_HTML)

        file_path = os.path.join(os.getcwd(), self.path[1:])
        if os.path.exists(file_path) and os.path.isfile(file_path):
            with open(file_path, 'rb') as f:
                self.wfile.write(f.read())
        else:
            self._set_response_404()
            self.wfile.write(b'File not found')
            print(f'File {file_path} not found')

    def handle_not_found(self):
        self._set_response_404()
        self.wfile.write(b'Not Found')
        print(f'Request {self.path} not found')


def run(server_class=HTTPServer, handler_class=HTTPRequestHandler,
        port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()


if __name__ == '__main__':
    run()
