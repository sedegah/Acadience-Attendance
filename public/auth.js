const loginForm = $("#login-form");
const registerForm = $("#register-form");
const loginStatus = $("#login-status");
const registerStatus = $("#register-status");

// Tab switching
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetTab = tab.dataset.tab;
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    if (targetTab === "login") {
      loginForm.classList.remove("hidden");
      registerForm.classList.add("hidden");
    } else {
      loginForm.classList.add("hidden");
      registerForm.classList.remove("hidden");
    }
  });
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginStatus.classList.add("hidden");

  const email = $("#login-email").value.trim();
  const password = $("#login-password").value;

  try {
    const data = await apiFetch("/api/lecturer/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    localStorage.setItem("lecturer_token", data.token);
    localStorage.setItem("lecturer_email", data.lecturer.email);
    loginStatus.textContent = "Login successful! Redirecting...";
    loginStatus.classList.remove("hidden");
    loginStatus.dataset.tone = "success";

    setTimeout(() => {
      window.location.href = "/lecturer.html";
    }, 1000);
  } catch (err) {
    loginStatus.textContent = err.message;
    loginStatus.classList.remove("hidden");
    loginStatus.dataset.tone = "error";
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  registerStatus.classList.add("hidden");

  const fullName = $("#register-name").value.trim();
  const email = $("#register-email").value.trim();
  const password = $("#register-password").value;
  const passwordConfirm = $("#register-password-confirm").value;

  if (password !== passwordConfirm) {
    registerStatus.textContent = "Passwords do not match";
    registerStatus.classList.remove("hidden");
    registerStatus.dataset.tone = "error";
    return;
  }

  try {
    await apiFetch("/api/lecturer/register", {
      method: "POST",
      body: JSON.stringify({ full_name: fullName, email, password })
    });

    registerStatus.textContent = "Registration successful! Please log in.";
    registerStatus.classList.remove("hidden");
    registerStatus.dataset.tone = "success";

    setTimeout(() => {
      document.querySelector('[data-tab="login"]').click();
      $("#login-email").value = email;
    }, 1500);
  } catch (err) {
    registerStatus.textContent = err.message;
    registerStatus.classList.remove("hidden");
    registerStatus.dataset.tone = "error";
  }
});
