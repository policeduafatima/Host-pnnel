document.addEventListener('DOMContentLoaded', async function() {
    if (!localStorage.getItem('token')) {
        window.location.href = '/login';
        return;
    }

    // Load user data
    const user = await fetchUserData();
    if (!user) return;

    // Update UI
    document.querySelector('.username').textContent = user.username;
    document.getElementById('coin-balance').textContent = user.coins;

    // Load deployments
    await loadDeployments();

    // Event listeners
    document.getElementById('deploy-new-btn').addEventListener('click', () => {
        window.location.href = '/deployments';
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
            
            const stats = {
                total: deployments.length,
                active: deployments.filter(d => d.status === 'active').length,
                suspended: deployments.filter(d => d.status === 'suspended').length
            };

            document.getElementById('total-bots').textContent = stats.total;
            document.getElementById('active-bots').textContent = stats.active;
            document.getElementById('suspended-bots').textContent = stats.suspended;
        } catch (error) {
            console.error('Failed to load deployments:', error);
        }
    }
});
