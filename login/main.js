document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    document.getElementById("login").style.display = "none";
    document.getElementById("loggingin").style.display = "flex";

    // Clear previous errors
    clearErrors();

    // Get form data
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Prepare the data to send to the server
    const requestData = {
        username: username,
        password: password,
    };

    try {
        // Make the POST request
        const response = await fetch("https://auth.davidnet.net/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });
        const result = await response.json();
        console.log(result);

        // Show response message
        const messageDiv = document.getElementById("response-message2");
        if (response.ok) {
            messageDiv.textContent = "Login successful!";
            messageDiv.style.color = "green";

            if (result.message == "verify_email") {
                setTimeout(() => {
                    window.location =
                        "https://account.davidnet.net/links/verify_email?token=" +
                        result.email_token;
                }, 1500);
            } else if (result.message == "2fa") {
                localStorage.setItem("early-login-token", result.early_login_token);
                console.log("Got 2FA Request from server token: " + result.session_token);
                document.getElementById("twofa").style.display = "flex";
                document.getElementById("loggingin").style.display = "none";
            } else {
                localStorage.setItem("session-token", result.session_token);
                console.log("Stored session_token: " + result.session_token);

                setTimeout(() => {
                    window.location = "https://account.davidnet.net/account";
                }, 1500);
            }
        } else {
            handleErrors(result.error);
            document.getElementById("login").style.display = "block";
            document.getElementById("loggingin").style.display = "none";
        }
    } catch (error) {
        console.error(error);
        const messageDiv = document.getElementById("response-message2");
        messageDiv.textContent = "Network security violation!";
        messageDiv.style.color = "red";
    }
});

function handleErrors(error) {
    console.log("Handling error:", error); // Debugging error

    if (error.includes("Invalid username")) {
        document.getElementById("username").classList.add("error-input");
        document.getElementById("username-error").textContent =
            "Incorrect username.";
    } else if (error.includes("Invalid password")) {
        document.getElementById("password").classList.add("error-input");
        document.getElementById("password-error").textContent =
            "Incorrect password.";
    } else if (error.includes("Missing fields")) {
        if (!document.getElementById("username").value) {
            document.getElementById("username").classList.add("error-input");
            document.getElementById("username-error").textContent =
                "Username is required.";
        }
        if (!document.getElementById("password").value) {
            document.getElementById("password").classList.add("error-input");
            document.getElementById("password-error").textContent =
                "Password is required.";
        }
    } else {
        const messageDiv = document.getElementById("response-message");
        messageDiv.textContent = "Something went wrong. Please try again later.";
        messageDiv.style.color = "red";
    }
}

function clearErrors() {
    // Clear all error messages and input highlights
    const errorFields = document.querySelectorAll(".error");
    errorFields.forEach((field) => field.textContent = "");
    const errorInputs = document.querySelectorAll(".error-input");
    errorInputs.forEach((input) => input.classList.remove("error-input"));
}

import { get_session_information, is_session_valid } from "/session.js";

document.addEventListener("DOMContentLoaded", async () => {
    const valid = await is_session_valid();
    if (valid === true) {
        window.location.href = "https://account.davidnet.net/account/";
    }
});
