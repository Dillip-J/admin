// js/admin-guard.js

(function adminGuard() {
    const token = localStorage.getItem('admin_access_token');
    const currentUrl = window.location.href;
    
    // Check exactly which page we are on
    const isDashboard = currentUrl.includes('admin.html');
    const isAdminLogin = currentUrl.includes('admin-login.html');

    // 1. IF NO TOKEN: Kick them out of the dashboard
    if (!token) {
        if (isDashboard) {
            console.warn("No Admin Token: Redirecting to Admin Login...");
            window.location.replace('admin-login.html');
        }
        return; 
    }

    try {
        // 2. TOKEN EXISTS: Let's check who they are
        const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        
        // 3. STRICT ROLE CHECK: Kick out patients and doctors back to the MAIN public site
        if (payload.role !== 'admin') {
            console.warn("Security Alert: Unauthorized Role. Redirecting to Public Site...");
            localStorage.removeItem('admin_access_token');
            window.location.replace('https://dillip-j.github.io/Vision-24-7/'); 
            return;
        }

        // 4. IF VALID ADMIN: Push them to the dashboard if they are sitting on the login page
        if (isAdminLogin) {
            window.location.replace('admin.html'); 
        }

    } catch (error) {
        // If the token is corrupted, destroy it and kick them back to login
        console.error("Corrupted admin token destroyed.");
        localStorage.removeItem('admin_access_token');
        if (isDashboard) {
            window.location.replace('admin-login.html');
        }
    }
})();