// js/admin-guard.js
(function adminGuard() {
    const token = localStorage.getItem('admin_access_token');
    
    // In your setup, the login page is index.html
    let currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // 1. If NO token, force them to stay on the login page (index.html)
    if (!token) {
        if (currentPage !== 'index.html' && currentPage !== '') {
            window.location.replace('index.html');
        }
        return;
    }

    try {
        const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        
        // 2. STRICT ROLE CHECK: Kick out patients and doctors back to the MAIN public site
        if (payload.role !== 'admin') {
            console.warn("Security Alert: Unauthorized Role.");
            localStorage.removeItem('admin_access_token');
            window.location.replace('https://dillip-j.github.io/Vision-24-7/'); 
            return;
        }

        // 3. If they ARE an admin, and they land on the login page, teleport them to the dashboard
        if (currentPage === 'index.html' || currentPage === '') {
            window.location.replace('admin.html'); // Teleports to your actual dashboard
        }

    } catch (error) {
        // If the token is corrupted, destroy it and kick them back to login
        localStorage.removeItem('admin_access_token');
        if (currentPage !== 'index.html' && currentPage !== '') {
            window.location.replace('index.html');
        }
    }
})();