import { is_session_valid, get_session_information, get_session_token } from '/session.js';

document.addEventListener("DOMContentLoaded", async () => {
    const valid = await is_session_valid();
    if (valid === false) {
        window.location.href = "https://account.davidnet.net/login/";
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    if (is_session_valid() === false) {
        window.location = "https://account.davidnet.net/login/";
    }
    const session_token =  get_session_token();

    const sessioninfo = get_session_information();
    const id = sessioninfo.id;
    const userid = sessioninfo.userid;
    const ip = sessioninfo.ip;
    const created_at = sessioninfo.created_at;

    //display_session()
    const requestData = {
        token: session_token
    };

    const get_sessions = async () => {
        const requestData = {
            token: session_token,
            userid: userid
        };
        const response = await fetch('https://auth.davidnet.net/get_sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });
        const result = await response.json();
        return result.sessions
    };
    console.log(await get_sessions());

    // Make the POST request to get the email
    const getEmail = async () => {
        const response = await fetch('https://auth.davidnet.net/get_email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });
        const result = await response.json();
        return result.email;
    };

    // Make the POST request to get the creation date
    const getCreatedAt = async () => {
        const response = await fetch('https://auth.davidnet.net/get_created_at', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });
        const result = await response.json();
        return result.created_at;
    };

    // Wait for both requests
    const email = await getEmail();
    const creationDate = await getCreatedAt();

    // Set the content on the page
    document.getElementById("email").textContent = "<strong>Email:</strong><br>" + email;
    document.getElementById("creationdate").textContent = "<strong>UTC Creation date:</strong><br>" + creationDate;
});

function display_session(id, ip, creationdate) {
    const sessionDiv = document.getElementById(sessions);

    // Create the content for session div
    sessionDiv.innerHTML = `
        <h3>${id}</h3>
        <p class="lefttext"><strong>IP:</strong><br>${ip}</p>
        <p class="lefttext"><strong>UTC Creationdate:</strong><br>${creationdate}</p>
        <button onclick="handleLogout('${id}')">Log out</button>
        <P></P>
    `;

    // Append the session div to the body (or any other container element)
    document.body.appendChild(document.getElementById("sessions"));
}