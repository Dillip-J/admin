document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Session Authorization & Dynamic Routing ---
    const currentProvider = JSON.parse(localStorage.getItem('currentProvider'));
    if (!currentProvider) { window.location.href = 'provider-auth.html'; return; }

    const providerName = currentProvider.name || "Provider";
    const providerType = currentProvider.providerType || "Doctor"; // Defaults to Doctor if old account
    const providerCategory = currentProvider.category || "Healthcare";

    // Setup Header Info
    document.getElementById('welcome-message').textContent = providerType === 'Doctor' ? `Dr. ${providerName.replace('Dr. ', '')}` : providerName;
    document.getElementById('clinic-name').textContent = `${providerCategory} • ${providerType}`;
    
    const parts = providerName.replace('Dr. ', '').trim().split(' ');
    document.getElementById('header-initials').textContent = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0][0].toUpperCase();


    // --- 2. Dynamic Sidebar Generation ---
    const sidebarNav = document.getElementById('dynamic-sidebar-nav');
    
    // Configuration dictionary for different provider types
    const tabConfig = {
        'Doctor': [
            { id: 'tab-appointments', icon: 'fa-calendar-check', text: 'My Appointments' },
            { id: 'tab-schedule', icon: 'fa-clock', text: 'Schedule Manager' },
            { id: 'tab-records', icon: 'fa-file-waveform', text: 'Patient Records' },
            { id: 'tab-earnings', icon: 'fa-wallet', text: 'Earnings' }
        ],
        'Lab': [
            { id: 'tab-appointments', icon: 'fa-vial-virus', text: 'Lab Bookings' },
            { id: 'tab-schedule', icon: 'fa-clock', text: 'Collection Schedule' },
            { id: 'tab-records', icon: 'fa-file-pdf', text: 'Uploaded Reports' },
            { id: 'tab-earnings', icon: 'fa-wallet', text: 'Earnings' }
        ],
        'Pharmacy': [
            { id: 'tab-appointments', icon: 'fa-pills', text: 'Prescription Orders' },
            { id: 'tab-schedule', icon: 'fa-truck-fast', text: 'Delivery Slots' },
            { id: 'tab-records', icon: 'fa-clipboard-list', text: 'Order History' },
            { id: 'tab-earnings', icon: 'fa-wallet', text: 'Earnings' }
        ]
    };

    const myTabs = tabConfig[providerType] || tabConfig['Doctor'];
    
    sidebarNav.innerHTML = '';
    myTabs.forEach((tab, index) => {
        sidebarNav.innerHTML += `
            <a href="#" class="nav-item ${index === 0 ? 'active' : ''}" id="${tab.id}">
                <i class="fa-solid ${tab.icon}"></i> ${tab.text}
            </a>
        `;
    });


    // --- 3. View Toggling Logic (SPA Routing) ---
    const views = {
        'tab-appointments': document.getElementById('view-appointments'),
        'tab-schedule': document.getElementById('view-schedule'),
        'tab-records': document.getElementById('view-records'),
        'tab-earnings': document.getElementById('view-earnings')
    };

    function switchTab(tabId) {
        // Hide all views and deactivate all buttons
        Object.keys(views).forEach(key => {
            const btn = document.getElementById(key);
            if (btn) btn.classList.remove('active');
            if (views[key]) views[key].style.display = 'none';
        });

        // Activate selected
        const activeBtn = document.getElementById(tabId);
        if (activeBtn) activeBtn.classList.add('active');
        if (views[tabId]) views[tabId].style.display = 'block';

        // Trigger specific render functions
        if (tabId === 'tab-appointments') loadAppointments();
        if (tabId === 'tab-schedule') loadScheduleManager();
        if (tabId === 'tab-records') renderPatientRecords();
        if (tabId === 'tab-earnings') renderEarnings();
    }

    // Attach Event Listeners to newly created sidebar buttons
    myTabs.forEach(tab => {
        const el = document.getElementById(tab.id);
        if(el) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                switchTab(tab.id);
            });
        }
    });

    // --- DB Helper ---
    function getMyBookings() {
        const allBookings = JSON.parse(localStorage.getItem('bookedAppointments')) || [];
        // Match by exact provider name/ID
        return allBookings.filter(b => b.doctorName === providerName || b.doctorId === currentProvider.id);
    }

    // --- 4. View 1: Appointments / Orders ---
    function loadAppointments() {
        const myBookings = getMyBookings();
        const upcomingBookings = myBookings.filter(b => b.status === 'upcoming');
        const completedBookings = myBookings.filter(b => b.status === 'completed');

        // Dynamic terminology based on provider
        const terminology = {
            'Doctor': { title: 'Upcoming Consultations', label: 'Patients', action: 'Complete' },
            'Lab': { title: 'Pending Sample Collections', label: 'Samples', action: 'Upload Result' },
            'Pharmacy': { title: 'Pending Medicine Deliveries', label: 'Orders', action: 'Mark Delivered' }
        }[providerType] || { title: 'Upcoming Requests', label: 'Requests', action: 'Process' };

        const statsContainer = document.getElementById('provider-stats');
        if(statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-info"><span>Total ${terminology.label}</span><strong>${myBookings.length}</strong></div>
                    <div class="stat-icon"><i class="fa-solid fa-users"></i></div>
                </div>
                <div class="stat-card">
                    <div class="stat-info"><span>Pending</span><strong class="text-blue">${upcomingBookings.length}</strong></div>
                    <div class="stat-icon"><i class="fa-regular fa-calendar-check"></i></div>
                </div>
                <div class="stat-card">
                    <div class="stat-info"><span>Completed</span><strong class="text-green">${completedBookings.length}</strong></div>
                    <div class="stat-icon" style="background: rgba(16,185,129,0.1); color: var(--success-green);"><i class="fa-solid fa-check-double"></i></div>
                </div>
            `;
        }

        // Update Section Title
        const sectionTitle = document.querySelector('#view-appointments .section-title');
        if (sectionTitle) sectionTitle.textContent = terminology.title;

        const listEl = document.getElementById('provider-appointments-list');
        if(!listEl) return;
        listEl.innerHTML = '';

        if (upcomingBookings.length === 0) {
            listEl.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-secondary); border: 1px dashed var(--border-color); border-radius: 12px;">No pending ${terminology.label.toLowerCase()} found.</div>`;
            return;
        }

        upcomingBookings.forEach(apt => {
            listEl.innerHTML += `
                <div class="provider-apt-card">
                    <div class="apt-details">
                        <h3>${apt.patientName || "Guest Patient"}</h3>
                        <div class="text-secondary" style="font-size: 0.9rem;">ID: ${apt.bookingId} • ${apt.visitType}</div>
                        <div class="apt-meta">
                            <div><i class="fa-regular fa-calendar text-blue"></i> ${apt.date}</div>
                            <div><i class="fa-regular fa-clock text-blue"></i> ${apt.time}</div>
                        </div>
                    </div>
                    <button class="btn-upload" onclick="openUploadModal('${apt.bookingId}', '${apt.patientName}')">
                        <i class="fa-solid fa-check"></i> ${terminology.action}
                    </button>
                </div>
            `;
        });
    }

    // --- 5. Upload Modal Logic (Dynamic text based on provider) ---
    const modal = document.getElementById('upload-modal');
    window.openUploadModal = function(bookingId, patientName) {
        document.getElementById('record-booking-id').value = bookingId;
        document.getElementById('record-display-id').textContent = bookingId;
        document.getElementById('record-patient-name').textContent = patientName || "Guest Patient";
        
        // Change Modal Labels dynamically
        const notesLabel = document.querySelector('#upload-modal label');
        if (providerType === 'Lab') notesLabel.textContent = "Lab Technician Remarks *";
        else if (providerType === 'Pharmacy') notesLabel.textContent = "Delivery / Order Notes *";
        else notesLabel.textContent = "Clinical Notes / Diagnosis *";

        document.getElementById('record-notes').value = '';
        modal.style.display = 'flex';
    };

    document.getElementById('close-upload-btn').addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('form-upload-record').addEventListener('submit', (e) => {
        e.preventDefault();
        const bookingId = document.getElementById('record-booking-id').value;
        const notes = document.getElementById('record-notes').value;
        const fileInput = document.getElementById('record-file');

        let allBookings = JSON.parse(localStorage.getItem('bookedAppointments')) || [];
        const index = allBookings.findIndex(b => b.bookingId === bookingId);
        
        if (index !== -1) {
            allBookings[index].status = "completed";
            allBookings[index].clinicalNotes = notes;
            allBookings[index].completedAt = new Date().toLocaleDateString();
            if(fileInput.files.length > 0) {
                allBookings[index].hasReport = true;
                allBookings[index].reportName = fileInput.files[0].name;
            }
            
            localStorage.setItem('bookedAppointments', JSON.stringify(allBookings));
            alert("Record securely saved!");
            modal.style.display = 'none';
            loadAppointments(); 
        }
    });

    // --- 6. View: Patient Records / History ---
    function renderPatientRecords() {
        const completedBookings = getMyBookings().filter(b => b.status === 'completed');
        const tbody = document.getElementById('records-list');
        tbody.innerHTML = '';

        if(completedBookings.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 40px;">No historical records found.</td></tr>`;
            return;
        }

        completedBookings.forEach(apt => {
            const hasReport = apt.hasReport;
            const btnClass = hasReport ? 'btn-download' : 'btn-download disabled';
            const btnText = hasReport ? `<i class="fa-solid fa-download"></i> Download` : `No File`;
            const clickAction = hasReport ? `onclick="alert('Downloading ${apt.reportName} securely...')"` : ``;

            tbody.innerHTML += `
                <tr>
                    <td><strong>${apt.patientName || "Guest Patient"}</strong></td>
                    <td>${apt.date}</td>
                    <td>${apt.visitType}</td>
                    <td><div class="note-preview" title="${apt.clinicalNotes}">${apt.clinicalNotes || "No notes provided."}</div></td>
                    <td><button class="${btnClass}" ${clickAction}>${btnText}</button></td>
                </tr>
            `;
        });
    }

    // --- 7. View: Earnings ---
    function renderEarnings() {
        const completedBookings = getMyBookings().filter(b => b.status === 'completed');
        
        let totalEarnings = 0;
        completedBookings.forEach(b => {
            let consult = parseFloat(b.consultationFee) || 0;
            let visit = parseFloat(b.visitCharge) || 0;
            totalEarnings += (consult + visit);
        });

        document.getElementById('earnings-stats').innerHTML = `
            <div class="stat-card">
                <div class="stat-info"><span>Total Net Earnings</span><strong style="color: var(--success-green);">$${totalEarnings.toFixed(2)}</strong></div>
                <div class="stat-icon" style="background: #ECFDF5; color: #10B981;"><i class="fa-solid fa-sack-dollar"></i></div>
            </div>
            <div class="stat-card">
                <div class="stat-info"><span>Completed Sessions</span><strong>${completedBookings.length}</strong></div>
                <div class="stat-icon"><i class="fa-solid fa-hand-holding-medical"></i></div>
            </div>
            <div class="stat-card">
                <div class="stat-info"><span>Next Payout</span><strong>$0.00</strong></div>
                <div class="stat-icon" style="background: #F3E8FF; color: #9333EA;"><i class="fa-solid fa-building-columns"></i></div>
            </div>
        `;

        const txList = document.getElementById('transactions-list');
        txList.innerHTML = '';

        if(completedBookings.length === 0) {
            txList.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-secondary); border: 1px dashed var(--border-color); border-radius: 12px;">No earnings generated yet.</div>`;
            return;
        }

        [...completedBookings].reverse().forEach(apt => {
            let amount = (parseFloat(apt.consultationFee) || 0) + (parseFloat(apt.visitCharge) || 0);
            txList.innerHTML += `
                <div class="transaction-item">
                    <div class="tx-left">
                        <div class="tx-icon"><i class="fa-solid fa-money-bill-transfer"></i></div>
                        <div class="tx-info">
                            <h3>Transaction: ${apt.patientName || "Guest Patient"}</h3>
                            <p>${apt.date} • ${apt.visitType} • ID: ${apt.bookingId}</p>
                        </div>
                    </div>
                    <div class="tx-amount">
                        +$${amount.toFixed(2)}
                        <span class="tx-status">Cleared</span>
                    </div>
                </div>
            `;
        });
    }

    // --- 8. Schedule Manager (Empty placeholder for now to prevent errors) ---
    function loadScheduleManager() {
        // Keeps the existing calendar logic you already have.
    }

    // Initialize Default View
    loadAppointments();

    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('currentProvider');
        window.location.href = 'provider-auth.html';
    });
});