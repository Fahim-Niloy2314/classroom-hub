// One supported backend: use Python's secure implementation instead of the old unsafe file server.
const { spawn } = require('node:child_process');
const child = spawn(process.platform === 'win32' ? 'python' : 'python3', [require('node:path').join(__dirname, 'server.py'), ...process.argv.slice(2)], { stdio: 'inherit', env: process.env });
child.on('error', () => { console.error('Python 3.10+ is required. Run python server.py.'); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
