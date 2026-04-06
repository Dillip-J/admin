// js/admin-script.js

// ==========================================
// --- 0. INSTANT THEME MANAGER (Prevents Flashing) ---
// ==========================================
(function() {
    const savedTheme = localStorage.getItem('admin_theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
})();

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // --- 1. DARK MODE TOGGLE ---
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    if (themeToggleBtn && themeIcon) {
        // Set correct icon on load
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            themeIcon.className = 'fa-solid fa-sun';
        } else {
            themeIcon.className = 'fa-regular fa-moon';
        }

        themeToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (document.documentElement.getAttribute('data-theme') === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('admin_theme', 'light');
                themeIcon.className = 'fa-regular fa-moon';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('admin_theme', 'dark');
                themeIcon.className = 'fa-solid fa-sun';
            }
        });
    }

    // ==========================================
    // --- 2. GLOBAL OFFLINE DETECTOR ---
    // ==========================================
    window.addEventListener('offline', () => showNetworkToast(false));
    window.addEventListener('online', () => showNetworkToast(true));

    function showNetworkToast(isOnline) {
        let toast = document.getElementById('network-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'network-toast';
            toast.className = 'network-toast'; // Replaced ALL inline CSS with this class
            document.body.appendChild(toast);
        }
        
        // Wipe old classes
        toast.classList.remove('online', 'offline', 'fade-out');

        if (isOnline) {
            toast.classList.add('online');
            toast.innerHTML = '<i class="fa-solid fa-wifi"></i> Connection Restored';
            setTimeout(() => { 
                toast.classList.add('fade-out'); 
                setTimeout(() => toast.remove(), 300); 
            }, 3000);
        } else {
            toast.classList.add('offline');
            toast.innerHTML = '<i class="fa-solid fa-plane-up"></i> System Offline. Check Connection.';
        }
    }

    if (!navigator.onLine) showNetworkToast(false);
});
// // admin-verification.js
// document.addEventListener('DOMContentLoaded', () => {
//     const API_BASE = 'http://127.0.0.1:8000';

//     // --- 1. VIP SESSION GUARD ---
//     const adminToken = localStorage.getItem('admin_access_token');
//     if (!adminToken) {
//         window.location.href = 'admin-login.html'; // Or whatever your login page is named
//         return;
//     }

//     const verificationList = document.getElementById('verification-list');
//     const pendingCountSpan = document.getElementById('pending-count');

//     // --- 2. FETCH REAL PENDING APPLICATIONS ---
//     async function loadQueue() {
//         try {
//             const response = await fetch(`${API_BASE}/admin/pending-applications`, {
//                 headers: { 'Authorization': `Bearer ${adminToken}` }
//             });

//             if (response.status === 401) {
//                 localStorage.removeItem('admin_access_token');
//                 window.location.href = 'admin-login.html';
//                 return;
//             }

//             const pendingProviders = await response.json();
            
//             if(pendingCountSpan) pendingCountSpan.textContent = pendingProviders.length;
//             if(!verificationList) return;
            
//             verificationList.innerHTML = '';

//             if (pendingProviders.length === 0) {
//                 verificationList.innerHTML = `
//                     <div class="empty-queue">
//                         <i class="fa-solid fa-clipboard-check"></i>
//                         <h2>Queue is Empty</h2>
//                         <p>All provider applications have been processed.</p>
//                     </div>
//                 `;
//                 return;
//             }

//             // --- 3. RENDER THE QUEUE ---
//             pendingProviders.forEach(provider => {
//                 const icon = provider.provider_type === "Hospital" || provider.provider_type === "Lab" ? "fa-hospital" : "fa-user-doctor";
//                 const dateStr = provider.created_at ? new Date(provider.created_at).toLocaleDateString() : "Recently";

//                 const cardHTML = `
//                     <div class="verify-card" id="card-${provider.provider_id}">
//                         <div class="verify-top">
//                             <div class="verify-info">
//                                 <h3>${provider.name}</h3>
//                                 <p>${provider.email} • Applied on ${dateStr}</p>
                                
//                                 <div class="verify-meta">
//                                     <div class="meta-pill"><i class="fa-regular ${icon}"></i> ${provider.provider_type}</div>
//                                     <div class="meta-pill"><i class="fa-solid fa-stethoscope"></i> ${provider.category || 'General'}</div>
//                                     <div class="meta-pill"><i class="fa-solid fa-id-card"></i> Lic: ${provider.license_number || 'N/A'}</div>
//                                 </div>
//                             </div>
//                             <span class="status-badge status-upcoming">Pending Review</span>
//                         </div>

//                         <div class="verify-actions">
//                             <button class="btn-view-docs" onclick="viewDocs('${provider.license_document_url}')">
//                                 <i class="fa-solid fa-file-pdf"></i> View Documents
//                             </button>
//                             <button class="btn-reject" onclick="processApplication('${provider.provider_id}', 'reject')">
//                                 <i class="fa-solid fa-xmark"></i> Reject
//                             </button>
//                             <button class="btn-approve" onclick="processApplication('${provider.provider_id}', 'approve')">
//                                 <i class="fa-solid fa-check"></i> Verify & Approve
//                             </button>
//                         </div>
//                     </div>
//                 `;
//                 verificationList.insertAdjacentHTML('beforeend', cardHTML);
//             });

//         } catch (error) {
//             console.error("Error loading queue:", error);
//             if(verificationList) verificationList.innerHTML = `<p style="color:red; text-align:center;">Failed to connect to backend server.</p>`;
//         }
//     }

//     // Initialize View
//     loadQueue();

//     // --- 4. PROCESS APPLICATIONS LOGIC (API CONNECTED) ---
//     window.processApplication = async function(providerId, action) {
//         if (action === 'approve') {
//             const confirmApprove = confirm(`Are you sure you want to verify and approve this provider?`);
//             if (!confirmApprove) return;

//             try {
//                 // Hit the real FastAPI PATCH route
//                 const response = await fetch(`${API_BASE}/admin/approve/${providerId}`, {
//                     method: 'PATCH',
//                     headers: { 'Authorization': `Bearer ${adminToken}` }
//                 });

//                 if (response.ok) {
//                     alert(`Provider has been successfully verified and approved!`);
//                     loadQueue(); // Refresh list dynamically
//                 } else {
//                     const err = await response.json();
//                     alert(`Approval failed: ${err.detail}`);
//                 }
//             } catch (error) {
//                 console.error(error);
//                 alert("Network error.");
//             }

//         } else if (action === 'reject') {
//             const confirmReject = confirm(`Are you sure you want to REJECT this provider?`);
//             if (!confirmReject) return;
            
//             // Note: In our current Python backend, we didn't build a DELETE route yet. 
//             // So we just simulate it in the UI for now!
//             alert(`Provider application rejected. (Requires Phase 2 DELETE route in backend)`);
//             document.getElementById(`card-${providerId}`).style.display = 'none';
//         }
//     };

//     // --- 5. Simulate Document Viewing ---
//     window.viewDocs = function(docUrl) {
//         if (docUrl && docUrl !== 'null') {
//             window.open(`${API_BASE}${docUrl}`, '_blank');
//         } else {
//             alert("This provider did not upload any license documents.");
//         }
//     };
// });