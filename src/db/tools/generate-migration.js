const { execSync } = require('node:child_process');

const arg = process.argv[2];
if (!arg) throw new Error('Please provide the name for migration');
const command = `cross-env NODE_ENV=development typeorm-ts-node-commonjs migration:generate -d ./src/db/migrations-data-source.ts ./src/db/migrations/${arg}`;

execSync(command, { stdio: 'inherit' });