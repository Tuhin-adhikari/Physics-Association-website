function showEventDetails(title, description, date, registerLink, rules = []) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('event-title').innerText = title;
    document.getElementById('event-date').innerText = date;
    document.getElementById('event-description').innerText = description;

    const rulesContainer = document.getElementById("event-rules-container");
    const rulesList = document.getElementById("event-rules");
    rulesList.innerHTML = "";
    if (rules && rules.length > 0) {
        rules.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            rulesList.appendChild(li);
        });
        rulesContainer.classList.remove("hidden");
    } else {
        rulesContainer.classList.add("hidden");
    }

    const registerButton = document.getElementById('event-link');
    registerButton.href = registerLink || "#";
    registerButton.target = "_blank";
    registerButton.rel = "noopener noreferrer";

    const popup = document.getElementById('event-detail');
    popup.classList.remove('hidden');
    popup.classList.add('show');
    document.body.style.overflow = "hidden";
}

function closeEvent() {
    const popup = document.getElementById('event-detail');
    popup.classList.add('hidden');
    popup.classList.remove('show');
    document.body.style.overflow = "auto";
}