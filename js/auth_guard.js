// js/admin-guard.js
(function adminGuard() {
    const token = localStorage.getItem('admin_access_token');
    // Default to admin-login.html if path is empty
    let currentPage = window.location.pathname.split('/').pop() || 'admin-login.html';

    // 1. If no token, force them to the admin login page
    if (!token) {
        if (currentPage !== 'admin-login.html' && currentPage !== '') {
            window.location.replace('admin-login.html');
        }
        return;
    }

    try {
        const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        
        // 2. STRICT ROLE CHECK: Kick out patients and doctors
        if (payload.role !== 'admin') {
            console.warn("Security Alert: Unauthorized Role.");
            localStorage.removeItem('admin_access_token');
            window.location.replace('../index.html'); // Send to main patient site
            return;
        }

        // 3. If they are logged in and on the login page, push to dashboard
        if (currentPage === 'admin-login.html' || currentPage === '') {
            window.location.replace('admin.html'); 
        }

    } catch (error) {
        // If the token is corrupted or fake, destroy it and kick them
        localStorage.removeItem('admin_access_token');
        window.location.replace('admin-login.html');
    }
})();