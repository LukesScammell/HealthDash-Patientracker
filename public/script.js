// === Apply saved or system theme on load ===
(function applySavedOrSystemTheme() {
  const saved = localStorage.getItem("darkMode");
  if (saved === "enabled") {
    document.body.classList.add("dark");
  } else if (saved === "disabled") {
    document.body.classList.remove("dark");
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.body.classList.add("dark");
  }
})();

// === Toggle dark mode and swap icon ===
function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");

  const toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) {
    toggleBtn.textContent = isDark ? "☀️" : "🌙";
  }
}

// === Logout helper ===
function logout() {
  fetch("/logout", { method: "POST" }).then(() => location.href = "login.html");
}

// === Load navigation and setup ===
fetch("nav.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("nav-placeholder").innerHTML = html;

    const toggleBtn = document.querySelector(".nav-toggle");
    const navExpand = document.getElementById("nav-expand");
    const navbar = document.querySelector(".navbar");
    const themeToggle = document.getElementById("theme-toggle");
    const logoutBtn = document.getElementById("logout-btn");

    // Setup nav toggle
    if (toggleBtn && navExpand && navbar) {
      toggleBtn.addEventListener("click", () => {
        navExpand.classList.toggle("show");
        navbar.classList.toggle("expanded");
      });
    }

    // Setup theme toggle
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleDarkMode);

      // Set correct icon on load
      const saved = localStorage.getItem("darkMode");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const darkOn = saved === "enabled" || (!saved && prefersDark);
      themeToggle.textContent = darkOn ? "☀️" : "🌙";
    }

    // Setup logout button
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logout);
    }

    // === Auth state handling ===
    fetch("/me", { credentials: "include", cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then(user => {
        document.getElementById("nav-user").textContent = "👋 " + user.username;
        document.querySelectorAll(".nav-auth").forEach(el => el.style.display = "inline-block");
        document.getElementById("login-btn").style.display = "none";
        document.getElementById("register-btn").style.display = "none";
        document.getElementById("logout-btn").style.display = "inline-block";

        if (user.role === "provider") {
          document.querySelectorAll(".nav-users").forEach(el => el.style.display = "inline-block");
        }
      })
      .catch(() => {
        document.querySelectorAll(".nav-auth").forEach(el => el.remove());
        document.querySelectorAll(".nav-users").forEach(el => el.remove());
        document.getElementById("login-btn").style.display = "inline-block";
        document.getElementById("register-btn").style.display = "inline-block";
        document.getElementById("logout-btn").style.display = "none";
      });
  });
