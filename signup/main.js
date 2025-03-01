document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    clearErrors();

    // Get form data
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Prepare the data to send to the server
    const requestData = {
        username: username,
        email: email,
        password: password,
    };

    try {
        // Make the POST request
        const response = await fetch('https://auth.davidnet.net/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        const result = await response.json();

        // Debug: Log result to check the server response
        console.log(result);

        // Show response message
        const messageDiv = document.getElementById('response-message');
        if (response.ok) {
            messageDiv.textContent = result.message || 'Signup successful!';
            messageDiv.style.color = 'green';
        } else {
            handleErrors(result.error);
        }

    } catch (error) {
        console.error(error);
        const messageDiv = document.getElementById('response-message');
        messageDiv.textContent = 'Network error. Please try again later.';
        messageDiv.style.color = 'red';
    }
});

function handleErrors(error) {
    console.log('Handling error:', error); // Debugging error

    if (error.includes('Invalid username')) {
        document.getElementById('username').classList.add('error-input');
        document.getElementById('username-error').textContent = 'Please enter a valid username.';
    } else if (error.includes('Invalid email')) {
        document.getElementById('email').classList.add('error-input');
        document.getElementById('email-error').textContent = 'Please enter a valid email address.';
    } else if (error.includes('Too big username')) {
        document.getElementById('username').classList.add('error-input');
        document.getElementById('username-error').textContent = 'Username is too long. Please shorten it.';
    } else if (error.includes('Too big email')) {
        document.getElementById('email').classList.add('error-input');
        document.getElementById('email-error').textContent = 'Email is too long. Please shorten it.';
    } else if (error.includes('Missing fields')) {
        if (!document.getElementById('username').value) {
            document.getElementById('username').classList.add('error-input');
            document.getElementById('username-error').textContent = 'Username is required. Please fill it out.';
        }
        if (!document.getElementById('email').value) {
            document.getElementById('email').classList.add('error-input');
            document.getElementById('email-error').textContent = 'Email is required. Please fill it out.';
        }
        if (!document.getElementById('password').value) {
            document.getElementById('password').classList.add('error-input');
            document.getElementById('password-error').textContent = 'Password is required. Please fill it out.';
        }
    } else {
        const messageDiv = document.getElementById('response-message');
        messageDiv.textContent = 'Something went wrong. Please try again later.';
        messageDiv.style.color = 'red';
    }
}

function clearErrors() {
    // Clear all error messages and input highlights
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => field.textContent = '');
    const errorInputs = document.querySelectorAll('.error-input');
    errorInputs.forEach(input => input.classList.remove('error-input'));
}
