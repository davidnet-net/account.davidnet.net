document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
        const messageDiv = document.getElementById('response-message');
        messageDiv.textContent = 'Something wrent wrong!';
        messageDiv.style.color = 'red';
        console.error("Missing token.");
        return
    } else {
        console.log(token);
    }

    if (window.location.hash === "#newcode") {
        const requestData = {};

        try {
            const response = await fetch('https://auth.davidnet.net/new_email_code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const messageDiv = document.getElementById('response-message');
                messageDiv.textContent = 'New email sended.';
                messageDiv.style.color = 'green';
                setTimeout(() => {
                    window.location = "https://account.davidnet.net/links/verify_email?token=" + token
                }, 1500);
            } else {
                const messageDiv = document.getElementById('response-message');
                messageDiv.textContent = 'Something wrent wrong!';
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            const messageDiv = document.getElementById('response-message');
            messageDiv.textContent = 'Network security violation!';
            messageDiv.style.color = 'red';
        }
    }
});
