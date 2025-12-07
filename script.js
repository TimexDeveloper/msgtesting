// JavaScript code
// Initialize admin user only if localStorage is empty (data persistence)
function initializeAdmin() {
    let users = JSON.parse(localStorage.getItem('users')) || {};
    if (Object.keys(users).length === 0) {
        users['Timex'] = {
            password: '5555',
            role: 'admin',
            friends: [],
            requestsSent: [],
            requestsReceived: [],
            status: 'Online',
            isBanned: false
        };
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

    // Show admin tab if user is admin
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    let users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[loggedInUser] && users[loggedInUser].role === 'admin') {
        document.getElementById('adminTab').style.display = 'inline-block';
    } else {
        document.getElementById('adminTab').style.display = 'none';
    }

    // Set initial status
    document.getElementById('statusSelect').value = users[loggedInUser].status;

    // Show chat tab by default
    showTab('chat');
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

    users[username] = {
        password: password,
        role: 'user',
        friends: [],
        requestsSent: [],
        requestsReceived: [],
        status: 'Online',
        isBanned: false
    };
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
        if (users[username].isBanned) {
            document.getElementById('loginError').textContent = 'Your account has been banned.';
            return;
        }
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

// Tab management
function showTab(tabName) {
    document.getElementById('chatTabContent').style.display = tabName === 'chat' ? 'block' : 'none';
    document.getElementById('friendsTabContent').style.display = tabName === 'friends' ? 'block' : 'none';
    document.getElementById('adminTabContent').style.display = tabName === 'admin' ? 'block' : 'none';

    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName + 'Tab').classList.add('active');

    if (tabName === 'friends') {
        displayFriends();
        displayFriendRequests();
    }
}

// Status management
function updateStatus() {
    const status = document.getElementById('statusSelect').value;
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    let users = JSON.parse(localStorage.getItem('users')) || {};
    users[loggedInUser].status = status;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Status updated to ' + status);
}

// Friends management with requests
function sendFriendRequest() {
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

    if (users[loggedInUser].requestsSent.includes(friendUsername)) {
        alert('Request already sent.');
        return;
    }

    // Add to sent and received
    users[loggedInUser].requestsSent.push(friendUsername);
    users[friendUsername].requestsReceived.push(loggedInUser);
    localStorage.setItem('users', JSON.stringify(users));
    document.getElementById('friendInput').value = '';
    alert('Friend request sent.');
}

function acceptRequest(username) {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    let users = JSON.parse(localStorage.getItem('users')) || {};

    // Add to friends
    users[loggedInUser].friends.push(username);
    users[username].friends.push(loggedInUser);

    // Remove from requests
    users[loggedInUser].requestsReceived = users[loggedInUser].requestsReceived.filter(u => u !== username);
    users[username].requestsSent = users[username].requestsSent.filter(u => u !== loggedInUser);

    localStorage.setItem('users', JSON.stringify(users));
    displayFriends();
    displayFriendRequests();
}

function declineRequest(username) {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    let users = JSON.parse(localStorage.getItem('users')) || {};

    // Remove from requests
    users[loggedInUser].requestsReceived = users[loggedInUser].requestsReceived.filter(u => u !== username);
    users[username].requestsSent = users[username].requestsSent.filter(u => u !== loggedInUser);

    localStorage.setItem('users', JSON.stringify(users));
    displayFriendRequests();
}

function displayFriends() {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    let users = JSON.parse(localStorage.getItem('users')) || {};
    const friendsList = document.getElementById('friendsList');
    friendsList.innerHTML = '';

    if (users[loggedInUser] && users[loggedInUser].friends) {
        users[loggedInUser].friends.forEach(friend => {
            const li = document.createElement('li');
            li.textContent = friend + ' (' + (users[friend] ? users[friend].status : 'Unknown') + ')';
            friendsList.appendChild(li);
        });
    }
}

function displayFriendRequests() {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    let users = JSON.parse(localStorage.getItem('users')) || {};
    const requestsList = document.getElementById('requestsList');
    requestsList.innerHTML = '';

    if (users[loggedInUser] && users[loggedInUser].requestsReceived) {
        users[loggedInUser].requestsReceived.forEach(requester => {
            const li = document.createElement('li');
            li.textContent = requester;
            const acceptBtn = document.createElement('button');
            acceptBtn.textContent = 'Accept';
            acceptBtn.onclick = () => acceptRequest(requester);
            const declineBtn = document.createElement('button');
            declineBtn.textContent = 'Decline';
            declineBtn.onclick = () => declineRequest(requester);
            li.appendChild(acceptBtn);
            li.appendChild(declineBtn);
            requestsList.appendChild(li);
        });
    }
}

// Admin functions
function banUser() {
    const username = document.getElementById('banInput').value.trim();
    if (!username) {
        alert('Please enter a username.');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || {};
    if (!users[username]) {
        alert('User does not exist.');
        return;
    }

    if (username === 'Timex') {
        alert('Cannot ban admin.');
        return;
    }

    users[username].isBanned = true;
    localStorage.setItem('users', JSON.stringify(users));
    alert('User banned.');
    document.getElementById('banInput').value = '';
}

function clearChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify([]));
    document.getElementById('messages').innerHTML = '';
    alert('Chat history cleared.');
}

function deleteAllUsersExceptAdmin() {
    let users = JSON.parse(localStorage.getItem('users')) || {};
    const adminData = users['Timex'];
    users = { 'Timex': adminData };
    localStorage.setItem('users', JSON.stringify(users));
    alert('All users except Timex have been deleted.');
}