// Equipment Tracker Application
// Using IndexedDB for local database storage

let db;
const DB_NAME = 'FireDeptEquipmentDB';
const DB_VERSION = 1;
const STORE_NAME = 'equipment';

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            console.error('Database failed to open');
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            console.log('Database opened successfully');
            resolve(db);
        };
        
        request.onupgradeneeded = (e) => {
            db = e.target.result;
            
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('name', 'name', { unique: false });
                objectStore.createIndex('type', 'type', { unique: false });
                objectStore.createIndex('status', 'status', { unique: false });
                objectStore.createIndex('location', 'location', { unique: false });
                console.log('Object store created');
            }
        };
    });
}

// Add equipment to database
function addEquipment(equipment) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        
        equipment.timestamp = new Date().toISOString();
        equipment.lastUpdated = new Date().toISOString();
        
        const request = objectStore.add(equipment);
        
        request.onsuccess = () => {
            console.log('Equipment added successfully');
            resolve(request.result);
        };
        
        request.onerror = () => {
            console.error('Error adding equipment');
            reject(request.error);
        };
    });
}

// Get all equipment from database
function getAllEquipment() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.getAll();
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = () => {
            reject(request.error);
        };
    });
}

// Update equipment
function updateEquipment(id, updatedData) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.get(id);
        
        request.onsuccess = () => {
            const data = request.result;
            Object.assign(data, updatedData);
            data.lastUpdated = new Date().toISOString();
            
            const updateRequest = objectStore.put(data);
            
            updateRequest.onsuccess = () => {
                resolve(updateRequest.result);
            };
            
            updateRequest.onerror = () => {
                reject(updateRequest.error);
            };
        };
        
        request.onerror = () => {
            reject(request.error);
        };
    });
}

// Delete equipment
function deleteEquipment(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.delete(id);
        
        request.onsuccess = () => {
            resolve();
        };
        
        request.onerror = () => {
            reject(request.error);
        };
    });
}

