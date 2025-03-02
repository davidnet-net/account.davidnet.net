document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const messageDiv = document.getElementById("response-message");

  if (!token) {
    document.getElementById("verifying").style.display = "none";
    document.getElementById("error").style.display = "flex";

    messageDiv.textContent = "Missing token!";
    messageDiv.style.color = "red";
    console.error("Missing token.");
    return;
  }

  const response = await fetch("https://auth.davidnet.net/verify_recovery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const result = await response.json(); // Correcting here
  console.log(result);

  if (response.ok) {
    document.getElementById("verifying").style.display = "none";
    document.getElementById("verified").style.display = "flex";

    setTimeout(function () {
      window.close();
    }, 5000);
  } else {
    if (result.error == "Already verified") {
      document.getElementById("verifying").style.display = "none";
      document.getElementById("verified").style.display = "flex";
      document.getElementById("name").textContent = "Already verified!";
    } else {
      document.getElementById("verifying").style.display = "none";
      document.getElementById("error").style.display = "flex";
      messageDiv.textContent = "Something went wrong!";
      messageDiv.style.color = "red";
    }
  }
});
