import {
    get_session_information,
    get_session_token,
    is_session_valid,
} from "/session.js";

let isModalOpen = false;

function promptChoice(closeText, confirmText, message, title) {
    if (isModalOpen) return false;
    isModalOpen = true;

    return new Promise((resolve) => {
        const modal = document.getElementById("myModal");
        const modalTitle = modal.querySelector(".modal-header h2");
        const modalMessage = modal.querySelector(".modal-content p");
        const closeButton = modal.querySelector("#modal-close");
        const closeButton_x = document.getElementById("modal-close-x");
        const confirmButton = modal.querySelector("#modal-confirm");

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        closeButton.textContent = closeText;
        confirmButton.textContent = confirmText;

        modal.classList.add("active");

        function closeModal(result) {
            modal.classList.remove("active");
            isModalOpen = false;
            resolve(result);
            removeEventListeners();
        }

        function removeEventListeners() {
            closeButton.removeEventListener("click", onClose);
            closeButton_x.removeEventListener("click", onClose);
            confirmButton.removeEventListener("click", onConfirm);
        }

        function onClose() {
            closeModal(false);
        }

        function onConfirm() {
            closeModal(true);
        }

        closeButton.addEventListener("click", onClose);
        closeButton_x.addEventListener("click", onClose);
        confirmButton.addEventListener("click", onConfirm);
    });
}

// Utility function to format UTC dates
function formatUTCDate(utcDate) {
    const date = new Date(utcDate);
    return date.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
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
        const response = await fetch("https://auth.davidnet.net/get_sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: sessionToken, userid }),
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
    const { id, ip, created_at, useragent } = session;
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
            <p class="lefttext"><strong>Useragent:</strong><br>${useragent}</p>
            <button class="logout-btn" id="logout-btn-${id}">Log out</button>
        </div>
    `;
    sessionDiv.insertAdjacentHTML("beforeend", sessionHTML);

    // Highlight current session
    const currentSession = document.querySelector(`#session-${id}`);
    if (id === sessionInfo.id) {
        currentSession.style.backgroundColor = "#181a1b";
        currentSession.style.border = "1px solid #4caf50";
        currentSession.querySelector("h3").innerText = "Your session";
    }

    // Add logout button event listener
    const logoutButton = document.getElementById(`logout-btn-${id}`);
    if (logoutButton) {
        logoutButton.addEventListener("click", () => handleLogout(id));
    } else {
        console.warn("Logout button not found for session", id);
    }
}

// Handle session logout
async function handleLogout(id) {
    try {
        const token = await get_session_token();
        const response = await fetch("https://auth.davidnet.net/delete_session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, session_id: id }),
        });

        if (response.ok) {
            console.log("Logged out successfully!");
            loadSessions(); // Reload sessions after logout
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

    sessionDiv.innerHTML = "<h2>Sessions:</h2>";

    // Check if session is valid
    const valid = await is_session_valid();
    if (!valid) {
        window.location.href = "https://account.davidnet.net/login/";
        return;
    }

    const { sessionToken, sessionInfo } = await fetchSessionData();
    const sessions = await getSessions(sessionToken, sessionInfo.userid);

    sessions.forEach((session) => {
        displaySession(session, sessionInfo); // Display each session
    });
}

// Update user info (email and creation date)
async function updateUserInfo() {
    try {
        const sessionToken = await get_session_token();

        const [usernameResponse, emailResponse, creationDateResponse] =
            await Promise.all([
                fetch("https://auth.davidnet.net/get_username", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: sessionToken }),
                }),
                fetch("https://auth.davidnet.net/get_email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: sessionToken }),
                }),
                fetch("https://auth.davidnet.net/get_created_at", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: sessionToken }),
                }),
            ]);

        const username = (await usernameResponse.json()).username;
        const email = (await emailResponse.json()).email;
        const creationDate = (await creationDateResponse.json()).created_at;

        document.getElementById("hello").textContent = `Hello, ${username}`;
        document.getElementById("email").textContent = `Email: ${email}`;
        document.getElementById("creationdate").textContent = `UTC Creation date: ${formatUTCDate(creationDate)
            }`;
    } catch (error) {
        console.error("Failed to fetch user info:", error);
    }
}

// Initialize sessions and user info after DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
    await loadSessions();
    await updateUserInfo();
    await load2famanager();

    document.getElementById("delete-account-btn").addEventListener("click", delete_account);
});

async function delete_account() {
    const result = await promptChoice("Cancel", "Yes", "Are you sure you want to delete your account and usercontent?", "Account deletion confirmation!");
    if (result) {
        const session_token = await get_session_token();
        try {
            const response = await fetch("https://auth.davidnet.net/get_delete_token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: session_token }),
            });

            const result = await response.json();

            if (response.ok) {
                const token = result.delete_token;
                window.location = "https://account.davidnet.net/links/delete_account?token=" + token;
            } else {

                console.error("delete token collection failed:", result.error);
            }
        } catch (error) {
            console.error("Error during delete token collection:", error);
        }
    } else {
        console.log("Stopped user deletion");
    }
}


async function load2famanager() {
    const session_token = await get_session_token();
    try {
        const response = await fetch("https://auth.davidnet.net/get_2fa_information", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: session_token }),
        });
        const result = await response.json();

        if (response.ok) {
            if (result.totp == true) {
                document.getElementById("disable-totp-btn").style.display = "block";
                document.getElementById("disable-totp-btn").addEventListener("click", disabletotp);
            } else {
                document.getElementById("enable-totp-btn").style.display = "block";
                document.getElementById("enable-totp-btn").addEventListener("click", async () => {
                    const result = await promptChoice("Cancel", "Yes", "Are you sure you want to enable TOTP?", "Account 2FA security!");
                    if (result == true) { window.location.href = "https://account.davidnet.net/pages/2fa/totp" };
                });                
            }
        } else {
            await promptChoice("Ok", "):", "We couldnt load 2FA management!", "Something wrent wrong!");
        }
    } catch (error) {
        console.error("Failed to load totp info:", error);
        return [];
    }
}

async function disabletotp() {
    const result = await promptChoice("Cancel", "Yes", "Are you sure you want to disable TOTP?", "Account 2FA security!");
    if (result == true) {
        const session_token = await get_session_token();
        try {
            const response = await fetch("https://auth.davidnet.net/disable_totp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: session_token }),
            });
            const result = await response.json();

            if (response.ok) {
                window.location.reload();
            } else {
                await promptChoice("Ok", "):", "We couldnt process 2FA changes!", "Something wrent wrong!");
            }
        } catch (error) {
            console.error("Failed to totp info:", error);
            return [];
        }
    }
}