// Display equipment in the UI
function displayEquipment(equipmentList) {
    const container = document.getElementById('equipmentList');
    
    if (equipmentList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Equipment Found</h3>
                <p>Add your first piece of equipment using the form above.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    equipmentList.forEach(equipment => {
        const card = document.createElement('div');
        card.className = 'equipment-card';
        
        const statusClass = equipment.status.replace(/\s+/g, '-');
        const timestamp = new Date(equipment.timestamp).toLocaleString();
        const lastUpdated = new Date(equipment.lastUpdated).toLocaleString();
        
        card.innerHTML = `
            <h3>${equipment.name}</h3>
            <div class="equipment-info">
                <strong>Type:</strong> ${equipment.type}
            </div>
            <div class="equipment-info">
                <strong>Location:</strong> ${equipment.location}
            </div>
            <div class="equipment-info">
                <strong>Status:</strong> <span class="status-badge status-${statusClass}">${equipment.status}</span>
            </div>
            ${equipment.serialNumber ? `
            <div class="equipment-info">
                <strong>Serial #:</strong> ${equipment.serialNumber}
            </div>
            ` : ''}
            ${equipment.notes ? `
            <div class="equipment-info">
                <strong>Notes:</strong> ${equipment.notes}
            </div>
            ` : ''}
            <div class="timestamp">
                Added: ${timestamp}<br>
                Last Updated: ${lastUpdated}
            </div>
            <div class="equipment-actions">
                <button class="btn-edit" onclick="editEquipment(${equipment.id})">Edit</button>
                <button class="btn-delete" onclick="confirmDelete(${equipment.id})">Delete</button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Update statistics
function updateStats(equipmentList) {
    const total = equipmentList.length;
    const available = equipmentList.filter(e => e.status === 'Available').length;
    const inUse = equipmentList.filter(e => e.status === 'In Use').length;
    const maintenance = equipmentList.filter(e => e.status === 'Maintenance').length;
    
    document.getElementById('totalCount').textContent = total;
    document.getElementById('availableCount').textContent = available;
    document.getElementById('inUseCount').textContent = inUse;
    document.getElementById('maintenanceCount').textContent = maintenance;
}

// Filter and search equipment
function filterEquipment() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const typeFilter = document.getElementById('filterType').value;
    
    getAllEquipment().then(equipment => {
        let filtered = equipment;
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(e => 
                e.name.toLowerCase().includes(searchTerm) ||
                e.type.toLowerCase().includes(searchTerm) ||
                e.location.toLowerCase().includes(searchTerm) ||
                (e.serialNumber && e.serialNumber.toLowerCase().includes(searchTerm))
            );
        }
        
        // Apply status filter
        if (statusFilter) {
            filtered = filtered.filter(e => e.status === statusFilter);
        }
        
        // Apply type filter
        if (typeFilter) {
            filtered = filtered.filter(e => e.type === typeFilter);
        }
        
        displayEquipment(filtered);
        updateStats(equipment); // Always show total stats
    });
}

// Load and display all equipment
function loadEquipment() {
    getAllEquipment().then(equipment => {
        displayEquipment(equipment);
        updateStats(equipment);
    }).catch(error => {
        console.error('Error loading equipment:', error);
    });
}

// Edit equipment
function editEquipment(id) {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get(id);
    
    request.onsuccess = () => {
        const equipment = request.result;
        
        // Populate form with existing data
        document.getElementById('equipmentName').value = equipment.name;
        document.getElementById('equipmentType').value = equipment.type;
        document.getElementById('location').value = equipment.location;
        document.getElementById('status').value = equipment.status;
        document.getElementById('serialNumber').value = equipment.serialNumber || '';
        document.getElementById('notes').value = equipment.notes || '';
        
        // Change form submit behavior to update instead of add
        const form = document.getElementById('equipmentForm');
        form.dataset.editId = id;
        
        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth' });
    };
}

// Confirm delete
function confirmDelete(id) {
    if (confirm('Are you sure you want to delete this equipment?')) {
        deleteEquipment(id).then(() => {
            loadEquipment();
        }).catch(error => {
            console.error('Error deleting equipment:', error);
            alert('Failed to delete equipment');
        });
    }
}

// Form submission handler
document.addEventListener('DOMContentLoaded', () => {
    // Initialize database and load equipment
    initDB().then(() => {
        loadEquipment();
        
        // Auto-refresh every 5 seconds for "live" tracking
        setInterval(loadEquipment, 5000);
    }).catch(error => {
        console.error('Failed to initialize database:', error);
        alert('Failed to initialize database. Please refresh the page.');
    });
    
    // Form submission
    const form = document.getElementById('equipmentForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const equipment = {
            name: document.getElementById('equipmentName').value,
            type: document.getElementById('equipmentType').value,
            location: document.getElementById('location').value,
            status: document.getElementById('status').value,
            serialNumber: document.getElementById('serialNumber').value,
            notes: document.getElementById('notes').value
        };
        
        // Check if we're editing or adding
        if (form.dataset.editId) {
            const id = parseInt(form.dataset.editId);
            updateEquipment(id, equipment).then(() => {
                loadEquipment();
                form.reset();
                delete form.dataset.editId;
                alert('Equipment updated successfully!');
            }).catch(error => {
                console.error('Error updating equipment:', error);
                alert('Failed to update equipment');
            });
        } else {
            addEquipment(equipment).then(() => {
                loadEquipment();
                form.reset();
                alert('Equipment added successfully!');
            }).catch(error => {
                console.error('Error adding equipment:', error);
                alert('Failed to add equipment');
            });
        }
    });
    
    // Search and filter event listeners
    document.getElementById('searchInput').addEventListener('input', filterEquipment);
    document.getElementById('filterStatus').addEventListener('change', filterEquipment);
    document.getElementById('filterType').addEventListener('change', filterEquipment);
});

// ==================== REPORTING FUNCTIONS ====================

// Generate Equipment Status Report
async function generateStatusReport() {
    const equipment = await getAllEquipment();
    const reportOutput = document.getElementById('reportOutput');
    
    const statusCounts = {
        'Available': 0,
        'In Use': 0,
        'Maintenance': 0,
        'Out of Service': 0
    };
    
    equipment.forEach(item => {
        statusCounts[item.status]++;
    });
    
    let html = `
        <div class="report-header">
            <h3>📊 Equipment Status Report</h3>
            <p class="report-date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="report-summary">
            <h4>Summary</h4>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="label">Total Equipment</div>
                    <div class="value">${equipment.length}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Available</div>
                    <div class="value" style="color: #2ecc71;">${statusCounts['Available']}</div>
                </div>
                <div class="summary-item">
                    <div class="label">In Use</div>
                    <div class="value" style="color: #3498db;">${statusCounts['In Use']}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Maintenance</div>
                    <div class="value" style="color: #f39c12;">${statusCounts['Maintenance']}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Out of Service</div>
                    <div class="value" style="color: #e74c3c;">${statusCounts['Out of Service']}</div>
                </div>
            </div>
        </div>
        
        <div class="report-section">
            <h4>Detailed Equipment List</h4>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Equipment Name</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Serial Number</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    equipment.forEach(item => {
        html += `
            <tr>
                <td>${item.name}</td>
                <td>${item.type}</td>
                <td>${item.location}</td>
                <td><span class="status-badge status-${item.status.replace(' ', '-')}">${item.status}</span></td>
                <td>${item.serialNumber || 'N/A'}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    reportOutput.innerHTML = html;
}

// Generate Maintenance Schedule Report
async function generateMaintenanceReport() {
    const equipment = await getAllEquipment();
    const reportOutput = document.getElementById('reportOutput');
    
    const maintenanceItems = equipment.filter(item => item.status === 'Maintenance');
    const needsAttention = equipment.filter(item => item.status === 'Out of Service');
    
    let html = `
        <div class="report-header">
            <h3>🔧 Maintenance Schedule Report</h3>
            <p class="report-date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="report-summary">
            <h4>Maintenance Overview</h4>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="label">Currently in Maintenance</div>
                    <div class="value" style="color: #f39c12;">${maintenanceItems.length}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Out of Service</div>
                    <div class="value" style="color: #e74c3c;">${needsAttention.length}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Total Requiring Attention</div>
                    <div class="value">${maintenanceItems.length + needsAttention.length}</div>
                </div>
            </div>
        </div>
    `;
    
    if (maintenanceItems.length > 0) {
        html += `
            <div class="report-section">
                <h4>Equipment Currently in Maintenance</h4>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Equipment Name</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Serial Number</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        maintenanceItems.forEach(item => {
            html += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td>${item.location}</td>
                    <td>${item.serialNumber || 'N/A'}</td>
                    <td>${item.notes || 'No notes'}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    if (needsAttention.length > 0) {
        html += `
            <div class="alert-box critical">
                <h5>⚠️ Critical: Equipment Out of Service</h5>
                <p>${needsAttention.length} item(s) are currently out of service and require immediate attention.</p>
            </div>
            
            <div class="report-section">
                <h4>Out of Service Equipment</h4>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Equipment Name</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Serial Number</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        needsAttention.forEach(item => {
            html += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td>${item.location}</td>
                    <td>${item.serialNumber || 'N/A'}</td>
                    <td>${item.notes || 'No notes'}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    if (maintenanceItems.length === 0 && needsAttention.length === 0) {
        html += `
            <div class="alert-box">
                <h5>✅ All Clear</h5>
                <p>No equipment currently requires maintenance or is out of service.</p>
            </div>
        `;
    }
    
    reportOutput.innerHTML = html;
}

// Generate Equipment by Location Report
async function generateLocationReport() {
    const equipment = await getAllEquipment();
    const reportOutput = document.getElementById('reportOutput');
    
    const locationGroups = {};
    equipment.forEach(item => {
        if (!locationGroups[item.location]) {
            locationGroups[item.location] = [];
        }
        locationGroups[item.location].push(item);
    });
    
    let html = `
        <div class="report-header">
            <h3>📍 Equipment by Location Report</h3>
            <p class="report-date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="report-summary">
            <h4>Location Overview</h4>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="label">Total Locations</div>
                    <div class="value">${Object.keys(locationGroups).length}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Total Equipment</div>
                    <div class="value">${equipment.length}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Avg per Location</div>
                    <div class="value">${(equipment.length / Object.keys(locationGroups).length).toFixed(1)}</div>
                </div>
            </div>
        </div>
    `;
    
    Object.keys(locationGroups).sort().forEach(location => {
        const items = locationGroups[location];
        const available = items.filter(i => i.status === 'Available').length;
        
        html += `
            <div class="report-section">
                <h4>${location} (${items.length} items, ${available} available)</h4>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Equipment Name</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Serial Number</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        items.forEach(item => {
            html += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td><span class="status-badge status-${item.status.replace(' ', '-')}">${item.status}</span></td>
                    <td>${item.serialNumber || 'N/A'}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    });
    
    reportOutput.innerHTML = html;
}

// Generate Equipment by Type Report
async function generateTypeReport() {
    const equipment = await getAllEquipment();
    const reportOutput = document.getElementById('reportOutput');
    
    const typeGroups = {};
    equipment.forEach(item => {
        if (!typeGroups[item.type]) {
            typeGroups[item.type] = [];
        }
        typeGroups[item.type].push(item);
    });
    
    let html = `
        <div class="report-header">
            <h3>🔍 Equipment by Type Report</h3>
            <p class="report-date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="report-summary">
            <h4>Type Overview</h4>
            <div class="summary-grid">
    `;
    
    Object.keys(typeGroups).sort().forEach(type => {
        const count = typeGroups[type].length;
        html += `
            <div class="summary-item">
                <div class="label">${type}</div>
                <div class="value">${count}</div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    Object.keys(typeGroups).sort().forEach(type => {
        const items = typeGroups[type];
        const available = items.filter(i => i.status === 'Available').length;
        
        html += `
            <div class="report-section">
                <h4>${type} (${items.length} total, ${available} available)</h4>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Equipment Name</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Serial Number</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        items.forEach(item => {
            html += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.location}</td>
                    <td><span class="status-badge status-${item.status.replace(' ', '-')}">${item.status}</span></td>
                    <td>${item.serialNumber || 'N/A'}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    });
    
    reportOutput.innerHTML = html;
}

// Generate Out of Service Report
async function generateOutOfServiceReport() {
    const equipment = await getAllEquipment();
    const reportOutput = document.getElementById('reportOutput');
    
    const outOfService = equipment.filter(item => item.status === 'Out of Service');
    const maintenance = equipment.filter(item => item.status === 'Maintenance');
    
    let html = `
        <div class="report-header">
            <h3>⚠️ Out of Service Report</h3>
            <p class="report-date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="report-summary">
            <h4>Critical Status Overview</h4>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="label">Out of Service</div>
                    <div class="value" style="color: #e74c3c;">${outOfService.length}</div>
                </div>
                <div class="summary-item">
                    <div class="label">In Maintenance</div>
                    <div class="value" style="color: #f39c12;">${maintenance.length}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Total Unavailable</div>
                    <div class="value">${outOfService.length + maintenance.length}</div>
                </div>
                <div class="summary-item">
                    <div class="label">% of Fleet</div>
                    <div class="value">${((outOfService.length + maintenance.length) / equipment.length * 100).toFixed(1)}%</div>
                </div>
            </div>
        </div>
    `;
    
    if (outOfService.length > 0) {
        html += `
            <div class="alert-box critical">
                <h5>🚨 Critical Alert</h5>
                <p>${outOfService.length} equipment item(s) are currently out of service and unavailable for use.</p>
            </div>
            
            <div class="report-section">
                <h4>Out of Service Equipment</h4>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Equipment Name</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Serial Number</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        outOfService.forEach(item => {
            html += `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.type}</td>
                    <td>${item.location}</td>
                    <td>${item.serialNumber || 'N/A'}</td>
                    <td>${item.notes || 'No notes provided'}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    } else {
        html += `
            <div class="alert-box">
                <h5>✅ Good News</h5>
                <p>No equipment is currently out of service.</p>
            </div>
        `;
    }
    
    reportOutput.innerHTML = html;
}

// Generate Compliance Report
async function generateComplianceReport() {
    const equipment = await getAllEquipment();
    const reportOutput = document.getElementById('reportOutput');
    
    const missingSerialNumbers = equipment.filter(item => !item.serialNumber || item.serialNumber.trim() === '');
    const outOfService = equipment.filter(item => item.status === 'Out of Service');
    const maintenance = equipment.filter(item => item.status === 'Maintenance');
    const available = equipment.filter(item => item.status === 'Available');
    
    const complianceScore = ((equipment.length - missingSerialNumbers.length - outOfService.length) / equipment.length * 100).toFixed(1);
    
    let html = `
        <div class="report-header">
            <h3>✅ Compliance & Readiness Report</h3>
            <p class="report-date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="report-summary">
            <h4>Compliance Score: ${complianceScore}%</h4>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="label">Total Equipment</div>
                    <div class="value">${equipment.length}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Operational Ready</div>
                    <div class="value" style="color: #2ecc71;">${available.length}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Missing Serial Numbers</div>
                    <div class="value" style="color: #e74c3c;">${missingSerialNumbers.length}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Needs Attention</div>
                    <div class="value" style="color: #f39c12;">${outOfService.length + maintenance.length}</div>
                </div>
            </div>
        </div>
    `;
    
    if (missingSerialNumbers.length > 0) {
        html += `
            <div class="alert-box">
                <h5>⚠️ Documentation Issues</h5>
                <p>${missingSerialNumbers.length} equipment item(s) are missing serial numbers. This may affect compliance and tracking.</p>
            </div>
            
            <div class="report-section">
                <h4>Equipment Missing Serial Numbers</h4>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Equipment Name</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        missingSerialNumbers.forEach(item => {
            html += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td>${item.location}</td>
                    <td><span class="status-badge status-${item.status.replace(' ', '-')}">${item.status}</span></td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    html += `
        <div class="report-section">
            <h4>Readiness Summary</h4>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Count</th>
                        <th>Percentage</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Available for Use</td>
                        <td>${available.length}</td>
                        <td>${(available.length / equipment.length * 100).toFixed(1)}%</td>
                        <td><span class="status-badge status-Available">Ready</span></td>
                    </tr>
                    <tr>
                        <td>In Maintenance</td>
                        <td>${maintenance.length}</td>
                        <td>${(maintenance.length / equipment.length * 100).toFixed(1)}%</td>
                        <td><span class="status-badge status-Maintenance">Scheduled</span></td>
                    </tr>
                    <tr>
                        <td>Out of Service</td>
                        <td>${outOfService.length}</td>
                        <td>${(outOfService.length / equipment.length * 100).toFixed(1)}%</td>
                        <td><span class="status-badge status-Out-of-Service">Critical</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    reportOutput.innerHTML = html;
}

// Export to PDF (using browser print)
function exportToPDF() {
    window.print();
}

// Export to CSV
async function exportToCSV() {
    const equipment = await getAllEquipment();
    
    if (equipment.length === 0) {
        alert('No equipment data to export');
        return;
    }
    
    let csv = 'Equipment Name,Type,Location,Status,Serial Number,Notes,Added Date,Last Updated\n';
    
    equipment.forEach(item => {
        const row = [
            item.name,
            item.type,
            item.location,
            item.status,
            item.serialNumber || '',
            (item.notes || '').replace(/,/g, ';'),
            new Date(item.timestamp).toLocaleDateString(),
            new Date(item.lastUpdated).toLocaleDateString()
        ];
        csv += row.map(field => `"${field}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fire-dept-equipment-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Print Report
function printReport() {
    window.print();
}
