import { is_session_valid, get_session_information, get_session_token } from '/session.js';

// Utility function to format UTC dates
function formatUTCDate(utcDate) {
    const date = new Date(utcDate);
    return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });
}

// Fetches session information
async function fetchSessionData() {
    const sessionToken = await get_session_token();
    const sessionInfo = await get_session_information();
    return { sessionToken, sessionInfo };
}

// Fetch all sessions for a user
async function getSessions(sessionToken, userid) {
    try {
        const response = await fetch('https://auth.davidnet.net/get_sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: sessionToken, userid })
        });
        const data = await response.json();
        return data.sessions || [];
    } catch (error) {
        console.error("Failed to fetch sessions:", error);
        return [];
    }
}

// Display session information on the page
function displaySession(session, sessionInfo) {
    const { id, ip, created_at } = session;
    const sessionDiv = document.getElementById("sessions");

    if (!sessionDiv) {
        console.error("Element with ID 'sessions' not found.");
        return;
    }

    const formattedDate = formatUTCDate(created_at);

    const sessionHTML = `
        <div class="session" id="session-${id}">
            <h3>${id}</h3>
            <p class="lefttext"><strong>IP:</strong><br>${ip}</p>
            <p class="lefttext"><strong>UTC Creationdate:</strong><br>${formattedDate}</p>
            <button class="logout-btn" id="logout-btn-${id}">Log out</button>
        </div>
    `;
    sessionDiv.insertAdjacentHTML('beforeend', sessionHTML);

    // Highlight current session
    const currentSession = document.querySelector(`#session-${id}`);
    if (id === sessionInfo.id) {
        currentSession.style.backgroundColor = '#181a1b';
        currentSession.style.border = '1px solid #4caf50';
        currentSession.querySelector('h3').innerText = "Your session";
    }

    // Add logout button event listener
    const logoutButton = document.getElementById(`logout-btn-${id}`);
    if (logoutButton) {
        logoutButton.addEventListener('click', () => handleLogout(id));
    } else {
        console.warn("Logout button not found for session", id);
    }
}

// Handle session logout
async function handleLogout(id) {
    try {
        const token = await get_session_token();
        const response = await fetch('https://auth.davidnet.net/delete_session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, session_id: id })
        });

        if (response.ok) {
            console.log("Logged out successfully!");
            loadSessions();  // Reload sessions after logout
        } else {
            const result = await response.json();
            console.error("Logout failed:", result.error);
        }
    } catch (error) {
        console.error("Error during logout:", error);
    }
}

// Load sessions and display them
async function loadSessions() {
    const sessionDiv = document.getElementById("sessions");
    if (!sessionDiv) {
        console.error("Element with ID 'sessions' not found.");
        return;
    }

    sessionDiv.innerHTML = '<h2>Sessions:</h2>';

    // Check if session is valid
    const valid = await is_session_valid();
    if (!valid) {
        window.location.href = "https://account.davidnet.net/login/";
        return;
    }

    const { sessionToken, sessionInfo } = await fetchSessionData();
    const sessions = await getSessions(sessionToken, sessionInfo.userid);

    sessions.forEach(session => {
        displaySession(session, sessionInfo);  // Display each session
    });
}

// Update user info (email and creation date)
async function updateUserInfo() {
    try {
        const sessionToken = await get_session_token();
        
        const [usernameResponse, emailResponse, creationDateResponse] = await Promise.all([
            fetch('https://auth.davidnet.net/get_username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: sessionToken })
            }),
            fetch('https://auth.davidnet.net/get_email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: sessionToken })
            }),
            fetch('https://auth.davidnet.net/get_created_at', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: sessionToken })
            })
        ]);

        const username = (await usernameResponse.json()).username;
        const email = (await emailResponse.json()).email;
        const creationDate = (await creationDateResponse.json()).created_at;

        document.getElementById("hello").textContent = `Hello, ${username}`
        document.getElementById("email").textContent = `Email: ${email}`;
        document.getElementById("creationdate").textContent = `UTC Creation date: ${formatUTCDate(creationDate)}`;
    } catch (error) {
        console.error("Failed to fetch user info:", error);
    }
}

// Initialize sessions and user info after DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
    await loadSessions();
    await updateUserInfo();
});
