document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    document.getElementById("login").style.display = "none";
    document.getElementById("loggingin").style.display = "flex";
  
    // Clear previous errors
    clearErrors();
  
    // Get form data
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    // Prepare the data to send to the server (send a default TOTP code "0" for now)
    const requestData = {
      username: username,
      password: password,
      totp_code: "0", // Default TOTP code
    };
  
    try {
      // Make the POST request to the login endpoint
      const response = await fetch("https://auth.davidnet.net/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
  
      const result = await response.json();
  
      // Show response message
      const messageDiv = document.getElementById("response-message2");
      if (response.ok) {
        // If login successful and session token returned
        messageDiv.textContent = "Login successful!";
        messageDiv.style.color = "green";
  
        if (result.message === "verify_email") {
          // If email verification is needed, redirect to the verify email page
          setTimeout(() => {
            window.location =
              "https://account.davidnet.net/links/verify_email?token=" +
              result.email_token;
          }, 1500);
        } else if (result.message === "totp_required") {
          // If TOTP is required, show the TOTP input form
          showTOTPInput(result.totp_token);
        } else {
          // If session token is returned, store it and redirect to the account page
          localStorage.setItem("session-token", result.session_token);
          console.log("Stored session_token: " + result.session_token);
  
          setTimeout(() => {
            window.location = "https://account.davidnet.net/account";
          }, 1500);
        }
      } else {
        handleErrors(result.error);
        document.getElementById("login").style.display = "block";
        document.getElementById("loggingin").style.display = "none";
      }
    } catch (error) {
      console.error(error);
      const messageDiv = document.getElementById("response-message2");
      messageDiv.textContent = "Network security violation!";
      messageDiv.style.color = "red";
    }
  });
  
  // Show TOTP input form after login request if TOTP is required
  function showTOTPInput(totp_token) {
    // Hide the login form and show the TOTP input form
    document.getElementById("login").style.display = "none";
    document.getElementById("totp-container").style.display = "block";
  
    // Handle TOTP form submission
    document.getElementById("totp-form").addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const totpCode = document.getElementById("totp-code").value;
      
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
  
      // Make the POST request again with the TOTP code
      try {
        const response = await fetch("https://auth.davidnet.net/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: password,
            totp_code: totpCode, // TOTP code entered by the user
          }),
        });
  
        const result = await response.json();
  
        // Show response message
        const messageDiv = document.getElementById("response-message2");
        if (response.ok) {
          // If login successful and session token returned
          localStorage.setItem("session-token", result.session_token);
          console.log("Stored session_token: " + result.session_token);
  
          setTimeout(() => {
            window.location = "https://account.davidnet.net/account";
          }, 1500);
        } else {
          handleErrors(result.error);
        }
      } catch (error) {
        console.error(error);
        const messageDiv = document.getElementById("response-message2");
        messageDiv.textContent = "Failed to verify TOTP!";
        messageDiv.style.color = "red";
      }
    });
  }
  
  // Handle errors and display error messages
  function handleErrors(error) {
    console.log("Handling error:", error); // Debugging error
  
    if (error.includes("Invalid username")) {
      document.getElementById("username").classList.add("error-input");
      document.getElementById("username-error").textContent =
        "Incorrect username.";
    } else if (error.includes("Invalid password")) {
      document.getElementById("password").classList.add("error-input");
      document.getElementById("password-error").textContent =
        "Incorrect password.";
    } else if (error.includes("Invalid TOTP code")) {
      document.getElementById("totp-code").classList.add("error-input");
      document.getElementById("totp-error").textContent = "Invalid TOTP code.";
    } else if (error.includes("Missing fields")) {
      if (!document.getElementById("username").value) {
        document.getElementById("username").classList.add("error-input");
        document.getElementById("username-error").textContent =
          "Username is required.";
      }
      if (!document.getElementById("password").value) {
        document.getElementById("password").classList.add("error-input");
        document.getElementById("password-error").textContent =
          "Password is required.";
      }
    } else {
      const messageDiv = document.getElementById("response-message");
      messageDiv.textContent = "Something went wrong. Please try again later.";
      messageDiv.style.color = "red";
    }
  }
  
  // Clear all error messages and input highlights
  function clearErrors() {
    const errorFields = document.querySelectorAll(".error");
    errorFields.forEach((field) => (field.textContent = ""));
    const errorInputs = document.querySelectorAll(".error-input");
    errorInputs.forEach((input) => input.classList.remove("error-input"));
  }
  
  // Redirect if session is already valid
  import { get_session_information, is_session_valid } from "/session.js";
  
  document.addEventListener("DOMContentLoaded", async () => {
    const valid = await is_session_valid();
    if (valid === true) {
      window.location.href = "https://account.davidnet.net/account/";
    }
  });
  