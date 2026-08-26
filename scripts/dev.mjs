import { spawn } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const commands = [
  ['run', 'dev', '--workspace', 'backend'],
  ['run', 'dev', '--workspace', 'frontend'],
];
const children = commands.map((args) => spawn(npm, args, { stdio: 'inherit' }));
let stopping = false;

const stop = (signal = 'SIGTERM') => {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill(signal);
};

for (const child of children) {
  child.on('exit', (code) => {
    if (!stopping && code !== 0) {
      process.exitCode = code ?? 1;
      stop();
    }
  });
}

process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));
