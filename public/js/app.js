// API Configuration
const API_URL = '/api';

// State Management
let currentUser = null;
let authToken = null;
let selectedUsersForSharing = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    authToken = localStorage.getItem('authToken');
    if (authToken) {
        fetchProfile();
    } else {
        showSection('hero');
    }
});

// Navigation
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.add('hidden'));

    // Show selected section
    const section = document.getElementById(sectionName);
    if (section) {
        section.classList.remove('hidden');

        // Load data for specific sections
        if (sectionName === 'feed' && authToken) {
            loadFeed();
        } else if (sectionName === 'my-posts' && authToken) {
            loadMyPosts();
        } else if (sectionName === 'profile' && authToken) {
            loadProfile();
        } else if (sectionName === 'connections' && authToken) {
            loadConnections();
        } else if (sectionName === 'create-post') {
            // Only reset form if not editing (i.e., no postId set)
            if (!document.getElementById('postId') || !document.getElementById('postId').value) {
                resetPostForm();
            }
        }
    }
}

// Authentication Functions
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            updateNavigation();
            showSection('feed');
            showSuccess('Account created successfully!');
        } else {
            let errorMsg = data.message || 'Registration failed';
            if (data.errors) {
                // Express-validator errors
                errorMsg += ': ' + data.errors.map(e => `${e.param || e.path}: ${e.msg || e.message}`).join(', ');
            } else if (typeof data.errors === 'object') {
                // Mongoose validation errors
                errorMsg += ': ' + Object.values(data.errors).map(e => `${e.path}: ${e.message}`).join(', ');
            }
            showError('registerError', errorMsg);
        }
    } catch (error) {
        showError('registerError', 'Network error. Please try again.');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            updateNavigation();
            showSection('feed');
            showSuccess('Logged in successfully!');
        } else {
            showError('loginError', data.message || 'Login failed');
        }
    } catch (error) {
        showError('loginError', 'Network error. Please try again.');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    updateNavigation();
    showSection('hero');
}

async function fetchProfile() {
    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data;
            updateNavigation();
            showSection('feed');
        } else {
            // Any error (including 401) - logout and show hero
            console.error('Failed to fetch profile:', response.status);
            logout();
        }
    } catch (error) {
        // Network error - logout and show hero
        console.error('Network error fetching profile:', error);
        logout();
    }
}

function updateNavigation() {
    const navMenu = document.getElementById('navMenu');
    const navMenuAuth = document.getElementById('navMenuAuth');
    const usernameDisplay = document.getElementById('usernameDisplay');

    if (authToken && currentUser) {
        navMenu.classList.add('hidden');
        navMenuAuth.classList.remove('hidden');
        usernameDisplay.textContent = `@${currentUser.username}`;
    } else {
        navMenu.classList.remove('hidden');
        navMenuAuth.classList.add('hidden');
    }
}

// Post Functions
async function loadFeed() {
    const container = document.getElementById('feedPosts');
    container.innerHTML = '<div class="loading">Loading posts...</div>';

    try {
        const response = await fetch(`${API_URL}/posts`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const posts = await response.json();
            displayPosts(posts, container, false);
        } else if (response.status === 401) {
            logout();
        } else {
            container.innerHTML = '<div class="empty-state"><h3>Failed to load posts</h3></div>';
        }
    } catch (error) {
        console.error('Error loading feed:', error);
        container.innerHTML = '<div class="empty-state"><h3>Network error</h3></div>';
    }
}

async function loadMyPosts() {
    const container = document.getElementById('myPosts');
    container.innerHTML = '<div class="loading">Loading your posts...</div>';

    try {
        const response = await fetch(`${API_URL}/posts/my-posts`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const posts = await response.json();
            displayPosts(posts, container, true);
        } else if (response.status === 401) {
            logout();
        } else {
            container.innerHTML = '<div class="empty-state"><h3>Failed to load posts</h3></div>';
        }
    } catch (error) {
        console.error('Error loading my posts:', error);
        container.innerHTML = '<div class="empty-state"><h3>Network error</h3></div>';
    }
}

function displayPosts(posts, container, showActions) {
    if (posts.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No posts yet</h3><p>Start writing your first diary entry!</p></div>';
        return;
    }

    container.innerHTML = posts.map(post => createPostCard(post, showActions)).join('');
}

