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
    return true;
  } else {
    console.log("Session invalid");
    return false;
  }
}

export async function get_session_information(params) {
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
