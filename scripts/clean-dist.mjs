import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const workspace = process.argv[2];
if (workspace !== 'backend' && workspace !== 'frontend') {
  throw new Error('clean-dist requires the explicit backend or frontend workspace name.');
}

rmSync(resolve(repositoryRoot, workspace, 'dist'), { recursive: true, force: true });
