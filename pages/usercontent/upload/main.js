import {
    get_session_information,
    get_session_token,
    is_session_valid,
    require_login
} from "/session.js";


let isModalOpen = false;

function promptChoice(closeText, confirmText, message, title) {
    if (isModalOpen) return false;
    isModalOpen = true;

    return new Promise((resolve) => {
        const modal = document.getElementById("myModal");
        const modalTitle = modal.querySelector(".modal-header h2");
        const modalMessage = modal.querySelector(".modal-content p");
        const closeButton = modal.querySelector("#modal-close");
        const closeButton_x = document.getElementById("modal-close-x");
        const confirmButton = modal.querySelector("#modal-confirm");

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        closeButton.textContent = closeText;
        confirmButton.textContent = confirmText;

        if (confirmText === "") {
            confirmButton.style.display = "none";
        } else {
            confirmButton.style.display = "block";
        }

        modal.classList.add("active");

        function closeModal(result) {
            modal.classList.remove("active");
            isModalOpen = false;
            resolve(result);
            removeEventListeners();
        }

        function removeEventListeners() {
            closeButton.removeEventListener("click", onClose);
            closeButton_x.removeEventListener("click", onClose);
            confirmButton.removeEventListener("click", onConfirm);
        }

        function onClose() {
            closeModal(false);
        }

        function onConfirm() {
            closeModal(true);
        }

        closeButton.addEventListener("click", onClose);
        closeButton_x.addEventListener("click", onClose);
        confirmButton.addEventListener("click", onConfirm);
    });
}

const params = new URLSearchParams(window.location.search);
const type = params.get("type");
const redirect = params.get("redirect");
const token = localStorage.getItem("session-token");
let allowsubmit = true;

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("loader").style.display = "flex";
    document.getElementById("upload").style.display = "none";

    if (!allowsubmit) { return }
    const fileInput = document.getElementById("file");
    const file = fileInput.files[0];

    if (!file) {
        document.getElementById("message").innerText = "Please select a file to upload.";
        document.getElementById("message").classList.add("error");
        return;
    }

    const formData = new FormData();
    formData.append("token", token); // Using the hardcoded token
    formData.append("type", type);   // Using the hardcoded type
    formData.append("file", file);

    try {
        const response = await fetch("https://usercontent.davidnet.net/upload", {
            method: "POST",
            body: formData,
            credentials: "include", // if you're using cookies for session management
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById("response-message2").innerText = "File uploaded successfully!";
            document.getElementById("response-message2").classList.remove("error");
            document.getElementById("response-message2").classList.add("success");
            setTimeout(() => {
                window.location = redirect + "?ucurl=" + data.url;
            }, 1000);
        } else {
            const data = await response.json();
            document.getElementById("response-message").innerText = `Error: ${data.error || "Unknown error"}`;
            document.getElementById("response-message").classList.add("error");
        }
    } catch (error) {
        document.getElementById("response-message").innerText = `Upload failed: ${error.message}`;
        document.getElementById("response-message").classList.add("error");
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    await require_login();
    if (!type || !redirect) {
        allowsubmit = false;
        await promptChoice("Ok", "", "Missing crucial information!", "ERROR!");
    }
});