// JavaScript code
// Initialize admin user only if localStorage is empty (data persistence)
function initializeAdmin() {
    let users = JSON.parse(localStorage.getItem('users')) || {};
    if (Object.keys(users).length === 0) {
        users['admin'] = { password: 'superadmin123', role: 'admin', friends: [] };
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Check if user is logged in on page load
window.onload = function() {
    initializeAdmin();
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
        showChat();
        loadMessages();
    } else {
        showLogin();
    }
};

// Show registration view
function showRegistration() {
    document.getElementById('registration').style.display = 'block';
    document.getElementById('login').style.display = 'none';
    document.getElementById('chat').style.display = 'none';
    clearErrors();
}

// Show login view
function showLogin() {
    document.getElementById('registration').style.display = 'none';
    document.getElementById('login').style.display = 'block';
    document.getElementById('chat').style.display = 'none';
    clearErrors();
}

// Show chat view
function showChat() {
    document.getElementById('registration').style.display = 'none';
    document.getElementById('login').style.display = 'none';
    document.getElementById('chat').style.display = 'block';

    // Show admin panel if user is admin
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    let users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[loggedInUser] && users[loggedInUser].role === 'admin') {
        document.getElementById('adminPanel').style.display = 'block';
    } else {
        document.getElementById('adminPanel').style.display = 'none';
    }

    // Display friends
    displayFriends();
}

// Clear error messages
function clearErrors() {
    document.getElementById('regError').textContent = '';
    document.getElementById('loginError').textContent = '';
}

// Registration form submit
document.getElementById('regForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    if (!username || !password) {
        document.getElementById('regError').textContent = 'Please fill in all fields.';
        return;
    }

    // Retrieve existing users from localStorage (simulating a database)
    // Note: localStorage stores data as strings, so we use JSON.parse to convert back to object
    // localStorage is not secure for real user accounts (easily accessible via browser dev tools)
    // but used here for frontend simulation without backend
    let users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[username]) {
        document.getElementById('regError').textContent = 'Username already exists.';
        return;
    }

    users[username] = { password: password, role: 'user', friends: [] };
    // Save updated users object back to localStorage as JSON string
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! Please login.');
    showLogin();
});

// Login form submit
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    // Retrieve users from localStorage for authentication check
    // Again, using JSON.parse to convert stored string back to object
    // Reminder: localStorage is client-side only and not secure for production use
    let users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[username] && users[username].password === password) {
        sessionStorage.setItem('loggedInUser', username);
        showChat();
        loadMessages();
    } else {
        document.getElementById('loginError').textContent = 'Invalid username or password.';
    }
});

// Logout
function logout() {
    sessionStorage.removeItem('loggedInUser');
    sessionStorage.removeItem('messages');
    document.getElementById('messages').innerHTML = '';
    showLogin();
}

// Send message
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (!message) return;

    const loggedInUser = sessionStorage.getItem('loggedInUser');
    addMessage(message, 'sent', loggedInUser);
    input.value = '';
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Add message to chat
function addMessage(text, type, sender) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + type;
    messageDiv.textContent = sender ? `${sender}: ${text}` : text;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Save to localStorage chatHistory (all messages)
    let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    chatHistory.push({ sender, text, timestamp: new Date().toISOString() });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

// Load messages from localStorage chatHistory
function loadMessages() {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    chatHistory.forEach(msg => {
        const type = msg.sender === loggedInUser ? 'sent' : 'received';
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ' + type;
        messageDiv.textContent = `${msg.sender}: ${msg.text}`;
        messagesDiv.appendChild(messageDiv);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Admin functions
function clearChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify([]));
    document.getElementById('messages').innerHTML = '';
    alert('Chat history cleared.');
}

function deleteAllUsersExceptAdmin() {
    let users = JSON.parse(localStorage.getItem('users')) || {};
    const adminData = users['admin'];
    users = { 'admin': adminData };
    localStorage.setItem('users', JSON.stringify(users));
    alert('All users except Admin have been deleted.');
}

// Friends management
function addFriend() {
    const friendUsername = document.getElementById('friendInput').value.trim();
    if (!friendUsername) {
        alert('Please enter a username.');
        return;
    }

    const loggedInUser = sessionStorage.getItem('loggedInUser');
    let users = JSON.parse(localStorage.getItem('users')) || {};

    if (!users[friendUsername]) {
        alert('User does not exist.');
        return;
    }

    if (friendUsername === loggedInUser) {
        alert('You cannot add yourself as a friend.');
        return;
    }

    if (users[loggedInUser].friends.includes(friendUsername)) {
        alert('This user is already your friend.');
        return;
    }

    users[loggedInUser].friends.push(friendUsername);
    localStorage.setItem('users', JSON.stringify(users));
    displayFriends();
    document.getElementById('friendInput').value = '';
    alert('Friend added successfully.');
}

function displayFriends() {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    let users = JSON.parse(localStorage.getItem('users')) || {};
    const friendsList = document.getElementById('friendsList');
    friendsList.innerHTML = '';

    if (users[loggedInUser] && users[loggedInUser].friends) {
        users[loggedInUser].friends.forEach(friend => {
            const li = document.createElement('li');
            li.textContent = friend;
            friendsList.appendChild(li);
        });
    }
}