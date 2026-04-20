// js/admin-dash.js

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // --- 1. STRICT VIP SESSION GUARD ---
    // ==========================================
    const adminToken = localStorage.getItem('admin_access_token');
    if (!adminToken) {
        window.location.replace('index.html'); 
        return;
    }

    // Logout function
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('admin_access_token');
            localStorage.removeItem('currentAdmin');
            window.location.replace('index.html'); 
        });
    }

    // ==========================================
    // --- 2. TAB NAVIGATION ROUTING ---
    // ==========================================
    const tabs = {
        verify: { btn: document.getElementById('tab-verify'), view: document.getElementById('view-verify'), render: renderVerifyQueue },
        quality: { btn: document.getElementById('tab-quality'), view: document.getElementById('view-quality'), render: renderQuality },
        complaints: { btn: document.getElementById('tab-complaints'), view: document.getElementById('view-complaints'), render: renderComplaints }
    };

    function switchTab(tabKey) {
        Object.values(tabs).forEach(tab => {
            if(tab.btn) tab.btn.classList.remove('active');
            if(tab.view) tab.view.classList.add('hidden'); 
        });
        if(tabs[tabKey].btn) tabs[tabKey].btn.classList.add('active');
        if(tabs[tabKey].view) tabs[tabKey].view.classList.remove('hidden');
        if(tabs[tabKey].render) tabs[tabKey].render(); 
    }

    if(tabs.verify.btn) tabs.verify.btn.addEventListener('click', (e) => { e.preventDefault(); switchTab('verify'); });
    if(tabs.quality.btn) tabs.quality.btn.addEventListener('click', (e) => { e.preventDefault(); switchTab('quality'); });
    if(tabs.complaints.btn) tabs.complaints.btn.addEventListener('click', (e) => { e.preventDefault(); switchTab('complaints'); });

    // ==========================================
    // --- 3. VERIFICATION QUEUE (API CONNECTED) ---
    // ==========================================
    async function renderVerifyQueue() {
        const list = document.getElementById('verification-list');
        const pendingCountSpan = document.getElementById('pending-count');

        try {
            const response = await fetch(`${API_BASE}/admin/pending-applications`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });

            if (response.status === 401) {
                localStorage.removeItem('admin_access_token');
                window.location.replace('index.html'); 
                return;
            }

            const pendingProviders = await response.json();
            
            if(pendingCountSpan) pendingCountSpan.textContent = pendingProviders.length;
            if(!list) return;
            
            list.innerHTML = '';

            if (pendingProviders.length === 0) {
                list.innerHTML = `<div class="empty-queue"><i class="fa-solid fa-clipboard-check"></i><h2>Queue is Empty</h2><p>All applications processed.</p></div>`;
                return;
            }

            pendingProviders.forEach(provider => {
                const iconClass = provider.provider_type === "Hospital" || provider.provider_type === "Lab" ? "fa-hospital" : "fa-user-doctor";
                const dateStr = provider.created_at ? new Date(provider.created_at).toLocaleDateString() : "Recently";

                list.innerHTML += `
                    <div class="verify-card" id="card-${provider.provider_id}">
                        <div class="verify-top">
                            <div class="verify-info">
                                <h3>${provider.name}</h3>
                                <p>${provider.email} • Applied: ${dateStr}</p>
                                <div class="verify-meta">
                                    <div class="meta-pill"><i class="fa-solid ${iconClass}"></i> ${provider.provider_type} (${provider.category || 'General'})</div>
                                    <div class="meta-pill"><i class="fa-solid fa-id-card"></i> Reg: ${provider.license_number || 'N/A'}</div>
                                </div>
                            </div>
                            <span class="status-badge status-upcoming">Pending</span>
                        </div>
                        
                        <div class="verify-actions">
                            <button class="btn-view-docs" onclick="viewLicense('${provider.license_document_url}')">
                                <i class="fa-solid fa-file-pdf"></i> View Documents
                            </button>
                            <button class="btn-reject" onclick="processApp('${provider.provider_id}', 'reject')"><i class="fa-solid fa-xmark"></i> Reject</button>
                            <button class="btn-approve" onclick="processApp('${provider.provider_id}', 'approve')"><i class="fa-solid fa-check"></i> Verify & Approve</button>
                        </div>
                    </div>
                `;
            });
        } catch (error) {
            console.error("Queue fetch error:", error);
            if(list) list.innerHTML = `<p class="error-text text-center">Failed to connect to server.</p>`; 
        }
    }

    // Document Viewer Logic
    window.viewLicense = function(docUrl) {
        if (docUrl && docUrl !== 'null') {
            window.open(`${API_BASE}${docUrl}`, '_blank');
        } else {
            alert("This provider did not upload any license documents.");
        }
    };

    // Application Processing Logic (Hits FastAPI)
    window.processApp = async function(providerId, action) {
        if (action === 'approve') {
            const confirmApprove = confirm(`Are you sure you want to verify and approve this provider?`);
            if (!confirmApprove) return;

            try {
                const response = await fetch(`${API_BASE}/admin/approve/${providerId}`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });

                if (response.ok) {
                    alert(`Provider verified and approved!`);
                    renderVerifyQueue(); 
                } else {
                    const err = await response.json();
                    alert(`Approval failed: ${err.detail}`);
                }
            } catch (error) {
                console.error(error);
                alert("Network error.");
            }
        } else if (action === 'reject') {
            const confirmReject = confirm(`Are you sure you want to REJECT this provider?`);
            if (!confirmReject) return;
            alert(`Reject UI triggered. (Requires Phase 2 DELETE route in backend)`);
            document.getElementById(`card-${providerId}`).classList.add('hidden'); 
        }
    };

    // ==========================================
    // --- 4. QUALITY & COMPLAINTS (PHASE 2 MOCKS) ---
    // ==========================================
    function renderQuality() {
        const tbody = document.getElementById('quality-list');
        if(!tbody) return;
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state-cell">
            <i class="fa-solid fa-hammer feature-icon"></i>
            <br>Provider Quality Metrics require a Phase 2 Backend Update (Provider Ratings Table).
        </td></tr>`;
    }

    function renderComplaints() {
        const list = document.getElementById('complaints-list');
        if(!list) return;
        list.innerHTML = `<div class="empty-queue">
            <i class="fa-solid fa-face-smile feature-icon text-success"></i>
            <h2>Phase 2 Feature</h2>
            <p>The Complaints Table needs to be created in the PostgreSQL database.</p>
        </div>`;
    }

    // ==========================================
    // --- 5. GLOBAL ADMIN SEARCH (API CONNECTED) ---
    // ==========================================
    const adminSearchInput = document.getElementById('admin-global-search');

    if (adminSearchInput) {
        adminSearchInput.addEventListener('input', async (e) => {
            const query = e.target.value.trim();
            
            if (query.length < 1) {
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/admin/global-admin-search?q=${query}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                });

                if (!response.ok) throw new Error("Search Failed");

                const data = await response.json();
                console.log("Admin Search Results:", data);
                
                if (typeof updateAdminDashboardTables === "function") {
                    updateAdminDashboardTables(data); 
                }

            } catch (err) {
                console.error("Admin Search Error:", err);
            }
        });
    }

    // --- Boot up the app ---
    switchTab('verify');
});