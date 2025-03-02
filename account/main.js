import { is_session_valid, get_session_information, get_session_token } from '/session.js';

// Define the handleLogout function globally
async function handleLogout(id) {
    const token = await get_session_token();
    console.log("Logging out id: " + id + "  with our token: " + token)

    const response = await fetch('https://auth.davidnet.net/delete_session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, session_id: id }),
    });

    if (response.ok) {
        console.log("Logged out!");
    } else {
        const result = await response.json();  // Voeg 'await' toe om de response correct te verwerken
        console.error(result.error);
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    const valid = await is_session_valid();
    if (!valid) {
        window.location.href = "https://account.davidnet.net/login/";
        return; // Stop de code hier als de sessie ongeldig is
    }

    const session_token = await get_session_token();
    console.log("session_token:", session_token);

    const sessioninfo = await get_session_information();
    console.log("Session info:", sessioninfo);

    const { id, userid, ip, created_at } = sessioninfo;

    const requestData = { token: session_token };

    const get_sessions = async () => {
        const response = await fetch('https://auth.davidnet.net/get_sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: session_token, userid })
        });
        return (await response.json()).sessions;
    };

    const sessions = await get_sessions();
    sessions.forEach(session => {
        display_session(session.id, session.ip, session.created_at);
    });
    console.log("Sessions:", await get_sessions());


    const getEmail = async () => {
        const response = await fetch('https://auth.davidnet.net/get_email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
        });
        return (await response.json()).email;
    };

    const getCreatedAt = async () => {
        const response = await fetch('https://auth.davidnet.net/get_created_at', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
        });
        return (await response.json()).created_at;
    };

    // Wacht op beide requests tegelijkertijd
    const [email, creationDate] = await Promise.all([getEmail(), getCreatedAt()]);

    document.getElementById("email").textContent = `Email: ${email}`;
    document.getElementById("creationdate").textContent = `UTC Creation date: ${creationDate}`;
});


function display_session(id, ip, creationdate) {
    const sessionDiv = document.getElementById("sessions");

    if (!sessionDiv) {
        console.error("Element with ID 'sessions' not found.");
        return;
    }

    const sessionHTML = `
        <div class="session" id="session-${id}">
            <h3>${id}</h3>
            <p class="lefttext"><strong>IP:</strong><br>${ip}</p>
            <p class="lefttext"><strong>UTC Creationdate:</strong><br>${creationdate}</p>
            <button class="logout-btn" id="logout-btn-${id}">Log out</button>
            <p></p>
        </div>
    `;

    sessionDiv.innerHTML += sessionHTML;

    // Attach the logout button event listener inside the loop to each button
    const logoutButton = document.getElementById(`logout-btn-${id}`);
    if (logoutButton) {
        logoutButton.addEventListener('click', () => handleLogout(id));
        console.log("Connected logout button: " + `logout-btn-${id}`);
    } else {
        console.warn("Log out button not found");
    }
}
