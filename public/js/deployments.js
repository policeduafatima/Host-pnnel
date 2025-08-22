document.addEventListener('DOMContentLoaded', async function() {
    if (!localStorage.getItem('token')) {
        window.location.href = '/login';
        return;
    }

    const user = await fetchUserData();
    if (!user) return;

    // Load deployments
    await loadDeployments();

    // Deploy new bot form
    const deployForm = document.getElementById('deploy-form');
    if (deployForm) {
        deployForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (user.coins < 10) {
                alert('You need at least 10 coins to deploy a bot');
                return;
            }

            const formData = {
                appName: document.getElementById('app-name').value,
                sessionId: document.getElementById('session-id').value,
                prefix: document.getElementById('prefix').value,
                // Add other form fields
            };

            try {
                const response = await fetch('/api/deployments', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Deployment started successfully!');
                    window.location.reload();
                } else {
                    alert(data.error || 'Deployment failed');
                }
            } catch (error) {
                alert('Network error. Please try again.');
            }
        });
    }

    // View logs buttons
    document.querySelectorAll('.view-logs-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const appId = this.dataset.appId;
            const logs = await fetchLogs(appId);
            // Display logs in modal or dedicated section
            console.log(logs);
        });
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

    async function loadDeployments() {
        try {
            const response = await fetch('/api/deployments', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const deployments = await response.json();
            
            const container = document.getElementById('deployments-container');
            container.innerHTML = '';
            
            deployments.forEach(deployment => {
                const deploymentEl = document.createElement('div');
                deploymentEl.className = 'deployment-card';
                deploymentEl.innerHTML = `
                    <h3>${deployment.appName}</h3>
                    <p>Status: ${deployment.status}</p>
                    <p>URL: <a href="${deployment.url}" target="_blank">${deployment.url}</a></p>
                    <button class="view-logs-btn" data-app-id="${deployment._id}">View Logs</button>
                    <button class="edit-config-btn" data-app-id="${deployment._id}">Edit Config</button>
                `;
                container.appendChild(deploymentEl);
            });
        } catch (error) {
            console.error('Failed to load deployments:', error);
        }
    }

    async function fetchLogs(appId) {
        try {
            const response = await fetch(`/api/deployments/${appId}/logs`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch logs:', error);
            return null;
        }
    }
});
