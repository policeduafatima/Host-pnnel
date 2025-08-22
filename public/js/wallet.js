document.addEventListener('DOMContentLoaded', async function() {
    if (!localStorage.getItem('token')) {
        window.location.href = '/login';
        return;
    }

    const user = await fetchUserData();
    if (!user) return;

    // Display balance
    document.getElementById('coin-balance').textContent = user.coins;

    // Load transaction history
    await loadTransactions();

    // Claim daily coins
    document.getElementById('claim-coins-btn').addEventListener('click', async function() {
        try {
            const response = await fetch('/api/wallet/claim', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            const data = await response.json();
            if (response.ok) {
                alert('Coins claimed successfully!');
                window.location.reload();
            } else {
                alert(data.error || 'Failed to claim coins');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        }
    });

    // Redeem voucher
    document.getElementById('redeem-voucher-btn').addEventListener('click', async function() {
        const voucherCode = document.getElementById('voucher-code').value;
        
        try {
            const response = await fetch('/api/wallet/redeem', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ voucherCode })
            });
            
            const data = await response.json();
            if (response.ok) {
                alert(`Redeemed ${data.coinsAdded} coins!`);
                window.location.reload();
            } else {
                alert(data.error || 'Failed to redeem voucher');
            }
        } catch (error) {
            alert('Network error. Please try again.');
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

    async function loadTransactions() {
        try {
            const response = await fetch('/api/wallet/transactions', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const transactions = await response.json();
            
            const container = document.getElementById('transactions-list');
            container.innerHTML = '';
            
            transactions.forEach(tx => {
                const txEl = document.createElement('div');
                txEl.className = 'transaction-item';
                txEl.innerHTML = `
                    <p>${tx.description}</p>
                    <p>${new Date(tx.createdAt).toLocaleString()}</p>
                    <p class="${tx.type}">${tx.type === 'credit' ? '+' : '-'}${tx.amount} coins</p>
                `;
                container.appendChild(txEl);
            });
        } catch (error) {
            console.error('Failed to load transactions:', error);
        }
    }
});