function createPostCard(post, showActions) {
    const date = new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const privacyClass = `privacy-${post.privacy}`;
    const privacyLabel = {
        'private': '🔒 Private',
        'followers': '👥 Followers',
        'specific': '🎯 Specific',
        'public': '🌍 Public'
    }[post.privacy];

    const actions = showActions ? `
        <div class="post-actions">
            <button class="btn btn-secondary" onclick="editPost('${post._id}')">Edit</button>
            <button class="btn btn-danger" onclick="deletePost('${post._id}')">Delete</button>
        </div>
    ` : '';

    return `
        <div class="post-card">
            <div class="post-header">
                <span class="post-author">@${post.author.username}</span>
                <span class="post-date">${date}</span>
            </div>
            <span class="post-privacy ${privacyClass}">${privacyLabel}</span>
            <h3 class="post-title">${escapeHtml(post.title)}</h3>
            <div class="post-content">${escapeHtml(post.content)}</div>
            ${actions}
        </div>
    `;
}

async function handlePostSubmit(event) {
    event.preventDefault();

    const postId = document.getElementById('postId').value;
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const privacy = document.getElementById('postPrivacy').value;

    const postData = {
        title,
        content,
        privacy,
        sharedWith: privacy === 'specific' ? selectedUsersForSharing : []
    };

    try {
        const url = postId ? `${API_URL}/posts/${postId}` : `${API_URL}/posts`;
        const method = postId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        if (response.ok) {
            showSuccess(postId ? 'Post updated successfully!' : 'Post created successfully!');
            resetPostForm();
            showSection('my-posts');
        } else if (response.status === 401) {
            logout();
        } else {
            const data = await response.json();
            showError('postError', data.message || 'Failed to save post');
        }
    } catch (error) {
        console.error('Error submitting post:', error);
        showError('postError', 'Network error. Please try again.');
    }
}

async function editPost(postId) {
    try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            showSection('create-post');
            const post = await response.json();

            document.getElementById('postId').value = post._id;
            document.getElementById('postTitle').value = post.title;
            document.getElementById('postContent').value = post.content;
            document.getElementById('postPrivacy').value = post.privacy;
            document.getElementById('postFormTitle').textContent = 'Edit Your Secret';

            if (post.privacy === 'specific' && post.sharedWith) {
                selectedUsersForSharing = post.sharedWith.map(u => u._id);
                updateSelectedUsers(post.sharedWith);
            }

            handlePrivacyChange();
        } else if (response.status === 401) {
            logout();
        } else {
            alert('Failed to load post');
        }
    } catch (error) {
        console.error('Error loading post for edit:', error);
        alert('Failed to load post');
    }
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            showSuccess('Post deleted successfully!');
            loadMyPosts();
        } else if (response.status === 401) {
            logout();
        } else {
            alert('Failed to delete post');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Network error. Please try again.');
    }
}

function resetPostForm() {
    document.getElementById('postForm').reset();
    document.getElementById('postId').value = '';
    document.getElementById('postFormTitle').textContent = 'Write a New Secret';
    selectedUsersForSharing = [];
    document.getElementById('sharedWithGroup').classList.add('hidden');
    document.getElementById('selectedUsers').innerHTML = '';
}

function cancelPostEdit() {
    resetPostForm();
    showSection('my-posts');
}

function handlePrivacyChange() {
    const privacy = document.getElementById('postPrivacy').value;
    const sharedWithGroup = document.getElementById('sharedWithGroup');
    
    if (privacy === 'specific') {
        sharedWithGroup.classList.remove('hidden');
    } else {
        sharedWithGroup.classList.add('hidden');
    }
}

