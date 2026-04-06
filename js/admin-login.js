// admin-login.js
document.addEventListener('DOMContentLoaded', () => {
// ==========================================
// 🚨 SMART API ROUTER
// ==========================================
let API_BASE;

if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
    // 💻 LOCAL MODE: You are testing on your laptop
    API_BASE = 'http://127.0.0.1:8000';
    console.log("🔌 Connected to LOCAL Backend");
} else {
    // 🌍 LIVE MODE: You are on the real internet
    API_BASE = 'https://backend-depolyment-1.onrender.com'; 
    console.log("☁️ Connected to LIVE Cloud Backend");
}
    const loginForm = document.getElementById('admin-login-form');
    const errorBox = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            // Reset UI
            if (errorBox) errorBox.style.display = 'none';
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = "Authenticating...";
            submitBtn.disabled = true;

            try {
                // 1. Hit the Secure Admin Auth Route
                const response = await fetch(`${API_BASE}/admin-auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: password })
                });

                if (!response.ok) {
                    if (errorBox) errorBox.style.display = 'flex';
                    return;
                }

                const data = await response.json();

                // 2. Save the VIP Admin Token 
                // We use a different key name so it doesn't conflict with patient/doctor tokens 
                localStorage.setItem('admin_access_token', data.access_token);
                localStorage.setItem('currentAdmin', JSON.stringify(data.admin));

                // 3. Teleport to Dashboard (FIXED FILENAME)
                window.location.href = 'admin.html';

            } catch (error) {
                console.error("Admin Login Error:", error);
                alert("Server offline. Please check Uvicorn.");
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});