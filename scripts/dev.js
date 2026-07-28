import { spawn, spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));

// Always clear ports before starting (avoids EADDRINUSE from orphaned node processes)
spawnSync(process.execPath, [path.join(root, 'free-port.js'), '5000', '5173'], {
  stdio: 'inherit',
});

function run(name, cwd, args) {
  const child = spawn(process.execPath, args, {
    cwd: path.join(root, '..', cwd),
    stdio: 'inherit',
    env: process.env,
  });
  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
    }
  });
  return child;
}

const backend = run('backend', 'backend', ['src/index.js']);
const frontend = run('frontend', 'frontend', [
  path.join(root, '../frontend/node_modules/vite/bin/vite.js'),
]);

function shutdown() {
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
