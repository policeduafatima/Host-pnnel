document.addEventListener('DOMContentLoaded', async function() {
    if (!localStorage.getItem('token')) {
        window.location.href = '/login';
        return;
    }

    const user = await fetchUserData();
    if (!user) return;

    // Set referral link
    const referralLink = `${window.location.origin}/signup?ref=${user.username}`;
    document.getElementById('referral-link').value = referralLink;

    // Copy referral link
    document.getElementById('copy-referral-btn').addEventListener('click', function() {
        const linkInput = document.getElementById('referral-link');
        linkInput.select();
        document.execCommand('copy');
        alert('Referral link copied to clipboard!');
    });

    // Load referral history
    await loadReferrals();

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

    async function loadReferrals() {
        try {
            const response = await fetch('/api/referrals', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const referrals = await response.json();
            
            document.getElementById('total-referrals').textContent = referrals.length;
            document.getElementById('earned-coins').textContent = referrals.length * 5;
            
            const container = document.getElementById('referrals-list');
            container.innerHTML = '';
            
            referrals.forEach(ref => {
                const refEl = document.createElement('div');
                refEl.className = 'referral-item';
                refEl.innerHTML = `
                    <p>${ref.username}</p>
                    <p>${new Date(ref.joinedAt).toLocaleDateString()}</p>
                    <p>+5 coins</p>
                `;
                container.appendChild(refEl);
            });
        } catch (error) {
            console.error('Failed to load referrals:', error);
        }
    }
});
