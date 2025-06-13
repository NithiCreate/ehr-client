
let currentUser = null;
let authToken = null;

// API Base URL
const API_BASE = '/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
        authToken = savedToken;
        verifyToken();
    }

    // Set up form listeners
    setupFormListeners();
});

function setupFormListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Role change listener for registration
    document.getElementById('reg-role').addEventListener('change', function() {
        const specializationField = document.getElementById('specialization-field');
        if (this.value === 'doctor') {
            specializationField.style.display = 'block';
        } else {
            specializationField.style.display = 'none';
        }
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            showNotification('Welcome!', `Successfully logged in as ${data.user.firstName}`, 'success');
            showMainApp();
        } else {
            showNotification('Login Failed', data.message || 'Invalid credentials', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('reg-firstName').value,
        lastName: document.getElementById('reg-lastName').value,
        username: document.getElementById('reg-username').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        role: document.getElementById('reg-role').value,
        specialization: document.getElementById('reg-specialization').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Success!', 'Registration successful! Please login.', 'success');
            showLogin();
        } else {
            showNotification('Registration Failed', data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

async function verifyToken() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            currentUser = await response.json();
            showMainApp();
        } else {
            localStorage.removeItem('authToken');
            authToken = null;
            showLogin();
        }
    } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem('authToken');
        authToken = null;
        showLogin();
    }
}

function showLogin() {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById('main-app').classList.add('hidden');
}

function showRegister() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('register-section').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('nav-menu').classList.remove('hidden');
    
    showDashboard();
    loadDashboardData();
}

function showDashboard() {
    hideAllSections();
    document.getElementById('dashboard').classList.remove('hidden');
    loadDashboardData();
}

function showPatients() {
    hideAllSections();
    document.getElementById('patients-section').classList.remove('hidden');
    loadPatients();
}

function showAppointments() {
    hideAllSections();
    document.getElementById('appointments-section').classList.remove('hidden');
    loadAppointments();
}

function hideAllSections() {
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('patients-section').classList.add('hidden');
    document.getElementById('appointments-section').classList.add('hidden');
}

