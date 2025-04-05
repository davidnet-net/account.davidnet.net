import {
    get_session_information,
    get_session_token,
    is_session_valid,
} from "/session.js";

let isModalOpen = false;

function promptChoice(closeText, confirmText, message, title, isinput) {
    if (isModalOpen) return false;
    isModalOpen = true;

    return new Promise((resolve) => {
        const modal = document.getElementById("myModal");
        const modalTitle = modal.querySelector(".modal-header h2");
        const modalMessage = modal.querySelector(".modal-content p");
        const closeButton = modal.querySelector("#modal-close");
        const closeButton_x = document.getElementById("modal-close-x");
        const confirmButton = modal.querySelector("#modal-confirm");
        const modalinput = document.getElementById("modalinput");

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        closeButton.textContent = closeText;
        confirmButton.textContent = confirmText;
        modalinput.value = "";
        
        if (message == "Can you live with the fact that this cat will be sad when you delete your acount?") {
            modal.style.backgroundImage = "url('https://account.davidnet.net/icons/cryingcat.jpg')";
        } else {
            modal.style.backgroundImage = "none";
        }

        if (isinput == true) {
            modalinput.style.display = "block";
        } else {
            modalinput.style.display = "false";
        }


        modal.classList.add("active");

        function closeModal(result) {
            modal.classList.remove("active");
            isModalOpen = false;
            if (isinput == true) {
                resolve(modalinput.value);
            } else {
                resolve(result);
            }
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

// Fetch all logs
async function getLogs(sessionToken) {
    try {
        const response = await fetch("https://auth.davidnet.net/get_account_logs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: sessionToken }),
        });
        const data = await response.json();
        return data.logs.reverse() || [];
    } catch (error) {
        console.error("Failed to fetch logs:", error);
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

function displayLog(log) {
    const { id, title, message, date } = log;
    const LogsDiv = document.getElementById("logs");

    if (!LogsDiv) {
        console.error("Element with ID 'logs' not found.");
        return;
    }

    const formattedDate = formatUTCDate(date);

    const LogHTML = `
        <div class="log" id="log-${id}">
            <h3>${title}</h3>
            <p>${message}</p>
            <br>
            <p class="lefttext"><strong>UTC Date:</strong><br>${formattedDate}</p>
        </div>
    `;
    LogsDiv.insertAdjacentHTML("beforeend", LogHTML);
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

// Load logs and display them
async function loadLogs() {
    const LogsDiv = document.getElementById("logs");
    if (!LogsDiv) {
        console.error("Element with ID 'logs' not found.");
        return;
    }

    // Check if session is valid
    const valid = await is_session_valid();
    if (!valid) {
        window.location.href = "https://account.davidnet.net/login/";
        return;
    }

    const sessionToken = await get_session_token();
    const logs = await getLogs(sessionToken); // Fix: Don't destructure

    // Instead of clearing the div, just add the logs to it
    if (logs.length === 0) {
        LogsDiv.innerHTML = "<h2>No logs available.</h2>"; // Show a message if no logs exist
    } else {
        console.log(logs);
        logs.forEach(console.log);
        logs.forEach(displayLog); // Fix: Directly call `displayLog`
    }
}



// Update user info (email and creation date)
async function updateUserInfo() {
    try {
        const sessionToken = await get_session_token();

        const [usernameResponse, emailResponse, creationDateResponse, idResponse] =
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
                fetch("https://auth.davidnet.net/get_id", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: sessionToken }),
                }),
            ]);

        const username = (await usernameResponse.json()).username;
        const email = (await emailResponse.json()).email;
        const creationDate = (await creationDateResponse.json()).created_at;
        const userid = (await idResponse.json()).id;

        document.getElementById("hello").textContent = `Hello, ${username}`;
        document.getElementById("email").textContent = `Email: ${email}`;
        document.getElementById("creationdate").textContent = `UTC Creation date: ${formatUTCDate(creationDate)}`;
        document.getElementById("goprofile").href = `https://account.davidnet.net/user?id=${userid}`;

        await loadprofilepicture(userid);
    } catch (error) {
        console.error("Failed to fetch user info:", error);
    }
}

// Initialize sessions and user info after DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
    await loadSessions();
    await updateUserInfo();
    await load2famanager();
    await loadLogs();

    document.getElementById("delete-account-btn").addEventListener("click", delete_account);
    document.getElementById("changedesc").addEventListener("click", changedesc);

    setTimeout(() => {
        document.getElementById("background").style.display = "flex";
        document.getElementById("loader").style.display = "none";
    }, 1000);
});

async function delete_account() {
    const result = await promptChoice("Cancel", "Yes", "Are you sure you want to delete your account and usercontent?", "Account deletion confirmation!");
    if (result) {
        const result2 = await promptChoice("Cancel", "Yes", "Are you really really sure you want to delete your account and usercontent?", "Account deletion confirmation!");
        if (!result2) {
            return;
        }
        
        const result3 = await promptChoice("No", "Yes", "Can you live with the fact that this cat will be sad when you delete your acount?", "Account deletion confirmation!");
        if (!result3) {
            return;
        }

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

async function loadprofilepicture(userid) {
    try {
        const response = await fetch("https://auth.davidnet.net/get_profile_picture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: userid }),
        });

        const result = await response.json();

        if (response.ok) {
            const profilepicture = result.profile_picture;
            const usericon = document.getElementById("usericon");
            usericon.src = profilepicture;
        } else {

            console.error("usericon collection failed:", result.error);
        }
    } catch (error) {
        console.error("Error during usericon collection:", error);
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
    if (!result) return;

    const session_token = await get_session_token();
    const disableButton = document.getElementById("disable-totp-btn");

    try {
        disableButton.disabled = true; // Prevent multiple clicks
        const response = await fetch("https://auth.davidnet.net/disable_totp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: session_token }),
        });
        const result = await response.json();

        if (response.ok) {
            window.location.reload();
        } else {
            await promptChoice("Ok", "):", "We couldn't process 2FA changes!", "Something went wrong!");
        }
    } catch (error) {
        console.error("Failed to disable TOTP:", error);
    } finally {
        disableButton.disabled = false;
    }
}

async function changedesc() {
    const result = await promptChoice("Cancel", "Change", "Enter your new description!", "Change account description", true);
    if (!result) {
        return
    }
    const session_token = await get_session_token();

    try {
        const response = await fetch("https://auth.davidnet.net/set_desc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: session_token, description: result }),
        });
        const result = await response.json();

        if (response.ok) {
            await promptChoice("Ok", "):", "Desc updated!", "Check your profile!");
        } else {
            await promptChoice("Ok", "):", "Something wrent wrong", "Something went wrong!");
        }
    } catch (error) {
        console.error("Failed to disable TOTP:", error);
    } finally {
        disableButton.disabled = false;
    }
}