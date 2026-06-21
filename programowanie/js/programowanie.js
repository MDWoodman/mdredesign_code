const menuButton = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');

if (menuButton && menu) {
	menuButton.addEventListener('click', () => {
		const isOpen = menu.classList.toggle('open');
		menuButton.setAttribute('aria-expanded', String(isOpen));
	});

	menu.querySelectorAll('a').forEach((link) => {
		link.addEventListener('click', () => {
			menu.classList.remove('open');
			menuButton.setAttribute('aria-expanded', 'false');
		});
	});
}

const offerContainer = document.querySelector('#offer-list');

async function loadOffer() {
	if (!offerContainer) return;

	try {
		const response = await fetch('programowanie/katalogi/oferta-programowanie.json');
		if (!response.ok) throw new Error('Nie udało się pobrać katalogu oferty');

		const offers = await response.json();
		offerContainer.innerHTML = '';

		offers.forEach((offer) => {
			const card = document.createElement('article');
			card.className = 'card';

			const tags = Array.isArray(offer.tags)
				? offer.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')
				: '';

			card.innerHTML = `
				<h3>${offer.title}</h3>
				<p>${offer.description}</p>
				<div class="tags">${tags}</div>
			`;

			offerContainer.appendChild(card);
		});
	} catch (error) {
		offerContainer.innerHTML = '<p class="card">Nie udało się wczytać katalogu usług. Odśwież stronę lub skontaktuj się bezpośrednio mailowo.</p>';
	}
}

loadOffer();
