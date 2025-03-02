import { is_session_valid, get_session_information } from './session.js';

document.addEventListener("DOMContentLoaded", async (event) => {
    const is_session_valid = await is_session_valid()
    if ( is_session_valid == true) {
        window.location = "https://account.davidnet.net/account/"
    }
});