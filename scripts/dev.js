const { spawn } = require('child_process');

const vite = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', '5173'], {
  shell: true,
  stdio: 'inherit'
});

let electron = null;
let isShuttingDown = false;

function startElectron() {
  electron = spawn('npx', ['electron', '.'], {
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: 'http://127.0.0.1:5173'
    },
    shell: true,
    stdio: 'inherit'
  });

  electron.on('exit', (code) => {
    if (!isShuttingDown) {
      shutdown(code || 0);
    }
  });
}

function shutdown(code = 0) {
  isShuttingDown = true;
  if (electron && !electron.killed) electron.kill();
  if (!vite.killed) vite.kill();
  process.exit(code);
}

vite.on('spawn', () => {
  setTimeout(startElectron, 1200);
});

vite.on('exit', (code) => {
  if (!isShuttingDown) {
    shutdown(code || 0);
  }
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
