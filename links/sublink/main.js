import { get_session_token, is_session_valid } from "/session.js";

if (window.self === window.top) {
    window.location.href = "https://account.davidnet.net";
}

window.addEventListener("message", async (event) => {
    if (!event.origin.endsWith(".davidnet.net")) return;
    const valid = await is_session_valid();
    if (valid === true) {
        window.location.href = "https://account.davidnet.net/account/";
    }

    if (event.data === "get_session_token") {
        const storedValue = await get_session_token();
        event.source.postMessage(storedValue, event.origin);
    }
});