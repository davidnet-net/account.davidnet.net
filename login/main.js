import { get_session_information, is_session_valid } from "/session.js";

document.addEventListener("DOMContentLoaded", async () => {
    if (await is_session_valid()) {
        redirectToAccount();
    }

    document.getElementById("login-form").addEventListener("submit", handleLogin);
});

async function handleLogin(event) {
    event.preventDefault();
    toggleLoginState(true);
    clearErrors();

    const requestData = getLoginFormData();
    try {
        const response = await sendLoginRequest(requestData);
        await processLoginResponse(response, requestData);
    } catch (error) {
        showError("Network security violation!");
        toggleLoginState(false);
    }
}

function getLoginFormData() {
    return {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
        totp_token: "0"
    };
}

async function sendLoginRequest(data) {
    const response = await fetch("https://auth.davidnet.net/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return response.json().then(result => ({ response, result }));
}

async function processLoginResponse({ response, result }, requestData) {
    if (response.ok) {
        handleSuccessfulLogin(result, requestData);
    } else {
        handleErrors(result.error);
        toggleLoginState(false);
    }
}

function handleSuccessfulLogin(result, requestData) {
    if (result.message === "verify_email") {
        redirectTo(`https://account.davidnet.net/links/verify_email?token=${result.email_token}`);
    } else if (result.message === "give_totp") {
        showTotpInput(requestData);
    } else {
        storeSessionToken(result.session_token);
        redirectToAccount();
    }
}

function showTotpInput(requestData) {
    toggleLoginState(false);
    document.getElementById("totp").style.display = "flex";

    const inputs = document.querySelectorAll(".totp-box");
    inputs.forEach((input, index) => {
        input.addEventListener("input", () => handleTotpInput(input, index, inputs, requestData));
        input.addEventListener("keydown", (e) => handleTotpBackspace(e, input, index, inputs));
    });
}

async function handleTotpInput(input, index, inputs, requestData) {
    if (input.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
    }

    if (Array.from(inputs).every(input => input.value.length === 1)) {
        requestData.totp_token = inputsToTotpString(inputs);
        await verifyTotp(requestData);
    }
}

function handleTotpBackspace(event, input, index, inputs) {
    if (event.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
    }
}

async function verifyTotp(requestData) {
    try {
        const { response, result } = await sendLoginRequest(requestData);
        if (response.ok) {
            storeSessionToken(result.session_token);
            redirectToAccount();
        } else {
            handleErrors(result.error);
        }
    } catch {
        showError("Network error while verifying TOTP");
    }
}

function toggleLoginState(loggingIn) {
    document.getElementById("login").style.display = loggingIn ? "none" : "block";
    document.getElementById("loggingin").style.display = loggingIn ? "flex" : "none";
}

function storeSessionToken(token) {
    localStorage.setItem("session-token", token);
}

function redirectTo(url) {
    setTimeout(() => window.location.href = url, 1500);
}

function redirectToAccount() {
    redirectTo("https://account.davidnet.net/account");
}

function inputsToTotpString(inputs) {
    return Array.from(inputs).map(input => input.value).join('');
}

function handleErrors(error) {
    console.log("Handling error:", error);
    
    if (error.includes("Invalid username")) {
        showFieldError("username", "Incorrect username.");
    } else if (error.includes("Invalid password")) {
        showFieldError("password", "Incorrect password.");
    } else if (error.includes("Missing fields")) {
        if (!document.getElementById("username").value) showFieldError("username", "Username is required.");
        if (!document.getElementById("password").value) showFieldError("password", "Password is required.");
    } else {
        showError("Something went wrong. Please try again later.");
    }
}

function showFieldError(fieldId, message) {
    document.getElementById(fieldId).classList.add("error-input");
    document.getElementById(`${fieldId}-error`).textContent = message;
}

function showError(message) {
    const messageDiv = document.getElementById("response-message2");
    messageDiv.textContent = message;
    messageDiv.style.color = "red";
}

function clearErrors() {
    document.querySelectorAll(".error").forEach(field => field.textContent = "");
    document.querySelectorAll(".error-input").forEach(input => input.classList.remove("error-input"));
}
