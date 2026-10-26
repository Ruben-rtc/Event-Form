const form = document.querySelector('#edit-form');
const status = document.querySelector('#status');
const titre = document.querySelector('#titre');
const boutonSupprimer = document.querySelector('#supprimer');

const id = window.location.pathname.split('/').filter(Boolean).pop();

async function chargerFormulaire() {
    try {
        const response = await fetch(`/api/event-form/${id}`);

        if (response.status === 404) {
            status.textContent = "Ce formulaire n'existe pas.";
            return;
        }
        if (!response.ok) throw new Error(`Erreur ${response.status}`);

        const { form: data } = await response.json();

        // Pré-remplit chaque champ grâce à son attribut name
        for (const champ of ['name', 'surname', 'email', 'message']) {
            form.elements[champ].value = data[champ];
        }

        titre.textContent = `${data.name} ${data.surname}`;
        document.title = titre.textContent;
        document.querySelector('#date').textContent =
            `Envoyé le ${new Date(data.submitted_at).toLocaleString('fr-CH')}`;

        form.hidden = false;
    } catch (error) {
        status.textContent = 'Impossible de charger le formulaire.';
        console.error(error);
    }
}

// ---------- Modification ----------
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form));
    // data = { name, surname, email, message }

    try {
        const response = await fetch(`/api/event-form/edit/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error(`Erreur ${response.status}`);

        titre.textContent = `${data.name} ${data.surname}`;
        document.title = titre.textContent;
        status.textContent = 'Modifications enregistrées.';
    } catch (error) {
        status.textContent = "Une erreur s'est produite, réessaie.";
        console.error(error);
    }
});

// ---------- Suppression ----------
boutonSupprimer.addEventListener('click', async () => {
    try {
        const response = await fetch(`/api/event-form/delete/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error(`Erreur ${response.status}`);

        window.location.href = '/liste.html';
    } catch (error) {
        status.textContent = "La suppression a échoué, réessaie.";
        console.error(error);
    }
});

chargerFormulaire();
