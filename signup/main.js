document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    clearErrors();

    // Get form data
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Prepare the data to send to the server
    const requestData = { username, email, password };

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
        messageDiv.textContent = 'Oops! Something went wrong. Please try again later.';
        messageDiv.style.color = 'red';
    }
});

function handleErrors(error) {
    const errorMessages = {
        'Invalid username': 'The username is invalid. Please choose a valid username.',
        'Invalid email': 'The email address is not valid. Please provide a valid email.',
        'Too big username': 'The username is too long. Please use a shorter username.',
        'Too big email': 'The email address is too long. Please use a shorter email.',
        'Missing fields': {
            username: 'Username is required.',
            email: 'Email is required.',
            password: 'Password is required.'
        }
    };

    if (errorMessages[error]) {
        if (typeof errorMessages[error] === 'string') {
            displayError(error, errorMessages[error]);
        } else {
            // Handle missing fields
            Object.entries(errorMessages[error]).forEach(([field, message]) => {
                if (!document.getElementById(field).value) {
                    displayError(field, message);
                }
            });
        }
    } else {
        const messageDiv = document.getElementById('response-message');
        messageDiv.textContent = 'An unexpected error occurred. Please try again.';
        messageDiv.style.color = 'red';
    }
}

function displayError(field, message) {
    const input = document.getElementById(field);
    input.classList.add('error-input');
    const errorField = document.getElementById(`${field}-error`);
    if (errorField) {
        errorField.textContent = message;
    }
}

function clearErrors() {
    // Clear all error messages and input highlights
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => field.textContent = '');
    const errorInputs = document.querySelectorAll('.error-input');
    errorInputs.forEach(input => input.classList.remove('error-input'));
}
