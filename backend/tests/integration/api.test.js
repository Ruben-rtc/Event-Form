// Tests d'intégration : testent la vraie stack lancée avec docker compose
// (nginx -> backend -> MySQL), en passant par nginx comme le ferait le navigateur.
//
// Lancer en local :
//   1. à la racine du projet : docker compose up -d --build --wait
//   2. dans backend/        : npm run test:integration
//
// Attention : ces tests créent puis suppriment un formulaire dans la base.
import { describe, test, before } from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8080';
const API = `${BASE_URL}/api/event-form`;

const newForm = {
    name: 'Test',
    surname: 'Integration',
    email: 'test.integration@example.com',
    message: 'Formulaire créé par les tests GitHub Actions',
};

const json = (method, body) => ({
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
});

// Vérifie si un port de la machine hôte est ouvert
function portIsOpen(port, host = '127.0.0.1') {
    return new Promise((resolve) => {
        const socket = net.connect(port, host);
        socket.setTimeout(2000);
        socket.once('connect', () => { socket.destroy(); resolve(true); });
        socket.once('timeout', () => { socket.destroy(); resolve(false); });
        socket.once('error', () => resolve(false));
    });
}

// Le backend peut mettre quelques secondes à démarrer après la base de données
before(async () => {
    for (let i = 0; i < 30; i++) {
        try {
            const res = await fetch(API);
            if (res.ok) return;
        } catch { /* pas encore prêt */ }
        await new Promise((r) => setTimeout(r, 2000));
    }
    throw new Error(`L'API ne répond pas sur ${API}`);
});

describe('Frontend (nginx)', () => {
    test('sert la page d\'accueil', async () => {
        const res = await fetch(`${BASE_URL}/`);

        assert.equal(res.status, 200);
        assert.match(res.headers.get('content-type'), /text\/html/);
    });

    test('sert la page de liste', async () => {
        const res = await fetch(`${BASE_URL}/liste.html`);

        assert.equal(res.status, 200);
    });

    test('/form/:id renvoie la page form.html', async () => {
        const res = await fetch(`${BASE_URL}/form/1`);

        assert.equal(res.status, 200);
        assert.match(await res.text(), /edit-form/);
    });
});

describe('API via nginx + MySQL', () => {
    test('la base contient les données initiales de form-database.sql', async () => {
        const res = await fetch(API);
        const { forms } = await res.json();

        assert.equal(res.status, 200);
        const noms = forms.map((f) => f.name);
        assert.ok(noms.includes('Ruben'));
        assert.ok(noms.includes('Arthur'));
    });

    test('un id inexistant renvoie 404', async () => {
        const res = await fetch(`${API}/999999`);

        assert.equal(res.status, 404);
    });

    // Scénario CRUD complet : les tests d'un fichier s'exécutent dans l'ordre
    let id;

    test('POST crée un formulaire', async () => {
        const res = await fetch(`${API}/add`, json('POST', newForm));
        const body = await res.json();

        assert.equal(res.status, 201);
        assert.ok(Number.isInteger(body.form.id));
        id = body.form.id;
    });

    test('GET renvoie le formulaire créé', async () => {
        const res = await fetch(`${API}/${id}`);
        const { form } = await res.json();

        assert.equal(res.status, 200);
        assert.equal(form.email, newForm.email);
        assert.equal(form.message, newForm.message);
        assert.ok(form.submitted_at, 'la date est remplie par MySQL');
    });

    test('PUT modifie le formulaire', async () => {
        const res = await fetch(`${API}/edit/${id}`, json('PUT', { ...newForm, message: 'Message modifié' }));
        assert.equal(res.status, 200);

        const check = await fetch(`${API}/${id}`);
        const { form } = await check.json();
        assert.equal(form.message, 'Message modifié');
    });

    test('DELETE supprime le formulaire', async () => {
        const res = await fetch(`${API}/delete/${id}`, { method: 'DELETE' });
        assert.equal(res.status, 200);

        const check = await fetch(`${API}/${id}`);
        assert.equal(check.status, 404);
    });

    test('supprimer un formulaire déjà supprimé renvoie 404', async () => {
        const res = await fetch(`${API}/delete/${id}`, { method: 'DELETE' });

        assert.equal(res.status, 404);
    });
});

describe('Isolation réseau', () => {
    // Seul nginx (8080) doit être publié sur la machine hôte.
    // Si tu as un MySQL installé en local, le test du port 3306 échouera : c'est normal.
    test('MySQL (3306) n\'est pas accessible depuis l\'hôte', async () => {
        assert.equal(await portIsOpen(3306), false);
    });

    test('le backend (3000) n\'est pas accessible directement depuis l\'hôte', async () => {
        assert.equal(await portIsOpen(3000), false);
    });
});
