import { dirname, join as joinPath } from 'node:path';
import { fileURLToPath } from 'node:url';

console.log(joinPath(dirname(fileURLToPath(import.meta.url)), 'foo.txt'));
