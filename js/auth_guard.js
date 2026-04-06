// js/auth-guard.js
// js/admin/admin-guard.js
(function adminGuard() {
    // FIXED: Look for the specific Admin token!
    const token = localStorage.getItem('admin_access_token');
    let currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (!token) {
        if (currentPage !== 'index.html') {
            window.location.replace('index.html');
        }
        return;
    }

    try {
        const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        
        // STRICT ROLE CHECK
        if (payload.role !== 'admin') {
            console.warn("Security Alert: Unauthorized Role.");
            window.location.replace('../patient/index.html'); // Kick non-admins out
            return;
        }

        // If they are on the login page but already logged in, push them to dashboard
        if (currentPage === 'index.html') {
            window.location.replace('admin.html'); 
        }

    } catch (error) {
        localStorage.removeItem('admin_access_token');
        window.location.replace('index.html');
    }
})();