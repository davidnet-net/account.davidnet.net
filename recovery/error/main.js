document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramValue = urlParams.get('err');
    document.getElementById("response-message").innerText = paramValue;
    document.getElementById("response-message").style.color = "darkred";
});
