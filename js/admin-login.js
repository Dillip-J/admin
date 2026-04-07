// js/admin-login.js
document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('admin-login-form');
    const errorBox = document.getElementById('login-error');
    const errorText = document.getElementById('login-error-text'); // Optional: Add this ID to a span inside your error box to show exact errors

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('admin-email').value.toLowerCase();
            const password = document.getElementById('admin-password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            // Reset UI (NO INLINE CSS)
            if (errorBox) errorBox.classList.add('hidden');
            
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Authenticating...";
            submitBtn.disabled = true;

            try {
                // 1. Hit the Secure Admin Auth Route
                const response = await fetch(`${API_BASE}/admin-auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: password })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    if (errorBox) {
                        errorBox.classList.remove('hidden'); // NO INLINE CSS
                        // If you have a span for the text, inject the exact FastAPI error:
                        if (errorText) errorText.textContent = errorData.detail || "Invalid credentials.";
                    }
                    return;
                }

                const data = await response.json();

                // 2. Save the VIP Admin Token 
                localStorage.setItem('admin_access_token', data.access_token);
                localStorage.setItem('currentAdmin', JSON.stringify(data.admin));

                // 3. Teleport to Dashboard (FIXED: points to admin-dash.html and uses replace)
                window.location.replace('admin.html');

            } catch (error) {
                console.error("Admin Login Error:", error);
                alert("Server connection failed. The server is currently disconnected.");
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});