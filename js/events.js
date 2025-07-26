function showEventDetails(title, description, date, registerLink, subEvents = [], rules = []) {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Populate content
    document.getElementById('event-title').innerText = title;
    document.getElementById('event-date').innerText = date;
    document.getElementById('event-description').innerText = description;

    // Sub-events
    const subEventsContainer = document.getElementById("event-sub-events-container");
    const subEventsList = document.getElementById("event-sub-events");
    subEventsList.innerHTML = "";
    subEvents.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        subEventsList.appendChild(li);
    });
    subEventsContainer.classList.toggle("hidden", subEvents.length === 0);

    // Rules
    const rulesContainer = document.getElementById("event-rules-container");
    const rulesList = document.getElementById("event-rules");
    rulesList.innerHTML = "";
    rules.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        rulesList.appendChild(li);
    });
    rulesContainer.classList.toggle("hidden", rules.length === 0);

    // Register link
    document.getElementById('event-link').href = "";

    // Show section
    document.getElementById('event-detail').classList.remove('hidden');
}

function closeEvent() {
    document.getElementById('event-detail').classList.add('hidden');
}
