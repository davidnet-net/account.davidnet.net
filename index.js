import { get_session_information, is_session_valid } from "./session.js";

document.addEventListener("DOMContentLoaded", async () => {
  const valid = await is_session_valid();
  if (valid === true) {
    window.location.href = "https://account.davidnet.net/account/";
  } else {
    window.location.href = "https://account.davidnet.net/login/";
  }
});