// Profile Functions
async function loadProfile() {
    const profileContent = document.getElementById('profileContent');
    
    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            
            profileContent.innerHTML = `
                <div class="profile-info">
                    <div class="profile-stat">
                        <strong>Username:</strong>
                        <span>@${user.username}</span>
                    </div>
                    <div class="profile-stat">
                        <strong>Email:</strong>
                        <span>${user.email}</span>
                    </div>
                    <div class="profile-stat">
                        <strong>Bio:</strong>
                        <span>${user.bio || 'No bio yet'}</span>
                    </div>
                    <div class="profile-stat">
                        <strong>Followers:</strong>
                        <span>${user.followers.length}</span>
                    </div>
                    <div class="profile-stat">
                        <strong>Following:</strong>
                        <span>${user.following.length}</span>
                    </div>
                    <div class="profile-stat">
                        <strong>Member Since:</strong>
                        <span>${new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="showEditProfile()">Edit Profile</button>
            `;
        } else if (response.status === 401) {
            logout();
        } else {
            profileContent.innerHTML = '<div class="empty-state"><h3>Failed to load profile</h3></div>';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        profileContent.innerHTML = '<div class="empty-state"><h3>Failed to load profile</h3></div>';
    }
}

function showEditProfile() {
    document.getElementById('profileForm').classList.remove('hidden');
    document.getElementById('profileBio').value = currentUser.bio || '';
}

async function updateProfile() {
    const bio = document.getElementById('profileBio').value.trim();

    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bio })
        });

        if (response.ok) {
            showSuccess('Profile updated successfully!');
            document.getElementById('profileForm').classList.add('hidden');
            loadProfile();
        } else {
            alert('Failed to update profile');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// User Search Functions
let searchTimeout;

document.getElementById('sharedWithSearch')?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        document.getElementById('searchResults').innerHTML = '';
        return;
    }

    searchTimeout = setTimeout(() => searchUsersForSharing(query), 300);
});

async function searchUsersForSharing(query) {
    try {
        const response = await fetch(`${API_URL}/auth/search?query=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const users = await response.json();
            displaySearchResults(users);
        }
    } catch (error) {
        console.error('Search error:', error);
    }
}

function displaySearchResults(users) {
    const container = document.getElementById('searchResults');
    
    const filteredUsers = users.filter(u => !selectedUsersForSharing.includes(u._id));
    
    if (filteredUsers.length === 0) {
        container.innerHTML = '<p style="padding: 10px; color: #999;">No users found</p>';
        return;
    }

    container.innerHTML = filteredUsers.map(user => `
        <div class="user-item">
            <div class="user-info">
                <div class="username">@${user.username}</div>
                ${user.bio ? `<div class="bio">${escapeHtml(user.bio)}</div>` : ''}
            </div>
            <button class="btn btn-primary" onclick="addUserToShare('${user._id}', '${user.username}')">Add</button>
        </div>
    `).join('');
}

function addUserToShare(userId, username) {
    if (!selectedUsersForSharing.includes(userId)) {
        selectedUsersForSharing.push(userId);
        updateSelectedUsers([{ _id: userId, username }]);
        document.getElementById('searchResults').innerHTML = '';
        document.getElementById('sharedWithSearch').value = '';
    }
}

function updateSelectedUsers(users) {
    const container = document.getElementById('selectedUsers');
    
    if (selectedUsersForSharing.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <h4>Sharing with:</h4>
        ${users.map(user => `
            <div class="user-item">
                <span>@${user.username}</span>
                <button class="btn btn-danger" onclick="removeUserFromShare('${user._id}')">Remove</button>
            </div>
        `).join('')}
    `;
}

function removeUserFromShare(userId) {
    selectedUsersForSharing = selectedUsersForSharing.filter(id => id !== userId);
    const users = selectedUsersForSharing.map(id => ({ _id: id, username: 'User' }));
    updateSelectedUsers(users);
}

async function searchUsers() {
    const query = document.getElementById('userSearch').value.trim();
    
    if (query.length < 2) {
        alert('Please enter at least 2 characters');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/search?query=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const users = await response.json();
            displayUserSearchResults(users);
        } else if (response.status === 401) {
            logout();
        } else {
            alert('Search failed. Please try again.');
        }
    } catch (error) {
        console.error('Error searching users:', error);
        alert('Search failed. Please try again.');
    }
}

function displayUserSearchResults(users) {
    const container = document.getElementById('userSearchResults');
    
    if (users.length === 0) {
        container.innerHTML = '<p style="padding: 10px; color: #999;">No users found</p>';
        return;
    }

    container.innerHTML = users.map(user => {
        const isFollowing = currentUser.following.some(f => f._id === user._id);
        const isSelf = user._id === currentUser._id;
        
        let button = '';
        if (!isSelf) {
            button = isFollowing 
                ? `<button class="btn btn-secondary" onclick="unfollowUser('${user._id}')">Unfollow</button>`
                : `<button class="btn btn-primary" onclick="followUser('${user._id}')">Follow</button>`;
        }

        return `
            <div class="user-item">
                <div class="user-info">
                    <div class="username">@${user.username}</div>
                    ${user.bio ? `<div class="bio">${escapeHtml(user.bio)}</div>` : ''}
                </div>
                ${button}
            </div>
        `;
    }).join('');
}

async function followUser(userId) {
    try {
        const response = await fetch(`${API_URL}/auth/follow/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            showSuccess('User followed successfully!');
            await fetchProfile();
            
            // Refresh connections page if it's currently active
            const connectionsSection = document.getElementById('connections');
            if (connectionsSection && !connectionsSection.classList.contains('hidden')) {
                loadConnections();
            }
            
            // Refresh search results if search page is active
            const searchInput = document.getElementById('userSearch');
            if (searchInput && searchInput.value) {
                searchUsers();
            }
        } else if (response.status === 401) {
            logout();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to follow user');
        }
    } catch (error) {
        console.error('Follow error:', error);
        alert('Network error. Please try again.');
    }
}

async function unfollowUser(userId) {
    try {
        const response = await fetch(`${API_URL}/auth/follow/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            showSuccess('User unfollowed successfully!');
            await fetchProfile();
            
            // Refresh connections page if it's currently active
            const connectionsSection = document.getElementById('connections');
            if (connectionsSection && !connectionsSection.classList.contains('hidden')) {
                loadConnections();
            }
            
            // Refresh search results if search page is active
            const searchInput = document.getElementById('userSearch');
            if (searchInput && searchInput.value) {
                searchUsers();
            }
        } else if (response.status === 401) {
            logout();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to unfollow user');
        }
    } catch (error) {
        console.error('Unfollow error:', error);
        alert('Network error. Please try again.');
    }
}

// Connections Functions
async function loadConnections() {
    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            displayFollowing(user.following || []);
            displayFollowers(user.followers || []);
        } else if (response.status === 401) {
            logout();
        } else {
            document.getElementById('followingList').innerHTML = '<p>Failed to load connections</p>';
            document.getElementById('followersList').innerHTML = '<p>Failed to load connections</p>';
        }
    } catch (error) {
        console.error('Error loading connections:', error);
        document.getElementById('followingList').innerHTML = '<p>Network error</p>';
        document.getElementById('followersList').innerHTML = '<p>Network error</p>';
    }
}

