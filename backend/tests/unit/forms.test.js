// Tests unitaires des routes /api/event-form
// La base de données est simulée (mock) : aucun MySQL n'est nécessaire.
// Lancer : npm test
import { describe, test, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../app.js';
import db from '../../db/db-forms.js';

const fakeForms = [
    { id: 1, name: 'Ruben', surname: 'ten Cate', email: 'ruben@example.com', message: 'Hello' },
    { id: 2, name: 'Arthur', surname: 'Saugy', email: 'arthur@example.com', message: 'Coucou' },
];

const newForm = { name: 'Jean', surname: 'Dupont', email: 'jean@example.com', message: 'Salut' };

const dbError = async () => { throw new Error('DB indisponible'); };

beforeEach(() => {
    // Les routes affichent les erreurs dans la console : on les masque pendant les tests
    mock.method(console, 'error', () => {});
    mock.method(console, 'log', () => {});
});

afterEach(() => {
    mock.restoreAll();
});

describe('GET /api/event-form', () => {
    test('renvoie la liste des formulaires', async () => {
        mock.method(db, 'getAllForms', async () => fakeForms);

        const res = await request(app).get('/api/event-form');

        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { forms: fakeForms });
    });

    test('renvoie une liste vide quand il n\'y a aucun formulaire', async () => {
        mock.method(db, 'getAllForms', async () => []);

        const res = await request(app).get('/api/event-form');

        assert.equal(res.status, 200);
        assert.deepEqual(res.body.forms, []);
    });

    test('renvoie 500 si la base de données plante', async () => {
        mock.method(db, 'getAllForms', dbError);

        const res = await request(app).get('/api/event-form');

        assert.equal(res.status, 500);
        assert.equal(res.body.message, 'Une erreur interne est survenue');
    });
});

describe('GET /api/event-form/:id', () => {
    test('renvoie le formulaire demandé', async () => {
        const getFormById = mock.method(db, 'getFormById', async () => fakeForms[0]);

        const res = await request(app).get('/api/event-form/1');

        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { form: fakeForms[0] });
        // L'id de l'URL est bien converti en nombre
        assert.deepEqual(getFormById.mock.calls[0].arguments, [1]);
    });

    test('renvoie 404 si le formulaire n\'existe pas', async () => {
        mock.method(db, 'getFormById', async () => undefined);

        const res = await request(app).get('/api/event-form/999');

        assert.equal(res.status, 404);
        assert.equal(res.body.message, 'Formulaire non trouvé');
    });

    test('renvoie 500 si la base de données plante', async () => {
        mock.method(db, 'getFormById', dbError);

        const res = await request(app).get('/api/event-form/1');

        assert.equal(res.status, 500);
    });
});

describe('POST /api/event-form/add', () => {
    test('crée un formulaire et renvoie 201', async () => {
        const createForm = mock.method(db, 'createForm',
            async (name, surname, email, message) => ({ id: 3, name, surname, email, message }));

        const res = await request(app).post('/api/event-form/add').send(newForm);

        assert.equal(res.status, 201);
        assert.equal(res.body.message, 'Le formulaire au nom de Jean a bien été créé!');
        assert.deepEqual(res.body.form, { id: 3, ...newForm });
        assert.deepEqual(createForm.mock.calls[0].arguments,
            [newForm.name, newForm.surname, newForm.email, newForm.message]);
    });

    test('renvoie 500 si la base de données plante', async () => {
        mock.method(db, 'createForm', dbError);

        const res = await request(app).post('/api/event-form/add').send(newForm);

        assert.equal(res.status, 500);
    });
});

describe('PUT /api/event-form/edit/:id', () => {
    test('met à jour le formulaire', async () => {
        const updateForm = mock.method(db, 'updateForm',
            async (id, name, surname, email, message) => ({ id, name, surname, email, message }));

        const res = await request(app).put('/api/event-form/edit/2').send(newForm);

        assert.equal(res.status, 200);
        assert.equal(res.body.message, 'Formulaire mis à jour');
        assert.deepEqual(updateForm.mock.calls[0].arguments,
            [2, newForm.name, newForm.surname, newForm.email, newForm.message]);
    });

    test('renvoie 500 si la base de données plante', async () => {
        mock.method(db, 'updateForm', dbError);

        const res = await request(app).put('/api/event-form/edit/2').send(newForm);

        assert.equal(res.status, 500);
    });
});

describe('DELETE /api/event-form/delete/:id', () => {
    test('supprime le formulaire', async () => {
        const deleteForm = mock.method(db, 'deleteForm', async () => ({ success: true }));

        const res = await request(app).delete('/api/event-form/delete/1');

        assert.equal(res.status, 200);
        assert.equal(res.body.message, 'Formulaire supprimé');
        assert.deepEqual(deleteForm.mock.calls[0].arguments, [1]);
    });

    test('renvoie 404 si le formulaire n\'existe pas', async () => {
        mock.method(db, 'deleteForm', async () => ({ success: false }));

        const res = await request(app).delete('/api/event-form/delete/999');

        assert.equal(res.status, 404);
        assert.equal(res.body.message, 'Formulaire non trouvé');
    });

    test('renvoie 500 si la base de données plante', async () => {
        mock.method(db, 'deleteForm', dbError);

        const res = await request(app).delete('/api/event-form/delete/1');

        assert.equal(res.status, 500);
    });
});

describe('Routes inconnues', () => {
    test('renvoie 404', async () => {
        const res = await request(app).get('/api/route-qui-nexiste-pas');

        assert.equal(res.status, 404);
    });
});
