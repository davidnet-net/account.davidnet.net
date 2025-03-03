const inputs = document.querySelectorAll(".totp-box");
const errmsg = document.getElementById("error");

// Restrict input to numbers only
inputs.forEach(input => {
    input.addEventListener("input", (e) => {
        const value = e.target.value;
        if (!/^\d*$/.test(value)) {  // Ensure only numbers are entered
            e.target.value = value.slice(0, -1);
        }
    });
});

// Auto-focus and validate once all inputs are filled
inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
        // Focus the next input if current one is filled
        if (input.value && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }

        // Check if all inputs are filled
        if (Array.from(inputs).every(input => input.value.length === 1)) {
            const enteredString = Array.from(inputs).map(input => input.value).join('');
            console.log("Entered TOTP:", enteredString);
        }
    });

    input.addEventListener("keydown", (e) => {
        // Allow backspace to move focus backward
        if (e.key === "Backspace" && !input.value && index > 0) {
            inputs[index - 1].focus();
        }
    });
});

// Controleer of de gebruiker een geldige early login token heeft
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("https://auth.davidnet.net/is_valid_early_login_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: localStorage.getItem("early-login-token") }),
        });

        const result = await response.json();
        console.log(result);

        if (!response.ok) {
            window.location = "https://account.davidnet.net/login";
        }
    } catch (error) {
        console.error("Error during token validation:", error);
        window.location = "https://account.davidnet.net/login";
    }
});
