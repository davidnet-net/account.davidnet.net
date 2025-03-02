import { is_session_valid, get_session_information } from './session.js';

document.addEventListener("DOMContentLoaded", async () => {
    const valid = await is_session_valid();
    if (valid === true) {
        window.location.href = "https://account.davidnet.net/account/";
    }
});
