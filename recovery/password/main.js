document.getElementById("resetpassword-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    document.getElementById("resetpassword").style.display = "none";
    document.getElementById("waitforverify").style.display = "flex";

    // Clear previous errors
    clearErrors();

    // Get form data
    const email = document.getElementById("email").value;

    // Prepare the data to send to the server
    const requestData = {
        email: email,
    };

    try {
        // Make the POST request
        const response = await fetch("https://auth.davidnet.net/start_recovery", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        const result = await response.json();

        if (response.ok) {
            const recovery_ticket = result.recovery_ticket;
            //localStorage.setItem("recovery_ticket", result.recovery_ticket);

            const interval = setInterval(async () => {
                try {
                    const response = await fetch("https://auth.davidnet.net/recovery_status", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ticket: recovery_ticket }),
                    });

                    if (!response.ok) {
                        window.location = "/recovery/error/?err=Token expired!"
                        clearInterval(interval);
                    }

                    // Check if the response body is empty before trying to parse it
                    const responseBody = await response.text();
                    if (responseBody) {
                        const result = JSON.parse(responseBody); // Only parse if there's content
                        console.log(result);

                        if (result.status == 1) {
                            console.log("Recovery verified!");
                            clearInterval(interval);

                            const recovery_token = result.token;
                            console.log("RECOVERY TOKEN: " + recovery_token);
                        }
                    } else {
                        console.error("Empty response body");
                    }
                } catch (error) {
                    console.error("Error checking email status:", error);
                }
            }, 2500);
        } else {
            handleErrors(result.error);
            document.getElementById("resetpassword").style.display = "flex";
            document.getElementById("waitforverify").style.display = "none";
        }
    } catch (error) {
        console.error(error);
        window.location = "/recovery/error/?err=Network security violation!"
    }
});

function handleErrors(error) {
    console.log("Handling error:", error); // Debugging error

    if (error.includes("Invalid email")) {
        document.getElementById("email").classList.add("error-input");
        document.getElementById("email-error").textContent =
            "Please enter a valid email address.";
    } else if (error.includes("Not verified")) {
        window.location = "/recovery/error/?err=Email not verified!"
    } else {
        window.location = "/recovery/error/?err=Something unexpected wrent wrong!"
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
