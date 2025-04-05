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

// Utility function to format UTC dates
function formatUTCDate(utcDate) {
    const date = new Date(utcDate);
    return date.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await require_login();
    await displayuploads(await get_uploads());
    document.getElementById("deleteallbtn").addEventListener("click", rmall)
});

async function get_uploads() {
    const session_token = await get_session_token();
    try {
        const response = await fetch("https://usercontent.davidnet.net/get_user_uploads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: session_token }),
        });
        const result = await response.json();

        if (response.ok) {
            return result;
        } else {
            if (result.error === "No uploads found for this user.") {
                await promptChoice("Ok", "", "You do not have any uploaded content", "No uploads found!");
            } else {
                await promptChoice("Ok", "", "We couldn't load uploads!", "Something went wrong!");
            }
            window.location.href = "/";
        }
    } catch (error) {
        console.error("Failed to load uploads:", error);
        return [];
    }
}

async function displayuploads(uploads) {
    const userProfiles = uploads.filter(u => u.type === "profile_picture");
    const maxProfileId = userProfiles.length > 0 ? Math.max(...userProfiles.map(u => u.id)) : null;

    uploads.forEach(upload => {
        console.log(upload);

        const isCurrentProfile = upload.type === "profile_picture" && upload.id === maxProfileId;

        const LogHTML = `
            <tr>
              <td class="uid">${upload.id}</td>
              <td><a href="${upload.url}">${upload.url.slice(45)}</a></td>
              <td>${upload.type}</td>
              <td>${formatUTCDate(upload.created_at)}</td>
              <td>
                <div class="table-btn-row">
                  <button id="download-btn-${upload.id}" >Download</button>
                  ${isCurrentProfile ? "" : `<button id="delete-btn-${upload.id}" class="danger-btn">Delete</button>`}
                </div>
              </td>
            </tr> 
        `;
        document.getElementById("uploads").insertAdjacentHTML("beforeend", LogHTML);

        // Download knop
        document.getElementById("download-btn-" + upload.id).addEventListener("click", async () => {
            await downloadImage(upload.url, upload.url.slice(45));
        });

        // Delete knop, alleen als het niet het actieve profiel is
        if (!isCurrentProfile) {
            document.getElementById("delete-btn-" + upload.id).addEventListener("click", async () => {
                await deleteupload(upload.id, upload.url.slice(45));
            });
        }
    });
}

async function downloadImage(url, filename) {
    const response = await fetch(url, { mode: 'cors' }); // Zorg dat de server CORS toestaat
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
}

async function deleteupload(id, name) {
    const result = await promptChoice("Cancel", "Yes", "Are you sure you want to delete " + name + "?", "Usercontent deletion!");
    if (!result) return;
    const session_token = await get_session_token();
    try {
        const response = await fetch("https://usercontent.davidnet.net/delete_content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: session_token, id: id }),
        });
        const result = await response.json();

        if (response.ok) {
            await promptChoice("Ok", "", name + " deleted!", "Success!");
            window.location.reload();
        } else {
            await promptChoice("Ok", "", "We couldn't delete the upload!", "Something went wrong!");
        }
    } catch (error) {
        console.error("Failed to delete usercontent:", error);
        return [];
    }
}

async function rmall() {
    const result = await promptChoice("Cancel", "Yes", "Are you sure you want to delete everything?");
    if (!result) return;
    const result2 = await promptChoice("Cancel", "Yes", "Are you really really sure you want to delete everything?");
    if (!result2) return;

    const session_token = await get_session_token();
    try {
        const response = await fetch("https://usercontent.davidnet.net/delete_all_content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: session_token }),
        });
        const result = await response.json();

        if (response.ok) {
            await promptChoice("Ok", "", "All your usercontent is deleted!", "Success!");
            window.location.reload();
        } else {
            await promptChoice("Ok", "", "We couldn't delete all uploads!", "Something went wrong!");
        }
    } catch (error) {
        console.error("Failed to delete all usercontent:", error);
        return [];
    }
}
