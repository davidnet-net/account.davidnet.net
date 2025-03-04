import { get_session_information, is_session_valid } from "/session.js";

const session_token = await get_session_token();
let username = "";
try {
    const response = await fetch("https://auth.davidnet.net/get_username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: session_token }),
    });
    const result = await response.json();

    if (response.ok) {
        username = result.username;
    } else {
        await promptChoice("Ok", "):", "We couldnt process 2FA changes!", "Something wrent wrong!");
    }
} catch (error) {
    console.error("Failed to totp info:", error);
}

// Genereer een TOTP-secret
const secret = new OTPAuth.Secret({ size: 20 });

// Maak een TOTP instance
const totp = new OTPAuth.TOTP({
    issuer: "Davidnet",
    label: username,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secret
});

// Genereer de otpauth:// URI
const otpAuthUrl = totp.toString();

// Genereer een QR-code
new QRCode(document.getElementById("qrcode"), otpAuthUrl);

const inputs = document.querySelectorAll(".totp-box");
const defaultColor = "#ccc";
const successColor = "green";
const errorcolor = "red";

// Restrict input to numbers only
inputs.forEach(input => {
    input.addEventListener("input", (e) => {
        const value = e.target.value;
        if (!/^\d*$/.test(value)) {
            e.target.value = value.slice(0, -1);
        }
    });
});

// Auto-focus en validatie
inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
        if (input.value && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }

        if (Array.from(inputs).every(input => input.value.length === 1)) {
            const enteredString = Array.from(inputs).map(input => input.value).join('');
            const expectedCode = totp.generate();

            if (enteredString === expectedCode) {
                inputs.forEach(input => input.style.borderColor = successColor);
                console.log("Secret:", secret.base32);
            } else {
                inputs.forEach(input => input.style.borderColor = errorcolor);
            }
        } else {
            inputs.forEach(input => input.style.borderColor = defaultColor);
        }
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !input.value && index > 0) {
            inputs[index - 1].focus();
        }
    });
});