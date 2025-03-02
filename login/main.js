document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        handleLogin();
    });
});

async function handleLogin(totpCode = "0") {
    toggleVisibility("login", false);
    toggleVisibility("loggingin", true);
    clearErrors();

    const requestData = getLoginData(totpCode);

    try {
        const response = await sendLoginRequest(requestData);
        const result = await response.json();
        processLoginResponse(response.ok, result);
    } catch (error) {
        console.error(error);
        showMessage("Network security violation!", "red");
    }
}

function getLoginData(totpCode) {
    return {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
        totp_token: totpCode
    };
}

async function sendLoginRequest(data) {
    return fetch("https://auth.davidnet.net/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
}

function processLoginResponse(success, result) {
    if (success) {
        // No TOTP required or TOTP verified
        if (result.message !== "give_totp") {
            showMessage("Login successful!", "green");
            localStorage.setItem("session-token", result.session_token);
            console.log("Stored session_token:", result.session_token);
            redirectWithDelay("https://account.davidnet.net/account");
        }
    } else if (result.message === "give_totp") {
        // TOTP required, show TOTP input
        handleTOTP();
    } else {
        handleErrors(result.error);
        toggleVisibility("login", true);
        toggleVisibility("loggingin", false);
    }
}

function handleTOTP() {
    toggleVisibility("loggingin", false);
    toggleVisibility("totp", true);

    const inputs = document.querySelectorAll(".totp-box");
    setupTOTPInput(inputs);
}

function setupTOTPInput(inputs) {
    inputs.forEach((input, index) => {
        input.addEventListener("input", () => {
            input.value = input.value.replace(/\D/g, ""); // Alleen cijfers
            if (input.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }

            // Controleer of alle velden gevuld zijn
            if (Array.from(inputs).every(input => input.value.length === 1)) {
                const totpCode = Array.from(inputs).map(input => input.value).join('');
                handleLogin(totpCode); // Opnieuw proberen met de TOTP-code
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && !input.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });
}

function toggleVisibility(elementId, isVisible) {
    document.getElementById(elementId).style.display = isVisible ? "flex" : "none";
}

function showMessage(message, color) {
    const messageDiv = document.getElementById("response-message2");
    messageDiv.textContent = message;
    messageDiv.style.color = color;
}

function redirectWithDelay(url, delay = 1500) {
    setTimeout(() => {
        window.location = url;
    }, delay);
}




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
