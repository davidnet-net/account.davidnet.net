import { get_session_information, is_session_valid } from "/session.js";

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Checking session validity...");
    if (await is_session_valid()) {
        console.log("Session is valid, redirecting to account page...");
        redirectToAccount();
    }

    document.getElementById("login-form").addEventListener("submit", handleLogin);
});

async function handleLogin(event) {
    event.preventDefault();
    console.log("Login form submitted");
    toggleLoginState(true);
    clearErrors();

    const requestData = getLoginFormData();
    console.log("Request data:", requestData);
    try {
        const response = await sendLoginRequest(requestData);
        console.log("Login response:", response);
        await processLoginResponse(response, requestData);
    } catch (error) {
        console.error("Network security violation!", error);
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
    console.log("Sending login request...");
    const response = await fetch("https://auth.davidnet.net/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    console.log("Received response:", result);
    return { response, result };
}

async function processLoginResponse({ response, result }, requestData) {
    console.log("Processing login response...");
    if (response.ok) {
        console.log("Login successful, processing result...");
        handleSuccessfulLogin(result, requestData);
    } else {
        console.warn("Login failed with error:", result.error);
        handleErrors(result.error);
        toggleLoginState(false);
    }
}

function handleSuccessfulLogin(result, requestData) {
    console.log("Handling successful login result:", result);
    if (result.message === "verify_email") {
        console.log("Redirecting to email verification...");
        redirectTo(`https://account.davidnet.net/links/verify_email?token=${result.email_token}`);
    } else if (result.message === "give_totp") {
        console.log("TOTP required, displaying input...");
        showTotpInput(requestData);
    } else {
        console.log("Session token received, storing and redirecting...");
        storeSessionToken(result.session_token);
        redirectToAccount();
    }
}

function showTotpInput(requestData) {
    console.log("Showing TOTP input...");
    document.getElementById("login").style.display = "none";
    document.getElementById("loggingin").style.display = "none";
    document.getElementById("totp").style.display = "flex";

    const inputs = document.querySelectorAll(".totp-box");
    inputs.forEach((input, index) => {
        input.addEventListener("input", () => handleTotpInput(input, index, inputs, requestData));
        input.addEventListener("keydown", (e) => handleTotpBackspace(e, input, index, inputs));
    });
}

async function handleTotpInput(input, index, inputs, requestData) {
    console.log("Handling TOTP input at index:", index);
    if (input.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
    }

    if (Array.from(inputs).every(input => input.value.length === 1)) {
        requestData.totp_token = inputsToTotpString(inputs);
        console.log("TOTP input complete, verifying...");
        await verifyTotp(requestData);
    }
}

function handleTotpBackspace(event, input, index, inputs) {
    if (event.key === "Backspace" && !input.value && index > 0) {
        console.log("Backspace pressed, moving focus back...");
        inputs[index - 1].focus();
    }
}

async function verifyTotp(requestData) {
    console.log("Verifying TOTP...");
    try {
        const { response, result } = await sendLoginRequest(requestData);
        if (response.ok) {
            console.log("TOTP verified, storing session and redirecting...");
            storeSessionToken(result.session_token);
            redirectToAccount();
        } else {
            console.warn("TOTP verification failed:", result.error);
            handleErrors(result.error);
        }
    } catch (error) {
        console.error("Network error while verifying TOTP", error);
        showError("Network error while verifying TOTP");
    }
}

function toggleLoginState(loggingIn) {
    document.getElementById("login").style.display = loggingIn ? "none" : "block";
    document.getElementById("loggingin").style.display = loggingIn ? "flex" : "none";
}

function storeSessionToken(token) {
    console.log("Storing session token...");
    localStorage.setItem("session-token", token);
}

function redirectTo(url) {
    console.log("Redirecting to:", url);
    setTimeout(() => window.location.href = url, 1500);
}

function redirectToAccount() {
    console.log("Redirecting to account page...");
    window.location.href = "https://account.davidnet.net/account";
}

function inputsToTotpString(inputs) {
    return Array.from(inputs).map(input => input.value).join('');
}

function handleErrors(error) {
    console.warn("Handling error:", error);
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
