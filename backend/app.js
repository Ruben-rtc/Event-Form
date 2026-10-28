import express from 'express';
import formRouter from './routes/forms.js';

// L'application Express est séparée de app.listen() (voir index.js)
// pour que les tests puissent l'importer sans démarrer de serveur.
const app = express();

app.use(express.json());

app.use('/api/event-form', formRouter);

export default app;