function displayFollowing(following) {
    const followingList = document.getElementById('followingList');
    const followingCount = document.getElementById('followingCount');
    
    followingCount.textContent = following.length;
    
    if (following.length === 0) {
        followingList.innerHTML = '<p class="empty-message">You are not following anyone yet</p>';
        return;
    }
    
    followingList.innerHTML = following.map(user => `
        <div class="user-card">
            <div class="user-info">
                <strong>${escapeHtml(user.username)}</strong>
            </div>
            <button class="btn btn-danger btn-sm" onclick="unfollowUser('${user._id}')">
                Unfollow
            </button>
        </div>
    `).join('');
}

function displayFollowers(followers) {
    const followersList = document.getElementById('followersList');
    const followersCount = document.getElementById('followersCount');
    
    followersCount.textContent = followers.length;
    
    if (followers.length === 0) {
        followersList.innerHTML = '<p class="empty-message">No followers yet</p>';
        return;
    }
    
    followersList.innerHTML = followers.map(user => `
        <div class="user-card">
            <div class="user-info">
                <strong>${escapeHtml(user.username)}</strong>
            </div>
            <button class="btn btn-primary btn-sm" onclick="followBackUser('${user._id}')">
                Follow Back
            </button>
        </div>
    `).join('');
}

async function followBackUser(userId) {
    await followUser(userId);
    loadConnections(); // Refresh the connections view
}

// Utility Functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
    setTimeout(() => {
        errorElement.classList.remove('show');
    }, 5000);
}

function showSuccess(message) {
    // Simple alert for now - could be enhanced with a toast notification
    alert(message);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
