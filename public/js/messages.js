document.addEventListener('DOMContentLoaded', async function() {
    if (!localStorage.getItem('token')) {
        window.location.href = '/login';
        return;
    }

    const user = await fetchUserData();
    if (!user) return;

    // Load messages
    await loadMessages();

    // Send message
    document.getElementById('send-message-btn').addEventListener('click', async function() {
        const message = document.getElementById('message-input').value.trim();
        if (!message) return;

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ message })
            });

            if (response.ok) {
                document.getElementById('message-input').value = '';
                await loadMessages();
            } else {
                alert('Failed to send message');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        }
    });

    // Auto-refresh messages every 10 seconds
    setInterval(loadMessages, 10000);

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

    async function loadMessages() {
        try {
            const response = await fetch('/api/messages', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const messages = await response.json();
            
            const container = document.getElementById('messages-container');
            container.innerHTML = '';
            
            messages.forEach(msg => {
                const msgEl = document.createElement('div');
                msgEl.className = `message ${msg.sender === user._id ? 'sent' : 'received'}`;
                msgEl.innerHTML = `
                    <p class="message-content">${msg.content}</p>
                    <p class="message-time">${new Date(msg.createdAt).toLocaleTimeString()}</p>
                `;
                if (msg.senderRole === 'admin') {
                    msgEl.classList.add('admin-message');
                }
                container.appendChild(msgEl);
            });
            
            // Scroll to bottom
            container.scrollTop = container.scrollHeight;
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }
});
