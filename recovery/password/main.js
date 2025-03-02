import { get_session_information, is_session_valid } from "/session.js";
document.addEventListener("DOMContentLoaded", async () => {
    const valid = await is_session_valid();
    if (valid) {
        window.location.href = "https://account.davidnet.net/account/";
    }

    const recovery_token = localStorage.getItem("recovery-token");

    if (!recovery_token) {
        window.location.href = "https://account.davidnet.net/recovery/";
    }
});

document.getElementById("pass-recovery-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form data
    const password = document.getElementById("password").value;

    // Prepare the data to send to the server
    const recovery_token = localStorage.getItem("recovery-token");
    const requestData = {
        password: password,
        token: recovery_token
    };

    try {
        // Make the POST request
        const response = await fetch("https://auth.davidnet.net/recover_password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById("pass-recovery").style.display = "none";
            document.getElementById("success").style.display = "flex";
            localStorage.setItem("recovery-token", null);
        } else {
            if (result.error == "Invalid password") {
                document.getElementById("password").classList.add("error-input");
                document.getElementById("password-error").textContent = "Invalid password.";
            } else {
                window.location = "/recovery/error/?err=Missing token(s)"
            }
        }
    } catch (error) {
        console.error(error);
        window.location = "/recovery/error/?err=Network security violation!"
    }
});
