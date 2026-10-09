const form = document.querySelector('#event-form');
const status = document.querySelector('#status');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form));
    // data = { name, surname, email, message }

    try {
        const response = await fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error(`Erreur ${response.status}`);

        status.textContent = 'Merci, ton message a bien été envoyé.';
        form.reset();
    } catch (error) {
        status.textContent = "Une erreur s'est produite, réessaie.";
        console.error(error);
    }
});