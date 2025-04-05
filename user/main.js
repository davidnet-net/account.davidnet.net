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
    const url = window.location.href;
    const params = new URLSearchParams(new URL(url).search);
    const id = params.get("id");

    if (await does_user_exists === true ) {
        const username = await get_username(id);
        const profile_picture = await get_profile_picture(id);
        const description = await get_desc(id);
        const created_at = await get_created_at(id);

        document.getElementById("username").textContent = username;
        document.getElementById("profile-icon").src = profile_picture;
        document.getElementById("desc").textContent = description;
        document.getElementById("created").src= formatUTCDate(created_at);

        document.getElementById("background").style.display = "flex";
        document.getElementById("loader").style.display = "none";
    } else {
        document.getElementById("loader").style.display = "none";
        await promptChoice("Ok", "", "User not found", "Error");
        window.location.href = "https://account.davidnet.net/";
    }
});

async function get_profile_picture(id) {
    try {
        const response = await fetch("https://auth.davidnet.net/get_profile_picture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id }),
        });

        const result = await response.json();

        if (response.ok) {
            return result.profile_picture;
        } else {

            console.error("usericon collection failed:", result.error);
            return false;
        }
    } catch (error) {
        console.error("Error during usericon collection:", error);
        return false;
    }   
}

async function does_user_exists(id) {
    try {
        const response = await fetch("https://auth.davidnet.net/does_user_exists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id }),
        });

        const result = await response.json();

        if (response.ok) {
            return result.exists
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }   
}

async function get_username(id) {
    try {
        const response = await fetch("https://auth.davidnet.net/get_username_from_id", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id }),
        });

        const result = await response.json();

        if (response.ok) {
            return result.username
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }   
}

async function get_desc(id) {
    try {
        const response = await fetch("https://auth.davidnet.net/get_desc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id }),
        });

        const result = await response.json();

        if (response.ok) {
            return result.description
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }   
}

async function get_created_at(id) {
    try {
        const response = await fetch("https://auth.davidnet.net/get_created_at_from_id", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id }),
        });

        const result = await response.json();

        if (response.ok) {
            return result.created_at
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }   
}