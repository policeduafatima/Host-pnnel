document.addEventListener('DOMContentLoaded', async function() {
    if (!localStorage.getItem('token')) {
        window.location.href = '/login';
        return;
    }

    const user = await fetchUserData();
    if (!user || user.role !== 'admin') {
        window.location.href = '/dashboard';
        return;
    }

    // Load admin data
    await loadAdminData();
    await loadUsers();
    await loadDeployments();

    // Update Heroku API keys
    document.getElementById('update-heroku-keys').addEventListener('click', async function() {
        const keys = document.getElementById('heroku-keys').value
            .split('\n')
            .filter(key => key.trim() !== '');
        
        try {
            const response = await fetch('/api/admin/heroku-keys', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ keys })
            });

            if (response.ok) {
                alert('Heroku API keys updated successfully!');
                await loadAdminData();
            } else {
                alert('Failed to update Heroku API keys');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        }
    });

    // Ban user
    document.querySelectorAll('.ban-user-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const userId = this.dataset.userId;
            const confirmBan = confirm('Are you sure you want to ban this user?');
            
            if (confirmBan) {
                try {
                    const response = await fetch(`/api/admin/users/${userId}/ban`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });

                    if (response.ok) {
                        alert('User banned successfully!');
                        await loadUsers();
                    } else {
                        alert('Failed to ban user');
                    }
                } catch (error) {
                    alert('Network error. Please try again.');
                }
            }
        });
    });

    // Toggle maintenance mode
    document.getElementById('toggle-maintenance').addEventListener('change', async function() {
        const maintenanceMessage = document.getElementById('maintenance-message').value;
        
        try {
            const response = await fetch('/api/admin/maintenance', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ 
                    maintenance: this.checked,
                    message: maintenanceMessage 
                })
            });

            if (response.ok) {
                alert('Maintenance mode updated successfully!');
            } else {
                alert('Failed to update maintenance mode');
                this.checked = !this.checked;
            }
        } catch (error) {
            alert('Network error. Please try again.');
            this.checked = !this.checked;
        }
    });

    async function fetchUserData() {
        try {
            const response = await fetch('/api/auth/user', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            return null;
        }
    }

    async function loadAdminData() {
        try {
            const response = await fetch('/api/admin', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            
            document.getElementById('heroku-keys').value = data.herokuKeys.join('\n');
            document.getElementById('toggle-maintenance').checked = data.maintenance;
            document.getElementById('maintenance-message').value = data.maintenanceMessage || '';
        } catch (error) {
            console.error('Failed to load admin data:', error);
        }
    }

    async function loadUsers() {
        try {
            const response = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const users = await response.json();
            
            const container = document.getElementById('users-list');
            container.innerHTML = '';
            
            users.forEach(user => {
                const userEl = document.createElement('tr');
                userEl.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.coins}</td>
                    <td>${user.deploymentsCount}</td>
                    <td>
                        <button class="ban-user-btn" data-user-id="${user._id}">
                            ${user.isActive ? 'Ban' : 'Unban'}
                        </button>
                    </td>
                `;
                container.appendChild(userEl);
            });
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    }

    async function loadDeployments() {
        try {
            const response = await fetch('/api/admin/deployments', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const deployments = await response.json();
            
            const container = document.getElementById('deployments-list');
            container.innerHTML = '';
            
            deployments.forEach(deployment => {
                const depEl = document.createElement('tr');
                depEl.innerHTML = `
                    <td>${deployment.appName}</td>
                    <td>${deployment.user.username}</td>
                    <td>${deployment.status}</td>
                    <td>${new Date(deployment.lastPaid).toLocaleDateString()}</td>
                    <td>
                        <a href="${deployment.url}" target="_blank">View</a>
                    </td>
                `;
                container.appendChild(depEl);
            });
        } catch (error) {
            console.error('Failed to load deployments:', error);
        }
    }
});
