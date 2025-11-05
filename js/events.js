function showEventDetails(title, description, date, registerLink, rules = []) {
    // Scroll to top smoothly when popup opens
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Populate content
    document.getElementById('event-title').innerText = title;
    document.getElementById('event-date').innerText = date;
    document.getElementById('event-description').innerText = description;

    // Rules section
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

    // Register link
    const registerButton = document.getElementById('event-link');
    registerButton.href = registerLink || "#";
    registerButton.target = "_blank";
    registerButton.rel = "noopener noreferrer";

    // Show popup
    document.getElementById('event-detail').classList.remove('hidden');

    // Prevent background scrolling
    document.body.style.overflow = "hidden";
}

function closeEvent() {
    const popup = document.getElementById('event-detail');
    popup.classList.add('hidden');

    // Restore scrolling
    document.body.style.overflow = "auto";
}