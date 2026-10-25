const liste = document.querySelector('#liste');
const status = document.querySelector('#status');

async function chargerFormulaires() {
    try {
        const response = await fetch('/api/event-form');
        if (!response.ok) throw new Error(`Erreur ${response.status}`);

        const { forms } = await response.json();

        if (forms.length === 0) {
            status.textContent = 'Aucun formulaire pour le moment.';
            return;
        }

        for (const form of forms) {
            const li = document.createElement('li');

            const nom = document.createElement('h2');
            nom.textContent = `${form.name} ${form.surname}`;

            const email = document.createElement('p');
            email.className = 'email';
            email.textContent = form.email;

            const message = document.createElement('p');
            message.textContent = form.message;

            const date = document.createElement('p');
            date.className = 'date';
            date.textContent = new Date(form.submitted_at).toLocaleString('fr-CH');

            const lien = document.createElement('a');
            lien.className = 'carte';
            lien.href = `/form/${form.id}`;
            lien.append(nom, email, message, date);

            li.append(lien);
            liste.append(li);
        }
    } catch (error) {
        status.textContent = "Impossible de charger les formulaires.";
        console.error(error);
    }
}

chargerFormulaires();
