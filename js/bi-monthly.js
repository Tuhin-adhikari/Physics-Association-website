const cards = document.querySelectorAll('.event-card');
const modal = document.getElementById('event-modal');
const closeModal = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const modalDate = document.getElementById('modal-date');
const modalDescription = document.getElementById('modal-description');

cards.forEach(card => {
    card.addEventListener('click', () => {
        modalTitle.textContent = card.getAttribute('data-title');
        modalDate.textContent = card.getAttribute('data-date');
        modalDescription.textContent = card.getAttribute('data-description');
        modal.classList.remove('hidden');
    });
});

closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});