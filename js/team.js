// Modal logic
const modal = document.getElementById("team-modal");
const closeModal = document.getElementById("close-modal");
const cards = document.querySelectorAll(".team-card");

const modalName = document.getElementById("modal-name");
const modalRole = document.getElementById("modal-role");
const modalImg = document.getElementById("modal-img");
const modalTeam = document.getElementById("modal-team");

cards.forEach(card => {
    card.addEventListener("click", () => {
        modalName.textContent = card.dataset.name;
        modalRole.textContent = card.dataset.role;
        modalImg.src = card.dataset.image;
        modalTeam.textContent = `Team Members: ${card.dataset.team}`;
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    });
});

closeModal.addEventListener("click", () => {
    modal.classList.remove("flex");
    modal.classList.add("hidden");
});
