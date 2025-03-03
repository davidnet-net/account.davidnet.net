const inputs = document.querySelectorAll(".totp-box");
const targetString = "123456"; // Replace with the string you're validating
const defaultColor = "#ccc";  // Default border color (e.g., gray)
const successColor = "green"; // Border color when TOTP is correct

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
            if (enteredString === targetString) {
                inputs.forEach(input => input.style.borderColor = successColor);
                alert("Success! TOTP is valid.");
            } else {
                inputs.forEach(input => input.style.borderColor = defaultColor);
                alert("Invalid TOTP.");
            }
        }
    });

    input.addEventListener("keydown", (e) => {
        // Allow backspace to move focus backward
        if (e.key === "Backspace" && !input.value && index > 0) {
            inputs[index - 1].focus();
        }
    });
});