const { spawn } = require('child_process');

const port = process.env.PORT || '3000';

const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['next', 'start', '-H', '0.0.0.0', '-p', port],
  { stdio: 'inherit' },
);

child.on('exit', (code) => process.exit(code ?? 0));


