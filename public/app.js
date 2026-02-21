const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE || "").replace(/\/$/, "");

function $(selector) {
  return document.querySelector(selector);
}

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('lecturer_token');
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "content-type": "application/json",
        ...(token ? { "authorization": `Bearer ${token}` } : {}),
        ...(options.headers || {})
      },
      ...options
    });

    const text = await response.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: "Invalid JSON response" };
      }
    }

    if (!response.ok) {
      const message = data.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(message);
    }

    return data;
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error("Network error - check your connection and API endpoint");
    }
    throw err;
  }
}

function setStatus(el, message, tone = "") {
  if (!el) return;
  el.textContent = message;
  el.dataset.tone = tone;
}
