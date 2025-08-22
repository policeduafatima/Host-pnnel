document.addEventListener('DOMContentLoaded', async function() {
    if (!localStorage.getItem('token')) {
        window.location.href = '/login';
        return;
    }

    const user = await fetchUserData();
    if (!user) return;

    // Populate form with current user data
    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email;
    document.getElementById('github-username').value = user.githubUsername || '';
    document.getElementById('whatsapp-number').value = user.whatsappNumber || '';
    document.getElementById('profile-pic-preview').src = user.profilePic;

    // Profile picture upload
    document.getElementById('profile-pic-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('profile-pic-preview').src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Save profile
    document.getElementById('save-profile-btn').addEventListener('click', async function() {
        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            githubUsername: document.getElementById('github-username').value,
            whatsappNumber: document.getElementById('whatsapp-number').value,
            profilePic: document.getElementById('profile-pic-preview').src
        };

        try {
            const response = await fetch('/api/settings/profile', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
                alert('Profile updated successfully!');
            } else {
                alert(data.error || 'Failed to update profile');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        }
    });

    // Change password
    document.getElementById('change-password-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            currentPassword: document.getElementById('current-password').value,
            newPassword: document.getElementById('new-password').value,
            confirmPassword: document.getElementById('confirm-password').value
        };

        if (formData.newPassword !== formData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        try {
            const response = await fetch('/api/settings/password', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
                alert('Password changed successfully!');
                this.reset();
            } else {
                alert(data.error || 'Failed to change password');
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
});
