import axios from "axios";

let redirectStarted = false;
const attachedAxiosClients = new WeakSet();

const getAuthorizationHeader = (headers) => {
  if (!headers) {
    return "";
  }

  if (typeof headers.get === "function") {
    return (
      headers.get("Authorization") ||
      headers.get("authorization") ||
      ""
    );
  }

  return (
    headers.Authorization ||
    headers.authorization ||
    ""
  );
};

const hasBearerToken = (headers) => {
  return /^Bearer\s+\S+/i.test(
    getAuthorizationHeader(headers)
  );
};

const fetchUsesBearerToken = (input, options) => {
  try {
    let headers;

    if (options?.headers) {
      headers = new Headers(options.headers);
    } else if (
      typeof Request !== "undefined" &&
      input instanceof Request
    ) {
      headers = input.headers;
    }

    return hasBearerToken(headers);
  } catch {
    return false;
  }
};

export const handleUnauthorized = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_info");

  window.dispatchEvent(new Event("authLogout"));

  if (
    redirectStarted ||
    window.location.pathname === "/login"
  ) {
    return;
  }

  redirectStarted = true;

  window.location.replace(
    "/login?reason=session_expired"
  );
};

export const attachUnauthorizedInterceptor = (
  client
) => {
  if (
    !client ||
    attachedAxiosClients.has(client)
  ) {
    return;
  }

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error?.response?.status === 401 &&
        hasBearerToken(error?.config?.headers)
      ) {
        handleUnauthorized();
      }

      return Promise.reject(error);
    }
  );

  attachedAxiosClients.add(client);
};

const installFetchInterceptor = () => {
  if (window.__obsidianAuthFetchInstalled) {
    return;
  }

  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input, options) => {
    const usesBearerToken =
      fetchUsesBearerToken(input, options);

    const response = await nativeFetch(
      input,
      options
    );

    if (
      response.status === 401 &&
      usesBearerToken
    ) {
      handleUnauthorized();
    }

    return response;
  };

  window.__obsidianAuthFetchInstalled = true;
};

export const installAuthInterceptors = () => {
  installFetchInterceptor();
  attachUnauthorizedInterceptor(axios);
};