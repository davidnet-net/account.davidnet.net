import { is_session_valid, get_session_information, get_session_token } from '/session.js';

// Create a function to load and display sessions
async function loadSessions() {
    // Clear the sessions div
    const sessionDiv = document.getElementById("sessions");
    if (sessionDiv) {
        sessionDiv.innerHTML = '<h2>Sessions:</h2>';  // Clear the existing content
    } else {
        console.error("Element with ID 'sessions' not found.");
    }

    const valid = await is_session_valid();
    if (!valid) {
        window.location.href = "https://account.davidnet.net/login/";
        return; // Stop if session is invalid
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
        display_session(session, sessioninfo);  // Pass session and sessioninfo to display_session
    });
    console.log("Sessions:", sessions);
}

// Load sessions when the DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
    await loadSessions();  // Load the sessions when the DOM is ready

    const getEmail = async () => {
        const response = await fetch('https://auth.davidnet.net/get_email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: await get_session_token() }),
        });
        return (await response.json()).email;
    };

    const getCreatedAt = async () => {
        const response = await fetch('https://auth.davidnet.net/get_created_at', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: await get_session_token() }),
        });
        return (await response.json()).created_at;
    };

    const [email, creationDate] = await Promise.all([getEmail(), getCreatedAt()]);

    // Format the account creation date
    const formattedCreationDate = formatUTCDate(creationDate);

    document.getElementById("email").textContent = `Email: ${email}`;
    document.getElementById("creationdate").textContent = `UTC Creation date: ${formattedCreationDate}`;
});

// Function to handle the logout of a session
async function handleLogout(id) {
    const token = await get_session_token();
    console.log("Logging out id: " + id + "  with our token: " + token);

    const response = await fetch('https://auth.davidnet.net/delete_session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, session_id: id }),
    });

    if (response.ok) {
        console.log("Logged out!");
        await loadSessions();  // Reload the sessions after logging out
    } else {
        const result = await response.json();
        console.error(result.error);
    }
}

function formatUTCDate(utcDate) {
    const date = new Date(utcDate);  // Parse the UTC string into a Date object
    return date.toLocaleString('en-US', {
        weekday: 'long',  // Full day name (e.g., Monday)
        year: 'numeric',  // Year (e.g., 2025)
        month: 'long',  // Full month name (e.g., March)
        day: 'numeric',  // Day of the month (e.g., 2)
        hour: '2-digit',  // Hour in 12-hour format
        minute: '2-digit',  // Minute
        second: '2-digit',  // Second
        timeZoneName: 'short'  // Time zone (e.g., UTC)
    });
}

function display_session(session, sessioninfo) {
    const { id, ip, created_at } = session;
    const sessionDiv = document.getElementById("sessions");

    if (!sessionDiv) {
        console.error("Element with ID 'sessions' not found.");
        return;
    }

    const formattedDate = formatUTCDate(created_at);  // Get the formatted date

    const sessionHTML = `
        <div class="session" id="session-${id}">
            <h3>${id}</h3>
            <p class="lefttext"><strong>IP:</strong><br>${ip}</p>
            <p class="lefttext"><strong>UTC Creationdate:</strong><br>${formattedDate}</p>
            <button class="logout-btn" id="logout-btn-${id}">Log out</button>
            <p></p>
        </div>
    `;

    sessionDiv.innerHTML += sessionHTML;

    // Check if the current session is the same as this one
    const currentSession = document.querySelector(`#session-${id}`);
    if (id === sessioninfo.id) {
        currentSession.style.backgroundColor = '#181a1b';  // Dark background
        currentSession.style.border = '1px solid #4caf50';  // Green border
        currentSession.querySelector('h3').innerText = "Your session"; // Update header text
    }

    const logoutButton = document.getElementById(`logout-btn-${id}`);
    if (logoutButton) {
        logoutButton.addEventListener('click', () => handleLogout(id));
        console.log("Connected logout button: " + `logout-btn-${id}`);
    } else {
        console.warn("Log out button not found");
    }
}
