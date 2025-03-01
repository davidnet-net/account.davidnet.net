document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const newcodeParam = urlParams.get("newcode");

    if (!token) {
        const messageDiv = document.getElementById('response-message');
        messageDiv.textContent = 'Something went wrong!';
        messageDiv.style.color = 'red';
        console.error("Missing token.");
        return;
    }

    // Dynamisch de link configureren
    const senderLink = document.getElementById("newsender");
    senderLink.href = `?token=${token}&newcode=true`;

    // Verberg de link direct als 'newcode' aanwezig is
    if (newcodeParam !== null || window.location.hash === "#newcode") {
        document.getElementById("newsender").style.display = "none";
    }

    // Verwerk de actie voor nieuwe code
    if (newcodeParam !== null || window.location.hash === "#newcode") {
        try {
            const response = await fetch('https://auth.davidnet.net/new_email_code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            const messageDiv = document.getElementById('response-message');
            if (response.ok) {
                messageDiv.textContent = 'New email sent.';
                messageDiv.style.color = 'green';
            } else {
                messageDiv.textContent = 'Something went wrong!';
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            const messageDiv = document.getElementById('response-message');
            messageDiv.textContent = 'Network security violation!';
            messageDiv.style.color = 'red';
        }
    }
});
