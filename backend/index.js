import express from 'express';
import formRouter from './routes/forms.js';
import { existsSync } from 'node:fs';

if (existsSync('.env')) {
    process.loadEnvFile();
}

const app = express();
const port = process.env.PORT;

app.use(express.json()) 

const router = express.Router();

app.use('/api/event-form', formRouter);

app.listen(port, () => {
  console.log(`backend event form listening on port ${port}`);
});