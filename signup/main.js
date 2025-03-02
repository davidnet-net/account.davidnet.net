document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    document.getElementById("signup").style.display = "none";
    document.getElementById("signingup").style.display = "flex";

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

        // Show response message
        const messageDiv = document.getElementById('response-message2');
        if (response.ok) {
            messageDiv.textContent = 'Signup successful!';
            messageDiv.style.color = 'green';

            setTimeout(() => {
                window.location = "https://account.davidnet.net/links/verify_email?token=" + result.email_token
            }, 1500);
        } else {
            handleErrors(result.error);
            document.getElementById("signup").style.display = "block";
            document.getElementById("signingup").style.display = "none";
        }

    } catch (error) {
        console.error(error);
        const messageDiv = document.getElementById('response-message2');
        messageDiv.textContent = 'Network security violation!';
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
    } else if (error.includes('Username taken')) {
        document.getElementById('username').classList.add('error-input');
        document.getElementById('username-error').textContent = 'This username is already in use. ';
    } else if (error.includes('Email taken')) {
        document.getElementById('email').classList.add('error-input');
        document.getElementById('email-error').textContent = 'This email is already in use.';
    } else if (error.includes('Missing fields')) {
        if (!document.getElementById('username').value) {
            document.getElementById('username').classList.add('error-input');
            document.getElementById('username-error').textContent = 'Username is required.';
        }
        if (!document.getElementById('email').value) {
            document.getElementById('email').classList.add('error-input');
            document.getElementById('email-error').textContent = 'Email is required.';
        }
        if (!document.getElementById('password').value) {
            document.getElementById('password').classList.add('error-input');
            document.getElementById('password-error').textContent = 'Password is required.';
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

import { is_session_valid, get_session_information } from '/session.js';
document.addEventListener("DOMContentLoaded", (event) => {
    if (is_session_valid == true) {
        window.location = "https://account.davidnet.net/account/"
    }
});