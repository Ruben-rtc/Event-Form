const status = document.querySelector('#status');
const detail = document.querySelector('#detail');

const id = window.location.pathname.split('/').filter(Boolean).pop();

async function chargerFormulaire() {
    try {
        const response = await fetch(`/api/event-form/${id}`);

        if (response.status === 404) {
            status.textContent = "Ce formulaire n'existe pas.";
            return;
        }
        if (!response.ok) throw new Error(`Erreur ${response.status}`);

        const { form } = await response.json();

        document.title = `${form.name} ${form.surname}`;
        document.querySelector('#titre').textContent = `${form.name} ${form.surname}`;
        document.querySelector('#email').textContent = form.email;
        document.querySelector('#message').textContent = form.message;
        document.querySelector('#date').textContent = new Date(form.submitted_at).toLocaleString('fr-CH');

        detail.hidden = false;
    } catch (error) {
        status.textContent = 'Impossible de charger le formulaire.';
        console.error(error);
    }
}

chargerFormulaire();