async function loadDashboardData() {
    try {
        // Load patients count
        const patientsResponse = await fetch(`${API_BASE}/patients`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (patientsResponse.ok) {
            const patients = await patientsResponse.json();
            document.getElementById('total-patients').textContent = patients.length;
        }

        // Load appointments count
        const appointmentsResponse = await fetch(`${API_BASE}/appointments`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (appointmentsResponse.ok) {
            const appointments = await appointmentsResponse.json();
            const today = new Date().toDateString();
            const todayAppointments = appointments.filter(apt => 
                new Date(apt.appointmentDate).toDateString() === today
            );
            document.getElementById('today-appointments').textContent = todayAppointments.length;
        }
        
        document.getElementById('recent-records').textContent = '0'; // Placeholder
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function loadPatients() {
    try {
        const response = await fetch(`${API_BASE}/patients`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const patients = await response.json();
            displayPatients(patients);
        }
    } catch (error) {
        console.error('Error loading patients:', error);
    }
}

// Notification system
function showNotification(title, message, type = 'info') {
    const notification = document.getElementById('notification');
    const icon = document.getElementById('notification-icon');
    const titleEl = document.getElementById('notification-title');
    const messageEl = document.getElementById('notification-message');
    
    // Set icon based on type
    const icons = {
        success: '<i class="fas fa-check-circle text-green-500 text-xl"></i>',
        error: '<i class="fas fa-exclamation-circle text-red-500 text-xl"></i>',
        warning: '<i class="fas fa-exclamation-triangle text-yellow-500 text-xl"></i>',
        info: '<i class="fas fa-info-circle text-blue-500 text-xl"></i>'
    };
    
    icon.innerHTML = icons[type] || icons.info;
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

function displayPatients(patients) {
    const tbody = document.getElementById('patients-table-body');
    tbody.innerHTML = '';
    
    if (patients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-users text-4xl mb-4 text-gray-300"></i>
                    <p class="text-lg">No patients found</p>
                    <p class="text-sm">Add your first patient to get started</p>
                </td>
            </tr>
        `;
        return;
    }
    
    patients.forEach((patient, index) => {
        const row = document.createElement('tr');
        row.className = 'table-row transition-all duration-200';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                            <span class="text-white font-semibold text-sm">${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}</span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${patient.firstName} ${patient.lastName}</div>
                        <div class="text-sm text-gray-500">${patient.email || 'No email'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${calculateAge(patient.dateOfBirth)} years
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${patient.gender === 'Male' ? 'bg-blue-100 text-blue-800' : patient.gender === 'Female' ? 'bg-pink-100 text-pink-800' : 'bg-gray-100 text-gray-800'}">
                    <i class="fas ${patient.gender === 'Male' ? 'fa-mars' : patient.gender === 'Female' ? 'fa-venus' : 'fa-genderless'} mr-1"></i>
                    ${patient.gender}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex items-center">
                    <i class="fas fa-phone mr-2 text-gray-400"></i>
                    ${patient.phone || 'No phone'}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <i class="fas fa-circle mr-1 text-xs"></i>
                    Active
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex space-x-2">
                    <button onclick="viewPatient('${patient.id}')" 
                            class="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-lg transition duration-200">
                        <i class="fas fa-eye mr-1"></i>View
                    </button>
                    <button onclick="editPatient('${patient.id}')" 
                            class="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-lg transition duration-200">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button onclick="addMedicalRecord('${patient.id}')" 
                            class="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded-lg transition duration-200">
                        <i class="fas fa-file-medical mr-1"></i>Record
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
        
        // Add staggered animation
        setTimeout(() => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            row.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 100);
        }, 0);
    });
}

async function loadAppointments() {
    try {
        const response = await fetch(`${API_BASE}/appointments`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const appointments = await response.json();
            displayAppointments(appointments);
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

function displayAppointments(appointments) {
    const container = document.getElementById('appointments-list');
    container.innerHTML = '';
    
    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-calendar-times text-gray-300 text-6xl mb-4"></i>
                <p class="text-gray-500 text-lg">No appointments scheduled</p>
                <p class="text-gray-400">Click "Schedule Appointment" to get started</p>
            </div>
        `;
        return;
    }
    
    appointments.forEach((appointment, index) => {
        const appointmentDiv = document.createElement('div');
        appointmentDiv.className = 'p-6 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200';
        
        const appointmentDate = new Date(appointment.appointmentDate);
        const today = new Date();
        const isToday = appointmentDate.toDateString() === today.toDateString();
        const isPast = appointmentDate < today;
        
        const statusColors = {
            scheduled: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            pending: 'bg-yellow-100 text-yellow-800'
        };
        
        appointmentDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center mb-3">
                        <div class="bg-gradient-to-r from-green-400 to-green-600 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                            <i class="fas fa-calendar-alt text-white"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-lg text-gray-800">Patient ID: ${appointment.patientId}</h4>
                            <p class="text-sm text-gray-500">
                                <i class="fas fa-clock mr-1"></i>
                                ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                ${isToday ? '<span class="ml-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">Today</span>' : ''}
                                ${isPast && appointment.status !== 'completed' ? '<span class="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Overdue</span>' : ''}
                            </p>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div class="flex items-center">
                            <i class="fas fa-stethoscope mr-2 text-gray-400"></i>
                            <span class="text-sm text-gray-600">Type: <span class="font-medium">${appointment.type || 'General Consultation'}</span></span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-info-circle mr-2 text-gray-400"></i>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[appointment.status] || statusColors.pending}">
                                ${appointment.status || 'pending'}
                            </span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-notes-medical mr-2 text-gray-400"></i>
                            <span class="text-sm text-gray-600">Duration: <span class="font-medium">30 min</span></span>
                        </div>
                    </div>
                </div>
                <div class="flex space-x-2 ml-4">
                    <button onclick="editAppointment('${appointment.id}')" 
                            class="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-lg transition duration-200 flex items-center">
                        <i class="fas fa-edit mr-2"></i>Edit
                    </button>
                    <button onclick="completeAppointment('${appointment.id}')" 
                            class="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-lg transition duration-200 flex items-center">
                        <i class="fas fa-check mr-2"></i>Complete
                    </button>
                    <button onclick="cancelAppointment('${appointment.id}')" 
                            class="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg transition duration-200 flex items-center">
                        <i class="fas fa-times mr-2"></i>Cancel
                    </button>
                </div>
            </div>
        `;
        container.appendChild(appointmentDiv);
        
        // Add staggered animation
        setTimeout(() => {
            appointmentDiv.style.opacity = '0';
            appointmentDiv.style.transform = 'translateX(-20px)';
            appointmentDiv.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                appointmentDiv.style.opacity = '1';
                appointmentDiv.style.transform = 'translateX(0)';
            }, index * 150);
        }, 0);
    });
}

function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

function showAddPatientForm() {
    const modalContent = `
        <div class="p-6">
            <h3 class="text-xl font-bold mb-4">Add New Patient</h3>
            <form id="add-patient-form">
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-bold mb-2">First Name</label>
                        <input type="text" id="patient-firstName" required 
                               class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-2">Last Name</label>
                        <input type="text" id="patient-lastName" required 
                               class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-bold mb-2">Date of Birth</label>
                        <input type="date" id="patient-dob" required 
                               class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-2">Gender</label>
                        <select id="patient-gender" required 
                                class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-bold mb-2">Email</label>
                        <input type="email" id="patient-email" 
                               class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-2">Phone</label>
                        <input type="tel" id="patient-phone" 
                               class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500">
                    </div>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-bold mb-2">Address</label>
                    <textarea id="patient-address" rows="3" 
                              class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"></textarea>
                </div>
                <div class="flex justify-end space-x-3">
                    <button type="button" onclick="hideModal()" 
                            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                        Cancel
                    </button>
                    <button type="submit" 
                            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Add Patient
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
    
    document.getElementById('add-patient-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const patientData = {
            firstName: document.getElementById('patient-firstName').value,
            lastName: document.getElementById('patient-lastName').value,
            dateOfBirth: document.getElementById('patient-dob').value,
            gender: document.getElementById('patient-gender').value,
            email: document.getElementById('patient-email').value,
            phone: document.getElementById('patient-phone').value,
            address: document.getElementById('patient-address').value
        };
        
        try {
            const response = await fetch(`${API_BASE}/patients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(patientData)
            });
            
            if (response.ok) {
                hideModal();
                loadPatients();
                showNotification('Success!', 'Patient added successfully', 'success');
            } else {
                const error = await response.json();
                showNotification('Error', error.message || 'Failed to add patient', 'error');
            }
        } catch (error) {
            console.error('Error adding patient:', error);
            alert('Failed to add patient');
        }
    });
}

function showModal(content) {
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function hideModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

function logout() {
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    showLogin();
}

// Enhanced placeholder functions with better UX
function viewPatient(id) { 
    showNotification('Feature Coming Soon', 'Patient details view is being developed', 'info');
}

function editPatient(id) { 
    showNotification('Feature Coming Soon', 'Patient editing functionality is being developed', 'info');
}

function addMedicalRecord(id) { 
    showNotification('Feature Coming Soon', 'Medical record creation is being developed', 'info');
}

function showAddAppointmentForm() { 
    showNotification('Feature Coming Soon', 'Appointment scheduling form is being developed', 'info');
}

function editAppointment(id) { 
    showNotification('Feature Coming Soon', 'Appointment editing is being developed', 'info');
}

function completeAppointment(id) { 
    showNotification('Feature Coming Soon', 'Appointment completion is being developed', 'info');
}

function cancelAppointment(id) { 
    showNotification('Feature Coming Soon', 'Appointment cancellation is being developed', 'info');
}
