// Create node_modules/@moderepo/bizstack-console-sdk/dist/index.js.map to avoid the following error.
//
// [vite] Failed to load source map for node_modules/@moderepo/bizstack-console-sdk/dist/index.js.
// Error: An error occurred while trying to read the map file at index.js.map
// Error: ENOENT: no such file or directory, open 'node_modules/@moderepo/bizstack-console-sdk/dist/index.js.map'

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const targetPath = resolve(process.cwd(), 'node_modules/@moderepo/bizstack-console-sdk/dist/index.js.map');

mkdirSync(dirname(targetPath), { recursive: true });
writeFileSync(targetPath, '{}', 'utf8');
