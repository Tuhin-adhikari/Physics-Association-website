const cards = document.querySelectorAll('.event-card');
const modal = document.getElementById('event-modal');
const closeModal = document.getElementById('close-modal');
const modalImage = document.getElementById('modal-image');

cards.forEach(card => {
    card.addEventListener('click', () => {
        const imageUrl = card.getAttribute('data-image');
        modalImage.src = imageUrl;
        modal.classList.remove('hidden');
    });
});

closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
    modalImage.src = ""; // optional
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
        modalImage.src = "";
    }
});
