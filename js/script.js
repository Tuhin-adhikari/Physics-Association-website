
const menuBtn = document.getElementById('menu-btn');
const dropdown = document.getElementById('dropdown');
const closeBtn = document.getElementById('close-btn');

menuBtn.addEventListener('click', () => {
    dropdown.classList.remove('hidden');
    dropdown.classList.remove('translate-x-full');
});

closeBtn.addEventListener('click', () => {
    dropdown.classList.add('translate-x-full');
    setTimeout(() => dropdown.classList.add('hidden'), 300);
});