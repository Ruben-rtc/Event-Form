import app from './app.js';
import { existsSync } from 'node:fs';

if (existsSync('.env')) {
    process.loadEnvFile();
}

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`backend event form listening on port ${port}`);
});
