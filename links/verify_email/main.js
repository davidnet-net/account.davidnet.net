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

    // Dynamically configure the link
    const senderLink = document.getElementById("newsender");
    senderLink.href = `?token=${token}&newcode=true`;

    // Hide the link if 'newcode' is present
    if (newcodeParam !== null || window.location.hash === "#newcode") {
        document.getElementById("newsender").style.display = "none";
    }

    // Handle new code action
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

    const interval = setInterval(async () => {
        try {
            const response = await fetch('https://auth.davidnet.net/email_status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            const result = await response.json();  // Correcting here
            console.log(result);

            if (result.status == 1) {
                console.log('Email verified!');
                clearInterval(interval);

                document.getElementById("email").style.display = "none";
                document.getElementById("email_verified").style.display = "flex";

                const messageDiv = document.getElementById('response-message2');
                messageDiv.textContent = 'Email verified!';
                messageDiv.style.color = 'green';
            }
        } catch (error) {
            console.error("Error checking email status:", error);
        }
    }, 2500);
});
