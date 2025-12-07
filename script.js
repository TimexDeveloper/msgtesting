// JavaScript code
// Check if user is logged in on page load
window.onload = function() {
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

    users[username] = password;
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
    if (users[username] === password) {
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

    addMessage(message, 'sent');
    input.value = '';

    // Simulate bot response after 1-2 seconds
    setTimeout(() => {
        addMessage('Echo: ' + message, 'received');
    }, 1500);
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Add message to chat
function addMessage(text, type) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + type;
    messageDiv.textContent = text;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Save to sessionStorage (last 10 messages)
    let messages = JSON.parse(sessionStorage.getItem('messages')) || [];
    messages.push({ text, type });
    if (messages.length > 10) {
        messages.shift();
    }
    sessionStorage.setItem('messages', JSON.stringify(messages));
}

// Load messages from sessionStorage
function loadMessages() {
    const messages = JSON.parse(sessionStorage.getItem('messages')) || [];
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ' + msg.type;
        messageDiv.textContent = msg.text;
        messagesDiv.appendChild(messageDiv);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}