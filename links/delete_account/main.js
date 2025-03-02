document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const messageDiv = document.getElementById("response-message");

  if (!token) {
    document.getElementById("deleting").style.display = "none";
    document.getElementById("error").style.display = "flex";

    messageDiv.textContent = "Something went wrong!";
    messageDiv.style.color = "red";
    console.error("Missing token.");
    return;
  }

  const response = await fetch("https://auth.davidnet.net/delete_account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: token }),
  });

  const result = await response.json(); // Correcting here
  console.log(result);

  if (response.ok) {
    document.getElementById("deleting").style.display = "none";
    document.getElementById("deleted").style.display = "flex";
  } else {
    if (result.error == "Already verified") {
      document.getElementById("deleting").style.display = "none";
      document.getElementById("deleted").style.display = "flex";
      document.getElementById("name").textContent = "Already verified!";
    } else {
      document.getElementById("deleting").style.display = "none";
      document.getElementById("error").style.display = "flex";
      messageDiv.textContent = "Something went wrong!";
      messageDiv.style.color = "red";
    }
  }
});
