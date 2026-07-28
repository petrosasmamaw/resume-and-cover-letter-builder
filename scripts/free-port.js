import { execFileSync } from 'child_process';

const ports = process.argv.slice(2).map(Number).filter(Boolean);
const keepPids = new Set(
  String(process.env.FREE_PORT_KEEP_PIDS || '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => n > 0)
);
keepPids.add(process.pid);
if (process.ppid) keepPids.add(process.ppid);

if (!ports.length) {
  console.error('Usage: node free-port.js <port> [port...]');
  process.exit(1);
}

function freePortWindows(port) {
  const keepList = [...keepPids].join(',');
  const command = [
    `$ErrorActionPreference='SilentlyContinue';`,
    `$keep = @(${[...keepPids].map((p) => p).join(',') || '0'});`,
    `$pids = @(Get-NetTCPConnection -LocalPort ${port} | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -gt 0 -and $keep -notcontains $_ });`,
    `foreach ($procId in $pids) { Stop-Process -Id $procId -Force; Write-Output ("Freed port ${port} (killed PID $procId)") }`,
  ].join(' ');

  try {
    const out = execFileSync(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command],
      { encoding: 'utf8', windowsHide: true }
    ).trim();
    if (out) console.log(out);
  } catch (err) {
    const out = `${err.stdout || ''}`.trim();
    if (out) console.log(out);
  }
}

function freePortUnix(port) {
  try {
    const output = execFileSync('lsof', ['-ti', `tcp:${port}`], {
      encoding: 'utf8',
    });
    const pids = [
      ...new Set(
        output
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean)
          .map(Number)
          .filter((pid) => pid > 0 && !keepPids.has(pid))
      ),
    ];
    for (const pid of pids) {
      try {
        process.kill(pid, 'SIGKILL');
        console.log(`Freed port ${port} (killed PID ${pid})`);
      } catch {
        // already gone
      }
    }
  } catch {
    // nothing listening
  }
}

for (const port of ports) {
  if (process.platform === 'win32') freePortWindows(port);
  else freePortUnix(port);
}
