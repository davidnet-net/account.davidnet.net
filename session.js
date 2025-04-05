export async function is_session_valid() {
  const session_token = localStorage.getItem("session-token");
  const requestData = {
    token: session_token,
  };

  // Make the POST request
  const response = await fetch("https://auth.davidnet.net/get_session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });

  if (response.ok) {
    console.log("Session valid!");
    SetSessionCookie(session_token);
    return true;
  } else {
    console.log("Session invalid");
    return false;
  }
}

function SetSessionCookie(sessionToken) {
  const cookieName = "session_token=" + sessionToken;
  const expires = new Date();
  expires.setTime(expires.getTime() + (30 * 60 * 1000)); // Stelt de vervaltijd in (bijvoorbeeld 30 minuten)
  const expiresString = "expires=" + expires.toUTCString();
  
  // Zet de cookie met de juiste parameters
  document.cookie = `${cookieName}; domain=.davidnet.net; path=/; ${expiresString}; Secure; SameSite=None`;
}

export async function get_session_information() {
  const session_token = localStorage.getItem("session-token");
  const requestData = {
    token: session_token,
  };

  // Make the POST request
  const response = await fetch("https://auth.davidnet.net/get_session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });
  const result = await response.json();

  if (response.ok) {
    const id = result.id;
    const userid = result.userid;
    const ip = result.ip;
    const created_at = result.created_at;
    const useragent = result.useragent;

    const session_info = {
      id: id,
      userid: userid,
      ip: ip,
      created_at,
      useragent
    };

    return session_info;
  } else {
    return false;
  }
}

export async function get_session_token() {
  return localStorage.getItem("session-token");
}

export async function require_login() {
  if (!await is_session_valid()) {
    window.location.href = "https://account.davidnet.net/login/";
  }
}