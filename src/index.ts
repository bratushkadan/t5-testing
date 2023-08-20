import path from 'node:path'

import { expressPingMiddleware } from '@/lib/server'

console.log(path.join(__dirname, 'foo.txt'))
